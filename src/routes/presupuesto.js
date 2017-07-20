var express = require('express');
var session = require('express-session');
var fs = require('fs');
var moment = require('moment');
moment().format();
var router = new express.Router();


router.get('/presupuesto-zonas', function(req, res) {
	/*if (req.session.id_usuario)
	{*/
		var query = 'SELECT presupuesto.ciudad_presupuesto AS Ciudad, ' +
					'Sum(presupuesto.cantidad_presupuesto) AS Cantidad, ' +
					'sum(presupuesto.pvp_presupuesto * presupuesto.cantidad_presupuesto) AS Total ' +
					'FROM presupuesto GROUP BY presupuesto.ciudad_presupuesto';

		console.log(query);

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