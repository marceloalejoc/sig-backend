var config = require('konfig')();
var pg = require('pg'), client, query, query1, query2;


/* GET /api/v1/products/:user/:userid */
var prodList = function(req, res) {
  var productos_json = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT p.id_producto+1983 id_producto, p.codigo,p.nombre, p.precio,p.cantidad ,p.detalle "
          + ", SUBSTRING(p.fecha::VARCHAR,1,10) fecha, SUBSTRING(p.hora::VARCHAR,1,8) hora "
          + "FROM productos p "
          + "JOIN usuarios u ON u.id_usuario=p.id_usuario "
          + "WHERE p.id_usuario+1983='"+ req.params.userid +"' "
          + "ORDER BY fecha DESC,hora DESC ";
    //console.log('BODY',req.body);
    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando consulta: ', err);
        res.json({'status':'500'});
      } else {
        console.log('Productos respuesta en formato JSON');
        res.json(result.rows);
      }
    });
  }

  productos_json(req, res);
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

/* POST /api/v1/products/:user */
var prodInsert =  function(req, res) {
  var row = {};

  var insert_json = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    var datos = [req.body.id_usuario-1983, req.body.codigo, req.body.nombre, req.body.detalle, req.body.precio, req.body.cant];
    query = "INSERT INTO productos "
          + "(id_usuario,codigo,nombre,detalle,precio,cantidad,fecha,hora) "
          + "VALUES ($1,$2,$3,$4,$5,$6, TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, TO_CHAR(NOW(),'HH24:MI:SS')::TIME) "
          + "RETURNING id_producto, SUBSTRING(fecha::VARCHAR,1,10) fecha, SUBSTRING(hora::VARCHAR,1,8) hora ";
    console.log('BODY: ',req.body);
    console.log('URL: ',req.params);
    query = client.query(query, datos, function(err, result){
      var row = {};
      res.set('content-type', 'application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando consulta: ', err);
        row = {status:'500'};
        res.json(row);
      } else {
        console.log('Producto insert respuesta en formato JSON');
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

  insert_json(req, res);
}


/* PUT /api/v1/products/:user/:prodid */
var prodUpdate =  function(req, res) {
  var row = {};

  var update_json = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    var datos = [req.body.id_usuario, req.body.codigo, req.body.nombre, req.body.detalle, req.body.precio, req.body.cant];
    query = "UPDATE productos "
          + "SET id_usuario=$1, codigo=$2, nombre=$3, detalle=$4, precio=$5, cantidad=$6 "
          + ",fecha=TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, hora=TO_CHAR(NOW(),'HH24:MI:SS')::TIME "
          + "WHERE id_producto='"+req.params.prodid+"' "
          + "RETURNING id_producto, '"+req.body.i+"' i ";
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


/* DELETE /api/v1/products/:user/:prodid */
var prodDelete =  function(req, res) {
  var row = {};

  var delete_json = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    var datos = [req.params.prodid];
    query = "DELETE FROM productos "
          + "WHERE id_producto+1983=$1 "
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

exports.list = prodList;
exports.info = prodInfo;
exports.add = prodInsert;
exports.modif = prodUpdate;
exports.delete = prodDelete;
