const router = require("express").Router();
const fd = require("formidable");
const sd = require("silly-datetime");
const fs = require("fs");
const gm = require("gm");
const db = require("../model/mydb");
const md5 = require("../model/myMD5.js");
const User = db.User;

// get 的/user/login请求,跳转到登录页面
router.get("/login",function(req,res){
  res.render("login");
})

// get 的/user/regist请求,跳转到注册页面
router.get("/regist",function(req,res){
  res.render("regist");
})

// post 的/user/login请求,处理登录
router.post("/login",function(req,res){
  var username = req.body.username;
  var password = req.body.password;
  // 判断用户名密码是否正确
  var filter = {
    username: username,
    password: md5.md5(password)
  }
  // 根据用户名密码查询是否正确
  db.findAll(User,filter,function(err,users){
    if(err){
      console.log(err);
      res.send({status:1,msg: "网络波动,稍后再试"});
      return ;
    }
    if(users.length==0){
      // 没找到数据,用户名或密码错误
      res.send({status:1,msg: "用户名或密码错误"});
      return ;
    }
    // 登录成功
    // 保存登录状态
    req.session.username = username;
    // 返回成功的状态
    res.send({status:0, msg: "登录成功"});
  })
})

// post的 /user/check请求,验证用户名是否存在
router.post("/check",function(req,res){
  // 获取参数username
  var body = req.body; // {username: username}
  // 根据参数username查询数据
  db.findAll(User,body,function(err,users){
    if(err){
      console.log(err);
      res.send({status:2, msg: "网络错误,稍后再试"});
      return;
    }
    if(users.length>0){// users数组中有数据,已存在
      res.send({status:1,msg: "用户名已存在"});
      return ;
    }
    // users数组是空数组
    res.send({status:0, msg: "用户名可以使用"});
  });
})

// post的 /user/regist请求,注册用户
router.post("/regist",function(req,res){
  // 获取用户名和密码
  var username = req.body.username;
  var password = req.body.password;
  // 第二次验证用户名是否存在(防止通过脚本直接发送请求)
  var filter = {
    username: username
  }
  db.findAll(User,filter,function(err,users){
    if(err){
      console.log(err);
      res.send({status:3,msg: "网络错误"});
      return;
    }
    if(users.length>0){
      res.send({status:1,msg: "用户名已存在"});
      return;
    }
    // 用户名不存在,可以使用
    // 设置用户的默认昵称为用户名
    var data = {};
    data.username = username; // 用户名
    data.password = md5.md5(password); // 密码
    data.nickname = username; // 昵称
    // 保存数据
    db.add(User,data,function(err){
      if(err){
        console.log(err);
        res.send({status: 3,msg: "网络错误"});
        return ;
      }
      // 注册成功
      // 保存登录状态
      req.session.username = username;
      res.send({status:0,msg: "注册成功"});
    })
  });
});

// get /user/logout请求,退出登录
router.get("/logout",function(req,res){
  // 退出登录,实际上就是讲session删除
  req.session.destroy(function(err){
    res.redirect("/");
  });
});

// get /user/center,跳转到个人中心页面
router.get("/center",function(req,res){
  // 获取当前登录的用户名
  var username = req.session.username;
  var filter = {
    username: username
  }
  // 获取当前登录的用户信息
  db.find(User,filter,function(err,users){
    if(err){
      console.log(err);
      res.render("error",{msg: "网络错误"});
      return ;
    }
    if(users.length==0){
      // 登录状态已失效
      req.session.destroy(function(err){
        res.redirect("/");
      })
      return ;
    }
    // 返回数据 users是一个数组,且只有一个元素
    res.render("center",{user: users[0]});
  })
});

// get /user/change/:nickname,修改昵称
router.get("/change/:nickname",function(req,res){
  // 修改的数据,nickname
  var nickname = req.params.nickname;
  // 修改的条件/依据
  var username = req.session.username;
  var filter = {
    username: username
  }
  var data = {
    nickname: nickname
  }
  db.modify(User,filter,data,function(err){
    if(err){
      console.log(err);
      res.send({status:1,msg:"网络错误,修改失败"});
      return ;
    }
    res.send({status:0,msg: "修改成功"});
  })
});

// get /user/upload, 跳转到上传头像页面
router.get("/upload",function(req,res){
  res.render("upload");
})

// post /user/upload, 上传头像
router.post("/upload",function(req,res){
  var form = new fd.IncomingForm();
  form.uploadDir = "./uploads"; // 临时保存路径
  form.parse(req,function(err,fields,files){
    if(err){
      console.log(err);
      res.render("error",{msg: "上传失败"});
      return ;
    }
    // 获取文件
    var pic = files.pic;
    // 获取文件的路径
    var path = pic.path;
    path = path.substr(path.indexOf("\\")+1)
    // 跳转到剪切的页面,同时将图片路径传过去
    res.render("cut",{pic: path});
    // res.render("cut",{pic: files.pic.path});
  });
});

// get /user/cut,剪切图片
router.get("/cut",function(req,res){
  var x = req.query.x;
  var y = req.query.y;
  var w = req.query.w;
  var h = req.query.h;
  var img = req.query.img;
  // 设置图片的名称
  var username = req.session.username;
  var time = sd.format(new Date(),"YYYYMMDDHHmmss");
  var picName = username+"_"+time;
  // 当前路径,相对的是项目的根目录
  gm("./uploads/"+img)
  .crop(w,h,x,y)
  // 用户的实际头像
  .write("./avatars/"+picName,function(err){
    if(err){
      console.log(err);
      res.send({status:1, msg:"剪切失败"});
      return ;
    }
    // 剪切成功,将新头像的路径保存到数据库中
    var filter = {username: username};
    var data = {avatar: "/"+picName};
    db.modify(User,filter,data,function(err){
      if(err){
        console.log(err);
        res.send({status:1, msg:"修改失败"});
        return ;
      }
      // 修改数据库成功
      res.send({status:0, msg:"修改成功"});
    });
  })
})

// get /user/changePwd,跳转到修改密码页面
router.get("/changePwd",function(req,res){
  res.render("changepwd");
})

// post /user/changePwd,修改密码
router.post("/changePwd",function(req,res){
  var username = req.session.username;
  var oldPwd = req.body.oldPwd;
  var password = req.body.password;
  // 根据用户名查询密码
  var filter = {
    username: username,
    password: md5.md5(oldPwd)
  };
  db.findAll(User,filter,function(err,users){
    if(err){
      console.log(err);
      res.send({status: 2,msg: "网络错误,修改失败"});
      return ;
    }
    if(users.length==0){ // 数据为空,没有查到数据
      res.send({status:1,msg:"旧密码错误"});
      return ;
    }
    // 旧密码正确,将其修改为新密码
    filter = {
      username: username
    };
    var data = {
      password: md5.md5(password) // 给新密码加密
    }
    db.modify(User,filter,data,function(err){
      if(err){
        console.log(err);
        res.send({status:2,msg:"网络波动,修改失败"});
        return ;
      }
      // 修改成功
      res.send({status:0,msg:"修改成功"});
    });
  });
});

module.exports = router;