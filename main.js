const Telegraf = require('telegraf');
const Kuroshiro = require("kuroshiro");
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");
const JishoApi = require("unofficial-jisho-api");
const session = require('telegraf/session');

const kuroshiro = new Kuroshiro();
const kuromojiAnalyzer = new KuromojiAnalyzer();
const jisho = new JishoApi();
kuroshiro.init(kuromojiAnalyzer).then(() => {
  const bot = new Telegraf(process.env.BOT_TOKEN);
  tokenizer = kuromojiAnalyzer._analyzer;
  bot.use(session())
  bot.command('jisho', (ctx) => {
    if (ctx.message.text === "/jisho") {
      ctx.reply("What word would you like to learn about?");
      ctx.session.use_jisho = true;
    } else {
      jishoTranslation(ctx, tokenizer);
    }
  });
  bot.on('message', (ctx) => {
    if(ctx.message.text) {
      if (ctx.session.use_jisho) {
        jishoTranslation(ctx, tokenizer);
      } else {
        const result = kuroshiro.convert(ctx.message.text, { to: "hiragana", mode: "okurigana" });
        result.then((actualResult) => {
          ctx.reply(actualResult);
        });
      }
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

function jishoTranslation(ctx,tokenizer) {
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
    if (translationText !== "")
      ctx.reply(translationText);
    else
      ctx.reply("Please input text to translate")
    ctx.session.use_jisho = false;
  });
}