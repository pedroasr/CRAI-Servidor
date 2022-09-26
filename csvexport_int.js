const fs = require('fs');
var spawn = require("child_process").spawn;

var database = require("./models/database");

var CronJob = require('cron').CronJob;

var interval = 5

if (interval > 60){

    console.log("Max sampling period is 60!")
    exit()
}

    


const puertadatos = database.getCollection('DoorSensors')
const bledatos = database.getCollection('BLE')
const wifidatos = database.getCollection('wifi')

//let cabecera = 'Fecha;Hora;Evento In-Out(1/0);Cont. D-In total;Cont. I-In total;Total IN;Cont. D-out total;Cont. I-Out total;Total OUT;Estimación nº Personas\r\n'
let cabeceradoor = 'Fecha;Hora;Evento In-Out(1/0);Entradas Derecha;Salidas Derecha;Entradas Izquierda;Salidas Izquierda;Entradas Derecha 2;Salidas Derecha 2\r\n'
let cabecerawifi = 'Fecha;Hora;Id;Canal;SSID;MAC Origen;RSSI\r\n'

let cabecerable = 'Fecha;Hora;Id;MAC;Tipo MAC;ADV Size;RSP Size;Tipo ADV;Advertisement;RSSI\r\n'

/* File targets for python scripts */
wifi_trg = "csv/wifi_"
ble_trg = "csv/ble_"
pcount_trg = "csv/pcount_"
wifi_trg_t = ""
ble_trg_t = ""
pcount_trg_t = ""

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

const getHora = () => {

    let d = new Date,
    dformat = [pad(d.getHours()),
              pad(d.getMinutes())].join(":");
    
    return dformat; 
}

const getInt = () => {

    let d = new Date;
    let dformat;

    
    if ((d.getMinutes() - interval) < 0)
        dformat = [pad(d.getHours()-1),pad(d.getMinutes()-interval+60)].join(":")
    else
        dformat = [pad(d.getHours()),pad(d.getMinutes()-interval)].join(":")
    
    return dformat
} 



let content = {}

const door = () => {

    pcount_trg_t = pcount_trg+getInt()+"-"+getHora()+".csv";

    fs.writeFile(pcount_trg_t, cabeceradoor, { flag: 'w' }, err => {});    

    /*var db = client.db("CRAI-UPCT");
    var collection = db.collection("DoorSensors");*/    //var query = {"date": {"$gte": new Date(`${isodate()}Z05:00:00.000T`), "$lt": new Date(`${isodate()}Z20:00:00.000T`)}};//, "$lt": `${getFecha()} 22:00:00`
    var query = {"timestamp": {"$gte": `${getFecha()} 07:00:00`, "$lt": `${getFecha()} ${getHora()}:00`}};//, "$lt": `${getFecha()} 22:00:00`
    var cursor = puertadatos.find(query).sort({"timestamp":1});
    
    
    //console.log(cursor)
    cursor.forEach(
        function(doc) {
            
            if(doc.timestamp !== undefined){
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.eventoIO ? 1 : 0};${doc.entradasSensorDer};${doc.salidasSensorDer};${doc.entradasSensorIzq};${doc.salidasSensorIzq};${doc.entradasSensorDer2};${doc.salidasSensorDer2}\r\n`
                fs.writeFile(pcount_trg_t, content, { flag: 'a' }, err => {});
            
            } 
        
        }
    );  

    
    
    console.log("Person count data saved");

        
    
}

const wifi = () => {

    wifi_trg_t = wifi_trg+getInt()+"-"+getHora()+".csv";

    fs.writeFile(wifi_trg_t, cabecerawifi, { flag: 'w' }, err => {});

    var query = {"timestamp": {"$gte": `${getFecha()} ${getInt()}:00`, "$lt": `${getFecha()} ${getHora()}:00`}};
    //var query = {"timestamp": {"$gte": `2022-06-29 07:00:00`, "$lt": `2022-06-29 22:00:00`}};
    
    var cursor = wifidatos.find(query);
    
    cursor.sort({timestamp:1}).allowDiskUse();

    console.log(`Saving Wifi data of the day`)

    
    cursor.forEach(
        function(doc) {
            if(doc.timestamp !== undefined){
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.id};${doc.canal};${doc.ssid};${doc.OrigMAC};${doc.rssi}\r\n`
                fs.writeFile(wifi_trg_t, content, { flag: 'a' }, err => {});
            
            }
        
        }
    );   

    
    
    console.log("Wifi data saved");
        
   
}


const ble = () => {

    ble_trg_t = ble_trg+getInt()+"-"+getHora()+".csv";
    
    fs.writeFile(ble_trg_t, cabecerable, { flag: 'w' }, err => {});


    var query = {"timestamp": {"$gte": `${getFecha()} ${getInt()}:00`, "$lt": `${getFecha()} ${getHora()}:00`}};
    var cursor = bledatos.find(query);
    
    cursor.sort({timestamp:1}).allowDiskUse();
    
    console.log(`Saving BLE data of the day`)

    cursor.forEach(
        function(doc) {
            if(doc.timestamp !== undefined){
                
                content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.idRasp};${doc.mac};${doc.tipoMac};${doc.bleSize};${doc.rspSize};${doc.tipoADV};${doc.bleData};${doc.rssi}\r\n`
                fs.writeFile(ble_trg_t, content, { flag: 'a' }, err => {
                    
                });
                
                
            }
        }
    );   
    
    //fs.writeFile(ble_trg_t,"END-OF-LINE",{flag:'a'}, err => {})
    
     
    console.log("BLE data saved");

}

const main = () => {
    door();
    wifi();
    ble();

    console.log(ble_trg_t)

    var ble_s = spawn('python3',["./hd_detect.py",
                                ble_trg_t]);

    ble_s.stdout.on('data', function (data) {
        dataToSend = data.toString()
        console.log('Python BLE> ' + dataToSend);
        
    });

    

}




var job = new CronJob(
    `0,5,10,15,20,25,30,35,40,45,50,55 8-22 * * *`,
    //'00 00 22 * * *',
    main
);

console.log("Starting CRON job");
job.start()


