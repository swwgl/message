const mongoose = require("mongoose");

const MsgSchema = mongoose.Schema;

var schema = new MsgSchema(
  {
    username: String,
    message: String,
    time: String,
  },
  {
    collection: "message",
  }
);

const model = mongoose.model("msg", schema);

// 暴露
module.exports = model;
