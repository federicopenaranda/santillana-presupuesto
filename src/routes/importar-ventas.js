var express = require('express');
var session = require('express-session');
var pdf = require('pdfkit');
var fs = require('fs');
var moment = require('moment');
moment().format();
var importarVentas = require('../utils/importar-ventas');
var router = new express.Router();


router.get('/importar-ventas', function(req, res) {
	console.log(req.query.fechaInicio);
	console.log(req.query.fechaFin);

	importarVentas.truncateVentasTmp(req.query.fechaInicio, req.query.fechaFin, res);

	if (req.session.id_usuario)
	{
		
		//res.json({"success": "true", "msg": "entra!"});
	}
	else
	{
		//res.json({"success": "false", "msg": "No estas logueado!"});
	}
});

module.exports = router;