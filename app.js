const express = require("express");
const route = require("./route");
const app = express();

app.listen(4000);

app.set("view engine", "ejs");

app.use(express.static("./public"));

app.get("/", function (req, res) {
  // res.render("index");
  // 展示首页所有留言的信息
  res.redirect("/message/show?page=1");
});

// 处理message相关的请求(所有以/message开头的请求)
app.use("/message", route.message);
