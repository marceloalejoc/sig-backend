DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios
(
  id_usuario serial NOT NULL,
  usuario character varying(32),
  contrasena character varying(64),
  nombre character varying(32),
  ap_paterno character varying(32),
  ap_materno character varying(32),
  nivel character varying(32),
  lat double precision,
  lng double precision,
  id_dispositivo character varying(32),
  img character varying(256),
  email character varying(256),
  descripcion character varying(256),
  dia integer,
  mes integer,
  ano integer,
  siglas character varying(32),
  empresa character varying(64),
  fecha date,
  hora time with time zone,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario)
);


DROP TABLE IF EXISTS ubicacion;
CREATE TABLE ubicacion
(
  id_ubicacion serial NOT NULL,
  id_usuario integer,
  lat double precision,
  lng double precision,
  fecha date,
  hora time without time zone,
  CONSTRAINT ubicacion_pkey PRIMARY KEY (id_ubicacion)
);
ALTER TABLE ubicacion
  ADD CONSTRAINT id_usuario FOREIGN KEY (id_usuario)
  REFERENCES usuarios (id_usuario) ON UPDATE RESTRICT ON DELETE RESTRICT;



DELETE FROM ubicacion ;



DROP TABLE IF EXISTS mensajes;
CREATE TABLE mensajes
(
  id_mensaje serial NOT NULL,
  id_usuario1 integer,
  id_usuario2 integer,
  lat double precision,
  lng double precision,
  fecha date,
  hora time without time zone,
  mensaje text,
  CONSTRAINT mensaje_pkey PRIMARY KEY (id_mensaje)
);


DROP TABLE IF EXISTS mensajes1;
CREATE TABLE mensajes1
(
  id_mensaje integer NOT NULL DEFAULT nextval('mensaje_id_mensaje_seq'::regclass),
  id_usuario1 integer,
  id_usuario2 integer,
  lat double precision,
  lng double precision,
  fecha date,
  hora time without time zone,
  mensaje text,
  CONSTRAINT mensaje_pkey PRIMARY KEY (id_mensaje)
);


DROP TABLE IF EXISTS productos;
CREATE TABLE productos (
  id_producto SERIAL,
  id_usuario INTEGER NOT NULL,
  codigo VARCHAR(32) NOT NULL,
  nombre VARCHAR(64) NOT NULL,
  detalle VARCHAR(256),
  precio DOUBLE PRECISION,
  cantidad INTEGER,
  fecha DATE,
  hora TIME,
  CONSTRAINT productos_pkey PRIMARY KEY (id_producto)
);

-- Tabla pedidos
DROP TABLE IF EXISTS pedidos;
CREATE TABLE pedidos (
  id_pedido SERIAL,
  id_usuario1 INTEGER NOT NULL,
  id_usuario2 INTEGER NOT NULL,
  nombres VARCHAR(64),
  email VARCHAR(128),
  direccion VARCHAR(128),
  --codigo VARCHAR(32) NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  detalle TEXT,
  fecha DATE,
  hora TIME,
  estado VARCHAR(16),
  CONSTRAINT pedidos_pkey PRIMARY KEY (id_pedido)
);
ALTER TABLE pedidos
  ADD CONSTRAINT id_usuario FOREIGN KEY (id_usuario)
  REFERENCES usuarios(id_usuario) ON UPDATE RESTRICT ON DELETE RESTRICT;

-- Tabla pedido_productos
DROP TABLE IF EXISTS pedido_productos;
CREATE TABLE pedido_productos (
  id_pedido_producto SERIAL,
  id_pedido INTEGER NOT NULL,
  id_producto INTEGER NOT NULL,
  precio DOUBLE PRECISION NOT NULL,
  cantidad INTEGER,
  CONSTRAINT pedidos_producto_pkey PRIMARY KEY (id_pedido,id_producto)
);
ALTER TABLE pedido_productos
  ADD UNIQUE (id_pedido_producto);
ALTER TABLE pedido_productos
  ADD CONSTRAINT id_pedido FOREIGN KEY (id_pedido)
  REFERENCES pedidos(id_pedido) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE pedido_productos
    ADD CONSTRAINT id_producto FOREIGN KEY (id_producto)
    REFERENCES productos(id_producto) ON UPDATE RESTRICT ON DELETE RESTRICT;
--;


-- Consulta recursiva
WITH RECURSIVE path(nom, path, parent, id_usuario1, id_usuario2, nivel)
  AS (SELECT id_usuario1,'/',NULL,id_usuario1,id_usuario2, 0
      FROM confianza
      WHERE id_usuario2=58
    UNION
      SELECT co.id_usuario1,
          pa.path || CASE pa.path WHEN '/' THEN '' ELSE '/' END || co.id_usuario2 ruta,
          pa.path, co.id_usuario1, co.id_usuario2,
          pa.nivel+1 nivel
      FROM confianza co, path pa
      WHERE co.id_usuario2=pa.id_usuario1 )
SELECT * FROM path;

-- Crear tabla confianza
DROP TABLE IF EXISTS confianza;
CREATE TABLE confianza (
  id_confianza SERIAL,
  id_usuario1 INTEGER,
  id_usuario2 INTEGER,
  estado VARCHAR(32),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  fecha DATE,
  hora TIME,
  CONSTRAINT confianza_pkey PRIMARY KEY (id_confianza)
);

-- Insertar datos de ejemplo
INSERT INTO confianza (id_usuario1,id_usuario2,lat,lng, fecha,hora,estado) VALUES
--(58,NULL,-16.5286043,-68.1798767, '2016-10-13','08:00:00',NULL),
(51,58,-16.5286043,-68.1798767, '2016-10-14','08:01:00','confirmado'),
(52,58,-16.5286043,-68.1798767, '2016-10-14','08:02:00','confirmado'),
(53,55,-16.5286043,-68.1798767, '2016-10-13','08:03:00','confirmado'),
(54,58,-16.5286043,-68.1798767, '2016-10-13','08:04:00','confirmado'),
(56,58,-16.5286043,-68.1798767, '2016-10-14','08:05:00','confirmado'),
(57,58,-16.5286043,-68.1798767, '2016-10-14','08:06:00','confirmado'),
(59,55,-16.5286043,-68.1798767, '2016-10-14','08:06:00','confirmado'),
(60,58,-16.5286043,-68.1798767, '2016-10-14','08:06:00','confirmado'),
(59,52,-16.5286043,-68.1798767, '2016-10-14','08:06:00','confirmado'),
(54,56,-16.5286043,-68.1798767, '2016-10-13','08:04:00','confirmado'),
(55,59,-16.5286043,-68.1798767, '2016-10-14','08:06:00','confirmado');


--\


DROP TABLE IF EXISTS niveles;
CREATE TABLE niveles(
  id_nivel SERIAL,
  rango INTEGER,
  nombre VARCHAR(32),
  descripcion TEXT,
  id_usuario INTEGER,
  id_posicion INTEGER,
  CONSTRAINT niveles_pkey PRIMARY KEY (id_nivel)
);

INSERT INTO niveles (id_nivel,rango,nombre,descripcion,id_usuario,id_posicion) VALUES
(1,1,'Admin','',NULL,NULL),
(2,2,'Empresa','',NULL,NULL),
(3,3,'Sucursal','',NULL,NULL),
(4,4,'Repartidor','',NULL,NULL),
(5,5,'Cliente','',NULL,NULL);



UPDATE usuarios SET nivel=5;
INSERT INTO usuarios (id_usuario,usuario,contrasena,nombre,ap_paterno,ap_materno,nivel,lat,lng,id_dispositivo,fecha,hora) VALUES
(1,'Admin','admin','Usuario','Administrador','Autoregistrado',1,-16.5286043,-68.1798767,0,'2016-07-01','08:00:00');


-- Consulta recursiva
WITH RECURSIVE path(usuario, path, parent, id_usuario1, id_usuario2, nivel)
  AS (SELECT u1.usuario usuario1,'->',NULL,id_usuario1,id_usuario2, 0
      FROM confianza co
      JOIN usuarios u1 ON u1.id_usuario=co.id_usuario1
      WHERE id_usuario2=52
    UNION
      SELECT DISTINCT ON(co.id_usuario1) u1.usuario,
          pa.path || CASE pa.path WHEN '->' THEN '' ELSE '->' END || u2.usuario || '->' path,
          pa.path, co.id_usuario1, co.id_usuario2,
          pa.nivel+1 nivel
      FROM confianza co
      JOIN usuarios u1 ON u1.id_usuario=co.id_usuario1
      JOIN usuarios u2 ON u2.id_usuario=co.id_usuario2
      JOIN path pa ON co.id_usuario2=pa.id_usuario1
      WHERE co.id_usuario1 NOT IN (SELECT id_usuario1 FROM path) )
SELECT * FROM path;



SELECT  *
FROM confianza
