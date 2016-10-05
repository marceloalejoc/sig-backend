#!/bin/bash

# El sistema se ejecutará en entorno de producción y en el puerto 3000
NODE_ENV=production
PORT=3000
LOG_PATH=log/$NODE_ENV.$PORT.log


echo "El sistema se ejecutará en '$NODE_ENV' en el puerto $PORT"

forever stop ./bin/www
forever start --append -o $LOG_PATH -e $LOG_PATH --minUptime 1000 --spinSleepTime 1000 ./bin/www
