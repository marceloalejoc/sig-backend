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
          + ", us.id_usuario+1983 id_usuario2, us.usuario usuario2 "
          + ", u2.id_usuario+1983 id_usuarioR, u2.usuario usuarioR, MD5(u2.id_dispositivo) id_dispR, u2.lat uLat, u2.lng uLng "
          + "FROM pedidos pe "
          + "JOIN usuarios us ON us.id_usuario=pe.id_empresa  "
          + "JOIN usuarios u2 ON u2.id_usuario=pe.id_repartidor  "
          + "WHERE pe.id_cliente+1983='"+ req.params.userid +"' "
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

/* GET /api/v1/pedidos/:user/to/:userid */
var pediListTo = function(req, res) {
  var list_json = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT pe.id_pedido+1983 id_pedido, pe.estado,pe.detalle,pe.lat,pe.lng  "
          + ", SUBSTRING(pe.fecha::VARCHAR,1,10) fecha, SUBSTRING(pe.hora::VARCHAR,1,8) hora "
          + ", us.id_usuario+1983 id_usuario1, us.usuario usuario1 "
          + "FROM pedidos pe "
          + "JOIN usuarios us ON us.id_usuario=pe.id_cliente  "
          + "WHERE pe.id_empresa+1983='"+ req.params.userid +"' "
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
    //console.log('BODY: ',req.body);
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

    var datos = [req.body.id-1983, req.body.pedido.user.id_usuario-1983, req.body.pedido.user.id_usuario-1983,
                 req.body.detalles, req.body.nombres, req.body.email, req.body.direccion,
                 req.body.lat, req.body.lng ];
    query = "INSERT INTO pedidos "
          + "(id_cliente,id_empresa,id_repartidor, detalle,nombres,email,direccion, lat,lng,fecha,hora) "
          + "VALUES ($1,$2,$3, $4,$5,$6,$7, $8,$9, TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, TO_CHAR(NOW(),'HH24:MI:SS')::TIME) "
          + "RETURNING id_pedido, SUBSTRING(fecha::VARCHAR,1,10) fecha, SUBSTRING(hora::VARCHAR,1,8) hora ";

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
          query1+= "UPDATE pedidos SET estado='registrado' WHERE id_pedido='"+row.id_pedido+"' RETURNING id_pedido; "
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



var getKilometros = function(latlng1,latlng2) {
  var lat1 = latlng1[0];
  var lon1 = latlng1[1];
  var lat2 = latlng2[0];
  var lon2 = latlng2[1];
  var rad = function(x) {return x*Math.PI/180;}
  var R = 6378.137; //Radio de la tierra en km
  var dLat = rad( lat2 - lat1 );
  var dLong = rad( lon2 - lon1 );
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d.toFixed(3); //Retorna tres decimales
}

/* PUT /api/v1/pedidos/:user/entrega/:pedid */
var pediEntrega =  function(req, res) {
  var row = {};

  var update_json = function(req, res) {
    var d = getKilometros(req.body.latlng,[req.body.pedido.lat,req.body.pedido.lng]);
    console.log('DIST',d*1000, 'm')
    if(d*1000>50) {
      res.json({dnum:d*1000,dlit:'metros',status:201});
      return;
    }
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    var datos = ['entregado']; //, req.body.lat, req.body.lng];
    query = "UPDATE pedidos "
          + "SET estado=$1 " //", lat=$2, lng=$3 "
          + ",fecha=TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, hora=TO_CHAR(NOW(),'HH24:MI:SS')::TIME "
          + "WHERE id_pedido+1983='"+req.body.pedido.id_pedido+"' "
          + "RETURNING id_pedido, '"+req.body.i+"' i ";
    query = client.query(query, datos, function(err, result){
      var row = {};
      res.set('content-type', 'application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando consulta: ', err);
        row = {status:'500'};
        res.json(row);
      } else {
        console.log('Pedido update respuesta en formato JSON');
        var row = result.rows[0];
        if(row && row.id_pedido) {
          row.status = '200';
          res.json(row);
        } else {
          row = {status:'403'};
          res.json(row);
        }
      }
    });
  }

  update_json(req, res);
}

/* PUT /api/v1/pedidos/:user/recibe/:pedid */
var pediRecibe =  function(req, res) {
  var row = {};

  var update_json = function(req, res) {
    var d = getKilometros(req.body.latlng,[req.body.pedido.lat,req.body.pedido.lng]);
    console.log('DIST',d*1000, 'm')
    if(d*1000>50) {
      res.json({dnum:d*1000,dlit:'metros',status:201});
      return;
    }
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    var datos = ['recibido']; //, req.body.lat, req.body.lng];
    query = "UPDATE pedidos "
          + "SET estado=$1 " //", lat=$2, lng=$3 "
          + ",fecha=TO_CHAR(NOW(),'YYYY-MM-DD')::DATE, hora=TO_CHAR(NOW(),'HH24:MI:SS')::TIME "
          + "WHERE id_pedido+1983='"+req.body.pedido.id_pedido+"' "
          + "RETURNING id_pedido, '"+req.body.i+"' i ";
    query = client.query(query, datos, function(err, result){
      var row = {};
      res.set('content-type', 'application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando consulta: ', err);
        row = {status:'500'};
        res.json(row);
      } else {
        console.log('Pedido update respuesta en formato JSON');
        var row = result.rows[0];
        if(row && row.id_pedido) {
          row.status = '200';
          res.json(row);
        } else {
          row = {status:'403'};
          res.json(row);
        }
      }
    });
  }

  update_json(req, res);
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
    //console.log('BODY: ',req.body, req.params);
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
    //console.log('BODY: ',req.body);
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


var pediDetalle = function(req, res) {
  var row = {};

  var detalle_json = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    var datos = [req.params.userid, req.params.pedid];
    query = "SELECT pe.id_pedido+1983 id_pedido, pe.nombres, pe.email, pe.direccion, pe.detalle, pe.estado\n"
          + ",u1.usuario de,u2.usuario para\n"
          + ",ps.codigo,ps.nombre producto,pp.precio,pp.cantidad\n"
          + "FROM pedidos pe\n"
          + "JOIN usuarios u1 ON u1.id_usuario=pe.id_cliente\n"
          + "JOIN usuarios u2 ON u2.id_usuario=pe.id_empresa\n"
          + "LEFT JOIN pedido_productos pp ON pp.id_pedido=pe.id_pedido\n"
          + "LEFT JOIN productos ps ON ps.id_producto=pp.id_producto\n"
          + "WHERE pe.id_pedido+1983=$2 AND pe.id_cliente+1983=$1 "
          + "ORDER BY pe.fecha ";
    //console.log('BODY: ',req.body);
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
        if(row && row.id_pedido) {
          var rows = {};
          result.rows.forEach(function(o,i){
            var producto = {
              codigo: o.codigo,
              producto: o.producto,
              precio: o.precio,
              cantidad: o.cantidad,
            };
            if(rows.id_pedido && rows.id_pedido==o.id_pedido) {
              rows.total+=producto.precio*producto.cantidad;
              rows.productos.push(producto);
            } else {
              rows = {
                id_pedido: o.id_pedido,
                nombres: o.nombres,
                email: o.email,
                direccion: o.direccion,
                detalle: o.detalle,
                de: o.de,
                para: o.para,
                estado: o.estado,
                total: 0,
                productos: []
              };
              if(producto.codigo) {
                rows.total+=producto.precio*producto.cantidad;
                rows.productos.push(producto);
              }
            }
          });
          rows.status = '200';
          res.json(rows);
        } else {
          row = {status:'403'};
          res.json(row);
        }
      }
    });
  }

  detalle_json(req, res);
}

exports.list = pediList;
exports.listTo = pediListTo;
//exports.info = prodInfo;
exports.add = pediInsert;
exports.entrega = pediEntrega;
exports.recibe = pediRecibe;
//exports.modif = prodUpdate;
//exports.delete = prodDelete;
exports.cancel = pediDelete;

exports.detalle = pediDetalle;
