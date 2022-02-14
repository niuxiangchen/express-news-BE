const express = require("express");
const handleDB = require("../db/handleDB");
const Captcha = require("../utils/captcha");
const router = express.Router();
const moment = require("moment");
const md5 = require("md5");
const keys = require("../views/news/keys");
const jsw = require("jsonwebtoken");
router.get("/passport/image_code/:float", (req, res) => {
  let captchaObj = new Captcha();
  let captcha = captchaObj.getCode();

  // captcha.text    // 图片验证码文本，
  // captcha.data    // 图片验证码图片内容信息

  // 保存图片验证码文本到session中
  req.session["ImageCode"] = captcha.text;
  console.log(captcha.text);
  // 图片， <img src="路径" alt=""/>
  res.setHeader("Content-Type", "image/svg+xml");
  res.send(captcha.data);
});

router.post("/passport/register", (req, res) => {
  (async function () {
    console.log("/passport/register");
    //分析完成注册功能需要做哪些事情（后端实现接口要尽可能严谨）
    // 1.获取post参数，判空
    let { username, image_code, password, agree } = req.body;
    if (!username || !image_code || !password || !agree) {
      res.send({ errmsg: "缺少必传参数" });
      return;
    }
    // 2.验证用户输入验证码是否正确，不正确就return
    if (image_code.toLowerCase() !== req.session["ImageCode"].toLowerCase()) {
      res.send({ errmsg: "验证码填写错误" });
      return;
    }
    // 3.查询数据库，看看用户名是不是被注册了
    let result = await handleDB(
      res,
      "info_user",
      "find",
      "数据库查询出错",
      `username="${username}"`
    );
    console.log("result为：", result);
    // 有这个用户是一个数组[{key:value}]
    // 没有的话result是一个空数组
    // 4.如果已经存在，返回用户名已经被注册，并return
    if (result[0]) {
      res.send({ errmsg: "用户名已经被注册" });
      return;
    }
    // 5.不存在，就在数据库中新增加一条记录
    let result2 = await handleDB(
      res,
      "info_user",
      "insert",
      "数据库插入数据出错",
      {
        username: username,
        password_hash: md5(md5(password) + keys.password_salt),
        nick_name: username,
        last_login: moment().format("YYYY-MM-DD hh:mm:ss"),
        // moment(new Date().toLocaleString()).format(
        //   "YYYY-MM-DD HH:mm:ss"
        // ),
      }
    );
    // 6.保持用户的登录状态
    req.session["user_id"] = result2.insertId;
    // 7.返回注册成功给前端
    res.send({ errno: "0", errmsg: "注册成功" });
  })();
});

router.post("/passport/login", (req, res) => {
  (async function () {
    // 1.获取post请求参数，判空
    let { username, password } = req.body;
    if (!username || !password) {
      res.json({ errmsg: "缺少必传参数" });
      return;
    }
    // 2.查询数据库，验证用户名是不是已经注册了
    let result = await handleDB(
      res,
      "info_user",
      "find",
      "数据库查询出错",
      `username="${username}"`
    );
    // 3.如果没有注册，返回用户名未注册 return
    if (!result[0]) {
      res.send({ errmsg: "用户名未注册，登陆失败" });
      return;
    }
    // 4.校验密码是不是正确？ 如果不正确 return
    if (md5(md5(password) + keys.password_salt) !== result[0].password_hash) {
      res.send({ errmsg: "用户名或者密码不正确，登陆失败" });
      return;
    }
    // 5.保持用户登录状态
    req.session["user_id"] = result[0].id;
    // 设置last_login 最后一次登陆时间
    // 本质是在修改字段
    await handleDB(
      res,
      "info_user",
      "update",
      "数据库修改出错",
      `id=${result[0].id}`,
      {
        last_login: moment().format("YYYY-MM-DD hh:mm:ss"),
        // moment(new Date().toLocaleString()).format(
        //   "YYYY-MM-DD hh:mm:ss"
        // ),
      }
    );
    // 6.返回登录成功给前端
    res.send({ errno: "0", errmsg: "登陆成功" });
  })();
});
router.post("/passport/logout", (req, res) => {
  // 退出登录的操作
  // 退出登录实际上是删除session中的user_id
  delete req.session["user_id"];
  res.send({ errmsg: "退出登录成功" });
});
// 生成jwttoken 与项目本身无关
router.get("/passport/token", (req, res) => {
  const token = jwt.sign({ id: 1, username: "zhangsan" }, keys.jwt_salt, {
    expiresIn: 60 * 60 * 2,
  });
  res.send({
    errmsg: "success!",
    errno: "0",
    reason: "登录请求",
    result: {
      token,
    },
  });
});
module.exports = router;
