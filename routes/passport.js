const express = require("express");
const Captcha = require("../utils/captcha");
const router = express.Router();



router.get("/passport/image_code/:float", (req, res)=>{
    let captchaObj = new Captcha();
    let captcha = captchaObj.getCode();

    // captcha.text    // 图片验证码文本， 
    // captcha.data    // 图片验证码图片内容信息 

    // 图片， <img src="路径" alt=""/>
    res.setHeader('Content-Type', 'image/svg+xml'); 
    res.send(captcha.data);
})


// router.get("注册接口路径",(req, res)=>{

//     // ...
//     // 验证用户输入的图片验证码是不是生成的那个captcha.text 
//     // ...


//     if(获取用户 === captcha.text){

//     }
// })

module.exports = router