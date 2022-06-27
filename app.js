//const Server = require('./models/rest');
const Mqtt_cli = require('./models/mqtt_cli')
const Server = require('./models/rest');

const server = new Server();

server.listen();


const mqttclient = new Mqtt_cli();

//server.listen();