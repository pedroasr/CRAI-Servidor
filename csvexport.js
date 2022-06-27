const fs = require('fs');

var mongodb = require("mongodb");
var CronJob = require('cron').CronJob;

var client = mongodb.MongoClient;
var url = "mongodb://10.147.18.134:27017/";

let cabecera = 'Fecha;Hora;Evento In-Out(1/0);Cont. D-In total;Cont. I-In total;Total IN;Cont. D-out total;Cont. I-Out total;Total OUT;Estimación nº Personas\r\n'

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

let content = {}

const main = () => {
    fs.writeFile(`csv/PersonCount_${getFecha()}_7-22.csv`, cabecera, { flag: 'w' }, err => {});

    client.connect(url, function (err, client) {

        var db = client.db("CRAI-UPCT");
        var collection = db.collection("DoorSensors");

        var query = {"timestamp": {"$gte": `${getFecha()} 07:00:00`, "$lt": `${getFecha()} 22:00:00`}};

        var cursor = collection.find(query);
        cursor.sort({timestamp:1})


        //console.log(cursor)
        cursor.forEach(
            function(doc) {
                if(doc.timestamp !== undefined){

                    content = `${doc.timestamp.split(" ")[0]};${doc.timestamp.split(" ")[1]};${doc.eventoIO ? 1 : 0};${doc.entradasSensorDer};${doc.entradasSensorIzq};${doc.entradasTotal};${doc.salidasSensorDer};${doc.salidasSensorIzq};${doc.salidasTotal};${doc.estPersonas}\r\n`
                    fs.writeFile(`csv/PersonCount_${getFecha()}_7-22.csv`, content, { flag: 'a' }, err => {});
                
                }
                    
                
            
            }, 
            function(err) {
                client.close();
            }
        );        
        
    })
}

var job = new CronJob(
    '00 00 22 * * *',
    main()
);
console.log("Starting CRON job");
job.start()


main();