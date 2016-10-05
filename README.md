## backend - Localiza


### Instalar y configurar Node.js


```
npm install angular-cookies angular-message-format angular-messages --save-dev
npm install angular-parse-ext angular-resource --save-dev
npm install body-parser --save-dev
npm install cookie-parser --save-dev
npm install debug --save-dev
npm install express --save-dev
npm install jade json2csv konfig --save-dev
npm install jquery --save-dev
npm install jquery-ui --save-dev
npm install lz-string morgan pg static-favicon stylus --save-dev
```

Opcionales

```
npm install grunt-cli
npm install grunt-cli
npm install grunt-contrib-clean --save-dev
npm install load-grunt-tasks --save-dev
npm install grunt-ng-constant --save-dev

npm install grunt-parallel grunt-express grunt-contrib-watch --save-dev
npm install grunt --save-dev
npm install grunt-contrib-uglify grunt-contrib-qunit grunt-contrib-concat grunt-contrib-jshint grunt-contrib-watch --save-dev
npm install angular --save-dev
npm install angular-leaflet-directive --dave-dev
npm install angular-material angular-material-icons --dave-dev
npm install angular-route --dave-dev
npm install angular-sanitize angular-touch --save-dev
npm install font-awesome --save-dev
npm install ng-csv json-export-excel --save-dev
npm install openlayers3 --save-dev
npm install openlayers --save-dev
npm install angular-openlayers --save-dev
npm install leaflet --save-dev
npm install d3 --save-dev
```

### Instalar  y configurar PostgreSQL


`sudo aptitude install postgresql-9.4 postgresql-9.4-postgis-2.1`


### Instalar y configurar nginx

Fuente:
[a](https://www.howtoforge.com/tutorial/installing-nginx-with-php-fpm-and-mariadb-lemp-on-debian-jessie/)
[b](https://support.rackspace.com/how-to/install-nginx-and-php-fpm-running-on-unix-file-sockets/)

```
sudo aptitude install nginx

sudo aptitude install php5-common php5-cli php5-fpm php5-pgsql

sudo aptitude install php5-pgsql
sudo aptitude install php5-common
```

Editar el archivo `sudo nano /etc/nginx/sites-enabled/default`

```
# Habilitar extension php
        location ~ \.php$ {
                include snippets/fastcgi-php.conf;

                # With php5-cgi alone:
                #fastcgi_pass 127.0.0.1:9000;
                # With php5-fpm:
                fastcgi_pass unix:/var/run/php5-fpm.sock;
        }
```

```
# Habilitar proxy_reverse
        location ^~ /www/ {
                root /var/www/html;
                proxy_set_header X-Forwarded-Host $host:$server_port;
                proxy_set_header X-Forwarded-Server $host;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

                proxy_pass http://127.0.0.1:8000/;
                proxy_redirect http://127.0.0.1:8000/ /www;

                proxy_set_header x-webobjects-server-protocol HTTP/1.0;
                proxy_set_header x-webobjects-server-url $scheme://$host;
        }
```

`sudo service nginx restart`

### Instalar e iniciar forever

`sudo npm install forever --global`


```
#!/bin/bash

# El sistema se ejecutará en entorno de producción y en el puerto 3000
NODE_ENV=production
PORT=3000
LOG_PATH=log/$NODE_ENV.$PORT.log


echo "El sistema se ejecutará en '$NODE_ENV' en el puerto $PORT"

forever stop ./bin/www
forever start --append -o $LOG_PATH -e $LOG_PATH --minUptime 1000 --spinSleepTime 1000 ./bin/www
```
