var express = require('express');
var session = require('express-session');
GLOBAL.mysql = require("mysql");
GLOBAL.sql = require('mssql');
var bodyParser = require("body-parser");
var app = express();
var moment = require('moment');
var _ = require('lodash');
var utils = require('./src/utils/utils');

moment().format();

var PORT = process.env.PORT || 3000;

// Las rutas estáticas deben estar antes del
// inicio de la sesión, si no es así se pierde la sesión
// luego de la ejecución de cada ruta.
app.use(express.static('reportes'));


app.use(session({
    secret: 'asfasfa3asfa',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 2160000000
    }
}));


app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(bodyParser.json());


// First you need to create a connection to the db
GLOBAL.pool = mysql.createPool({
	connectionLimit : 10,
  	//host: "192.168.100.150",
  	//host: "10.137.32.100",
  	multipleStatements: true,
  	host: "192.168.146.128",
  	user: "root",
  	password: "prueba-1",
  	database: "presupuesto",
  	acquireTimeout: 1000000
});


GLOBAL.pool.getConnection(function(err, connection) {
	if(err) throw err;
	console.log("Connected!");
});


GLOBAL.pool.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
});


// Servidor local de pruebas
/*GLOBAL.configMssql = {
    user: 'sa',
    password: 'prueba-1',
    server: 'SISTEMAS2',
    database: 'NAV2013R2',
    connectionTimeout: 250000,
    pool: {
        max: 10,
        min: 0
    }
}*/

// Servidor productivo
GLOBAL.configMssql = {
    user: 'nodejs',
    password: 'prueba-1',
    server: '10.137.32.35',
    database: 'NAV2013R2',
    connectionTimeout: 250000,
    pool: {
        max: 10,
        min: 0
    }
}




// Rutas de Logueo
app.use(require("./src/routes/login"));

// Rutas de Muestras a Colegios
app.use(require("./src/routes/importar-ventas"));

// Rutas de Presupuesto
app.use(require("./src/routes/presupuesto"));

// Rutas de Presupuesto
app.use(require("./src/routes/ventas_ppto"));

// Rutas Varias
app.use(require("./src/routes/otras"));





app.all('/*', function(req, res) {
    res.send('\
    	<!DOCTYPE html>\
		<html>\
		    <head>\
		        <title>Sistema de Presupuesto Santillana</title>\
		        <link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">\
            <link rel="stylesheet" type="text/css" href="https://bootswatch.com/darkly/bootstrap.min.css">\
		        <base href="/">\
		    </head>\
		    <body>\
		        <div ui-view></div>\
		        <script src="bundle.js"></script>\
		    </body>\
		</html>\
    	');
});


app.listen(PORT, function() {
    console.log('Server running on ' + PORT);
});