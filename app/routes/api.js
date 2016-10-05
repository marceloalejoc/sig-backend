var express = require('express');
var users = require('../controllers/users');
var ubicacion = require('../controllers/ubicacion');
var mensajes = require('../controllers/mensajes');

var router = express.Router();

/* USUARIOS */
/* GET /api/v1/usuarios */
router.get('/users', users.list);
/* POST /api/v1/usuarios/login/:usuario */
// data: usuario, email, latlng, iddisp
router.post('/users/login/:user', users.login);
/* POST /api/v1/usuarios/login/:usuario */
// data: usuario, email, latlng, iddisp
router.post('/users/register/:user', users.register);
/* GET /api/v1/usuarios/:usuario/info */
router.get('/users/:user/info', users.info);


/* UBICACION */

// GET /api/v1/ubicacion/:usuario
router.get('/ubicacion/:usuario',ubicacion.getUbicacion);
/* POST /api/v1/ubicacion/:usuario/:fecha/:lat/:lng */
// data: usuario, latlng, idmobile
router.post('/ubicacion/:usuario',ubicacion.postUbicacion);


/* MENSAJE */
/* POST /api/v1/mensaje/:usuario/:lat/:lng/:texto */
router.get('/mensaje/:usuario',mensajes.recibir);
/* POST /api/v1/mensaje/:usuario */
// data: usuario1, usuario2, latlng, idmobile, texto
router.post('/mensaje/:usuario',mensajes.enviar);
//router.put('/mensaje/:usuario',mensajes.enviar);
//router.delete('/mensaje/:usuario',mensajes.enviar);

//router.get('/mensaje/',mensajes.enviar);
//router.post('/mensaje/',mensajes.enviar);
//router.put('/mensaje/',mensajes.enviar);
//router.delete('/mensaje/',mensajes.enviar);



module.exports = router;
