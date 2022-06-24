const mqtt = require('mqtt')
const database = require('./database')
const botcrai = require('./bot_tel')

class Mqtt_cli{

    constructor(){

       

    }
    
}

let topics = ['CRAIUPCTPersonCount','CRAIUPCT_BLEdata','CRAIUPCT_WifiData','keepalive']
//const client = mqtt.connect('mqtt://localhost'); 
const door = database.getCollection('DoorSensors')
const ble = database.getCollection('BLE')
const wifi = database.getCollection('wifi')
const monitor = database.getCollection('monitor')

/*MQTT */

const options = {
  clean: true, // retain session
connectTimeout: 4000, // Timeout period
// Authentication information
clientId: 'Server',
username: 'Server',
password: 'Server',
}

const connectUrl = "ws://localhost:8083/mqtt";
const client = mqtt.connect(connectUrl,options);

client.on('connect', function () {
  client.subscribe(topics, function (err) {
    if (!err) {
      console.log("MQTT CLIENT CONNECTED")
    }
  })
})


let sniffers = []

let empty = {
  updated:false,
  iface1:0,
  iface1status:'unknown',
  iface2:0,
  iface2status:'unknown',
  iface3:0,
  iface3status:'unknown',
  temp:0,
  tempstatus:'unknown',
  BLEface:'unknown',
  error:true

}

for(let i = 0;i<5;i++){
  sniffers[i] = empty
}

botcrai.updateInfo(sniffers)

let okCount = 0
const maxTemp = 55;

//Bot report status every 15 minutes
setInterval(()=>{

  let msg = `Dispositivos OK: ${okCount}.\n`;
  for(let i = 0;i<5;i++){

    if(sniffers[i].updated){
      sniffers[i].updated = false;

      if(sniffers[i].error){
        msg += `Raspberry ${i+1} tiene errores.\n`
      }
      
    }else{
      msg += `Raspberry ${i+1} no ha enviado nada.\n`
    }
    
  }

  botcrai.botSendMessage(msg)
  okCount = 0;
},60 * 1000 * 15) //Cada 15 minutos

let ind = 1;

const saveMonitor = (dato) => {

  
  ind = parseInt((dato.id).split('y')[1])-1

  

  if(dato.id != "Raspberry6"){


    
    sniffers[ind].iface1status = 'OK'
    sniffers[ind].iface2status = 'OK'
    sniffers[ind].iface3status = 'OK'
    sniffers[ind].tempstatus = 'OK'
    sniffers[ind].error = false
    sniffers[ind].BLEface = dato.BLEface
    sniffers[ind].id = dato.id
    sniffers[ind].temp = dato.temp
    sniffers[ind].timestamp = dato.timestamp
    

    //Checking Wifi Interfaces
    
    if(dato.iface1 == 'KO'){

      sniffers[ind].iface1 = 0
      sniffers[ind].iface1status = 'KO'
      sniffers[ind].error = true

    }else if(sniffers[ind].iface1 < dato.iface1){

      sniffers[ind].iface1 = dato.iface1

    }else{
      sniffers[ind].iface1status = 'NoK'
      sniffers[ind].iface1 = dato.iface1
      sniffers[ind].error = true
    }

    if(dato.iface2 == 'KO'){

      sniffers[ind].iface2 = 0
      sniffers[ind].iface2status = 'KO'
      sniffers[ind].error = true

    }else if(sniffers[ind].iface2 < dato.iface2){

      sniffers[ind].iface2 = dato.iface2

    }else{
      sniffers[ind].iface2status = 'NoK'
      sniffers[ind].iface2 = dato.iface2
      sniffers[ind].error = true
    }

    if(dato.iface3 == 'KO'){

      sniffers[ind].iface3 = 0
      sniffers[ind].iface3status = 'KO'
      sniffers[ind].error = true

    }else if(sniffers[ind].iface3 < dato.iface3){

      sniffers[ind].iface3 = dato.iface3

    }else{
      sniffers[ind].iface3status = 'NoK'
      sniffers[ind].iface3 = dato.iface3
      sniffers[ind].error = true
    }

    if(sniffers[ind].BLEface == 'KO')
      sniffers[ind].error = true
    
    if(sniffers[ind].temp > maxTemp){
      sniffers[ind].tempstatus = "HOT"
      sniffers[ind].error = true
    }
    

    if(!sniffers[ind].error)
      okCount++;

    console.log("Updating bots sniffers info\n")
    botcrai.updateInfo(sniffers)

    sniffers[ind].updated = true


  }else{
    console.log("Falta programar terabee")
  }
}


client.on('message', function (topic, message) {

  switch(topic){

    case 'CRAIUPCTPersonCount':
      
      //console.log(JSON.parse(message))
      door.insertOne(JSON.parse(message))
  
      break;

    case 'CRAIUPCT_BLEdata':
      
      ble.insertOne(JSON.parse(message));

      break;

    case 'CRAIUPCT_WifiData':
      
      //console.log(JSON.parse(message))
      wifi.insertOne(JSON.parse(message))

      break;
    
    case 'keepalive':

      
      let rasp = JSON.parse(message)
      console.log("Received: ")
      console.log(rasp)
      saveMonitor(rasp);
      //botcrai.botSendMessage(`${rasp.id}--> T: ${rasp.temp}ºC`)
      monitor.insertOne(JSON.parse(message))
      break;

  }
  
    

})

module.exports = Mqtt_cli;