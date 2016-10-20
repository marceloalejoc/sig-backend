var config = require('konfig')();
var pg = require('pg'), client, query, query1, query2;


/* GET /api/v1/usuarios */
var list = function(req, res) {
  var usuarios_json = function(req, res) {
    client = new pg.Client(config.app.db);
    client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT id_usuario+1983 id_usuario, usuario,nombre,ap_paterno,ap_materno,lat,lng,img, MD5(id_dispositivo) id_dispositivo, SUBSTRING(fecha::VARCHAR,1,10) fecha, SUBSTRING(hora::VARCHAR,1,8) hora "
          + "FROM usuarios "
          + "WHERE lat IS NOT NULL AND lng IS NOT NULL "
          + "ORDER BY fecha DESC,hora DESC  ";
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

/* POST /api/v1/usuarios/:usuario/info */
var info = function(req, res) {
  var informacion_json = function(req, res) {
    client = new pg.Client(config.app.db);
    client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT id_usuario+1983 id_usuario,usuario,nombre,ap_paterno,ap_materno, img,email,descripcion, dia,mes,ano,siglas,empresa , nivel::VARCHAR "
          + ",SUBSTRING(fecha::VARCHAR,1,10) fecha, SUBSTRING(hora::VARCHAR,1,8) hora  "
          + "FROM usuarios "
          + "WHERE usuario='" + req.params.user + "' ";
    if(req.body.user.id_usuario) {
      query += " AND id_usuario+1983='"+req.body.user.id_usuario+"' ";
    }
    query = client.query(query, function(err, result){
      res.set('content-type', 'application/json; charset=UTF-8');
      if(err) {
        console.error('Error ejecutando consulta: ', err);
        res.json({'error':'Error en los parametros'});
      } else {
        console.log('Usuario info respuesta en formato JSON');
        var row = result.rows[0];
        if(row && row.usuario) {
          console.log('HORA:',row.fecha);
          row.status = '200';
          res.json(row);
        } else {
          row = {
            status: '403'
          };
          res.json(row);
        }
      }
    });
  }

  informacion_json(req, res);
}

/* POST /api/v1/users/login/:user */
var login =  function(req, res) {
  var login_json = function(req, res) {
    var row = null;
    var row1 = null;
    var row2 = null;

    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query1 = "SELECT id_usuario+1983 id_usuario,usuario,nombre,ap_paterno,ap_materno,MD5(id_dispositivo) id ,img "
           + "FROM usuarios "
           + "WHERE contrasena IS NOT NULL "
           + "  AND usuario='"+req.params.user+"' "
           //+ "AND id_dispositivo='"+req.body.iddisp+"' "

    query1 = client.query(query1, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      if(err) {
        client.end(function (err) { if (err) throw err; }); // disconnect the client
        console.error('Error ejecutando consulta: ', err);
        res.json({'status':'500'});
      } else {
        row1 = result.rows[0];
        if(row1) {
          client.end(function (err) { if (err) throw err; }); // disconnect the client
          console.log('Error usuarios: Contraseña requerida');
          res.json({'status':'201','info':'Contraseña requerida'});
        } else {
          if(!req.body.latlng) {
            console.log('Error usuarios: Ubicacion requerida');
            res.json({'status':'201','info':'Ubicacion requerida'});
            return;
          }
          query2 = "UPDATE usuarios "
                 + "SET usuario='"+req.params.user+"' "
                 + "WHERE id_dispositivo='"+req.body.iddisp+"' "
                 + "  AND contrasena IS NULL "
                 + "RETURNING id_usuario+1983 id_usuario,usuario,nombre,ap_paterno,ap_materno,MD5(id_dispositivo) id ,img "
          query2 = client.query(query2, function(err, result){
            if(err) {
              client.end(function (err) { if (err) throw err; }); // disconnect the client
              console.error('Error ejecutando consulta: ', err);
              res.json({'status':'501'});
            } else {
              row2 = result.rows[0];
              //console.log('DEBUG', row2);
              if(row2) {
                console.error('Usuarios respuesta en formato JSON');
                row2.status = '200';
                res.json(row2);
              } else {
                var datos = [req.params.user, req.body.iddisp, 'Usuario','Dispositivo','Autoregistrado'];
                query = "INSERT INTO usuarios "
                      + "(usuario,id_dispositivo,nombre,ap_paterno,ap_materno, fecha,hora, nivel ) "
                      + "VALUES ($1,$2,$3,$4,$5, TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, TO_CHAR(NOW(),'HH24:MI:SS')::TIME , 100) "
                      + "RETURNING id_usuario+1983 id_usuario,usuario,nombre,ap_paterno,ap_materno,MD5(id_dispositivo) id ,img "
                query = client.query(query, datos, function(err, result){
                  if(err) {
                    client.end(function (err) { if (err) throw err; }); // disconnect the client
                    console.error('Error ejecutando consulta: ', err);
                    res.json({'status':'501'});
                  } else {
                    client.end(function (err) { if (err) throw err; }); // disconnect the client
                    console.error('Usuarios respuesta en formato JSON');
                    row = result.rows[0];
                    row.status = '200';
                    res.json(row);
                  }
                });
              }
            }
          });
        }
      }
    });
  }

  var loginPass_json = function(req, res) {
    var row = null;
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();
    query = "SELECT id_usuario+1983 id_usuario,usuario,nombre,ap_paterno,ap_materno,MD5(id_dispositivo) id ,img "
          + "FROM usuarios "
          + "WHERE usuario = '"+req.params.user+"' "
          + "  AND contrasena='"+req.body.password+"' "
          //+ "  AND id_dispositivo = '"+req.body.iddisp+"' "

    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      if(err) {
        client.end(function (err) { if (err) throw err; }); // disconnect the client
        console.error('Error ejecutando consulta: ', err);
        res.json({'status':'500'});
      } else {
        row = result.rows[0];
        if(row) {
          client.end(function (err) { if (err) throw err; }); // disconnect the client
          console.error('Usuarios respuesta en formato JSON');
          row.status = '200';
          res.json(row);
        } else {
          client.end(function (err) { if (err) throw err; }); // disconnect the client
          console.error('Usuarios respuesta en formato JSON');
          res.json({'status':'403'});
        }
      }

    });
  }

  if(req.body.password)
    loginPass_json(req, res);
  else
    login_json(req, res);
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
                     req.body.nombre, req.body.appaterno, req.body.apmaterno, // $5
                     req.body.iddisp, req.body.descripcion, req.body.siglas, req.body.email, // $9
                     req.body.dia, req.body.mes, req.body.ano,
                     req.body.latlng[0], req.body.latlng[1], // $14
                     req.body.tipo];
        query2 = "INSERT INTO usuarios "
               + "(usuario,contrasena,nombre,ap_paterno,ap_materno,id_dispositivo, descripcion,siglas,email,dia,mes,ano, lat,lng, nivel, fecha,hora) "
               + "VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, $13,$14, $15, TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, TO_CHAR(NOW(),'HH24:MI:SS')::TIME)\n"
               + "RETURNING id_usuario+1983 id_usuario, usuario, id_dispositivo id;\n";
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


/* PUT /api/v1/usuarios/:user/:iduser */
var update =  function(req, res) {
  var row = null;

  client = new pg.Client(config.app.db);
  //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
  client.connect();

    req.body.iddisp=req.body.iddisp?req.body.iddisp:null;

    var datos = [req.body.usuario, req.body.contras,
                 req.body.nombre, req.body.ap_paterno, req.body.ap_materno, // $5
                 req.body.img, req.body.descripcion, req.body.siglas, req.body.email, // $9
                 req.body.dia, req.body.mes, req.body.ano, // $12
                 req.body.nivel];

    query = "UPDATE usuarios \n"
          + "SET usuario=$1,contrasena=$2,nombre=$3,ap_paterno=$4,ap_materno=$5, img=$6, descripcion=$7,siglas=$8,email=$9 "
          + ",dia=$10,mes=$11,ano=$12, nivel=$13 "
          + ",fecha=TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, hora=TO_CHAR(NOW(),'HH24:MI:SS')::TIME\n";
    query+= "WHERE id_usuario+1983='"+req.body.id_usuario+"' AND nivel!=100 \n"
          + "RETURNING id_usuario+1983 id_usuario, usuario;\n";

    query = client.query(query, datos, function(err, result){
      if(err) {
        client.end(function (err) { if (err) throw err; }); // disconnect the client
        console.error('Error ejecutando insert: ', err);
        row = {status:500};
      } else {

        if(result.rows[0]) {
          row = result.rows[0];
          row.status=200;
        } else {
          row = {status:304}
        }
      }
      // disconnect the client
      client.end(function (err) {
        if (err) throw err;
      });
      res.json(row);
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
exports.update = update;
