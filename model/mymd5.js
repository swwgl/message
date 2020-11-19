// 数据加密
/**
 * 将传入的字符串加密,返回一个MD5值
 * @param {String} pwd
 * @returns {String} md5
 */
exports.md5 = function (pwd) {
  var crypto = require("crypto");
  var str = crypto.createHash("md5").update(pwd).digest("base64"); //第一次加密
  // 乱序
  var arr = str.split("");
  var a = [];
  for (var i = 0; i < arr.length; i++) {
    if (i % 2 == 0) {
      a.push(arr[i]);
    }
    /* var temp = arr[i];
    var r = Math.floor(Math.random() * arr.length);
    arr[i] = arr[r];
    arr[r] = temp; */
  }
  str = arr.join(""); //重组字符串
  // 截取其中一部分
  str = str.substr(4, 18);
  str = crypto.createHash("md5").update(str).digest("base64");
  return str;
};
