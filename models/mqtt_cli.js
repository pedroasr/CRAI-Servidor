const mqtt = require('mqtt')
const database = require('./database')


class Mqtt_cli{

    constructor(){

       

    }
    
}

const client = mqtt.connect('mqtt://localhost'); 
const door = database.getCollection()

client.on('connect', function () {
  client.subscribe('CRAIUPCTPersonCount', function (err) {
    if (!err) {
      console.log("MQTT CLIENT CONNECTED")
    }
  })
})

function pad(n, z){
  z = z || 2;
return ('00' + n).slice(-z);
}

const getFechaCompleta = () => {
  let d = new Date,
  dformat =   [d.getFullYear(),
              pad(d.getMonth()+1),
              pad(d.getDate())].join('-')+' '+
              [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds()),
              pad(d.getMilliseconds(),3)].join(':');

  return dformat;
} 

let msg = {}
client.on('message', function (topic, message) {
  
    msg = JSON.parse(message);
    //console.log(msg)
    let c = door.insertOne(msg)
    //console.log(c)

})

module.exports = Mqtt_cli;