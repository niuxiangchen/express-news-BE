const express = require("express");
const md5 = require("md5");
const handleDB = require("../db/handleDB");
const common = require("../utils/common");
const constant = require("../utils/constant");
const upload_file = require("../utils/qn");

const multer = require("multer");
const keys = require("../views/news/keys");

const upload = multer({ dest: "public/news/upload/avatar" }); // 上传头像存放的地址
const router = express.Router();

router.get("/profile", (req, res) => {
  (async function () {
    let userInfo = await common.getUserInfo(req, res);

    let data = {
      user_info: {
        nick_name: userInfo[0].nick_name,
        avatar_url: userInfo[0].avatar_url
          ? constant.QINIU_AVATAR_URL_PRE + userInfo[0].avatar_url
          : "/news/images/worm.jpg",
      },
    };
    res.render("news/user", data);
  })();
});

// 展示基本信息页面，以及处理基本信息的POST提交
router.all("/user/base_info", (req, res) => {
  (async function () {
    //获取用户登录信息，获取不到就重定向到首页
    let userInfo = await common.getUserInfo(req, res);

    if (req.method === "GET") {
      let data = {
        nick_name: userInfo[0].nick_name,
        signature: userInfo[0].signature,
        gender: userInfo[0].gender ? userInfo[0].gender : "MAN",
      };

      res.render("news/user_base_info", data);
    } else if (req.method === "POST") {
      /*

                1、获取参数判空
                2、修改数据库中的用户数据
                3、返回操作成功
            */

      //    1、获取参数判空
      let { signature, nick_name, gender } = req.body;
      if (!signature || !nick_name || !gender) {
        res.send({ errmsg: "参数错误" });
        return;
      }
      //    2、修改数据库中的用户数据
      await handleDB(
        res,
        "info_user",
        "update",
        "数据库更新数据出错",
        `id=${userInfo[0].id}`,
        {
          signature,
          nick_name,
          gender,
        }
      );
      //    3、返回操作成功
      res.send({ errno: "0", errmsg: "操作成功" });
    }
  })();
});

// 展示修改密码页面(GET)以及保存密码修改的操作(POST提交)
router.all("/user/pass_info", (req, res) => {
  (async function () {
    //获取用户登录信息，获取不到就重定向到首页
    let userInfo = await common.getUserInfo(req, res);

    if (req.method === "GET") {
      res.render("news/user_pass_info");
    } else if (req.method === "POST") {
      /*
                1、获取参数(旧密码，新密码)
                2、校验两次新密码是否一致
                3、校验旧密码是否正确
                4、修改用户表里面的password_hash
                5、返回修改成功
            */
      //    1、获取参数(旧密码，新密码)
      let { old_password, new_password, new_password2 } = req.body;
      if (!old_password || !new_password || !new_password2) {
        res.send({ errmsg: "参数错误" });
        return;
      }
      console.log(old_password, new_password, new_password2);

      //    2、校验两次新密码是否一致
      if (new_password !== new_password2) {
        res.send({ errmsg: "两次密码不一致" });
        return;
      }
      //    3、校验旧密码是否正确
      if (
        md5(md5(old_password) + keys.password_salt) !==
        userInfo[0].password_hash
      ) {
        res.send({ errmsg: "旧密码不正确，修改失败" });
        return;
      }
      //    4、修改用户表里面的password_hash
      await handleDB(
        res,
        "info_user",
        "update",
        "数据库更新数据出错",
        `id=${userInfo[0].id}`,
        {
          password_hash: md5(md5(new_password) + keys.password_salt),
        }
      );
      //    5、返回修改成功
      res.send({ errno: "0", errmsg: "操作成功" });
    }
  })();
});

// 展示修改头像页面
router.get("/user/pic_info", (req, res) => {
  (async function () {
    let userInfo = await common.getUserInfo(req, res);
    res.render("news/user_pic_info");
  })();
});
// 提交头像图片的接口
router.post("/user/pic_info", upload.single("avatar"), (req, res) => {
  (async function () {
    let userInfo = await common.getUserInfo(req, res);
    /*

        1、接收上传图片的对象req.file
        2、上传图片到七牛云服务器
        3、把七牛云返回的对象的key属性保存到数据库
        4、返回上传成功

        */
    //    1、接收上传图片的对象req.file
    let file = req.file;
    // console.log(req.file);  //获取本次上传图片的一些信息
    /*
        req.file为如下对象：
        { fieldname: 'avatar',
            originalname: '02.png',   // 原文件名称
            encoding: '7bit',
            mimetype: 'image/png',
            destination: 'public/news/upload/avatar',
            filename: 'd747f74bb4c4e6aa9e50be2c6ca0c147',    // 现文件名称
            path:
            'public\\news\\upload\\avatar\\d747f74bb4c4e6aa9e50be2c6ca0c147',
            size: 103184 }


        */
    //    2、上传图片到七牛云服务器
    // upload_file(上传后的名字，上传的图片路径)   //上传的图片相对路径, 从项目文件夹出发
    try {
      var retObj = await upload_file(
        file.originalname,
        `${file.destination}/${file.filename}`
      );
      console.log(retObj);
    } catch (error) {
      console.log(error);
      res.send({ errmsg: "上传七牛云失败" });
      return;
    }

    /*
         retObj为：
        { hash: 'FoFxbAYRxF8N_EL6nf40nva4_AQm',
        key: 'image/avatar/02.png' }

        */
    //    3、把七牛云返回的对象的key属性保存到数据库
    await handleDB(
      res,
      "info_user",
      "update",
      "数据库修改数据失败",
      `id=${userInfo[0].id}`,
      {
        avatar_url: file.originalname,
      }
    );

    // 4、返回上传成功
    let data = {
      avatar_url: constant.QINIU_AVATAR_URL_PRE + file.originalname,
    };
    res.send({ errno: "0", errmsg: "上传成功", data });
  })();
});

// 展示收藏的新闻的页面
router.get("/user/collections", (req, res) => {
  (async function () {
    let userInfo = await common.getUserInfo(req, res);

    let { p = 1 } = req.query;

    let currentPage = p;
    //总页数 = 总条数/每页多少条   向上取整
    // 总条数  counts   登录用户收藏了多少条新闻，查收藏表 info_user_collection
    let counts = await handleDB(
      res,
      "info_user_collection",
      "sql",
      "数据库查询出错",
      `select count(*) from info_user_collection where user_id=${userInfo[0].id}`
    ); //  [{"count(*)": 50}]

    // 最终要查询的表示info_news表(标题和创建时间字段),   要查询的是登录的用户收藏过的新闻
    //  1、先查询到登录用户收藏过的新闻的id(分页查询出来)  limit (第几页的数据-1)*每页多少条,每页多少条
    let collectionNewsIdList = await handleDB(
      res,
      "info_user_collection",
      "find",
      "数据库查询错误2",
      `user_id=${userInfo[0].id} limit ${(currentPage - 1) * 10},10`
    );
    console.log(collectionNewsIdList); // id数组

    let collectionNewsList = [];
    // 遍历这个id数组，拿着里面每一个元素的news_id属性去查询info_news表
    // 把查询的每一个结果push到collectionNewsList
    for (var i = 0; i < collectionNewsIdList.length; i++) {
      // collectionNewsIdList[i] 表示id数组的每一个元素   collectionNewsIdList[i].news_id
      let ret = await handleDB(
        res,
        "info_news",
        "sql",
        "数据库查询出错3",
        `select title,create_time from info_news where id=${collectionNewsIdList[i].news_id}`
      ); // [{title:"新闻标题", create_time:"xxxxxxx"}]
      collectionNewsList.push(ret[0]);
    }

    console.log(collectionNewsList);

    // console.log(counts[0]["count(*)"]);

    let totalPage = Math.ceil(counts[0]["count(*)"] / 10);

    console.log(totalPage);

    let data = {
      currentPage,
      totalPage,
      collectionNewsList,
    };
    res.render("news/user_collection", data);
  })();
});

module.exports = router;
