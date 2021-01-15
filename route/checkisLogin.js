// 验证用户是否登录的路由
/**
 * req: 请求对象
 * res: 响应对象
 * next: 请求放行,调用下一个中间件
 * 请求放行的条件: 
 *    1. 已经登录(session中有值)
 *    2. 访问地址是: 
 *        /user/login,/user/regist,/user/check
 */
exports.check = function(req,res,next){
  // 获取session的值
  var username = req.session.username;
  // 获取请求地址
  var url = req.path;
  // 判断是否符合请求放行的条件
  if(username || 
    url=="/user/login" || 
    url=="/user/regist" || 
    url=="/user/check"
  ){
    next();
    return ;
  }
  // 不符合放行的条件,跳转到登录页面
  res.render("login");
}


