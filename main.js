const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const Kuroshiro = require("kuroshiro");
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");

const keyboard = Markup.inlineKeyboard([
    Markup.urlButton('❤️', 'http://telegraf.js.org'),
    Markup.callbackButton('Delete', 'delete')
  ]);
const kuroshiro = new Kuroshiro();
kuroshiro.init(new KuromojiAnalyzer()).then(() => {
    const bot = new Telegraf(process.env.BOT_TOKEN);

    bot.on('message', (ctx) => {
        const result = kuroshiro.convert(ctx.message.text, { to: "hiragana" });
        result.then((actualResult) => ctx.reply(actualResult));
    });
    bot.launch();
});