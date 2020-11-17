const express = require("express");
const route = require("./route");
const session = require("express-session");
const app = express();

app.listen(4000);

app.set("view engine", "ejs");

app.use(express.static("./public"));
// 获取post 提交的参数
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "message",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", function (req, res) {
  // res.render("index");
  // 展示首页所有留言的信息
  res.redirect("/message/show?page=1");
});

// 处理message相关的请求(所有以/message开头的请求)
app.use("/message", route.message);

// 处理user相关的请求(以/user开头的请求)
app.use("/user", route.user);
// 其他的 错误地址
app.use(function (req, res) {
  res.render("error", { msg: "请求地址错误" });
});
