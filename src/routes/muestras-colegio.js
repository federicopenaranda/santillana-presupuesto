var express = require('express');
var session = require('express-session');
var pdf = require('pdfkit');
var fs = require('fs');
var moment = require('moment');
moment().format();
var router = new express.Router();


router.get('/entregas-colegio-read', function(req, res) {
	console.log(req.session.id_usuario);
	if (req.session.id_usuario)
	{
		GLOBAL.pool.query('SELECT ' +
			'cliente.codigo_cliente_nav, ' +
			'cliente.nombre_cliente, ' +
			'entrega_colegio.id_entrega_colegio,  ' +
			'entrega_colegio.codigo_entrega_colegio, ' +
			'entrega_colegio.fecha_entrega_colegio, ' +
			'entrega_colegio.responsable_entrega_colegio, ' +
			'entrega_colegio.posicion_entrega_colegio, ' +
			'entrega_colegio.estado_entrega_colegio ' +
			'FROM entrega_colegio ' +
			'INNER JOIN cliente ON entrega_colegio.fk_id_cliente = cliente.id_cliente ' +
			'WHERE entrega_colegio.fk_id_usuario = ' + req.session.id_usuario,function(err,rows){
		  if(err) throw err;
		  res.json(rows);
		});
	}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}
});


router.get('/entregas-colegio-detalle', function(req, res) {
	console.log(req.session.id_usuario);

	if (req.session.id_usuario)
	{
		if (req.query.fk_id_entrega_colegio)
		{
			GLOBAL.pool.query('SELECT\
				item.codigo_nav_item,\
				item.nombre_nav_item,\
				entrega_colegio_det.id_entrega_colegio_det,\
				entrega_colegio_det.cantidad_entrega_colegio_det,\
				entrega_colegio_det.cantidad_devolucion_colegio_det,\
				entrega_colegio_det.cantidad_legalizacion_colegio_det,\
				entrega_colegio_det.fk_id_usuario_legaliza,\
				false AS devolver,\
				false AS legalizar\
				FROM\
				entrega_colegio_det\
				INNER JOIN item ON entrega_colegio_det.fk_id_item = item.id_item\
				WHERE\
				entrega_colegio_det.fk_id_entrega_colegio = ' + req.query.fk_id_entrega_colegio,function(err,rows){
			  if(err) throw err;
			  res.json(rows);
			});
		}
		else
		{
			res.json({"success": "false", "msg": "Error al enviar el ID de Muestra a Colegio!"});
		}
	}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}
});


router.get('/imprime-entregas-colegio', function(req, res) {
	var queryEntregaColegio = 'SELECT \
						entrega_colegio.fecha_entrega_colegio, \
						entrega_colegio.fecha_creacion_entrega_colegio, \
						entrega_colegio.observaciones_entrega_colegio, \
						entrega_colegio.responsable_entrega_colegio, \
						entrega_colegio.posicion_entrega_colegio, \
						entrega_colegio.telefono_entrega_colegio, \
						entrega_colegio.observaciones_devolucion_colegio, \
						entrega_colegio.fecha_devolucion_colegio, \
						entrega_colegio.estado_entrega_colegio, \
						entrega_colegio.codigo_entrega_colegio, \
						usuario_00_01_01.primer_nombre_usuario, \
						usuario_00_01_01.segundo_nombre_usuario, \
						usuario_00_01_01.apellido_paterno_usuario, \
						usuario_00_01_01.apellido_materno_usuario, \
						cliente.nombre_cliente, \
						cliente.codigo_cliente_nav \
						FROM \
						entrega_colegio \
						INNER JOIN usuario_00_01_01 ON entrega_colegio.fk_id_usuario = usuario_00_01_01.id_usuario \
						INNER JOIN cliente ON entrega_colegio.fk_id_cliente = cliente.id_cliente \
						WHERE \
						entrega_colegio.id_entrega_colegio = ' + req.query.fk_id_entrega_colegio;

	GLOBAL.pool.query(queryEntregaColegio ,function(err,rows){
		if(err) throw err;

	  	doc = new pdf;

		var nombreReporte = 'RepEntCliente-' + moment(new Date(), "YYYY-mm-dd_hms").format("YYYY-mm-DD_hms") + '.pdf'; 
		doc.pipe(fs.createWriteStream('reportes/' + nombreReporte));

		doc.fontSize(23).text('Formulario de Entrega de Libros a Cliente', 20, 20, {continued: true});

		doc.lineJoin('bevel').rect(480, 12, 120, 30).stroke();
		doc.fontSize(18).text(rows[0].codigo_entrega_colegio, 80, 20);

		doc.fontSize(10).text('Fecha de Entrega: ' + moment(rows[0].fecha_entrega_colegio, "YYYY-MM-dd").format("YYYY-MM-DD"), 20, 50);
		doc.fontSize(10).text('Código de Colegio: ' + rows[0].codigo_cliente_nav, 20, 65);
		doc.fontSize(10).text('Nombre de Colegio/Librería: ' + rows[0].nombre_cliente, 20, 80);
		doc.fontSize(10).text('Nombre de Cliente: ' + rows[0].responsable_entrega_colegio, 20, 95);
		doc.fontSize(10).text('Posición de Cliente: ' + rows[0].posicion_entrega_colegio, 20, 110);
		doc.fontSize(10).text('Teléfono/Celular: ' + rows[0].telefono_entrega_colegio, 20, 125);

		doc.lineJoin('bevel').rect(360, 50, 220, 80).stroke();

		doc.fontSize(10).text('Contacto Santillana: ', 370, 60);

		var sn = (rows[0].segundo_nombre_usuario) ? rows[0].segundo_nombre_usuario : '';

		var am = (rows[0].apellido_materno_usuario) ? rows[0].apellido_materno_usuario: '';

		doc.fontSize(18).text(rows[0].primer_nombre_usuario + ' '
							+ sn + ' '
							+ rows[0].apellido_paterno_usuario + ' '
							+ am + ' ', 370, 75);

		doc.fontSize(18).text('Detalle de libros entregados: ', 20, 160);

		/******************************************************/
		// [Inicio] Listado de libros de la entrega
		/******************************************************/
		var queryEntregaColegioDetalle = 'SELECT \
										item.codigo_nav_item, \
										item.nombre_nav_item, \
										entrega_colegio_det.cantidad_entrega_colegio_det \
										FROM \
										entrega_colegio_det \
										INNER JOIN item ON entrega_colegio_det.fk_id_item = item.id_item \
										WHERE \
										entrega_colegio_det.fk_id_entrega_colegio = ' + req.query.fk_id_entrega_colegio;

		GLOBAL.pool.query(queryEntregaColegioDetalle ,function(err2,rows2){
			if(err2) throw err2;

			doc.fontSize(14).text('Código ', 22, 190, { continued: true, width: 365 })
			   .text('Nombre ', 50, 190, { continued: true, width: 565 })
			   .text('Cantidad Entregada ', 320, 190, { width: 465 });

		   	var finalDetalle = 0;

			for ( var i=0; i<rows2.length; i++ )
			{
				doc.fontSize(8).text(rows2[i].codigo_nav_item, 22, 220+(i*15)); 
				doc.fontSize(8).text(rows2[i].nombre_nav_item, 100, 220+(i*15)); 
				doc.fontSize(8).text(rows2[i].cantidad_entrega_colegio_det, 500, 220+(i*15));
			}

			finalDetalle = 220 + (i*15);

			var obs = rows[0].observaciones_entrega_colegio ? rows[0].observaciones_entrega_colegio : '';

			doc.lineJoin('bevel').rect(20, finalDetalle+30, 270, 80).stroke();
			doc.fontSize(18).text('Observaciones ', 25, finalDetalle+35);
			doc.fontSize(10).text(obs, 25, finalDetalle+55, { width: 250 });

			doc.lineJoin('bevel').rect(300, finalDetalle+30, 270, 80).stroke();

			doc.lineJoin('bevel').rect(300, finalDetalle+63, 270, 12).stroke();
			doc.fontSize(7).text('Responsable de Colegio o Institución / Firma y Sello ', 350, finalDetalle+67);

			doc.fontSize(7).text('Aclaración de firma', 400, finalDetalle+103);
			doc.lineJoin('bevel').rect(300, finalDetalle+98, 270, 12).stroke();

			doc.end();
			res.json({"success": "true", "file": nombreReporte});
		});
		/******************************************************/
		// [Fin] Listado de libros de la entrega
		/******************************************************/

	});
});


router.post('/crea-muestra-colegio', function(req, res) {
	if (req.session.id_usuario)
	{
		var queryCodigo = 'SELECT MAX(correlativo_entrega_colegio) AS ultimo FROM entrega_colegio AS ultimo';

		GLOBAL.pool.query(queryCodigo, function(err, rows){
		  	if(err) throw err;

		  	console.log(rows);
		  
			var correlativo = 0;

			if (rows[0].ultimo == null)
			{
				console.log('correlativo 1');
				correlativo = 1;
			}
			else
			{
				console.log('correlativo: ' + rows[0].ultimo);
				correlativo = rows[0].ultimo + 1;
			}

		  	console.log(correlativo);

			var codigo = new Date().getFullYear() + '-' + correlativo;

			var fecha = moment(new Date(), "YYYY-mm-dd h:m:s").format(); 

			var query = "INSERT INTO `muestras`.`entrega_colegio` (\
							`id_entrega_colegio`, \
							`fk_id_usuario`, \
							`fk_id_cliente`, \
							`fecha_entrega_colegio`, \
							`fecha_creacion_entrega_colegio`, \
							`observaciones_entrega_colegio`, \
							`responsable_entrega_colegio`, \
							`posicion_entrega_colegio`, \
							`telefono_entrega_colegio`, \
							`observaciones_devolucion_colegio`, \
							`fecha_devolucion_colegio`, \
							`estado_entrega_colegio`, \
							`correlativo_entrega_colegio`, \
							`codigo_entrega_colegio`) \
						VALUES (NULL, '"+ req.session.id_usuario +"', '"+ req.query.cliente +
							"', '"+ req.query.fechaEntrega + 
							"', '"+ fecha +
							"', '"+ req.query.observaciones +
							"', '"+ req.query.responsable +
							"', '"+ req.query.posicion +
							"', '"+ req.query.telefono +
							"', NULL, NULL, 'abierta'" +
							", "+ correlativo +
							", '"+ codigo + "');";

			GLOBAL.pool.query(query, function(err,info){
			  if(err) throw err;
			  
			  	var fkIdEntregaColegio = info.insertId;

			  	data = JSON.parse(req.query.itemsSeleccionados);

			  	var query2 = "INSERT INTO `muestras`.`entrega_colegio_det` (\
			  					`id_entrega_colegio_det`, \
			  					`fk_id_entrega_colegio`, \
			  					`fk_id_item`, \
			  					`fk_id_usuario_legaliza`, \
			  					`cantidad_entrega_colegio_det`, \
			  					`cantidad_devolucion_colegio_det`, \
			  					`cantidad_legalizacion_colegio_det`) \
		  					VALUES ";
			  	
			  	for(var i = 0; i < data.length; i++)
			  	{
			    	query2 += "(NULL, '"+ fkIdEntregaColegio +"', '"+ data[i].fk_id_item+"', NULL, '"+ data[i].cantidad_entrega_colegio_det +"', NULL, NULL) ";
					query2 += (data[i+1]) ? ',' : ';';
			  	}

			  	GLOBAL.pool.query(query2, function(err,info){
					if(err) throw err;
					res.json({"success": "true"});
				});

			});

		});
	}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}
});


router.put('/guarda-devolucion', function(req, res) {
	if (req.session.id_usuario)
	{
		var query2 = "UPDATE `muestras`.`entrega_colegio_det` \
						SET  `cantidad_devolucion_colegio_det` =  '"+ req.query.cantidad_devolucion_colegio_det +"' \
					  WHERE  `entrega_colegio_det`.`id_entrega_colegio_det` = "+ req.query.id_entrega_colegio_det +";";

		GLOBAL.pool.query(query2, function(err,info){
			if(err) throw err;
			res.json({"success": "true"});
		});
	}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}
});


router.put('/guarda-legalizacion', function(req, res) {
	if (req.session.id_usuario)
	{
		var query2 = "UPDATE `muestras`.`entrega_colegio_det` \
						SET  `cantidad_legalizacion_colegio_det` =  '"+ req.query.cantidad_legalizacion_colegio_det +"' \
					  WHERE  `entrega_colegio_det`.`id_entrega_colegio_det` = "+ req.query.id_entrega_colegio_det +";";

		GLOBAL.pool.query(query2, function(err,info){
			if(err) throw err;
			res.json({"success": "true"});
		});
	}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}
});


router.delete('/elimina-devolucion', function(req, res) {
	if (req.session.id_usuario)
	{
		if (req.query.id_entrega_colegio)
		{
			var query2 = "DELETE FROM entrega_colegio WHERE id_entrega_colegio = " + 
							req.query.id_entrega_colegio + " LIMIT 1";

			GLOBAL.pool.query(query2, function(err,info){
				if(err) throw err;
				res.json({"success": "true"});
			});
		}
	}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}
});


module.exports = router;