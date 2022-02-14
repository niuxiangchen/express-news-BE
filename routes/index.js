const express = require("express");
const handleDB = require("../db/handleDB");
const router = express.Router();
const common = require("../utils/common");
require("../utils/filter");
const { QINIU_AVATAR_URL_PRE } = require("../utils/constant");
router.get("/", (req, res) => {
  (async function () {
    // 访问首页，处理右上角是否登陆展示问题
    // 判断是否登录
    let userInfo = await common.getUser(req, res);
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
      user_info: userInfo[0]
        ? {
            nick_name: userInfo[0].nick_name,
            avatar_url: userInfo[0].avatar_url
              ? QINIU_AVATAR_URL_PRE + userInfo[0].avatar_url
              : "/news/images/worm.jpg",
          }
        : false,
      category: result2,
      newsClick: result3,
    };
    res.render("news/index", data);
  })();
});

router.get("/news_list", (req, res) => {
  /*处理首页新闻数据列表的请求
  
  1、获取参数判空
  2、查询数据库  info_news   分类id  分页查询  perPage  currentPage
  3、返回数据给前端
  */
  (async function news_list() {
    // 1、获取参数判空
    // let {page, cid, per_page} = req.query;
    let { page = 1, cid = 1, per_page = 5 } = req.query; // 没传就给默认值

    console.log(page, cid, per_page);

    // 2、查询数据库  info_news   分类id  分页查询  perPage  currentPage
    let wh =
      cid != 1
        ? `category_id=${cid} order by create_time desc`
        : `1 order by create_time desc`;
    let result3 = await handleDB(
      res,
      "info_news",
      "limit",
      "info_news数据库查询出错",
      { where: wh, number: page, count: 5 }
    );

    // ！！！！！总页数的计算
    let result4 = await handleDB(
      res,
      "info_news",
      "sql",
      "info_news数据库查询出错",
      "select count(*) from info_news where " + wh
    );
    let total = result4[0]["count(*)"]; // 记录总条数
    let totalPage = Math.ceil(total / per_page); // 总页数 = 向上取整(记录总条数/每页条数)
    console.log(totalPage);

    // 3、返回数据给前端
    // res.json({newsList:result3})
    res.json({ newsList: result3, totalPage, currentPage: parseInt(page) });
  })();
});
// 以下是测试代码
// router.get("/get_cookie", (req, res) => {
//   // 测试获取cookie
//   res.send("cookie中name的值为：" + req.cookies["name"]);
// });
// router.get("/get_session", (req, res) => {
//   // 测试获取session
//   res.send("cookie中my_session中的age的值为：" + req.session["age"]);
// });

// router.get("/get_data", (req, res) => {
//   // 测试查询数据库
//   (async function () {
//     let result = await handleDB(res, "info_category", "find", "数据库查询出错");
//     res.send(result);
//   })();
// });

module.exports = router;
