const router = require("express").Router();
const db = require("../model/mydb");
const User = db.User;

// get 的 /user/login请求,跳转到登录页面
router.get("/login", function (req, res) {
  res.render("login");
});
// get 的 /user/regist请求,跳转到注册页面
router.get("/regist", function (req, res) {
  res.render("regist");
});

// post 的 /user/login请求,处理登录
router.post("/login", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  // 判断用户名密码是否正确
  var filter = {
    username: username,
    password: password,
  };
  db.findAll(User, filter, function (err, users) {
    if (err) {
      console.log(err);
      res.send({ status: 1, msg: "网络波动,稍后继续..." });
      return;
    }
    if (users.length == 0) {
      // 没有找到数据,用户名或密码错误
      res.send({ status: 1, msg: "用户名或密码错误" });
      return;
    }
    // 登录成功
    // 保存登录状态
    req.session.username = username;
    // 返回成功的状态
    res.send({ status: 0, msg: "登录成功" });
  });
});

module.exports = router;
