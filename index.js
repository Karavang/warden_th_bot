const TelegramBot = require("node-telegram-bot-api");
const { User, mongoConnect } = require("./forDb");

require("dotenv").config();
const TOKEN = process.env.TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });
const atStart = async () => {
  try {
    await mongoConnect();
    console.log("Connected to MongoDB!");
    aboba();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
atStart();
let chatId;
let userId;

bot.on("new_chat_members", async (msg) => {
  chatId = msg.chat.id;
  userId = msg.new_chat_member;
  console.log("C'mon is work!");
  if (!userId.is_bot) {
    const existingUser = await User.findOne({
      chat: chatId,
      userId: userId.id,
    });
    console.log(existingUser);
    if (!existingUser) {
      const userok = {
        chat: chatId,
        userId: userId.id,
        joinDate: new Date(),
      };

      await User.create(userok);
      console.log(`New member joined: ${userId.first_name} (${userId.id})`);
    }
  }
});

const aboba = async () => {
  try {
    const allUsers = await User.find();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersToKick = allUsers.filter(
      (user) => user.joinDate <= thirtyDaysAgo
    );

    console.log(usersToKick);

    for (const user of usersToKick) {
      await bot.banChatMember(user.chat, user.userId);
      await User.findByIdAndRemove(user._id);
    }
  } catch (error) {
    console.error("Error kicking user:", error);
  }
};
setInterval(aboba, 24 * 60 * 60 * 1000);

console.log("Bot is running...");
module.exports = atStart;
