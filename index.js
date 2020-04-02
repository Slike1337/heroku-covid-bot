"use strict";

const Telegraf = require("telegraf");

const fetch = require("node-fetch");

const URL = "https://coronavirus-19-api.herokuapp.com/countries/";
const GLOBALURL = "https://coronavirus-19-api.herokuapp.com/all";
const TOKEN = "912213209:AAGhLFKBT4TB_19ay4cL7SEkpqs7BT_sXbg";
let notifications = {};
const bot = new Telegraf(TOKEN);
bot.start(ctx => ctx.reply("\u041F\u0440\u0438\u0432\u0435\u0442, ".concat(ctx.message.from.first_name, "! \u042F - \u0442\u0435\u043B\u0435\u0433\u0440\u0430\u043C-\u0431\u043E\u0442, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u0442 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044E \u043E \u043A\u043E\u0440\u043E\u043D\u0430\u0432\u0438\u0440\u0443\u0441\u0435. \u0427\u0442\u043E \u0431\u044B \u0443\u0437\u043D\u0430\u0442\u044C \u0441\u043F\u0438\u0441\u043E\u043A \u043C\u043E\u0438\u0445 \u043A\u043E\u043C\u043C\u0430\u043D\u0434, \u043D\u0430\u043F\u0438\u0448\u0438 /help")));
bot.help(ctx => ctx.reply("Мои комманды:\n" + "/country {Название страны} - Узнать информацию о вашей стране. Примечание: название страны должно быть на английском!\n" + "/world - Узнать информацию об коронавирусе на всей планете.\n" + "/notif {Название страны} - Включить уведомления о стране каждые 24 часа. Примечание: название страны должно быть на английском!\n" + "/unnotif - Выключить уведомления."));
bot.command("country", ctx => {
  let country = ctx.message.text.split(" ")[1];

  if (country) {
    fetch(URL + country).then(res => {
      return res.json();
    }).then(data => {
      ctx.reply("\u0421\u0442\u0440\u0430\u043D\u0430: ".concat(data.country, "\n\u0418\u043D\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445: ").concat(data.cases, "\n\u0412\u044B\u0437\u0434\u043E\u0440\u043E\u0432\u0435\u0432\u0448\u0438\u0445: ").concat(data.recovered, "\n\u0421\u043C\u0435\u0440\u0442\u0435\u0439: ").concat(data.deaths));
    }).catch(err => {
      ctx.reply("Такой страны нет!");
    });
  } else ctx.reply("Введите название страны.");
});
bot.command("world", ctx => {
  fetch(GLOBALURL).then(res => {
    return res.json();
  }).then(data => {
    ctx.reply("\u0412\u0441\u0435\u0433\u043E \u0438\u043D\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445: ".concat(data.cases, "\n\u0412\u0441\u0435\u0433\u043E \u0432\u044B\u0437\u0434\u043E\u0440\u043E\u0432\u0435\u0432\u0448\u0438\u0445: ").concat(data.recovered, "\n\u0412\u0441\u0435\u0433\u043E \u0441\u043C\u0435\u0440\u0442\u0435\u0439: ").concat(data.deaths));
  }).catch(err => {});
});
bot.command("notif", async ctx => {
  try {
    let country = ctx.message.text.split(" ")[1];
    const response = await fetch(URL + country);
    const json = await response.json();
    if (notifications[ctx.message.from.id]) notifications[ctx.message.from.id].push(country);else {
      notifications[ctx.message.from.id] = [];
      notifications[ctx.message.from.id].push(country);
    }
    ctx.reply("\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043E \u0441\u0442\u0440\u0430\u043D\u0435 ".concat(country, " \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u044B."));
  } catch (err) {
    ctx.reply("Такой страны нет!");
  }
});
bot.command("unnotif", ctx => {
  delete notifications[ctx.message.from.id];
  ctx.reply("Уведомления выключены.");
});
setInterval(() => {
  for (let [key, value] of Object.entries(notifications)) {
    value.forEach(element => {
      fetch(URL + element).then(res => {
        return res.json();
      }).then(data => {
        bot.telegram.sendMessage(key, "\u0421\u0442\u0440\u0430\u043D\u0430: ".concat(data.country, "\n\u0418\u043D\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445: ").concat(data.cases, "\n\u0412\u044B\u0437\u0434\u043E\u0440\u043E\u0432\u0435\u0432\u0448\u0438\u0445: ").concat(data.recovered, "\n\u0421\u043C\u0435\u0440\u0442\u0435\u0439: ").concat(data.deaths));
      }).catch(err => {});
    });
  }
}, 86400000);
bot.launch();