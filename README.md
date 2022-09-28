
## Requerido:

    - npm
    - docker
    - docker.io
    - docker-compose
    - nodejs
    - git
    - pm2
    - Python3.8
        - pandas
        - numpy
        - joblib
        - mysql-connector-python
        - scikit-learn v0.23.1
        - lightgbm v2.3.1
 
### Descargar repositorio:

    
    git clone git@github.com:RosLD/CRAI-Servidor.git
    

### Instalación:

    
    npm install
    
    
### Descargar y utilizar contenedores:

    
    docker-compose up
    
   
### Instalar Grafana:

    
    snap install grafana
    
    
### Crear archivo .env en la raíz con los siguientes parámetros

    PORT="PuertoAUsar"
    sqlink="UbicacionSQL"
    squser="UsuarioSQL"
    sqpass="PasswordSQL"
    sqdb="BaseDeDatos"
    token="TelegramToken"
    chatid="IdDelChat"
    mqtt="ClaveEMQX"

### Ejecutar servidor con pm2

    
    sudo pm2 start app.js
    sudo pm2 start deviceMonitor.js
    sudo pm2 start csvexport.js
    sudo pm2 save
    
 
#### Python 3.8 instalation

sudo apt-get install python3.8
sudo apt-get install python3.8-distutils ó python3.8 -m pip install --upgrade pip
sudo pip install [libraries]