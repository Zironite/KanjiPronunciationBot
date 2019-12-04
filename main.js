const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const Kuroshiro = require("kuroshiro");
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");
const kuromoji = require("kuromoji")
const JishoApi = require("unofficial-jisho-api");

const kuroshiro = new Kuroshiro();
const kuromojiAnalyzer = new KuromojiAnalyzer();
const jisho = new JishoApi();
kuroshiro.init(kuromojiAnalyzer).then(() => {
  kuromoji.builder({
    dicPath: "./node_modules/kuromoji/dict/"
  }).build((err, tokenizer) => {
    const bot = new Telegraf(process.env.BOT_TOKEN);

    bot.on('message', (ctx) => {
      if(ctx.message.text) {
        const result = kuroshiro.convert(ctx.message.text, { to: "hiragana", mode: "okurigana" });
        result.then((actualResult) => {
          let translationPromises = [];
          let parsedKanji = {};
          tokenizer.tokenize(ctx.message.text).filter(element => Kuroshiro.Util.hasKanji(element.basic_form))
            .map(element => {
              for (let i = 0; i < element.basic_form.length; i++) {
                let currChar = element.basic_form.charAt(i);

                if (Kuroshiro.Util.hasKanji(currChar) && !parsedKanji.hasOwnProperty(currChar)) {
                  parsedKanji[currChar] = true;
                  translationPromises.push(jisho.searchForKanji(currChar).then((currKanjiResult) => {
                    return {
                      kanji: currChar,
                      meaning: currKanjiResult.meaning
                    };
                  }));
                }
              }
            });
          Promise.all(translationPromises).then(values => {
            let translationText = values.map(value => {
              return `${value.kanji} => ${value.meaning}`
            }).join("\n");
            ctx.reply(`${actualResult}\n\n${translationText}`);
          });
        });
      }
    });
    bot.launch();
  });
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