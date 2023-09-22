const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const { User, mongoConnect } = require("./forDb");
const express = require("express");
require("dotenv").config();
const app = express();
const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT;
const startServer = async () => {
  await mongoConnect();
  app.listen(PORT, () => {
    console.log("Server woke up");
  });
};
startServer();

const bot = new TelegramBot(TOKEN, { polling: true });

let chatId;
let userId;

bot.on("new_chat_members", (msg) => {
  chatId = msg.chat.id;
  const newMembers = msg.new_chat_members;

  newMembers.forEach(async (member) => {
    if (!member.is_bot) {
      userId = member.id;
      const newDate = new Date();

      const userBody = {
        userId: userId,
        joinDate: newDate,
      };
      const text = await User.create(userBody);
      console.log(text);
    }
  });
});

setInterval(async () => {
  if (chatId && userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const usersToKick = await User.find({
        userId: userId,
        joinDate: { $lt: thirtyDaysAgo },
      });

      for (const user of usersToKick) {
        await bot.kickChatMember(chatId, user.userId);
      }
    } catch (error) {
      console.error("Error kicking user:", error);
    }
  } else {
    console.error("chatId and userId are not set.");
  }
}, 24 * 60 * 60 * 1000);

console.log("Bot is running...");
