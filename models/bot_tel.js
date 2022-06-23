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

  let id = int(resp.split['R'][1])
  let toret = ''

  if(id != 6){

    toret = `Devolviendo informacion sobre ${sniffers[id-1].id}:\n 
        Temperatura: ${sniffers[id-1].temp} - ${sniffers[id-1].tempstatus}.\n
        AntenaWifi 1: ${sniffers[id-1].iface1} - ${sniffers[id-1].iface1status}.\n
        AntenaWifi 2: ${sniffers[id-1].iface2} - ${sniffers[id-1].iface2status}.\n
        AntenaWifi 3: ${sniffers[id-1].iface3} - ${sniffers[id-1].iface3status}.\n
        ESP32: ${sniffers[id-1].BLEface}.\n
        Su ultimo keep alive fue a ${sniffers[id-1].timestamp}`

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