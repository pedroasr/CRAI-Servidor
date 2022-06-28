const fs = require('fs');

var database = require("./models/database");

var CronJob = require('cron').CronJob;

/*var client = mongodb.MongoClient;
var url = "mongodb://10.147.18.134:27017/";*/

const puertadatos = database.getCollection('DoorSensors')
const bledatos = database.getCollection('BLE')
const wifidatos = database.getCollection('wifi')

let cabecera = 'Fecha;Hora;Evento In-Out(1/0);Cont. D-In total;Cont. I-In total;Total IN;Cont. D-out total;Cont. I-Out total;Total OUT;Estimación nº Personas\r\n'

let cabecerawifi = 'Fecha;Hora;Id;Canal;SSID;MAC Origen;RSSI\r\n'


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

const isodate =() =>{
    return new Date().toISOString().split('T')[0];
}

let content = {}

const door = () => {

    fs.writeFile(`csv/PersonCount_${getFecha()}_7-22.csv`, cabecera, { flag: 'w' }, err => {});    

    /*var db = client.db("CRAI-UPCT");
    var collection = db.collection("DoorSensors");*/
    console.log("HOLA")
    //var query = {"date": {"$gte": new Date(`${isodate()}Z05:00:00.000T`), "$lt": new Date(`${isodate()}Z20:00:00.000T`)}};//, "$lt": `${getFecha()} 22:00:00`
    var query = {"timestamp": {"$gte": `${getFecha()} 07:00:00`, "$lt": `${getFecha()} 22:00:00`}};//, "$lt": `${getFecha()} 22:00:00`
    var cursor = puertadatos.find(query).sort({timestamp:1});
    
    
    //console.log(cursor)
    cursor.forEach(
        function(doc) {
            
            if(doc.timestamp !== undefined){
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.eventoIO ? 1 : 0};${doc.entradasSensorDer};${doc.entradasSensorIzq};${doc.entradasTotal};${doc.salidasSensorDer};${doc.salidasSensorIzq};${doc.salidasTotal};${doc.estPersonas}\r\n`
                fs.writeFile(`csv/PersonCount_${getFecha()}_7-22.csv`, content, { flag: 'a' }, err => {});
            
            } 
        
        }
    );        
        
    
}

const wifi = () => {

    fs.writeFile(`csv/wifi_${getFecha()}_7-22.csv`, cabecerawifi, { flag: 'w' }, err => {});

    /*var db = client.db("CRAI-UPCT");
    var collection = db.collection("wifi");*/
    var query = {"timestamp": {"$gte": `${getFecha()} 07:00:00`, "$lt": `${getFecha()} 22:00:00`}};
    var cursor = wifidatos.find(query).sort({timestamp:1});


    cursor.forEach(
        function(doc) {
            if(doc.timestamp !== undefined){
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.id};${doc.canal};${doc.ssid};${doc.OrigMAC};${doc.rssi}\r\n`
                fs.writeFile(`csv/wifi_${getFecha()}_7-22.csv`, content, { flag: 'a' }, err => {});
            
            }
        
        }, 
        function(err) {
            //client.close();
        }
    );        
        
   
}

const main = () => {
    door();
    wifi();
}

var job = new CronJob(
    '00 00 22 * * *',
    main()
);
console.log("Starting CRON job");
job.start()

//main(); DO NOT UNCOMMENT!!!

