const express = require("express");
const handleDB = require("../db/handleDB");
const router = express.Router();
const common = require("../utils/common");
const dateFormat = require("../utils/filter");

router.get("/news_detail/:news_id", (req, res) => {
  (async function () {
    // 获取登录用户的信息
    let userInfo = await common.getUser(req, res);
    // 展示右侧点击排行的效果
    let result3 = await handleDB(
      res,
      "info_news",
      "sql",
      "查询数据库出错",
      "select * from info_news order by clicks desc limit 6"
    );
    let { news_id } = req.params;
    // 左侧新闻内容的的查询
    let newsResult = await handleDB(
      res,
      "info_news",
      "find",
      "查询数据库出错",
      `id=${news_id}`
    );
    // newsResult [{  }]
    // 可以把用户信息传递到模板中去
    if (!newsResult[0]) {
      let data = {
        user_info: userInfo[0]
          ? {
              nick_name: userInfo[0].nick_name,
              avatar_url: userInfo[0].avatar_url,
            }
          : false,
      };
      res.render("news/404", data);
      return;
    }
    // 确保数据有id为news_id这篇新闻，才可以继续往下操作
    // 点击数+1
    newsResult[0].clicks += 1;
    await handleDB(
      res,
      "info_news",
      "update",
      "修改数据库出错",
      `id=${news_id}`,
      { clicks: newsResult[0].clicks }
    );
    let data = {
      user_info: userInfo[0]
        ? {
            nick_name: userInfo[0].nick_name,
            avatar_url: userInfo[0].avatar_url,
          }
        : false,
      newsClick: result3,
      newsData: newsResult[0],
    };
    res.render("news/detail", data);
  })();
});

module.exports = router;
