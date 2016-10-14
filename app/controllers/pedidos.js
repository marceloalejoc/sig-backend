var config = require('konfig')();
var pg = require('pg'), client, query, query1, query2;


/* GET /api/v1/pedidos/:user/:userid */
var pediList = function(req, res) {
  var list_json = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT pe.id_pedido+1983 id_pedido, pe.estado,pe.detalle,pe.lat,pe.lng  "
          + ", SUBSTRING(pe.fecha::VARCHAR,1,10) fecha, SUBSTRING(pe.hora::VARCHAR,1,8) hora "
          + "FROM pedidos pe "
          + "JOIN usuarios us ON us.id_usuario=pe.id_usuario1  "
          + "WHERE pe.id_usuario1+1983='"+ req.params.userid +"' "
          + "ORDER BY fecha DESC,hora DESC ";
    //console.log('BODY',req.body);
    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando lista: ', err);
        res.json({'status':'500'});
      } else {
        console.log('Pedidos respuesta en formato JSON');
        res.json(result.rows);
      }
    });
  }

  list_json(req, res);
}

/* GET /api/v1/poducts/:user/prod/:prodid */
var prodInfo = function(req, res) {
  var informacion_json = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT p.id_producto+1983 id_producto, p.codigo,p.nombre, SUBSTRING(p.fecha::VARCHAR,1,10) fecha, SUBSTRING(p.hora::VARCHAR,1,8) hora "
          //+ ",SUBSTRING(fecha::VARCHAR,1,10) fecha, SUBSTRING(hora::VARCHAR,1,8) hora  "
          + "FROM productos p "
          + "JOIN usuarios u ON u.id_usuario=p.id_usuario "
          + "WHERE id_producto='"+ req.params.prodid +"' "
          + "ORDER BY fecha DESC,hora DESC ";
    console.log('BODY: ',req.body);
    query = client.query(query, function(err, result){
      var row = {};
      res.set('content-type', 'application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando consulta: ', err);
        row = {status:'500'};
        res.json(row);
      } else {
        console.log('Producto info respuesta en formato JSON');
        var row = result.rows[0];
        if(row && row.id_producto) {
          row.status = '200';
          res.json(row);
        } else {
          row = {status:'403'};
          res.json(row);
        }
      }
    });
  }

  informacion_json(req, res);
}

/* POST /api/v1/pedidos/:user */
var pediInsert =  function(req, res) {
  var row = {};

  var insert_json = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    var datos = [req.body.id-1983, req.body.pedido.user.id_usuario-1983, req.body.detalle, req.body.lat, req.body.lng];
    query = "INSERT INTO pedidos "
          + "(id_usuario1,id_usuario2,detalle,lat,lng,fecha,hora) "
          + "VALUES ($1,$2,$3, $4,$5, TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, TO_CHAR(NOW(),'HH24:MI:SS')::TIME) "
          + "RETURNING id_pedido, SUBSTRING(fecha::VARCHAR,1,10) fecha, SUBSTRING(hora::VARCHAR,1,8) hora ";
    console.log('BODY: ',req.body);
    console.log('URL: ',req.params);

    query = client.query(query, datos, function(err, result){
      var row = {};
      res.set('content-type', 'application/json; charset=UTF-8');
      if(err) {
        client.end(function (err) { if (err) throw err; }); // disconnect the client
        console.error('Error ejecutando consulta: ', err);
        row = {status:'500'};
        res.json(row);
      } else {
        console.log('Pedido insert respuesta en formato JSON');
        var row = result.rows[0];
        if(row && row.id_pedido) {
          var sql = ""
          for(var pi in req.body.pedido.productos) {
            var prod = req.body.pedido.productos[pi];
            sql += ",('"+row.id_pedido+"','"+(prod.id_producto-1983)+"','"+prod.precio+"','"+prod.pcant+"')";
          }
          sql = sql.replace(',','');
          query1 = "";
          if(sql) {
            query1+= "INSERT INTO pedido_productos (id_pedido,id_producto,precio,cantidad) "
                   + "VALUES " + sql + " "
                   + "RETURNING id_pedido_producto; "
          }
          query1+= "UPDATE pedidos SET estado='enviado' WHERE id_pedido='"+row.id_pedido+"' RETURNING id_pedido; "
          console.log('SQL:',query1);
          query1 = client.query(query1, function(err, result){
            if(err) {
              client.end(function (err) { if (err) throw err; }); // disconnect the client
              console.error('Error insert productos del pedido', err);
              row = {status:'501'};
              res.json(row);
            } else {
              client.end(function (err) { if (err) throw err; }); // disconnect the client
              console.log('Pedido insert producto ',result.rows);
              res.json(result.rows);
            }
          });

        } else {
          console.log('Pedido insert producto 403');
          row = {status:'403'};
          res.json(row);
        }
      }
    });

  }

  req.body.precio = parseFloat(req.body.precio);
  req.body.cant = parseInt(req.body.cant);
  if(isNaN(req.body.cant)){
    delete(req.body.cant);
  }
  if(isNaN(req.body.precio)){
    delete(req.body.precio);
  }

  insert_json(req, res);
}


/* PUT /api/v1/pedidos/:user/:prodid */
var pediUpdate =  function(req, res) {
  var row = {};

  var update_json = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    var datos = [req.body.estado, req.body.lat, req.body.lng];
    query = "UPDATE pedidos "
          + "SET estado=$1, lat=$2, lng=$3 "
          + ",fecha=TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, hora=TO_CHAR(NOW(),'HH24:MI:SS')::TIME "
          + "WHERE id_pedido='"+req.params.pedid+"' "
          + "RETURNING id_pedido, '"+req.body.i+"' i ";
    console.log('BODY: ',req.body, req.params);
    query = client.query(query, datos, function(err, result){
      var row = {};
      res.set('content-type', 'application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando consulta: ', err);
        row = {status:'500'};
        res.json(row);
      } else {
        console.log('Producto update respuesta en formato JSON');
        var row = result.rows[0];
        if(row && row.id_producto) {
          row.status = '200';
          res.json(row);
        } else {
          row = {status:'403'};
          res.json(row);
        }
      }
    });
  }

  req.body.precio = parseFloat(req.body.precio);
  req.body.cant = parseInt(req.body.cant);
  if(isNaN(req.body.cant)){
    delete(req.body.cant);
  }
  if(isNaN(req.body.precio)){
    delete(req.body.precio);
  }

  req.params.prodid -= 1983;
  req.body.id_usuario -= 1983;
  update_json(req, res);
}


/* DELETE /api/v1/pedidos/:user/:pedid */
var pediDelete =  function(req, res) {
  var row = {};

  var delete_json = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    var datos = [req.params.pedid];
    query = "UPDATE pedidos "
          + "SET estado='eliminado' "
          + "WHERE id_pedido+1983=$1 "
          + "RETURNING id_producto, '"+req.body.i+"' i ";
    console.log('BODY: ',req.body);
    query = client.query(query, datos, function(err, result){
      var row = {};
      res.set('content-type', 'application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando consulta: ', err);
        row = {status:'500'};
        res.json(row);
      } else {
        console.log('Producto delete respuesta en formato JSON');
        var row = result.rows[0];
        if(row && row.id_producto) {
          row.status = '200';
          res.json(row);
        } else {
          row = {status:'403'};
          res.json(row);
        }
      }
    });
  }

  delete_json(req, res);
}

exports.list = pediList;
//exports.info = prodInfo;
exports.add = pediInsert;
//exports.modif = prodUpdate;
//exports.delete = prodDelete;
exports.cancel = pediDelete;
