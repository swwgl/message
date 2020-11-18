const router = require("express").Router();
const sd = require("silly-datetime");
// 引入自己封装的数据库模块
const db = require("../model/mydb");
// 获取其中的Msgmodel
const Message = db.Msg;

// get message/show 展示所有的留言数据
router.get("/show", function (req, res) {
  // 获取当前页码
  var page = req.query.page;
  // 获取某一页数据
  db.find(Message, { page: page }, function (err, docs) {
    if (err) {
      console.log(err);
      // 跳转到错误页面
      res.render("error", { msg: "" });
      return;
    }
    // 获取数据的总条数
    db.getCount(Message, function (err, count) {
      // console.log(count);
      if (err) {
        console.log(err);
        res.render("error", { msg: "获取数据失败" });
        return;
      }
      // 通过count算出总页数
      var pages = Math.ceil(count / 5);
      // 获取所有用户的信息
      db.findAll(db.User, {}, function (err, users) {
        if (err) {
          console.log(err);
          res.render("error", { msg: "获取数据失败" });
          return;
        }
        // 没有出错,将数据传递给index
        // 传递的数据:留言的数据docs,当前页面page,总页数pages,所有用户users,当前登录的用户名username
        var data = {
          msgs: docs,
          page: page,
          pages: pages,
          users: users,
          username: req.session.username,
        };
        res.render("index", data);
      });
    });
  });
});
// get /message/tijiao 发表留言
router.get("/tijiao", function (req, res) {
  // 测试参数的获取
  // console.log(req.query);
  // res.send("success");
  // 获取参数
  var message = req.query;
  // 添加登录的用户名
  message.username = req.session.username;
  // 添加留言的时间
  message.time = sd.format(new Date());
  // 调用db的方法,保存到数据库中
  db.add(Message, message, function (err) {
    if (err) {
      console.log(err);
      // 返回错误信息给Ajax对象
      res.send({ status: 1, msg: "网络故障,发表失败!" });
      return;
    }
    // 成功
    res.send({ status: 0, msg: "success" });
  });
});

// get /message/del 删除留言
router.get("/del", function (req, res) {
  // 获取参数
  var id = req.query.id;
  var filter = {
    _id: db.getObjectId(id),
  };
  db.del(Message, filter, function (err) {
    if (err) {
      console.log(err);
      res.send({ status: 1, msg: "网络故障" });
      return;
    }
    res.send({ status: 0, msg: "success" });
  });
});

// get /message/send 修改留言
router.get("/update", function (req, res) {
  var id = req.query.id;
  var message = req.query.message;
  // 修改条件
  var filter = {
    _id: db.getObjectId(id),
  };
  // 修改数据
  var data = {
    message: message,
  };
  // 调用修改的方法
  db.modify(Message, filter, data, function (err, raw) {
    if (err) {
      console.log(err);
      res.send({ status: 1, msg: "修改失败" });
      return;
    }
    console.log(raw);
    res.send({ status: 0, msg: "修改成功" });
  });
});

module.exports = router;
