const fs = require('fs');
//const https = require('https');
const express = require('express');

require('dotenv').config();


/* Timestamp*/
function pad(n, z){
    z = z || 2;
  return ('00' + n).slice(-z);
  }
  
  const getFecha = () => {
    let d = new Date,
    dformat =   [d.getFullYear(),
                pad(d.getMonth()+1),
                pad(d.getDate())].join('-');
  
    return dformat;
} 

//Aqui esta definido el funcionamiento del servidor
class Rest {
    constructor() {

        this.app = express();

        this.port = process.env.PORT
        
        //Middleware
        this.middlewares();

        //Rutas de mi aplicacion
        this.routes();

    }

    middlewares(){

        //directorio publico
        this.app.use(express.static('public'));
    }

    routes() {
        //Estas son las peticiones que responde
        this.app.get('/upct_hd/ble', (req, res) => {
            
            res.download(`csv/PersonCount_${getFecha()}_7-22.csv`)
        });

        this.app.get('/upct_hd/ble/:fecha', (req, res) => {
            
            res.download(`csv/PersonCount_${req.params.fecha}_7-22.csv`)
        });

        
            

    }

    listen(){
        this.app.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }
}

module.exports = Rest;