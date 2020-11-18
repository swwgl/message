const express = require("express");
const route = require("./route");
const session = require("express-session");
const app = express();

app.listen(4000);
// 设置视图模板引擎
app.set("view engine", "ejs");
// 调用session配置
app.use(
  session({
    secret: "message",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
// 设置post请求参数的解析
app.use(express.urlencoded({ extended: true }));
// 设置根目录
app.use(express.static("./public"));
// 设置登录验证拦截器
app.use(route.checkisLogin);

app.get("/", function (req, res) {
  // res.render("index");
  // 判断是否已经登录(检查session有没有username)
  // var username = req.session.username;
  // if (!username) {
  //   //没有session
  //   res.render("login");
  // }
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
