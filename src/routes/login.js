var ActiveDirectory = require('activedirectory');
var express = require('express');
var router = new express.Router(); 

var loginLocal = 1;

router.get('/login-santillana', function(req, res) {
	if (loginLocal == 1)
	{
		//req.session.usuario = 'fpenaranda';
		//req.session.id_usuario = 24;

    	var query1 = 'SELECT * FROM usuario_00_01_01 WHERE correo_usuario = \'fpenaranda@santillana.com\';'

    	GLOBAL.pool.query(query1, function(err,rows){
		  if(err) throw err;
		  req.session.id_usuario = rows[0].id_usuario;

		  	var queryPrivilegios = 'SELECT DISTINCT(usuario_privilegio_00_00_04.nombre_privilegio_usuario_privilegio) \
				FROM usuario_00_01_01 \
				INNER JOIN usuario_tipo_usuario_00_01_02 ON usuario_tipo_usuario_00_01_02.fk_id_usuario = usuario_00_01_01.id_usuario \
				INNER JOIN usuario_tipo_00_02_01 ON usuario_tipo_usuario_00_01_02.fk_id_usuario_tipo = usuario_tipo_00_02_01.id_usuario_tipo \
				INNER JOIN usuario_tipo_privilegio_00_02_02 ON usuario_tipo_privilegio_00_02_02.fk_id_usuario_tipo = usuario_tipo_00_02_01.id_usuario_tipo \
				INNER JOIN usuario_privilegio_00_00_04 ON usuario_tipo_privilegio_00_02_02.fk_id_usuario_privilegio = usuario_privilegio_00_00_04.id_usuario_privilegio \
				WHERE usuario_00_01_01.correo_usuario = \'fpenaranda@santillana.com\';'; 
	  		
	  		GLOBAL.pool.query(queryPrivilegios, function(err2,rows2){
			  if(err2) throw err2;

			  var privilegios2 = [];

			  for (var i=0; i<rows2.length; i++)
			  {
			  	privilegios2.push(rows2[i].nombre_privilegio_usuario_privilegio);
			  }

			  res.json({"success": "true", "privilegios": privilegios2});
			});

		});

	}
	else
	{
		var config = { url: 'ldap://sbodc01',
		               baseDN: 'OU=Usuarios,OU=BO,OU=Santillana-Nuevo,DC=SANTILLANA,DC=LOCAL',
		               username: 'fpenaranda@santillana.com',
		               password: 'Stargate2016' }

		var ad = new ActiveDirectory(config);

		ad.authenticate(req.query.username, req.query.password, function(err, auth) {
		  if (err) {
		    console.log('ERROR: '+JSON.stringify(err)); 
		    res.json({"success": "false"});
		  }
		  else
		  {
			  if (auth) {
			    console.log('Authenticated!');
			    req.session.usuario = req.query.username;

			    if (req.session.usuario)
			    {
			    	var query1 = 'SELECT * FROM usuario_00_01_01 WHERE correo_usuario = \'' + req.session.usuario + '\'';

			    	GLOBAL.pool.query(query1, function(err,rows){
					  if(err) throw err;
					  req.session.id_usuario = rows[0].id_usuario;

					  	var queryPrivilegios = 'SELECT DISTINCT(usuario_privilegio_00_00_04.nombre_privilegio_usuario_privilegio) \
							FROM usuario_00_01_01 \
							INNER JOIN usuario_tipo_usuario_00_01_02 ON usuario_tipo_usuario_00_01_02.fk_id_usuario = usuario_00_01_01.id_usuario \
							INNER JOIN usuario_tipo_00_02_01 ON usuario_tipo_usuario_00_01_02.fk_id_usuario_tipo = usuario_tipo_00_02_01.id_usuario_tipo \
							INNER JOIN usuario_tipo_privilegio_00_02_02 ON usuario_tipo_privilegio_00_02_02.fk_id_usuario_tipo = usuario_tipo_00_02_01.id_usuario_tipo \
							INNER JOIN usuario_privilegio_00_00_04 ON usuario_tipo_privilegio_00_02_02.fk_id_usuario_privilegio = usuario_privilegio_00_00_04.id_usuario_privilegio \
							WHERE usuario_00_01_01.correo_usuario = \'' + req.session.usuario + '\';'; 
				  		
				  		GLOBAL.pool.query(queryPrivilegios, function(err2,rows2){
						  if(err2) throw err2;

						  var privilegios2 = [];

						  for (var i=0; i<rows2.length; i++)
						  {
						  	privilegios2.push(rows2[i].nombre_privilegio_usuario_privilegio);
						  }

						  res.json({"success": "true", "privilegios": privilegios2});
						});

					});
			    }
			  }
			  else {
			    console.log('Authentication failed!');
			    res.json({"success": "false"});
			  }
		  }

		  return;
		});
	}
});


router.get('/salir', function (req, res) {
	req.session.id_usuario = '';
	res.json({"success": "true"});
});


module.exports = router;