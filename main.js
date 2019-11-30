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
      if(ctx.message.photo) {
        let file = ctx.telegram.getFile(ctx.message.photo[2].file_id)
        file.then((response) => {
          let filePath = `https://api.telegram.org/file/bot${ctx.telegram.token}/${response.file_path}`;
          request({
            url: filePath,
            method: "get",
            encoding: null
          }, (error,response,body) => {
            if (error) {
              console.error(error);
            } else {
              sharp(body)
                .resize(600,600, {
                  fit: 'contain'
                })
                .toBuffer()
                .then(data => {
                  let job = tesseract.recognize(data, "jpn", { logger: m => console.log(m) });
                  job
                    .catch(err => console.error(err))
                    .then(result =>{
                      kuroshiro.convert(result.data.text, { to: "hiragana", mode: "okurigana" })
                        .then(actualResult => ctx.reply(actualResult));
                    })
                    .finally(resultOrError => console.log(resultOrError));
                });
            }
          });
        });
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