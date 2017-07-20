module.exports.truncateVentasTmp = truncateVentasTmp;

var moment = require('moment');


function truncateVentasTmp (fechaInicio, fechaFin, res) {
	var query = 'DELETE FROM `venta_temp`; \
			SET FOREIGN_KEY_CHECKS = 0; \
			TRUNCATE TABLE  `venta_temp`; \
			SET FOREIGN_KEY_CHECKS = 1;';

	GLOBAL.pool.query(query, function(err, infoTruncate){
		if(err) throw err;
		getDevuelveVentasNav(fechaInicio, fechaFin, res);
	});
}



function getDevuelveVentasNav (fechaInicio, fechaFin, res) {
	// Se crea el query que se ejecutará en el SQL Server (NAVISION)
	var query = 'EXEC [CONSULTA_VENTAS] @YEAR = NULL, '+
				'@FECHA_INICIO = \''+ fechaInicio +'\', '+
				'@FECHA_FIN = \''+ fechaFin +'\';';

	console.log(query);

	//console.log(getAllDays(fechaInicio, fechaFin));

  	// Se conecta al servidor SQL Server (con el usuario nodejs de solo lectura)
	var connection = new GLOBAL.sql.Connection(GLOBAL.configMssql, function(err) {
		var request = new GLOBAL.sql.Request(connection);
		request.query(query, function(err, recordset) {
			//console.log(recordset);
			if (err)
			{
				console.log(err);
				return;
			}
			else
			{
				//console.log(recordset);
			    if (recordset.length > 0)
		    		getInsertaVentasTemp(recordset, res);
		    	else
		    		console.log('Sin ventas en esas fechas.');
	    	}
		});

	});
}



function getInsertaVentasTemp (items, res) {

	console.log('Recorset en getInsertaVentasTemp: ');
	console.log(items.length);
	//console.log(items);

	var resto = items.length % 50;

	if (resto > 0)
	{
		vueltas = Math.trunc((items.length / 50)) + 1;
	}
	else
	{
		vueltas = Math.trunc(items.length / 50);
	}

	var indice = 0;

	syncLoop(vueltas, 
		function(loop) {
			var i = loop.iteration();

			var query2 = 'INSERT INTO `presupuesto`.`venta_temp` '
					+'(`id_venta`, `fk_id_gestion`, '
					+'`codigo_item_venta`, `nombre_item_venta`, `fecha_venta`, '
					+'`cantidad_venta`, `monto_venta`, `precio_unitario_venta`, '
					+'`tipo_movimiento_venta`, `linea_negocio_venta`, '
					+'`codigo_cliente_venta`, `nombre_cliente_venta`, '
					+'`ciudad_cliente_venta`, `codigo_vendedor_venta`, '
					+'`numero_documento_venta`) VALUES ';
			
			var in2 = 0;

			while (in2 < 50 )
			{
				if ( items[indice] )
				{
					//console.log('DENTRO DE WHILE:');
					//console.log(items[indice]);

					query2 += "(NULL, " + 
								+ '2' +",  "
								+ GLOBAL.mysql.escape(items[indice].No_) +",  "
								+ GLOBAL.mysql.escape(items[indice].Description) +",  "
								+ GLOBAL.mysql.escape(items[indice].PostingDate) +",  "
								+ GLOBAL.mysql.escape(items[indice].Quantity) +",  "
								+ GLOBAL.mysql.escape(items[indice].Amount) +",  "
								+ GLOBAL.mysql.escape(items[indice].UnitPrice) +",  "
								+ GLOBAL.mysql.escape(items[indice].TipoMovimiento) +",  "
								+ GLOBAL.mysql.escape(items[indice].linea_negocio) +",  "
								+ GLOBAL.mysql.escape(items[indice].CodigoCliente) +",  "
								+ GLOBAL.mysql.escape(items[indice].NombreCliente) +",  "
								+ GLOBAL.mysql.escape(items[indice].zona) +",  "
								+ GLOBAL.mysql.escape(items[indice].delegado) +",  "
								+ GLOBAL.mysql.escape(items[indice].DocumentNo) +") ";

					if (in2==49)
						query2 += ';';
					else
					{
						if (items[indice+1])
							query2 += ',';
						else
							query2 += ';';
					}
					

					in2++;
					indice++;
				}
				else
				{
					console.log('Break!');
					break;
				}
			}

			//console.log("query2");
			//console.log(query2);

			GLOBAL.pool.query(query2, function(err,info){
				if(err) throw err;
				//console.log(info);
				loop.next();
			});

		}, 
		function(){
			console.log('Finalizó');
			sincronizaVentas(res);
		}
	);
}



function sincronizaVentas (res) {
	var query = 'INSERT INTO venta (fk_id_gestion, codigo_venta, codigo_item_venta, nombre_item_venta, fecha_venta, '
				+'cantidad_venta, precio_unitario_venta, monto_venta, tipo_movimiento_venta, linea_negocio_venta, codigo_cliente_venta, '
				+'nombre_cliente_venta, ciudad_cliente_venta, codigo_vendedor_venta, nombre_vendedor_venta, numero_documento_venta) '
				+'SELECT fk_id_gestion, codigo_venta, codigo_item_venta, nombre_item_venta, fecha_venta, cantidad_venta, '
				+'precio_unitario_venta, monto_venta, tipo_movimiento_venta, linea_negocio_venta, codigo_cliente_venta, '
				+'nombre_cliente_venta, ciudad_cliente_venta, codigo_vendedor_venta, nombre_vendedor_venta, '
				+'numero_documento_venta FROM venta_temp AS t WHERE t.codigo_venta '
				+'NOT IN (SELECT codigo_venta FROM venta);';

	//console.log(query);

	GLOBAL.pool.query(query, function(err,info){
		if(err) throw err;
		//console.log(info);
		//console.log(err);
		res.json(info);
	});
}



function getAllDays(fechaInicio, fechaFin) {
    var s = new Date(fechaInicio - 0);
    var e = new Date(fechaFin - 0);
    var a = [];

    while(s < e) {
        a.push(s);
        s = new Date(s.setDate(
            s.getDate() + 1
        ))
    }

    return a;
};



function syncLoop(iterations, process, exit){  
    var index = 0,
        done = false,
        shouldExit = false;
    var loop = {
        next:function(){
            if(done){
                if(shouldExit && exit){
                    return exit(); // Exit if we're done
                }
            }
            // If we're not finished
            if(index < iterations){
                index++; // Increment our index
                process(loop); // Run our process, pass in the loop
            // Otherwise we're done
            } else {
                done = true; // Make sure we say we're done
                if(exit) exit(); // Call the callback on exit
            }
        },
        iteration:function(){
            return index - 1; // Return the loop number we're on
        },
        break:function(end){
            done = true; // End the loop
            shouldExit = end; // Passing end as true means we still call the exit callback
        }
    };
    loop.next();
    return loop;
}

