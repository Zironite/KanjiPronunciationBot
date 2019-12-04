const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const Kuroshiro = require("kuroshiro");
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");
const tesseract = require("tesseract.js");
const request = require("request");
const sharp = require('sharp');

const keyboard = Markup.inlineKeyboard([
    Markup.urlButton('❤️', 'http://telegraf.js.org'),
    Markup.callbackButton('Delete', 'delete')
  ]);
const kuroshiro = new Kuroshiro();
kuroshiro.init(new KuromojiAnalyzer()).then(() => {
    const bot = new Telegraf(process.env.BOT_TOKEN);

    bot.on('message', (ctx) => {
      if(ctx.message.text) {
        const result = kuroshiro.convert(ctx.message.text, { to: "hiragana", mode: "okurigana" });
        result.then((actualResult) => ctx.reply(actualResult));
      }
    });
    bot.launch();
});

// init project
const express = require("express");
const app = express();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.send('Works!');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});