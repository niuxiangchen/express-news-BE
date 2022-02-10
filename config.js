const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

const bodyParser = require("body-parser");
const common = require("./utils/common");
const keys = require("./views/news/keys");

// 引入各种router对象
const indexRouter = require("./routes/index");
const passportRouter = require("./routes/passport");
const detailRouter = require("./routes/detail");
const profileRouter = require("./routes/profile");

// function appConfig(){
// }
// 以函数的方式来进行封装
// let appConfig = app =>{

//     // 指定静态资源的文件夹
//     app.use(express.static("public"))

//     // 模板的配置
//     app.engine('html', require('express-art-template'));
//     app.set('view options', {
//         debug: process.env.NODE_ENV !== 'development'
//     });
//     app.set('views', path.join(__dirname, 'views'));
//     app.set('view engine', 'html');

//     // 获取post请求参数的配置
//     app.use(bodyParser.urlencoded({ extended: false }));
//     app.use(bodyParser.json());

//     // 注册cookie 和sesison
//     app.use(cookieParser())
//     app.use(cookieSession({
//         name:"my_session",
//         keys:["$%$&^%&THGFFDGHJHGE%%$Y&%^HGFF#$G%G$FF#F$#G%H^%H^%H%^"],
//         maxAge: 1000 * 60 * 60 * 24 * 2    // 2天
//     }))

// }

// 以面向对象的方式来抽取
class AppConfig {
  // 看成创建对象的时候执行的代码
  constructor(app) {
    // constructor里面的代码是什么时候执行？？？？
    this.app = app;
    this.listenPort = 3003;

    // 指定静态资源的文件夹
    this.app.use(express.static("public"));
    // 模板的配置
    this.app.engine("html", require("express-art-template"));
    this.app.set("view options", {
      debug: process.env.NODE_ENV !== "development",
    });
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "html");
    // 获取post请求参数的配置
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    // 注册cookie 和sesison
    this.app.use(cookieParser());
    this.app.use(
      cookieSession({
        name: "my_session",
        keys: [keys.session_key],
        maxAge: 1000 * 60 * 60 * 24 * 2, // 2天
      })
    );

    // 注册路由到app下
    this.app.use(common.csrfProtect, indexRouter);
    this.app.use(common.csrfProtect, passportRouter);
    this.app.use(common.csrfProtect, detailRouter);
    this.app.use(common.csrfProtect, profileRouter);
    // 在以上路由都找不到的就来到这个页面
    this.app.use((req, res) => {
      (async function () {
        // 在获取登录用户的信息
        let userInfo = await common.getUser(req, res);
        let data = {
          user_info: userInfo[0]
            ? {
                nick_name: userInfo[0].nick_name,
                avatar_url: userInfo[0].avatar_url,
              }
            : false,
        };
        res.render("news/404", data);
      })();
    });
  }

  // constructor(app){
  //     this.app = app
  // }

  // run(){
  //     // 指定静态资源的文件夹
  //     this.app.use(express.static("public"))
  //     // 模板的配置
  //     this.app.engine('html', require('express-art-template'));
  //     this.app.set('view options', {
  //         debug: process.env.NODE_ENV !== 'development'
  //     });
  //     this.app.set('views', path.join(__dirname, 'views'));
  //     this.app.set('view engine', 'html');
  //     // 获取post请求参数的配置
  //     this.app.use(bodyParser.urlencoded({ extended: false }));
  //     this.app.use(bodyParser.json());
  //     // 注册cookie 和sesison
  //     this.app.use(cookieParser())
  //     this.app.use(cookieSession({
  //         name:"my_session",
  //         keys:["$%$&^%&THGFFDGHJHGE%%$Y&%^HGFF#$G%G$FF#F$#G%H^%H^%H%^"],
  //         maxAge: 1000 * 60 * 60 * 24 * 2    // 2天
  //     }))
  // }
}

module.exports = AppConfig;
