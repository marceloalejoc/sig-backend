## SIG - Backend

[Prototipo del Sistema planteado](https://sig.macx.tk/)
Actualmente en desarrollo

### Backend del Sistema de Información Geográfica para el control de pedidos y entrega de productos, aplicando la ubicación geoespacial

Este Sistema implementado junto al [Frontend](https://github.com/marceloalejoc/sig-frontend) permite realizar las siguientes acciones:

- Registrar la ubicación de un dispositivo Movil, el cual representa a un Cliente, Repartidor de Productos y/o Servicios, Sucursal de una Empresa o Institución, ó por último, la ubicación de la Empresa o Institución.
- Registrar los productos o servicios ofrecidos.
- Obtener una lista de los usuarios registrados.
- Realizar un pedido a un Repartidor, Sucursal ó Empresa-Institución (Al realizar el pedido tambien se registra la ubicación del dispositivo en el momento de enviar la solicitud)
- Modificar los datos que representan a un Usuario.
- Ver en un mapa la ubicación de los usuarios.
- Envio de mensajes entre usuarios.

#### Requisitos de usuario

El dispositivo debe tener las siguientes características:

- Navegador HTML5
- GPS

### Instalación

Para realizar la instalación ver archivo [INSTALL.md](INSTALL.md)


### Referencias

[Fórmula del Haversine](https://es.wikipedia.org/wiki/F%C3%B3rmula_del_Haversine)
