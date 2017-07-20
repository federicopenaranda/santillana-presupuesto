var express = require('express');
var session = require('express-session');
var fs = require('fs');
var moment = require('moment');
moment().format();
var router = new express.Router();


router.get('/ventas_ppto-zonas', function(req, res) {
	/*if (req.session.id_usuario)
	{*/
		var query = 'SELECT \'LA PAZ / EL ALTO\' AS ciudad, ' +

					'(SELECT Sum(venta.cantidad_venta) FROM venta WHERE venta.ciudad_cliente_venta = \'LAPAZ\' OR venta.ciudad_cliente_venta = \'ELALTO\' AND venta.fecha_venta BETWEEN \'2016-07-01\' AND \'2017-06-30\') ' +
					 'AS cantidad_ventas, ' +

					'(SELECT Sum(venta.monto_venta) FROM venta WHERE venta.ciudad_cliente_venta = \'LAPAZ\' OR venta.ciudad_cliente_venta = \'ELALTO\' AND venta.fecha_venta BETWEEN \'2016-07-01\' AND \'2017-06-30\') ' + 
					'AS valor_ventas, ' +

					'(SELECT SUM(presupuesto.cantidad_presupuesto) FROM presupuesto WHERE presupuesto.ciudad_presupuesto = \'LAPAZ\' OR presupuesto.ciudad_presupuesto = \'ELALTO\') ' +
					'AS cantidad_presupuesto, ' +

					'(SELECT SUM((presupuesto.pvp_presupuesto * presupuesto.cantidad_presupuesto)) AS valor_presupuesto FROM presupuesto WHERE presupuesto.ciudad_presupuesto = \'LAPAZ\' OR presupuesto.ciudad_presupuesto = \'ELALTO\') ' +
					'AS valor_presupuesto, ' +

					'((SELECT Sum(venta.monto_venta) FROM venta WHERE ' +
					'venta.ciudad_cliente_venta = \'LAPAZ\'' +
					'OR venta.ciudad_cliente_venta = \'ELALTO\' AND ' +
					'venta.fecha_venta BETWEEN \'2016-07-01\' AND \'2017-06-30\' ) /' +
					'(SELECT SUM((presupuesto.pvp_presupuesto * presupuesto.cantidad_presupuesto)) AS valor_presupuesto ' +
					'FROM presupuesto WHERE presupuesto.ciudad_presupuesto = \'LAPAZ\' OR presupuesto.ciudad_presupuesto = \'ELALTO\' ) ) AS avance_ppto ' +


					'UNION ALL ' +

					'SELECT \'ORURO / POTOSI\' AS ciudad, ' +

					'(SELECT Sum(venta.cantidad_venta) FROM venta WHERE venta.ciudad_cliente_venta = \'ORURO\' OR venta.ciudad_cliente_venta = \'POTOSI\' AND venta.fecha_venta BETWEEN \'2016-07-01\' AND \'2017-06-30\') ' +
					 'AS cantidad_ventas, ' +

					'(SELECT Sum(venta.monto_venta) FROM venta WHERE venta.ciudad_cliente_venta = \'ORURO\' OR venta.ciudad_cliente_venta = \'POTOSI\' AND venta.fecha_venta BETWEEN \'2016-07-01\' AND \'2017-06-30\') ' +
					'AS valor_ventas, ' +

					'(SELECT SUM(presupuesto.cantidad_presupuesto) FROM presupuesto WHERE presupuesto.ciudad_presupuesto = \'ORURO\' OR presupuesto.ciudad_presupuesto = \'POTOSI\') ' +
					'AS cantidad_presupuesto, ' +

					'(SELECT SUM((presupuesto.pvp_presupuesto * presupuesto.cantidad_presupuesto)) AS valor_presupuesto FROM presupuesto WHERE presupuesto.ciudad_presupuesto = \'ORURO\' OR presupuesto.ciudad_presupuesto = \'POTOSI\') ' +
					'AS valor_presupuesto, ' +

					'( (SELECT Sum(venta.monto_venta) FROM venta WHERE ' +
					'venta.ciudad_cliente_venta = \'ORURO\'' +
					'OR venta.ciudad_cliente_venta = \'POTOSI\' AND ' +
					'venta.fecha_venta BETWEEN \'2016-07-01\' AND \'2017-06-30\' ) /' +
					'(SELECT SUM((presupuesto.pvp_presupuesto * presupuesto.cantidad_presupuesto)) AS valor_presupuesto ' +
					'FROM presupuesto WHERE presupuesto.ciudad_presupuesto = \'ORURO\' OR presupuesto.ciudad_presupuesto = \'POTOSI\' ) ) AS avance_ppto ' +


					'UNION ALL ' +

					'SELECT ' +
					'v.ciudad_cliente_venta AS ciudad, ' +
					'Sum(v.cantidad_venta) AS cantidad_ventas, ' +
					'Sum(v.monto_venta) AS valor_ventas, ' +
					'pptociudad.cantidad_presupuesto, ' +
					'pptociudad.valor_presupuesto, ' +
					'Sum(v.monto_venta / pptociudad.valor_presupuesto) AS avance_ppto '+
					'FROM venta v ' +
					'INNER JOIN presupuesto_ciudad AS pptociudad ' +
					'ON pptociudad.ciudad_presupuesto = v.ciudad_cliente_venta ' +
					'WHERE ' +
					'v.fecha_venta BETWEEN \'2016-07-01\' AND \'2017-06-30\' AND ' +
					'(v.ciudad_cliente_venta <> \'LAPAZ\' AND v.ciudad_cliente_venta <> \'ELALTO\' AND ' +
					'v.ciudad_cliente_venta <> \'ORURO\' AND v.ciudad_cliente_venta <> \'POTOSI\' ) ' +
					'GROUP BY ' +
					'v.ciudad_cliente_venta';

		//console.log(query);

		GLOBAL.pool.query(query,function(err,rows){
		  if(err) throw err;
		  res.json(rows);
		});
	/*}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}*/
});



router.get('/ventas_ppto-items', function(req, res) {
	/*if (req.session.id_usuario)
	{*/
		var query = 'SELECT v.codigo_item_venta AS item, v.nombre_item_venta AS nombre, ' +
					'Sum(v.cantidad_venta) AS cantidad_ventas, ' +
					'Sum(v.monto_venta) AS valor_ventas, ' +
					'pptoitem.cantidad_presupuesto, ' +
					'pptoitem.valor_presupuesto, ' +
					'(Sum(v.monto_venta) / pptoitem.valor_presupuesto) AS avance_ppto ' +
					'FROM ' +
					'venta v ' +
					'INNER JOIN presupuesto_item AS pptoitem ' +
					'ON pptoitem.item_presupuesto = v.codigo_item_venta ' +
					'WHERE ' +
					'v.fecha_venta BETWEEN \'2016-07-01\' AND \'2017-06-30\' ' +
					'GROUP BY ' +
					'v.codigo_item_venta ' +
					'ORDER BY ' +
					'Sum(v.monto_venta) DESC';

		//console.log(query);

		GLOBAL.pool.query(query,function(err,rows){
		  if(err) throw err;
		  res.json(rows);
		});
	/*}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}*/
});



router.get('/ventas_ppto-delegados', function(req, res) {
	/*if (req.session.id_usuario)
	{*/
		var query = 'SELECT pptodelegado.nombre_delegado_presupuesto, '+
					'v.codigo_vendedor_venta AS delegado, '+
					'Sum(v.cantidad_venta) AS cantidad_ventas, '+
					'Sum(v.monto_venta) AS valor_ventas, '+
					'pptodelegado.cantidad_presupuesto, '+
					'pptodelegado.valor_presupuesto, '+
					'(Sum(v.monto_venta) / pptodelegado.valor_presupuesto) AS avance_ppto '+
					'FROM venta v INNER JOIN presupuesto_delegado AS pptodelegado '+
					'ON pptodelegado.delegado_presupuesto = v.codigo_vendedor_venta '+
					'WHERE v.fecha_venta BETWEEN \'2016-07-01\' AND \'2017-06-30\' '+
					'GROUP BY v.codigo_vendedor_venta '+
					'ORDER BY Sum(v.monto_venta) DESC';

		//console.log(query);

		GLOBAL.pool.query(query,function(err,rows){
		  if(err) throw err;
		  res.json(rows);
		});
	/*}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}*/
});



router.get('/ventas_ppto-consolidado', function(req, res) {
	/*if (req.session.id_usuario)
	{*/
		var query = 'SELECT ' +
					'\'Consolidado\' AS consolidado,' + 
					'Sum(v.cantidad_venta) AS cantidad_ventas, ' +
					'Sum(v.monto_venta) AS valor_ventas, ' +

					'(select sum(`presupuesto`.`cantidad_presupuesto`) AS `cantidad_presupuesto` '+
					'from `presupuesto`) AS cantidad_presupuesto, ' +

					'(select sum((`presupuesto`.`pvp_presupuesto` * `presupuesto`.`cantidad_presupuesto`)) '+
					'from `presupuesto`) AS valor_presupuesto, ' +

					'(Sum(v.monto_venta) / ((select sum((`presupuesto`.`pvp_presupuesto` * `presupuesto`.`cantidad_presupuesto`)) '+
					'from `presupuesto`)) ) AS avance_ppto ' +

					'FROM ' +
					'venta v ' +

					'WHERE ' +
					'v.fecha_venta BETWEEN \'2016-07-01\' AND \'2017-06-30\' ' +

					'ORDER BY ' +
					'Sum(v.monto_venta) DESC';

		//console.log(query);

		GLOBAL.pool.query(query,function(err,rows){
		  if(err) throw err;
		  res.json(rows);
		});
	/*}
	else
	{
		res.json({"success": "false", "msg": "No estas logueado!"});
	}*/
});



module.exports = router;