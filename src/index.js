"use strict";

const Telegraf = require("telegraf");

const fetch = require("node-fetch");

const URL = "https://coronavirus-19-api.herokuapp.com/countries/";
const GLOBALURL = "https://coronavirus-19-api.herokuapp.com/all";
const TOKEN = "912213209:AAGhLFKBT4TB_19ay4cL7SEkpqs7BT_sXbg";
let notifications = {};
const bot = new Telegraf(TOKEN);
bot.start(ctx =>
    ctx.reply(
        `Привет, ${ctx.message.from.first_name}! Я - телеграм бот, который отображает информацию о коронавирусе. Что бы узнать список моих комманд, напиши /help`
    )
);
bot.help(ctx =>
    ctx.reply(
        "Мои комманды:\n" +
        "/country {Название страны} - Узнать информацию о вашей стране. Примечание: название страны должно быть на английском!\n" +
        "/world - Узнать информацию об коронавирусе на всей планете\n" +
        "/notif {Название страны} - Включить уведомления о стране каждые 24 часа. Примечание: название страны должно быть на английском!\n" +
        "/unnotif - Выключить уведомления"
    )
);
bot.command("country", ctx => {
    let country = ctx.message.text.split(" ")[1];

    if (country) {
        fetch(URL + country)
            .then(res => {
                return res.json();
            })
            .then(data => {
                ctx.reply(
                    `Страна: ${data.country}\nИнфицированных: ${data.cases}\nВыздоровевших: ${data.recovered}\nСмертей: ${data.deaths}`
                );
            })
            .catch(err => {
                ctx.reply("Такой страны нет!");
            });
    } else ctx.reply("Введите название страны.");
});
bot.command("world", ctx => {
    fetch(GLOBALURL)
        .then(res => {
            return res.json();
        })
        .then(data => {
            ctx.reply(
                `Всего инфицированных: ${data.cases}\nВсего выздоровевших: ${data.recovered}\nВсего смертей: ${data.deaths}`
            );
        })
        .catch(err => {
        });
});
bot.command("notif", async ctx => {
    try {
        let country = ctx.message.text.split(" ")[1];
        const response = await fetch(URL + country);
        const json = await response.json();
        if (notifications[ctx.message.from.id])
            notifications[ctx.message.from.id].push(country);
        else {
            notifications[ctx.message.from.id] = [];
            notifications[ctx.message.from.id].push(country);
        }
        ctx.reply(`Уведомления о стране ${country} включены.`);
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
            fetch(URL + element)
                .then(res => {
                    return res.json();
                })
                .then(data => {
                    bot.telegram.sendMessage(
                        key,
                        `Страна: ${data.country}\nИнфицированных: ${data.cases}\nВыздоровевших: ${data.recovered}\nСмертей: ${data.deaths}`
                    );
                })
                .catch(err => {
                });
        });
    }
}, 86400000);
bot.launch();
