const express = require("express");
const handleDB = require("../db/handleDB");
const router = express.Router();

router.get("/", (req,res)=>{
    // 测试设置cookie和session
    res.cookie("name", "nodejs");
    req.session["age"] = 11
    res.render("news/index");
})

router.get("/get_cookie", (req,res)=>{
    // 测试获取cookie
    res.send("cookie中name的值为："+req.cookies["name"]);
})
router.get("/get_session", (req,res)=>{
    // 测试获取session
    res.send("cookie中my_session中的age的值为："+req.session["age"]);
})


router.get("/get_data", (req,res)=>{
    // 测试查询数据库
    (async function(){
        let result = await handleDB(res, "info_category", "find", "数据库查询出错");
        res.send(result);    
    })();
})


module.exports = router