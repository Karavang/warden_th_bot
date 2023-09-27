const { Schema, model, connect } = require("mongoose");
const fromEnv = process.env;
const schema = new Schema(
  {
    chat: Number,
    userId: String,
    joinDate: Date,
  },
  { versionKey: false }
);
const User = model("User", schema);

const mongoConnect = async () => {
  try {
    await connect(fromEnv.LINK);
    console.log("connected");
  } catch (error) {
    console.log(`We has any problems with connection to db. Error:${error}`);
  }
};

module.exports = { User, mongoConnect };
