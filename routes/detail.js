const express = require("express");
const router = express.Router();

router.get("/news_detail/:news_id", (req, res) => {
  res.render("news/detail");
});

module.exports = router;
