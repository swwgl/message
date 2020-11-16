// 主体文件, 负责增删改查及其他功能
const mongoose = require("mongoose");
const config = require("./db.config.js");
const url = config.url;
const db = config.db;

// 数据库连接地址
const uri = url + "/" + db;
const opt = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.connect(uri, opt);

/**
 *
 * 将数据保存到数据库中的某个集合中
 * @param {mongoose.Model} model  集合对应的模型
 * @param {JSON} data  保存的数据
 * @param {Function} callback  回调函数
 */
function add(model, data, callback) {
  var o = new model(data);
  o.save(function (err) {
    callback(err);
  });
}

// 删除
/**
 *
 * 删除某个集合中符合条件的数据
 * @param {mongoose.Model} model 集合对应的模型
 * @param {JSON} filter  删除的数据
 * @param {Function} callback  回调函数
 */
function del(model, filter, callback) {
  model.deleteOne(filter, function (err) {
    callback(err);
  });
}
/**
 *
 * 修改数据
 * @param {mongoose.Model} model 集合对应的模型
 * @param {JSON} filter  条件
 * @param {JSON} data 数据
 * @param {Function} callback  回调函数
 */
function modify(model, filter, data, callback) {
  model.updateOne(filter, { $set: data }, function (err, raw) {
    callback(err, raw);
  });
}
/**
 *
 *  查询数据
 * @param {mongoose.Model} model  集合对应的模型
 * @param {JSON} [filter]   条件
 * @param {Object} [option]   选项
 * @param {Number}  [option.page] 显示的页码
 * @param {Number}  [option.size] 每页显示的条数
 * @param {Object}  [option.sort] 排序
 * @param {function} callback 回调函数
 */
function find(model, filter, option, callback) {
  if (arguments.length == 2) {
    callback = filter;
    filter = {};
    option = {
      page: 1,
      size: 5,
      sort: { _id: 1 },
    };
  }
  if (arguments.length == 3) {
    // 第三个参数肯定是回调
    callback = option;
    // 判断第二个参数是选项还是条件
    if (filter.page || filter.size || filter.sort) {
      // 第二个参数是选项
      option.page = filter.page || 1;
      option.size = filter.size || 5;
      option.sort = filter.sort || { _id: 1 };
      // 没有查询条件
      filter = {};
    } else {
      // 第二个参数是条件
      option = {
        page: 1,
        size: 5,
        sort: { _id: 1 },
      };
    }
  }
  // 4个参数的情况下
  option.page = option.page || 1;
  option.size = option.size || 5;
  option.sort = option.sort || { _id: 1 };
  // 计算查询的数据
  var limit = option.size; // 查询的条数
  var skip = (option.page - 1) * option.size; //跳过的条数
  var opt = {
    limit: limit,
    skip: skip,
    sort: option.sort,
  };
  // console.log("filter", filter);
  // console.log("option", option);
  // console.log("limit", limit);
  // console.log("skip", skip);
  // 查询数据
  // 参数一: 查询的条数,
  // 参数二:查询的属性
  // 参数三: 查询的选项
  model.find(filter, null, opt, function (err, docs) {
    callback(err, docs);
  });
}
/**
 *
 * 查询所有符合条件的数据
 * @param {mongoose.Model} model  集合对应的模型
 * @param {JSON} filter   条件
 * @param {function} callback 回调函数
 */
function findAll(model, filter, callback) {
  model.find(filter, function (err, docs) {
    callback(err, docs);
  });
}
/**
 *
 * 获取数据的总条数
 * @param {mongoose.Model} model 集合对应的模型
 * @param {function} callback  回调函数
 */
function getCount(model, callback) {
  model.countDocuments(function (err, count) {
    callback(err, count);
  });
}

module.exports = {
  add: add,
  del: del,
  modify: modify,
  find: find,
  findAll: findAll,
  getCount: getCount,
  User: require("./UserSchema.js"),
  Msg: require("./MsgSchema.js"),
};
