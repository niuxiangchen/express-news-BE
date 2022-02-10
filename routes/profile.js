const express = require("express");
const handleDB = require("../db/handleDB");
const common = require("../utils/common");
const router = express.Router();

router.get("/profile", (req, res) => {
  (async function () {
    let userResult = await common.getUser(req, res);
    if (!userResult[0]) {
      //  没有登录就跳转到首页去
      res.redirect("/");
    }
  })();
  res.render("news/user");
});

module.exports = router;
