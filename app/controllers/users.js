var config = require('konfig')();
var pg = require('pg'), client, query, query2;


/* GET /api/v1/usuarios */
var list = function(req, res) {
  var usuarios_json = function(req, res) {
    client = new pg.Client(config.app.db);
    client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT usuario,nombre,ap_paterno,ap_materno,lat,lng,img, id_dispositivo "
          + "FROM usuarios "
          + "WHERE lat IS NOT NULL AND lng IS NOT NULL ";
    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      if(err) {
        console.error('Error ejecutando consulta: ', err);
        res.json({'error':'Error en los parametros'});
      } else {
        console.log('Usuarios respuesta en formato JSON');
        res.json(result.rows);
      }
    });
  }

  usuarios_json(req, res);
}

/* GET /api/v1/usuarios/:usuario/info */
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

/* POST /api/v1/usuarios/login/:usuario */
var login =  function(req, res) {
  var row = null;
  var row2 = null;

  client = new pg.Client(config.app.db);
  //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
  client.connect();

  query = "SELECT id_usuario+1983 id_usuario,usuario,nombre,ap_paterno,ap_materno,id_dispositivo id ,img "
        + "FROM usuarios "
        + "WHERE usuario = '"+req.params.user+"' "
        + "  AND contrasena='"+req.body.password+"' "
        + "  AND id_dispositivo='"+req.body.iddisp+"' ";
  query = client.query(query, function(err, result){
    res.set('content-type','application/json; charset=UTF-8');
    if(err) {
      // disconnect the client
      client.end(function (err) {
        if (err) throw err;
      });
      console.error('Error ejecutando consulta: ', err);
      res.json({'error':'Error en los parametros'});
    } else {
      console.log('Usuarios respuesta en formato JSON');
      //res.json(result.rows);
      row = result.rows[0];
      if (row && row.usuario) { // ifok1
        row.status = 200;
      } else {
        row = {'status':404};
      } // ifok1
      // disconnect the client
      client.end(function (err) {
        if (err) throw err;
      });
      res.json(row);
    }

  });

}


/* POST /api/v1/usuarios/register/:usuario */
var register =  function(req, res) {
  var row = null;

  client = new pg.Client(config.app.db);
  //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
  client.connect();

  query = "SELECT id_usuario "
        + "FROM usuarios "
        + "WHERE usuario='"+req.params.user+"' ";
  query = client.query(query, function(err, result){
    res.set('content-type','application/json; charset=UTF-8');
    if(err) {
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      console.error('Error ejecutando select: ', err);
      row = {status:500};
      res.json(row);
    } else {
      console.log('Registrarse respuesta en formato JSON');
      row = result.rows[0];
      if (row && row.id_usuario) { // ifok1
        client.end(function (err) { if (err) throw err; }); // disconnect the client
        row = {status:304};
        res.json(row);
      } else {
        var datos = [req.body.usuario, req.body.password,
                     req.body.nombre, req.body.appaterno, req.body.apmaterno,
                     req.body.iddisp,
                     req.body.negocio, req.body.email,
                     req.body.dia, req.body.mes, req.body.ano,
                     req.body.latlng[0], req.body.latlng[1]];
        query2 = "INSERT INTO usuarios "
               + "(usuario,contrasena,nombre,ap_paterno,ap_materno,id_dispositivo, descripcion,email,dia,mes,ano,lat,lng) "
               + "VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, $12,$13) "
               + "RETURNING id_usuario+1983 id_usuario, usuario, id_dispositivo id ";
        query2 = client.query(query2, datos, function(err, result){
          if(err) {
            client.end(function (err) { if (err) throw err; }); // disconnect the client
            console.error('Error ejecutando insert: ', err);
            row = {status:500};
          } else {
            row = result.rows[0];
            row.status=200;
          }
          // disconnect the client
          client.end(function (err) {
            if (err) throw err;
          });
          res.json(row);
        });
      } // ifok1
    }

  });

}


/* POST /api/v1/usuarios/login/:usuario */
var login1 =  function(req, res) {
  var row = null;
  var row2 = null;

  client = new pg.Client(config.app.db);
  //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
  client.connect();

  query = "SELECT id_usuario,usuario,nombre,ap_paterno,ap_materno,img "
        + "FROM usuarios "
        + "WHERE usuario = '"+req.params.usuario+"' "
        + "  AND id_dispositivo='"+req.body.iddisp+"' ";
  query = client.query(query, function(err, result){
    res.set('content-type','application/json; charset=UTF-8');
    if(err) {
      // disconnect the client
      client.end(function (err) {
        if (err) throw err;
      });
      console.error('Error ejecutando consulta: ', err);
      res.json({'error':'Error en los parametros'});
    } else {
      console.log('Usuarios respuesta en formato JSON');
      //res.json(result.rows);
      row = result.rows[0];
      if (row && row.usuario) { // ifok1
        // disconnect the client
        client.end(function (err) {
          if (err) throw err;
        });
        //console.log('Resultado1:',result.rows);
        res.json(row);
      } else {

        //console.log('BODY:',req.body);
        query2 = "INSERT INTO usuarios "
               + "(usuario, nombre, ap_paterno, ap_materno, id_dispositivo, email) "
               + "VALUES ('"+req.params.usuario+"', 'Usuario', 'Visitante' ,'Anonimo', '"+req.body.iddisp+"', '"+req.body.email+"') "
               + "RETURNING id_usuario,usuario,nombre,ap_paterno,ap_materno ";
        query2 = client.query(query2, function(err, result){
          if(err) {
            // disconnect the client
            client.end(function (err) {
              if (err) throw err;
            });
            console.error('Error2 ejecutando consulta: ', err);
            res.json({'error':'Error en los parametros'});
          } else {
            // disconnect the client
            client.end(function (err) {
              if (err) throw err;
            });
            //console.log('Resultado2:',result);
            row2 = result.rows[0];
            res.json(row2);
          }

        });

      } // ifok1

    }

  });

}

exports.list = list;
exports.info = info;
exports.login = login;
exports.register = register;
