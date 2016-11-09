var config = require('konfig')();
var pg = require('pg'), client, query, query1, query2;


/* GET /api/v1/usuarios */
var list = function(req, res) {
  var usuarios_json = function(req, res) {
    client = new pg.Client(config.app.db);
    client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT id_usuario+1983 id_usuario, usuario,nombre,ap_paterno,ap_materno,lat,lng,img, MD5(id_dispositivo) id_dispositivo, SUBSTRING(fecha::VARCHAR,1,10) fecha, SUBSTRING(hora::VARCHAR,1,8) hora, nivel*13 tipo \n"
          + "FROM usuarios us\n"
          + "WHERE lat IS NOT NULL AND lng IS NOT NULL AND us.nivel>1\n"
          + "ORDER BY fecha DESC,hora DESC;  ";
    //console.log('SQL1:\n',query);
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

/* GET /api/v1/usuarios/last/:fecha/:hora */
var listLast = function(req, res) {
  var usuarios_json = function(req, res) {
    client = new pg.Client(config.app.db);
    client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT id_usuario+1983 id_usuario, usuario,nombre,ap_paterno,ap_materno,lat,lng,img, MD5(id_dispositivo) id_dispositivo, SUBSTRING(fecha::VARCHAR,1,10) fecha, SUBSTRING(hora::VARCHAR,1,8) hora, nivel*13 tipo \n"
          + "FROM usuarios us\n"
          + "WHERE lat IS NOT NULL AND lng IS NOT NULL AND us.nivel>1\n"
          + "  AND (us.fecha||' '||us.hora)>('"+req.params.fecha+"'||' '||'"+req.params.hora+"') "
          + "ORDER BY fecha DESC,hora DESC;  ";
    //console.log('SQL2:\n',query);
    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      if(err) {
        console.error('Error ejecutando consulta: ', err);
        res.json({'error':'Error en los parametros'});
      } else {
        console.log('Usuarios respuesta en formato JSON');
        //console.log('USER LAST',result.rows);
        res.json(result.rows);
      }
    });
  }

  usuarios_json(req, res);
}


/* POST /api/v1/usuarios/:usuario/info/:userid */
var info = function(req, res) {
  var informacion_json = function(req, res) {
    client = new pg.Client(config.app.db);
    client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT us.id_usuario+1983 id_usuario,us.descripcion,us.usuario,us.nombre,us.ap_paterno,us.ap_materno "
          + ",us.img,us.siglas,us.empresa, us.nivel::VARCHAR "
          + ",us.claves,us.sitio,us.email,us.direccion,us.zona "
          + ",SUBSTRING(fecha::VARCHAR,1,10) fecha, SUBSTRING(hora::VARCHAR,1,8) hora\n"
          + ",ni.nombre nivelnom\n"
          + "FROM usuarios us\n"
          + "LEFT JOIN niveles ni ON ni.nivel=us.nivel\n"
          + "WHERE us.usuario='" + req.params.user + "' ";
    if(req.body.user.id_usuario) {
      query += " AND us.id_usuario+1983='"+req.body.user.id_usuario+"' ";
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
          //row.telefono = parseInt(row.telefono);
          row.status = '200';
          //console.log('HORA:',row);
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

    query1 = "SELECT id_usuario+1983 id_usuario,usuario,nombre,ap_paterno,ap_materno,MD5(id_dispositivo) id ,img\n"
           + "FROM usuarios\n"
           + "WHERE (contrasena IS NULL     AND id_dispositivo!='"+req.body.iddisp+"' AND usuario='"+req.params.user+"') "
           + "   OR (contrasena IS NOT NULL AND usuario='"+req.params.user+"') ; "
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
          res.json({'status':'201','info':'Usuario no disponible'});
        } else {
          if(!req.body.latlng) {
            client.end(function (err) { if (err) throw err; }); // disconnect the client
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
                client.end(function (err) { if (err) throw err; }); // disconnect the client
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
                    res.json({'status':'502'});
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
        var datos = [req.body.usuario, req.body.password, req.body.descripcion,
                     req.body.nombre, req.body.appaterno, req.body.apmaterno, // $6
                     req.body.claves, req.body.sitio, req.body.email, req.body.direccion, req.body.zona, // $11
                     req.body.iddisp, req.body.latlng[0], req.body.latlng[1], req.body.tipo,// $15
                     req.body.siglas];// $16

        query2 = "INSERT INTO usuarios "
               + "(usuario,contrasena,descripcion, nombre,ap_paterno,ap_materno, claves,sitio,email,direccion,zona, id_dispositivo,lat,lng,nivel, siglas, fecha,hora) "
               + "VALUES($1,$2,$3, $4,$5,$6, $7,$8,$9,$10,$11, $12,$13,$14,$15, $16, TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, TO_CHAR(NOW(),'HH24:MI:SS')::TIME)\n"
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

    var datos = [req.body.usuario, req.body.descripcion, // $2
                 req.body.nombre, req.body.ap_paterno, req.body.ap_materno, // $5
                 req.body.claves, req.body.sitio, req.body.email, req.body.direccion, req.body.zona, // $10
                 req.body.siglas, req.body.empresa, req.body.img, // $13
                 req.body.nivel]; // $14

    query = "UPDATE usuarios \n"
          + "SET usuario=$1,descripcion=$2 "
          + ",nombre=$3,ap_paterno=$4,ap_materno=$5 "
          + ",claves=$6,sitio=$7,email=$8,direccion=$9,zona=$10 "
          + ",siglas=$11,empresa=$12,img=$13 "
          + ",nivel=$14 "
          //+ ",dia=$9,mes=$10,ano=$11, nivel=$12 "
          + ",fecha=TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, hora=TO_CHAR(NOW(),'HH24:MI:SS')::TIME\n";
    if(req.body.contras && req.body.contras==req.body.contrax) {
    query+= ",contrasena='"+req.body.contrax+"'\n"
    }
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
exports.listLast = listLast;
exports.info = info;
exports.login = login;
exports.register = register;
exports.update = update;
