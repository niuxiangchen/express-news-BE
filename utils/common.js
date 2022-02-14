// 公共的工具函数（哪一个接口要用都可以直接用）
const handleDB = require("../db/handleDB");
function getRandomString(n) {
  let str = "";
  while (str.length < n) {
    str += Math.random().toString(36).substring(2);
  }
  return str.substring(str.length - n);
}

function csrfProtect(req, res, next) {
  let method = req.method;
  if (method == "GET") {
    let csrf_token = getRandomString(48);
    res.cookie("csrf_token", csrf_token);
    next(); //执行跳转到下一个函数执行，即app.use(beforeReq,router)中的下一个
  } else if (method == "POST") {
    // 判断响应头中的x-csrftoken值，和cookies中的csrf_token进行对比
    console.log(req.headers["x-csrftoken"]);
    console.log(req.cookies["csrf_token"]);
    if (req.headers["x-csrftoken"] === req.cookies["csrf_token"]) {
      console.log("csrf验证通过");
      next();
    } else {
      res.send({ errmsg: "csrf验证不通过" });
      return;
    }
  }
}

//获取登录用户的信息，但是可能获取不上，因为用户可能没有登录
async function getUser(req, res) {
  // 判断是否登录
  // 测试设置cookie和session
  let user_id = req.session["user_id"];
  let result = [];
  if (user_id) {
    //如果已经获得到user_id,要确认这个user_id是有效的
    //  result是一个数组
    result = await handleDB(
      res,
      "info_user",
      "find",
      "查询数据库出错",
      `id=${user_id}`
    );
    // result[0]就是登陆的那个用户的数据对象
  }
  return result;
}

//获取登录用户的信息，一定可以获取到
async function getUserInfo(req, res) {
  let userInfo = await getUser(req, res);
  if (!userInfo[0]) {
    //  没有登录就跳转到首页去
    res.redirect("/");
  }
  return userInfo;
}

module.exports = {
  csrfProtect,
  getUser,
  getUserInfo,
};
