var express = require('express');
var users = require('../controllers/users');
var ubicacion = require('../controllers/ubicacion');
var mensajes = require('../controllers/mensajes');
var pedidos = require('../controllers/pedidos');
var products = require('../controllers/products');
var groups = require('../controllers/groups');

var router = express.Router();

/* USUARIOS */
/* GET /api/v1/usuarios */
router.get('/users', users.list);
/* POST /api/v1/usuarios/login/:user */
// data: usuario, email, latlng, iddisp
router.post('/users/login/:user', users.login);
/* POST /api/v1/usuarios/login/:user */
// data: usuario, email, latlng, iddisp
router.post('/users/register/:user', users.register);
/* POST /api/v1/usuarios/:user/info */
router.post('/users/:user/info', users.info);
//router.post('/users/:user/info/:id', users.infoId);
router.put('/users/:user/:iduser',users.update);


/* UBICACION */

// GET /api/v1/ubicacion/:usuario
router.get('/ubicacion/:usuario',ubicacion.getUbicacion);
/* POST /api/v1/ubicacion/:usuario/:fecha/:lat/:lng */
// data: usuario, latlng, idmobile
router.post('/ubicacion/:usuario',ubicacion.postUbicacion);


/* MENSAJE */
/* GET /api/v1/mensaje/:usuario */
router.get('/mensaje/:usuario',mensajes.recibir);
router.post('/mensaje/',mensajes.recibirUser);
/* POST /api/v1/mensaje/:usuario/:lat/:lng/:texto */
// data: usuario1, usuario2, latlng, idmobile, texto
router.post('/mensaje/:usuario',mensajes.enviar);
//router.put('/mensaje/:usuario',mensajes.enviar);
//router.delete('/mensaje/:usuario',mensajes.enviar);

//router.get('/mensaje/',mensajes.enviar);
//router.post('/mensaje/',mensajes.enviar);
//router.put('/mensaje/',mensajes.enviar);
//router.delete('/mensaje/',mensajes.enviar);

router.get('/pedidos/:user/:userid',pedidos.list);
router.get('/pedidos/:user/to/:userid',pedidos.listTo);
router.post('/pedidos/:user',pedidos.add);
router.delete('/pedidos/:user/:pedid',pedidos.cancel);

router.get('/products/:user/:userid',products.list);
router.get('/products/:user/prod/:prodid',products.info);
router.post('/products/:user',products.add);
router.put('/products/:user/:prodid',products.modif);
router.delete('/products/:user/:prodid',products.delete);


router.get('/groups/:user/:userid',groups.list);



module.exports = router;
