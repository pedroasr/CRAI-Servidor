## Primero hay que descargar los contenedores:

    - sudo docker-compose up

## A continuación ejecutar con node app.js

## Requerido:

    - npm
    - docker
    - docker.io
    - docker-compose
    - nodejs
    - git
    - pm2
 
### Descargar repositorio:

    ```sh
    git clone git@github.com:RosLD/CRAI-Servidor.git
    ```

### Instalación:

    ```sh
    npm install
    ```
    
### Descargar y utilizar contenedores:

    ```sh
    docker-compose up
    ```
   
### Instalar Grafana:

    ```sh
    snap install grafana
    ```
    
### Crear archivo .env en la raíz con los siguientes parámetros

    * PORT="PuertoAUsar"
    * sqlink="UbicacionSQL"
    * squser="UsuarioSQL"
    * sqpass="PasswordSQL"
    * sqdb="BaseDeDatos"
    * token="TelegramToken"
    * chatid="IdDelChat"
    * mqtt="ClaveEMQX"

### Ejecutar servidor con pm2

    ```sh
    sudo pm2 start app.js
    sudo pm2 start raspberryMonitor.js
    sudo pm2 start csvexport.js
    sudo pm2 save
    ```
 
