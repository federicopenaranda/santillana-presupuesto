var fs = require('fs');
var moment = require('moment');

function getAlmacenUsuarios (pool, callback) {
	// Se seleccionan todos los usuarios para obtener su almacén
	var query = "SELECT  `id_usuario` ,  `codigo_almacen_usuario` \
					FROM  `usuario_00_01_01` \
					WHERE usuario_00_01_01.codigo_almacen_usuario IS NOT NULL";

	pool.query(query, devuelveResultados);

	function devuelveResultados(err, infoUsuarios){
		if(err) throw err;
		callback(infoUsuarios, null);
	}
}


function truncateEntregaDelegado (pool, callback) {
	var query = 'DELETE FROM `entrega_delegado`; \
			DELETE FROM `entrega_delegado_detalle`;\
			SET FOREIGN_KEY_CHECKS = 0; \
			TRUNCATE TABLE  `entrega_delegado`; \
			TRUNCATE TABLE  `entrega_delegado_detalle`; \
			SET FOREIGN_KEY_CHECKS = 1;';

	pool.query(query, function(err, infoTruncate){
		if(err) throw err;
		callback(pool, procesaUsuariosTraspasos);
	});
}


function procesaUsuariosTraspasos (infoUsuarios, callback) {
	console.log("En procesaUsuariosTraspasos: ");
	console.log(infoUsuarios);
	console.log(infoUsuarios.length);

	var rsUsuarios = new Object;

	syncLoop(infoUsuarios.length, 
		function(loopUsuario) {

			var i = loopUsuario.iteration();
			
			console.log('Procesando almacen: ');
			console.log(infoUsuarios[i].codigo_almacen_usuario);

			getTraspasosUsuario(
				infoUsuarios[i].id_usuario, 
				infoUsuarios[i].codigo_almacen_usuario, 
				GLOBAL.sql, 
				function (codigoUsuario, recordset) {
					var q1 = creaQueryTraspasos (codigoUsuario, recordset);

					if (recordset.length > 0)
					{
						GLOBAL.pool.query(q1, function(err,info){
							if(err) throw err;
							loopUsuario.next();
						});
					}
					else
					{
						loopUsuario.next();
					}
				
				});
	  		
		}, 
		function(){
			console.log(rsUsuarios);
		}
	);
}


function getItemId (pool, codigoNavItem, callback) {
	if (codigoNavItem != '')
	{
		var query = 'SELECT `id_item` FROM  `item` WHERE  `codigo_nav_item` =  \''+ codigoNavItem +'\' LIMIT 1';

		pool.query(query, function(err, infoItem){
	  		if(err) throw err;
			callback(infoItem[0].id_item);
	  	});
	}
	else
	{
		callback(-1);
	}	
}


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


function getTraspasosUsuario (codigoUsuario, codigoAlmacenUsuario, conexionSqlServer, callback) {
	// Se crea el query que se ejecutará en el SQL Server (NAVISION)
	var query = 'SELECT [Item No_] AS ItemNo, \
						CONVERT(nvarchar,[Posting Date],20) AS PostingDate, [Entry Type] , \
						[Document No_], [Location Code] AS LocationCode, [Quantity], [Remaining Quantity], \
						[Invoiced Quantity] , [Positive] , \
						CONVERT(nvarchar,[Document Date],20) AS [Document Date], [Document Type], \
						[Order Type], [Order No_], [Item Category Code], [Product Group Code] \
				  FROM [NAV2013R2].[dbo].[Santillana Bolivia$Item Ledger Entry] \
				  WHERE [Location Code] = \'' + codigoAlmacenUsuario + '\' AND \
				  [Quantity] > 0 \
				  ORDER BY [Posting Date] ASC';

  	// Se conecta al servidor SQL Server (con el usuario nodejs de solo lectura)
	conexionSqlServer.connect("mssql://nodejs:prueba-1@10.137.32.35/NAV2013R2").then(function() {

		// Se ejecuta el query en el servidor SQL Server
	    new conexionSqlServer.Request().query(query).then(function(recordset) {

	    	//console.log(recordset);
	    	callback(codigoUsuario, recordset);

    	}).catch(function(err) {
				    console.log("Query Error: ");
			        console.log(err);
			    });


	}).catch(function(err) {
		    console.log("Connection Error: ");
		    console.log(err);
		});
}


function creaQueryTraspasos (codigoUsuario, traspasos, callback) {
	var fechasEntregas2 = utilDevuelveFechasTraspasos (traspasos);
	var ahora = moment(new Date(), "YYYY-mm-dd h:m:s").format();
	var ultimoQuery = '';

	for (var i=0; i<fechasEntregas2.length; i++)
	{
		var query = 'INSERT INTO `muestras`.`entrega_delegado` ' +
					'(`id_entrega_delegado`, `fk_id_usuario`, `fecha_entrega_delegado`, ' +
						'`fecha_registro_entrega_delegado`, `observaciones_entrega_delegado`) ' +
					'VALUES (NULL, \''+ codigoUsuario +'\', ' +
					'\''+ fechasEntregas2[i] +'\', ' +
					'\''+ ahora +'\',NULL);';

		query += 'SET @last_id := (SELECT LAST_INSERT_ID());';

		var query2 = 'INSERT INTO `muestras`.`entrega_delegado_detalle` \
						(`id_entrega_delegado_detalle`, `fk_id_entrega_delegado`, \
						`fk_id_item`, `cantidad_entrega_delegado_detalle`) VALUES ';

		var traspasosFiltrados = [];

		for (var i2=0; i2<traspasos.length; i2++)
		{
			if (traspasos[i2].PostingDate == fechasEntregas2[i])
				traspasosFiltrados.push(traspasos[i2]);
		}

		for (var i3=0; i3<traspasosFiltrados.length; i3++)
		{
			query2 += '(NULL, @last_id, (SELECT id_item FROM  `item` WHERE  `codigo_nav_item` = \'' + traspasosFiltrados[i3].ItemNo +'\'), \''+ traspasosFiltrados[i3].Quantity +'\') ';
			query2 += (traspasosFiltrados[i3+1]) ? ',' : ';';
		}

		ultimoQuery += query + query2;
	}

	//console.log(ultimoQuery);
	//fs.writeFile('C:\\muestras.log', ultimoQuery);

	return ultimoQuery;

	/*GLOBAL.pool.query(ultimoQuery, function(err,info){
		//if(err) throw err;
		//callback(info);
		console.log(err);
	//	console.log(info);
	});*/
}


function utilDevuelveFechasTraspasos (traspasos) {
	var fechasEntregas = [];

	for (var i=0; i<traspasos.length; i++)
	{
		fechasEntregas.push(traspasos[i].PostingDate);
	}

	// Se eliminan las fechas duplicadas
	fechasEntregas = fechasEntregas.filter(function(elem, pos) {
					    return fechasEntregas.indexOf(elem) == pos;
					})

	return fechasEntregas;
}


module.exports.getAlmacenUsuarios = getAlmacenUsuarios;
module.exports.truncateEntregaDelegado = truncateEntregaDelegado;
module.exports.getItemId = getItemId;
module.exports.syncLoop = syncLoop;
module.exports.getTraspasosUsuario = getTraspasosUsuario;
module.exports.creaQueryTraspasos = creaQueryTraspasos;
module.exports.procesaUsuariosTraspasos = procesaUsuariosTraspasos;