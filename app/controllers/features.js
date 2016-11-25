var config = require('konfig')();
var pg = require('pg'), client, query, query1, query2;



var getFeature = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT *, ST_AsGeoJSON( ST_Simplify(dpa.the_geom, 0.0005) ) geom \n"
          + "FROM dpa \n"
          + "WHERE id_tipo_dpa=4 AND id_dpa_superior IN (86,94) AND id_dpa IN (195,196,419) \n"

    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando lista: ', err);
        res.json({'status':'500'});
      } else {
        var rows = {'type':'FeatureCollection','features':[]};
        result.rows.forEach(function(o,i){
            var feature = {
                type: 'Feature',
                id: o.id_dpa,
                properties: {
                    id_dpa: o.id_dpa,
                    nombre: o.nombre,
                    codigo: o.codigo,
                    seccion: o.seccion
                },
                geometry: JSON.parse(o.geom)
            };
            rows.features.push(feature);
        });
        console.log('Pedidos respuesta en formato JSON');
        res.json(rows);
      }
    });
}

var getFeatures = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT row_to_json(fc) As data\n"
          + "FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features \n"
          + "      FROM (SELECT 'Feature' As type \n"
          + "              , ST_AsGeoJSON(lg.the_geom)::json as geometry \n"
          + "              , row_to_json(lp) As properties \n"
          + "            FROM dpa As lg \n"
          + "            INNER JOIN (SELECT id_dpa,nombre,fecha_creacion FROM dpa) As lp ON lg.id_dpa=lp.id_dpa \n"
          + "           ) As f \n"
          + "     ) As fc; "

    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando lista: ', err);
        res.json({'status':'500'});
      } else {
        var rows = result.rows;
        console.log('Pedidos respuesta en formato JSON');
        res.json(rows);
      }
    });
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


var getLineString = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT gps.id_usuario, ST_AsGeoJSON(ST_MakeLine(ST_Point(gps.lng,gps.lat) ORDER BY gps.fecha,gps.hora)) As geom \n"
          + "FROM ubicacion As gps \n"
          + "WHERE gps.id_usuario+1983='"+ req.body.id_usuario +"' \n"
          + "GROUP BY gps.id_usuario; \n"
          + "SELECT pos.*,SUBSTRING(pos.fecha::VARCHAR,1,10) fecha, SUBSTRING(pos.hora::VARCHAR,1,8) hora, ST_AsGeoJSON(ST_Point(pos.lng,pos.lat)) geom \n"
          + "  ,us.usuario \n"
          + "FROM ubicacion pos\n"
          + "JOIN usuarios us ON us.id_usuario=pos.id_usuario \n"
          + "WHERE pos.id_usuario+1983='"+ req.body.id_usuario +"'; \n"

    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando lista: ', err);
        res.json({'status':'500'});
      } else {
        var rows = {'type':'FeatureCollection','features':[]};
        var latlng = null;
        var a,b;
        result.rows.forEach(function(o,i){
            var feature = {
                type: 'Feature',
                id: o.id_ubicacion,
                properties: {
                  usuario: o.usuario,
                  fecha: o.fecha,
                  hora: o.hora
                },
                geometry: JSON.parse(o.geom)
            };
            if(o.lat&&o.lng) {
              a = new Date(o.fecha+" "+o.hora);
              if(latlng) {
                feature.properties.dist = getKilometros(latlng,[o.lat,o.lng]);
                //La diferencia se da en milisegundos así que debes dividir entre 1000
                feature.properties.temp = ((a-b)/1000);
                if(feature.properties.temp) {
                  feature.properties.vel = feature.properties.dist/feature.properties.temp*60*60;
                  feature.properties.vel = feature.properties.vel.toFixed(2);
                }
              }
              else {
                feature.properties.dist = 0;
                feature.properties.temp = 0;
                feature.properties.vel = 0;
              }
              b = a;
              latlng = [o.lat,o.lng];
            }
            rows.features.push(feature);
        });
        console.log('Pedidos respuesta en formato JSON');
        res.json(rows);
      }
    });
}

var getPoints = function(req, res) {
    client = new pg.Client(config.app.db);
    //client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
    client.connect();

    query = "SELECT *,SUBSTRING(fecha::VARCHAR,1,10) fecha, SUBSTRING(hora::VARCHAR,1,8) hora, ST_AsGeoJSON(ST_Point(lng,lat)) geom \n"
          + "FROM ubicacion \n"
          + "WHERE id_usuario+1983='"+ req.body.id_usuario +"' \n"

    query = client.query(query, function(err, result){
      res.set('content-type','application/json; charset=UTF-8');
      client.end(function (err) { if (err) throw err; }); // disconnect the client
      if(err) {
        console.error('Error ejecutando lista: ', err);
        res.json({'status':'500'});
      } else {
        var rows = {'type':'FeatureCollection','features':[]};
        result.rows.forEach(function(o,i){
            var feature = {
                type: 'Feature',
                id: o.id_ubicacion,
                properties: {
                    fecha: o.fecha,
                    hora: o.hora
                },
                geometry: JSON.parse(o.geom)
            };
            rows.features.push(feature);
        });
        console.log('Pedidos respuesta en formato JSON');
        res.json(rows);
      }
    });
}


exports.get = getFeature;
exports.lineString = getLineString;
