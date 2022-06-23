require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');

const chatId = process.env.chatid
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

let sniffers= []

// Matches "/echo [whatever]"
bot.onText(/\/get (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever" -- hacer split con " "

  let id = resp.split['R'][1]
  let toret = ''

  if(id != 6){

    toret = `Devolviendo informacion sobre ${sniffers[d].id}:\n 
        Temperatura: ${sniffers[id].temp} - ${sniffers[id].tempstatus}.\n
        AntenaWifi 1: ${sniffers[id].iface1} - ${sniffers[id].iface1status}.\n
        AntenaWifi 2: ${sniffers[id].iface2} - ${sniffers.iface2status}.\n
        AntenaWifi 3: ${sniffers[id].iface3} - ${sniffers.iface3status}.\n
        ESP32: ${sniffers[id].BLEface}.\n
        Su ultimo keep alive fue a ${sniffers[id].timestamp}`

  }else{

  }

  
  
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, toret);
});

const updateInfo = (datos) => {
  sniffers = datos
}

const botSendMessage = (msgToBot) => {

  bot.sendMessage(chatId,msgToBot)

}

module.exports = {botSendMessage,updateInfo};