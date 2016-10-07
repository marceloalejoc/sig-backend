var config = require('konfig')();
var pg = require('pg');
var client, query;
var client2, query2;


/* GET /api/v1/mensaje */
var enviar = function(req, res) {
  var postMensaje_json = function(req, res) {
    var row = null;
    var row2 = null;

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
        console.log('BODY: ',req.body);
        if(req.body.id2) {
          query2 = "INSERT INTO mensajes "
                 + "(id_usuario1, id_usuario2, lat, lng, fecha, hora, mensaje) "
                 + "VALUES ("+ req.body.id1 +", '"+ req.body.id2 +"', '"+ req.body.latlng[0] +"', '"+ req.body.latlng[1] +"', TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, TO_CHAR(NOW(),'HH24:MI:SS')::TIME, '"+ req.body.texto +"' ) "
                 + "RETURNING id_mensaje, fecha, hora ";
        } else {
          query2 = "INSERT INTO mensajes "
                 + "(id_usuario1, lat, lng, fecha, hora, mensaje) "
                 + "VALUES ("+ req.body.id1 +", '"+ req.body.latlng[0] +"', '"+ req.body.latlng[1] +"', TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, TO_CHAR(NOW(),'HH24:MI:SS')::TIME, '"+ req.body.texto +"' ) "
                 + "RETURNING id_mensaje, fecha, hora ";
        }
        query2 = client2.query(query2, function(err,result){
          if(err) {
            console.error('INSERT', err);
            res.json({'status':'500'});
          } else {
            console.log('MSG INSERT OK');
            row2 = result.rows[0];
            row2.status = '200';
            res.json(row2);
          }
        });

      }
    });

    console.log('Fecha:', Date());

  }

  if(!req.body.id1) {
    res.set('content-type','application/json; charset=UTF-8');
    console.log('Error en peticion de datos');
    res.json('status','400');
  }
  req.body.id1 -= 1983;
  if(req.body.id2) {
    req.body.id2 -= 1983;
  }
  postMensaje_json(req, res);
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
        res.json({'status':'500'});
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
            res.json({'status':'500'});
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


/* POST /api/v1/mensaje */
var recibirUser = function(req, res) {
  var postMensaje_json = function(req, res) {
    var row = null;

    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    //client2 = new pg.Client(config.app.db);
    //client2.on('drain', client2.end.bind(client2)); //disconnect client when all queries are finished
    //client2.connect();

    query = "SELECT id_usuario, usuario, nombre, ap_paterno, ap_materno "
          + "FROM usuarios "
          + "WHERE usuario='"+ req.body.usuario +"' "
          + "  AND id_dispositivo='"+req.body.iddisp+"' ";
    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      if(err) {
        client.end(function (err) { if (err) throw err; }); // disconnect the client
        console.error('SELECT', err);
        row = null;
        res.json({'status':'500'});
      } else {
        console.log('BODY:: ',req.body);
        row = result.rows[0];
        query2 = "SELECT me.id_usuario1, me.id_usuario2, me.lat, me.lng, me.fecha, me.hora, me.mensaje "
               + "       ,us1.usuario usuario1 "
               + "       ,us2.usuario usuario2 "
               + "FROM mensajes me "
               + "JOIN usuarios us1 ON us1.id_usuario=me.id_usuario1 "
               + "LEFT JOIN usuarios us2 ON us2.id_usuario=me.id_usuario2 "
        if(req.body.seguir && req.body.seguir.user && req.body.seguir.user.usuario) {
          query2 +=" WHERE (us1.usuario='"+ req.body.usuario +"' AND us2.usuario='"+ req.body.seguir.user.usuario +"') "
               + "   OR (us1.usuario='"+ req.body.seguir.user.usuario +"' AND us2.usuario='"+ req.body.usuario +"') ";
        } else {
          query2 +=" WHERE ( us2.usuario IS NULL ) "
        }
        query2 +=" ORDER BY fecha,hora "
        //console.log( (!!req.body.seguir.user) ,'SQL: ',query2);
        query2 = client.query(query2, function(err,result){
          if(err) {
            client.end(function (err) { if (err) throw err; }); // disconnect the client
            console.error('Error:', err);
            res.json({'status':'500'});
          } else {
            client.end(function (err) { if (err) throw err; }); // disconnect the client
            //console.log(result.rows);
            console.log('Mensajes respuesta en formato JSON');
            res.json(result.rows);
          }
        });

      }
    });

  }

  postMensaje_json(req, res);
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
exports.recibirUser = recibirUser;
