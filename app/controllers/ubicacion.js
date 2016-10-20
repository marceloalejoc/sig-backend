var config = require('konfig')();
var pg = require('pg');
var client, client2;
var query, query2, query3;


/* GET /api/v1/ubicacion */
var usuario = function(req, res) {
  var postUbicacion_json = function(req, res) {
    var row1 = null;
    var row2 = null;

    client = new pg.Client(config.app.db);
    client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT id_usuario, usuario, nombre, ap_paterno, ap_materno "
          + "FROM usuarios "
          + "WHERE usuario='"+ req.params.usuario +"' ";
    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      if(err) {
        console.error('SELECT', err);
        row1 = null;
        res.json({'error':'Error SQL'});
      } else {
        row1 = result.rows[0];
        query2 = "INSERT INTO ubicacion "
               + "(id_usuario, lat, lng, fecha, hora) "
               + "VALUES ('"+ row1.id_usuario +"', '"+ req.body.latlng[0] +"', '"+ req.body.latlng[1] +"', TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, TO_CHAR(NOW(),'HH24:MI:SS')::TIME ) "
               + "RETURNING id_ubicacion ; "
        query2+= "UPDATE usuarios "
               + "SET lat='"+req.body.latlng[0]+"', lng='"+req.body.latlng[1]+"', fecha=TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, hora=TO_CHAR(NOW(),'HH24:MI:SS')::TIME "//", fecha, hora "
               + "WHERE  id_usuario="+ row1.id_usuario + "; "
               + "RETURNING id_usuario ; "
        query2 = client2.query(query2, function(err,result){
          if(err) {
            console.error('INSERT2', err);
            res.json({'Error':'500'});
          } else {
            console.log('INSERT OK');
            row2 = result.rows;
            res.json(row2);
          }
        });

      }
    });

    console.log('Fecha:', Date());

  }

  postUbicacion_json(req, res);
}

/* GET /api/v1/ubicacion/:usuario */
var getUbicacion = function(req, res) {
  var getUbicacion_json = function(req, res) {
    var row = null;
    var row2 = null;

    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();


    query = "SELECT * "
          + "FROM usuarios "
          + "WHERE usuario='"+ req.params.usuario +"' "
          //+ "  AND id_dispositivo = '"+req.body.iddisp+"' ";
    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      if(err) {
        client.end(function (err) { if (err) throw err; }); // disconnect the client
        console.error('SELECT', err);
        res.json({'error':'Error SQL'});
      } else {
        row = result.rows[0];
        if(row) {
          query2 = "SELECT lat, lng, SUBSTRING(fecha::VARCHAR,0,11) fecha, SUBSTRING(hora::VARCHAR,0,9) hora "
                 + "FROM ubicacion "
                 + "WHERE id_usuario='"+ row.id_usuario +"' "
                 + "ORDER BY fecha,hora ";
          query2 = client.query(query2, function(err,result){
            if(err) {
              console.error('ERROR:', err);
              res.json({'Error':'500'});
            } else {
              row2 = result.rows;
              console.log('LIST OK');
              res.json(row2);
            }
          });
        } else {
          res.json({'Error':'404'});
        }

        client.end(function (err) { if (err) throw err; }); // disconnect the client

      }
    });

  }

  getUbicacion_json(req, res);
}


/* POST /api/v1/ubicacion/:usuario */
var postUbicacion = function(req, res) {
  var postUbicacion_json = function(req, res) {
    var row1 = null;
    var row2 = null;

    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT id_usuario, usuario, nombre, ap_paterno, ap_materno "
          + "FROM usuarios "
          + "WHERE usuario='"+ req.params.usuario +"' "
          + "  AND MD5(id_dispositivo) = '"+req.body.iddisp+"' ";
    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      if(err) {
        client.end(function (err) { if (err) throw err; }); // disconnect the client
        console.error('SELECT', err);
        res.json({'status':500});
      } else {
        row1 = result.rows[0];
        //console.log('PRUEBA',row, req.body, req.params);
        if(row1) {
          query2 = "INSERT INTO ubicacion "
                 + "(id_usuario, lat, lng, fecha, hora) "
                 + "VALUES ('"+ row1.id_usuario +"', '"+ req.body.latlng[0] +"', '"+ req.body.latlng[1] +"', TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, TO_CHAR(NOW(),'HH24:MI:SS')::TIME ) "
                 + "RETURNING id_ubicacion; "
          query2+= "UPDATE usuarios "
                 + "SET lat='"+req.body.latlng[0]+"', lng='"+req.body.latlng[1]+"', fecha=TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, hora=TO_CHAR(NOW(),'HH24:MI:SS')::TIME " //", fecha, hora "
                 + "WHERE  id_usuario="+ row1.id_usuario + " "
                 + "RETURNING id_usuario; "
          query2 = client.query(query2, function(err,result){
            client.end(function (err) { if (err) throw err; }); // disconnect the client
            if(err) {
              console.error('INSERT2 UPDATE3', err);
              res.json({'status':'501'});
            } else {
              console.log('INSERT2 UPDATE3 OK');
              res.json({'status':'200'});
            }
          });
        } else {
          client.end(function (err) { if (err) throw err; }); // disconnect the client
          res.json({'status':'403'});
        }

      }
    }); // query

  }

  if( !(req.body && req.body.latlng[0]&&req.body.latlng[1]) ){
    res.set('content-type','application/json; charset=UTF-8');
    res.json({'status':'501'});
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

exports.usuario = usuario;
exports.getUbicacion = getUbicacion;
exports.postUbicacion = postUbicacion;
exports.info = info;
