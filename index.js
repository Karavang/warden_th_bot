const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const { User, mongoConnect } = require("./forDb");
const express = require("express");
require("dotenv").config();
const app = express();
const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT;
const startServer = async () => {
  try {
    await mongoConnect();
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
  app.listen(PORT, () => {
    console.log("Server woke up");
  });
};
startServer();

const bot = new TelegramBot(TOKEN, { polling: true });

let chatId;
let userId;

bot.on("new_chat_members", async (msg) => {
  chatId = msg.chat.id;
  userId = msg.new_chat_members;
  for (const newMember of userId) {
    if (!newMember.is_bot) {
      const existingUser = await User.findOne({ userId: newMember.id });

      if (!existingUser) {
        const userok = { userId: newMember.id, joinDate: new Date() };
        await User.create(userok);
        console.log(
          `New member joined: ${newMember.first_name} (${newMember.id})`
        );
      }
    }
  }
});

setInterval(async () => {
  if (chatId) {
    try {
      const allUsers = await User.find();

      const currentDate = new Date();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const usersToKick = allUsers.filter(
        (user) => user.joinDate <= thirtyDaysAgo
      );

      console.log(usersToKick);

      for (const user of usersToKick) {
        await bot.banChatMember(chatId, usersToKick[0].userId);
      }
      for (const user of usersToKick) {
        await User.findByIdAndRemove(user._id);
      }
    } catch (error) {
      console.error("Error kicking user:", error);
    }
  } else {
    console.error("chatId and userId are not set.");
  }
}, 24 * 60 * 60 * 1000);

console.log("Bot is running...");
