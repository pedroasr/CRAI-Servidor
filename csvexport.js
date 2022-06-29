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

let cabecerable = 'Fecha;Hora;Id;MAC;Tipo MAC;ADV Size;RSP Size;Tipo ADV;Advertisement;RSSI\r\n'


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
    var collection = db.collection("DoorSensors");*/    //var query = {"date": {"$gte": new Date(`${isodate()}Z05:00:00.000T`), "$lt": new Date(`${isodate()}Z20:00:00.000T`)}};//, "$lt": `${getFecha()} 22:00:00`
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
        
        }
    );        
        
   
}

const getHora = (l=0) => {
    let d = new Date();
    return pad(d.getHours()+l)
}

let started = false

const ble = () => {

    if(getHora()=='07' || !started){

        fs.writeFile(`csv/ble_${getFecha()}_7-22.csv`, cabecerable, { flag: 'w' }, err => {});
        started = true
    }

    var query = {"timestamp": {"$gte": `${getFecha()} ${getHora(-1)}:00:00`, "$lt": `${getFecha()} ${getHora()}:00:00`}};
    var cursor = bledatos.find(query).sort({timestamp:1});
    
    console.log(`Writing from ${getHora(-1)} to ${getHora()}`)

    cursor.forEach(
        function(doc) {
            if(doc.timestamp !== undefined){
                
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.idRasp};${doc.mac};${doc.tipoMAC};${doc.bleSize};${doc.rspSize};${doc.tipoADV};${doc.bleData};${doc.rssi}\r\n`
                fs.writeFile(`csv/ble_${getFecha()}_7-22.csv`, content, { flag: 'a' }, err => {});
                
            }
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

//7-22 cada hora pero en esa franja
var blejob = new CronJob(
    '00 00 7-22 * * *',
    ble()
);

console.log("Starting BLE job");
blejob.start()

var blereset = new CronJob(
    '00 00 23 * * *',
    bledatos.drop((err,delOk)=>{
        if (err) {
            console.log("BBDD Removal not possible")
            throw err;
        }
        if (delOK) console.log("Collection deleted");
    })
);


//main(); DO NOT UNCOMMENT!!!

