require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');

const chatId = process.env.chatid
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

let sniffers= []

let id = 1;
// Matches "/echo [whatever]"
bot.onText(/\/get (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever" -- hacer split con " "

  id = parseInt(resp.split('R')[1])-1
  console.log("BOT- "+id)
  console.log(sniffers[id])
  let toret = 'Caracteristica deshabilitada por el momento'
  /*
  if(id != 6){

    toret = `Devolviendo informacion sobre ${sniffers[id].id}:\n 
        Temperatura: ${sniffers[id].temp} - ${sniffers[id].tempstatus}.
        AntenaWifi 1: ${sniffers[id].iface1} - ${sniffers[id].iface1status}.
        AntenaWifi 2: ${sniffers[id].iface2} - ${sniffers[id].iface2status}.
        AntenaWifi 3: ${sniffers[id].iface3} - ${sniffers[id].iface3status}.
        ESP32: ${sniffers[id].BLEface}.\n
      Su ultimo keep alive fue a ${sniffers[id].timestamp}`

  }else{

  }*/

  
  
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, toret);
});

const updateInfo = (datos) => {
  sniffers = datos

  console.log("--------------LIST OF DEVVICE-------------")
  for(let i = 0;i<5;i++){
    console.log(sniffers[i])
  }
}

const botSendMessage = (msgToBot) => {

  bot.sendMessage(chatId,msgToBot)

}

botSendMessage("Hello World!.\n Versión 2 alpha.\n Monitorizacion basada en EMQX")
module.exports = {botSendMessage,updateInfo};