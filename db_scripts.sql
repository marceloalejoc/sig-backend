DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios
(
  id_usuario serial NOT NULL,
  email character varying(256),
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
