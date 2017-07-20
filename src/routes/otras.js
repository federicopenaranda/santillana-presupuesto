var express = require('express');
var router = new express.Router();
var sincronizarProductos = require('../utils/sincroniza-productos');


router.get('/cliente-read', function(req, res) {
	if (req.session.id_usuario)
	{
		var query0 = 'SELECT ' +
							'cliente_region.codigo_cliente_region ' +
							'FROM cliente_region ' +
							'INNER JOIN usuario_cliente_region ON usuario_cliente_region.fk_id_cliente_region = cliente_region.id_cliente_region '+
							'WHERE usuario_cliente_region.fk_id_usuario = ' + 
							req.session.id_usuario;

		GLOBAL.pool.query(query0 , function(err1,rows1){

			if(err1) throw err1;

			var likesQuery = '';
			  
			for (var i=0; i<rows1.length; i++)
			{
				likesQuery += 'cliente.codigo_cliente_nav LIKE \''+ rows1[i].codigo_cliente_region +'%\'';
			  	likesQuery += (rows1[i+1]) ? ' OR ' : '';
			}

			var query3 = 'SELECT * FROM  cliente WHERE ' + likesQuery;

		  	GLOBAL.pool.query(query3, function(err2,rows2){
			  if(err2) throw err2;
			  res.json(rows2);
			});


		});


		
	}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}
});


router.get('/busca-item', function(req, res) {
	if (req.session.id_usuario)
	{
		if (req.query.criterioBusqueda!='undefined' && req.query.criterioBusqueda!='')
		{
			if (req.query.criterioBusqueda != '')
			{
				req.query.criterioBusqueda = decodeURI(req.query.criterioBusqueda);
				req.query.criterioBusqueda = req.query.criterioBusqueda.replace(/'/g, "\\'").replace(/"/g, "\\\"");


				var query2 = 'SELECT ed.fk_id_item, ed.nombre_nav_item, ed.total_entregado_delegado, IFNULL(ec.total_entrega_colegio, 0) AS total_ec, (ed.total_entregado_delegado - IFNULL(ec.total_entrega_colegio, 0)) AS existencias \
							FROM \
								(SELECT entrega_delegado_detalle.fk_id_item, Sum(entrega_delegado_detalle.cantidad_entrega_delegado_detalle) AS total_entregado_delegado, item.nombre_nav_item, item.codigo_nav_item FROM entrega_delegado_detalle INNER JOIN entrega_delegado ON entrega_delegado_detalle.fk_id_entrega_delegado = entrega_delegado.id_entrega_delegado INNER JOIN item ON entrega_delegado_detalle.fk_id_item = item.id_item WHERE entrega_delegado.fk_id_usuario = '+ req.session.id_usuario +' AND (item.codigo_nav_item LIKE \'%'+ req.query.criterioBusqueda +'%\' OR item.nombre_nav_item LIKE \'%'+ req.query.criterioBusqueda +'%\') GROUP BY entrega_delegado_detalle.fk_id_item, item.nombre_nav_item, item.codigo_nav_item) \
							AS ed \
							LEFT JOIN \
								(SELECT entrega_colegio_det.fk_id_item, SUM(entrega_colegio_det.cantidad_entrega_colegio_det) as total_entrega_colegio, item.codigo_nav_item, item.nombre_nav_item FROM entrega_colegio INNER JOIN entrega_colegio_det ON entrega_colegio_det.fk_id_entrega_colegio = entrega_colegio.id_entrega_colegio INNER JOIN item ON entrega_colegio_det.fk_id_item = item.id_item WHERE entrega_colegio.fk_id_usuario = '+ req.session.id_usuario +' AND (item.codigo_nav_item LIKE \'%'+ req.query.criterioBusqueda +'%\' OR item.nombre_nav_item LIKE \'%'+ req.query.criterioBusqueda +'%\') GROUP BY entrega_colegio_det.fk_id_item, item.nombre_nav_item, item.codigo_nav_item) \
							AS ec \
							ON ed.fk_id_item = ec.fk_id_item \
							HAVING existencias > 0';

				console.log(query2);

				GLOBAL.pool.query(query2 ,function(err,rows){
				  if(err) throw err;
				  res.json(rows);
				});
			}
	 	}
	 	else
	 	{
	 		res.json({"success": "true"});
	 	}
	 }
	 else
	 {
	 	res.json({"success": "false", "msg": "No estas logueado!"});
	 }
});


router.get('/sincronizar-items', function(req, res) {
	if (req.session.id_usuario)
	{
		sincronizarProductos.truncateItemTmp(sincronizarProductos.getSincronizarItems, res);
	}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}
});


module.exports = router;