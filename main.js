const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const Kuroshiro = require("kuroshiro");
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");

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

const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/", function(request, response) {
  response.send('Works!');
});

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});