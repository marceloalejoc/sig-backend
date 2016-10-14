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
