const express = require("express");
const handleDB = require("../db/handleDB");
const router = express.Router();

router.get("/", (req, res) => {
  (async function () {
    // 访问首页，处理右上角是否登陆展示问题
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
    // ------------------------------------------------
    // 展示首页头部分类信息
    // 查询数据库，查看分类信息？ 查表info_category
    let result2 = await handleDB(
      res,
      "info_category",
      "find",
      "查询数据库出错",
      ["name"]
    );
    // [{name:最新}，{name:xxx},...]

    // 展示右侧点击排行的效果
    let result3 = await handleDB(
      res,
      "info_news",
      "sql",
      "查询数据库出错",
      "select * from info_news order by clicks desc limit 6"
    );
    // 可以把用户信息传递到模板中去
    let data = {
      user_info: result[0]
        ? {
            nick_name: result[0].nick_name,
            avatar_url: result[0].avatar_url,
          }
        : false,
      category: result2,
      newsClick: result3,
    };
    res.render("news/index", data);
  })();
});

router.get("/get_cookie", (req, res) => {
  // 测试获取cookie
  res.send("cookie中name的值为：" + req.cookies["name"]);
});
router.get("/get_session", (req, res) => {
  // 测试获取session
  res.send("cookie中my_session中的age的值为：" + req.session["age"]);
});

router.get("/get_data", (req, res) => {
  // 测试查询数据库
  (async function () {
    let result = await handleDB(res, "info_category", "find", "数据库查询出错");
    res.send(result);
  })();
});

module.exports = router;
