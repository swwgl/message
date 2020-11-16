const mongoose = require("mongoose");

const UserSchema = mongoose.Schema;

var schema = new UserSchema({
  username: { type: String, unique: true },
  password: String,
  avatar: { type: String, default: "/img/avatar.jpg" },
  nickname: String,
});

const model = mongoose.model("user", schema);

// 暴露
module.exports = model;
