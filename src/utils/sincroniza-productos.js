module.exports.getSincronizarItems = getSincronizarItems;
module.exports.truncateItemTmp = truncateItemTmp;
module.exports.guardaItemTmp = guardaItemTmp;

var moment = require('moment');

function truncateItemTmp (callback, res) {
	var query = 'DELETE FROM `item_tmp`; \
			SET FOREIGN_KEY_CHECKS = 0; \
			TRUNCATE TABLE  `item_tmp`; \
			SET FOREIGN_KEY_CHECKS = 1;';

	GLOBAL.pool.query(query, function(err, infoTruncate){
		if(err) throw err;
		callback(guardaItemTmp, res);
	});
}


function getSincronizarItems (callback, res) {
	// Se crea el query que se ejecutará en el SQL Server (NAVISION)
	var query = 'SELECT [No_] AS codigo_nav_item \
				      ,[Description] AS nombre_nav_item \
				      ,[Item Disc_ Group] AS grupo_nav_item \
				      ,[Product Group Code] AS grupo_codigo_nav_item \
				      ,[ISBN] AS isbn_nav_item \
				      ,[Grado] AS grado_nav_item \
				      ,[Carga horaria] AS carga_horaria_nav_item \
				      ,[Materia] AS materia_nav_item \
				      ,[Nivel Educativo] AS nivel_educativo_nav_item \
				      ,[Obra] AS obra_nav_item \
				      ,[Autor] AS autor_nav_item \
				      ,[Grupo de Negocio] AS grupo_negocio_nav_item \
				  FROM [NAV2013R2].[dbo].[Santillana Bolivia$Item]';

  	// Se conecta al servidor SQL Server (con el usuario nodejs de solo lectura)
	GLOBAL.sql.connect("mssql://nodejs:prueba-1@10.137.32.35/NAV2013R2").then(function() {

		// Se ejecuta el query en el servidor SQL Server
	    new GLOBAL.sql.Request().query(query)
	    .then(function(recordset) {

	    	//console.log(recordset);
	    	callback(recordset, sincronitaItems, res);

    	}).catch(function(err) {
				    console.log("Query Error: ");
			        console.log(err);
			    });


	}).catch(function(err) {
		    console.log("Connection Error: ");
		    console.log(err);
		});
}


function guardaItemTmp (items, callback, res) {
	console.log(items.length);

	var query2 = 'INSERT INTO `muestras`.`item_tmp` \
					(`id_item`, `codigo_nav_item`, `nombre_nav_item`,  \
						`grupo_nav_item`, `grupo_codigo_nav_item`, `isbn_nav_item`,  \
						`grado_nav_item`, `carga_horaria_nav_item`, `materia_nav_item`,  \
						`nivel_educativo_nav_item`, `obra_nav_item`, `autor_nav_item`,  \
						`grupo_negocio_nav_item`)  \
					VALUES ';

	for (var i=0; i<items.length; i++)
	{
		//console.log(items[i].codigo_nav_item);

		query2 += "(NULL, \
					"+ GLOBAL.mysql.escape(items[i].codigo_nav_item) +",  \
					"+ GLOBAL.mysql.escape(items[i].nombre_nav_item) +",  \
					"+ GLOBAL.mysql.escape(items[i].grupo_nav_item) +",  \
					"+ GLOBAL.mysql.escape(items[i].grupo_codigo_nav_item) +",  \
					"+ GLOBAL.mysql.escape(items[i].isbn_nav_item) +",  \
					"+ GLOBAL.mysql.escape(items[i].grado_nav_item) +",  \
					"+ GLOBAL.mysql.escape(items[i].carga_horaria_nav_item) +",  \
					"+ GLOBAL.mysql.escape(items[i].materia_nav_item) +",  \
					"+ GLOBAL.mysql.escape(items[i].nivel_educativo_nav_item) +",  \
					"+ GLOBAL.mysql.escape(items[i].obra_nav_item) +",  \
					"+ GLOBAL.mysql.escape(items[i].autor_nav_item) +",  \
					"+ GLOBAL.mysql.escape(items[i].grupo_negocio_nav_item) +") ";

		query2 += (items[i+1]) ? ',' : ';';
	}



	GLOBAL.pool.query(query2, function(err,info){
		if(err) throw err;
		callback(res);
	});
}


function sincronitaItems (res) {
	var query = 'INSERT INTO item SELECT NULL, NULL, item_tmp.codigo_nav_item, item_tmp.nombre_nav_item, \
item_tmp.grupo_nav_item, item_tmp.grupo_codigo_nav_item, item_tmp.isbn_nav_item, \
item_tmp.grado_nav_item, item_tmp.carga_horaria_nav_item, item_tmp.materia_nav_item, \
item_tmp.nivel_educativo_nav_item, item_tmp.obra_nav_item, \
item_tmp.autor_nav_item, item_tmp.grupo_negocio_nav_item \
FROM item_tmp LEFT OUTER JOIN item ON item.codigo_nav_item = item_tmp.codigo_nav_item \
WHERE item.codigo_nav_item IS NULL';

	console.log(query);

	GLOBAL.pool.query(query, function(err,info){
		if(err) throw err;
		console.log(info);
		res.json(info);
	});
}