var config = require('konfig')();
var pg = require('pg');
var client, query;
var client2, query2;


/* GET /api/v1/mensaje */
var enviar = function(req, res) {
  var postUbicacion_json = function(req, res) {
    var row = null;

    client = new pg.Client(config.app.db);
    client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    client2 = new pg.Client(config.app.db);
    client2.on('drain', client2.end.bind(client2)); //disconnect client when all queries are finished
    client2.connect();

    query = "SELECT id_usuario, usuario, nombre, ap_paterno, ap_materno "
          + "FROM usuarios "
          + "WHERE usuario='"+ req.params.usuario +"' ";
    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      if(err) {
        console.error('SELECT', err);
        row = null;
        res.json({'error':'Error SQL'});
      } else {
        row = result.rows[0];
        query2 = "INSERT INTO mensajes "
               + "(id_usuario1, lat, lng, fecha, hora, mensaje) "
               + "VALUES ("+ row.id_usuario +", '"+ req.body.latlng[0] +"', '"+ req.body.latlng[1] +"', 'NOW()', 'NOW()', '"+ req.body.texto +"' ) ";
        query2 = client2.query(query2, function(err,result){
          if(err) {
            console.error('INSERT', err);
          } else {
            console.log('INSERT OK');
          }
        });

      }
    });

    console.log('Fecha:', Date());

  }

  postUbicacion_json(req, res);
}


/* GET /api/v1/mensaje */
var recibir = function(req, res) {
  var postUbicacion_json = function(req, res) {
    var row = null;

    client = new pg.Client(config.app.db);
    client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    client2 = new pg.Client(config.app.db);
    client2.on('drain', client2.end.bind(client2)); //disconnect client when all queries are finished
    client2.connect();

    query = "SELECT id_usuario, usuario, nombre, ap_paterno, ap_materno "
          + "FROM usuarios "
          + "WHERE usuario='"+ req.params.usuario +"' ";
    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      if(err) {
        console.error('SELECT', err);
        row = null;
        res.json({'error':'Error SQL'});
      } else {
        row = result.rows[0];
        query2 = "SELECT me.id_usuario1, me.id_usuario2, me.lat, me.lng, me.fecha, me.hora, me.mensaje "
               + "       ,us1.usuario usuario1 "
               + "       ,us2.usuario usuario2 "
               + "FROM mensajes me "
               + "JOIN usuarios us1 ON us1.id_usuario=me.id_usuario1 "
               + "LEFT JOIN usuarios us2 ON us2.id_usuario=me.id_usuario2 "
               //+ "WHERE usuario1='"+ req.params.usuario +"' OR usuario2='"+ req.params.usuario +"' ";
        query2 = client2.query(query2, function(err,result){
          if(err) {
            console.error('Error:', err);
            res.json({'error':'SQL'});
          } else {
            console.log('Mensajes respuesta en formato JSON');
            res.json(result.rows);
          }
        });

      }
    });

  }

  postUbicacion_json(req, res);
}


/* GET /api/v1/ubicacion/:usuario/info */
var info = function(req, res) {
  var informacion_json = function(req, res) {
    client = new pg.Client(config.app.db);
    client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT nombre,ap_paterno,ap_materno FROM usuarios WHERE usuario='" + req.params.usuario + "'";
    query = client.query(query, function(err, result){
      res.set('content-type', 'application/json; charset=UTF-8');
      if(err) {
        console.error('Error ejecutando consulta: ', err);
        res.json({'error':'Error en los parametros'});
      } else {
        console.log('Usuario info respuesta en formato JSON');
        res.json(result.rows);
      }
    });
  }

  informacion_json(req, res);
}

//exports.usuario = usuario;
exports.enviar = enviar;
exports.recibir = recibir;
