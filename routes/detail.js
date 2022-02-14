const express = require("express");
const handleDB = require("../db/handleDB");
const common = require("../utils/common");
const constant = require("../utils/constant");
const router = express.Router();

//展示详情页及其数据内容
router.get("/news_detail/:news_id", (req, res) => {
  (async function () {
    // 在获取登录用户的信息
    let userInfo = await common.getUser(req, res); // [{...}]     []
    // 假如没登录不能操作，可以这样写：
    // if(!userInfo[0]){
    //     res.send("未登录不能操作")
    //     return
    // }

    // 右侧点击排行的查询
    let result3 = await handleDB(
      res,
      "info_news",
      "find",
      "查询数据库出错",
      "1 order by clicks desc limit 6"
    );

    let { news_id } = req.params;
    // 左侧新闻内容的查询
    let newsResult = await handleDB(
      res,
      "info_news",
      "find",
      "查询数据库出错",
      `id=${news_id}`
    );
    // newsResult   [{ }]   []
    // console.log(newsResult[0]);  //[{ }]

    // 确保数据有id为news_id这篇新闻，才可以继续往下操作
    if (!newsResult[0]) {
      // 如果没有这篇新闻，就返回404页面
      common.abort404(req, res);
      return;
    }

    // 点击数就+1
    newsResult[0].clicks += 1;
    await handleDB(
      res,
      "info_news",
      "update",
      "数据库更新出错",
      `id=${news_id}`,
      { clicks: newsResult[0].clicks }
    );

    // 登录的用户是不是已经收藏了这篇新闻， 传一个布尔值给模板
    let isCollected = false;
    // 什么情况改成true?:
    // 已经登录的用户，并且收藏的这篇新闻(查询数据库，查询哪一个表info_user_collection)
    if (userInfo[0]) {
      // 如果已经登录
      // 查询数据库
      let collectionResult = await handleDB(
        res,
        "info_user_collection",
        "find",
        "查询数据库出错",
        `user_id=${userInfo[0].id} and news_id=${news_id}`
      ); // [{}]    []
      if (collectionResult[0]) {
        //收藏了这篇新闻
        isCollected = true;
      }
    }

    // 查询和这篇新闻相关的评论，[{}, {}, {} ...], 以创建时间降序排序
    let commentResult = await handleDB(
      res,
      "info_comment",
      "find",
      "查询数据库出错",
      `news_id=${news_id} order by create_time desc`
    );

    // 给commentResult数组中每一个元素(每一条评论)进行处理，添加评论者的信息
    for (let i = 0; i < commentResult.length; i++) {
      // 查询数据库, 查询info_user 表，根据 commentResult[i]中的user_id属性来查询
      let commenterResult = await handleDB(
        res,
        "info_user",
        "find",
        "查询数据库出错",
        `id=${commentResult[i].user_id}`
      );

      commentResult[i].commenter = {
        nick_name: commenterResult[0].nick_name,
        avatar_url: commenterResult[0].avatar_url
          ? constant.QINIU_AVATAR_URL_PRE + commenterResult[0].avatar_url
          : "/news/images/worm.jpg",
      };

      // 如果commentResult[i]有parent_id值，就添加parent这个属性
      if (commentResult[i].parent_id) {
        //如果有父评论， 查询父评论内容content(info_comment)，和父评论者(info_user)的昵称nick_name
        var parentComment = await handleDB(
          res,
          "info_comment",
          "find",
          "数据库查询失败",
          `id=${commentResult[i].parent_id}`
        );
        var parentUserInfo = await handleDB(
          res,
          "info_user",
          "find",
          "数据库查询失败",
          `id=${parentComment[0].user_id}` // parentComment[0].user_id上面这个父评论者的id
        );

        commentResult[i].parent = {
          // 传给前端ajax的回调中的拼接结果
          user: {
            nick_name: parentUserInfo[0].nick_name,
          },
          content: parentComment[0].content,
        };
      }
    }
    // console.log(commentResult);

    // 把登录用户的点赞过的评论全部查出来， 组织成：[id1, id2, id3] 传给前端模板
    let user_like_comments_ids = [];
    if (userInfo[0]) {
      //查询登录用户的点赞过的评论对象
      //info_comment_like可以告诉我们登录的用户点赞过哪些评论
      let user_like_commentsResult = await handleDB(
        res,
        "info_comment_like",
        "find",
        "数据库查询出错",
        `user_id=${userInfo[0].id}`
      ); // 查询条件？ user_id字段=登录用户的id

      // user_like_commentsResult这个数组是用户点赞过的每一条评论对象的数组
      // 遍历user_like_commentsResult每一个元素，取它的id， 插入到user_like_comments_ids数组中
      user_like_commentsResult.forEach((el) => {
        user_like_comments_ids.push(el.comment_id);
      });
    }

    // 查询新闻作者的一些信息，传到模板中去
    let authorInfo = await handleDB(
      res,
      "info_user",
      "find",
      "数据库查询出错",
      `id=${newsResult[0].user_id}`
    );
    //作者发布的新闻数量
    // select count(*) from info_news where user_id=${authorInfo[0].id}
    let authorNewsCount = await handleDB(
      res,
      "info_news",
      "sql",
      "数据库查询出错",
      `select count(*) from info_news where user_id=${authorInfo[0].id}`
    ); // [{ "count(*)": 900 }]

    // 查询作者的粉丝数量， 查 info_suer_fans表
    // select count(*)  from info_user_fans where followed_id = 作者id
    let authorFansCount = await handleDB(
      res,
      "info_user_fans",
      "sql",
      "数据库查询出错",
      `select count(*)  from info_user_fans where followed_id=${authorInfo[0].id}`
    );

    // 登录的用户是不是已经关注了这个作者， 传一个布尔值给模板
    let isFollow = false;
    // 什么情况改成true?:
    // 已经登录的用户，并且关注了这个作者(查询数据库，查询哪一个表info_user_fans)
    if (userInfo[0]) {
      // 如果已经登录
      // 查询数据库
      let followResult = await handleDB(
        res,
        "info_user_fans",
        "find",
        "查询数据库出错",
        `follower_id=${userInfo[0].id} and followed_id=${authorInfo[0].id}`
      ); // [{}]    []
      if (followResult[0]) {
        //收藏了这篇新闻
        isFollow = true;
      }
    }

    // 如果登录用户和作者是同个用户，不去展示关注按钮和取消关注按钮
    let isShowFollowBtn = userInfo[0]
      ? userInfo[0].id == authorInfo[0].id
        ? false
        : true
      : true;

    //作者的头相设置
    authorInfo[0].avatar_url = authorInfo[0].avatar_url
      ? constant.QINIU_AVATAR_URL_PRE + authorInfo[0].avatar_url
      : "/news/images/worm.jpg";

    // 传到模板中去的数据
    let data = {
      user_info: userInfo[0]
        ? {
            nick_name: userInfo[0].nick_name,
            avatar_url: userInfo[0].avatar_url
              ? constant.QINIU_AVATAR_URL_PRE + userInfo[0].avatar_url
              : "/news/images/worm.jpg",
          }
        : false,
      newsClick: result3,
      newsData: newsResult[0],
      isCollected,
      commentList: commentResult,
      user_like_comments_ids,
      authorInfo: authorInfo[0],
      authorNewsCount: authorNewsCount[0]["count(*)"],
      authorFansCount: authorFansCount[0]["count(*)"],
      isFollow,
      isShowFollowBtn,
    };

    res.render("news/detail", data);
  })();
});

// 处理收藏和取消收藏的接口
router.post("/news_detail/news_collect", (req, res) => {
  (async function () {
    /*
    点击收藏功能， 点击之后，要往数据库里面info_user_collection表添加一条记录
    点击取消收藏功能，点击之后，要往数据库里面info_user_collection表删除一条记录

    传参：   哪一个用户  user_id 收藏了哪一篇新闻  news_id
    user_id是登录用户的id可以直接获取，

    news_id 需要传递
    因为这个接口做的是收藏和取消收藏，所以还需要一个action表示收藏操作，还是取消收藏操作


    业务流程：
        1、获取登录用户信息，没有获取到，就return
        2、获取参数，判空
        3、查询数据库 判断新闻是否存在， 不存在就return(为了确保news_id是有的)
        4、根据action的值 收藏 或者  取消收藏的功能
        5、返回操作成功
    */
    //    1、获取登录用户信息，没有获取到，就return
    let userInfo = await common.getUser(req, res); // [{...}]     []

    if (!userInfo[0]) {
      //如果没有登录， 就return
      res.send({ errno: "4101", errmsg: "用户未登录" });
      return;
    }
    //    2、获取参数，判空
    let { news_id, action } = req.body;
    if (!news_id || !action) {
      res.send({ errmsg: "参数错误1" });
      return;
    }
    //    3、查询数据库 判断新闻是否存在， 不存在就return(为了确保news_id是有的)
    let newsResult = await handleDB(
      res,
      "info_news",
      "find",
      "数据库查询出错",
      `id=${news_id}`
    );
    if (!newsResult[0]) {
      res.send({ errmsg: "参数错误2" });
      return;
    }
    //    4、根据action的值 收藏 或者  取消收藏的功能
    if (action === "collect") {
      //执行收藏操作
      await handleDB(res, "info_user_collection", "insert", "数据库添加失败", {
        user_id: userInfo[0].id,
        news_id,
      });
    } else {
      //执行取消收藏操作, 取消收藏相当于删除这条记录
      await handleDB(
        res,
        "info_user_collection",
        "delete",
        "数据库添加失败",
        `user_id=${userInfo[0].id} and news_id=${news_id}`
      );
    }
    //    5、返回操作成功
    res.send({ errno: "0", errmsg: "操作成功" });
  })();
});

// 处理评论和回复的接口
router.post("/news_detail/news_comment", (req, res) => {
  (async function () {
    /*
    需要传哪些参数？
    一种是针对新闻的评论       评论的内容     新闻的id
    一种回复别人的评论      回复的内容    parent_id（针对的那条评论就是父评论）

    业务流程：
        1、获取登录用户的信息，获取不到就return
        2、获取参数，判空
        3、查询新闻，看看这条新闻是否存在
        4、往数据库info_comment表中插入数据 (如果有传parent_id，这个属性也要记得插入)
        5、返回成功的响应 (传数据给前端到回调函数中，去拼接评论的信息)
    */

    //1、获取登录用户的信息，获取不到就return
    let userInfo = await common.getUser(req, res); // [{...}]     []

    if (!userInfo[0]) {
      //如果没有登录， 就return
      res.send({ errno: "4101", errmsg: "用户未登录" });
      return;
    }
    // 2、获取参数，判空
    let { news_id, comment, parent_id = null } = req.body;
    if (!news_id || !comment) {
      res.send({ errmsg: "参数错误1" });
      return;
    }
    // 3、查询新闻，看看这条新闻是否存在
    let newsResult = await handleDB(
      res,
      "info_news",
      "find",
      "数据库查询出错",
      `id=${news_id}`
    );
    if (!newsResult[0]) {
      res.send({ errmsg: "参数错误2" });
      return;
    }
    // 4、往数据库info_comment表中插入数据 (如果有传parent_id，这个属性也要记得插入)
    let commentObj = {
      user_id: userInfo[0].id,
      news_id,
      content: comment,
      create_time: new Date().toLocaleDateString(),
    };
    if (parent_id) {
      //如果传了parent_id,就设置这个属性
      commentObj.parent_id = parent_id;

      //如果有父评论， 查询父评论内容content(info_comment)，和父评论者(info_user)的昵称nick_name
      var parentComment = await handleDB(
        res,
        "info_comment",
        "find",
        "数据库查询失败",
        `id=${parent_id}`
      );
      var parentUserInfo = await handleDB(
        res,
        "info_user",
        "find",
        "数据库查询失败",
        `id=${parentComment[0].user_id}` // parentComment[0].user_id上面这个父评论者的id
      );
    }
    let insertResult = await handleDB(
      res,
      "info_comment",
      "insert",
      "数据库插入失败",
      commentObj
    );

    // 5、返回成功的响应 (传数据给前端到回调函数中，去拼接评论的信息)
    let data = {
      user: {
        avatar_url: userInfo[0].avatar_url
          ? constant.QINIU_AVATAR_URL_PRE + userInfo[0].avatar_url
          : "/news/images/worm.jpg",
        nick_name: userInfo[0].nick_name,
      },
      content: comment,
      create_time: commentObj.create_time,
      news_id,
      id: insertResult.insertId, // 新增加的这条评论的id值
      parent: parent_id
        ? {
            // 传给前端ajax的回调中的拼接结果
            user: {
              nick_name: parentUserInfo[0].nick_name,
            },
            content: parentComment[0].content,
          }
        : null,
    };

    res.send({ errno: "0", errmsg: "操作成功", data });
  })();
});

// 处理点赞和取消点赞
router.post("/news_detail/comment_like", (req, res) => {
  (async function () {
    /*
    参数：
    哪一个用户(登录用户， 可以直接获取登录用户id) 点赞了哪一条评论 comment_id
    点赞和取消点赞 都是这个接口处理，所以还要有一个参数， action


    业务流程：
        1、获取登录用户的信息
        2、获取参数，判空     comment_id  action
        3、查询数据库，看看这条评论是否存在，不存在就return
        4、根据action的值是add还是remove来确定要执行点赞还是取消点赞
            执行点赞：把哪一个用户点赞了哪条评论的信息，作为一条记录保存到数据库， info_comment_like表
            取消点赞：在info_comment_like表中删除这条记录
            (info_comment表中的like_count+1 或者-1)
        5、返回操作成功
    */

    //    1、获取登录用户的信息
    let userInfo = await common.getUser(req, res); // [{...}]     []

    if (!userInfo[0]) {
      //如果没有登录， 就return
      res.send({ errno: "4101", errmsg: "用户未登录" });
      return;
    }
    //    2、获取参数，判空     comment_id  action
    let { comment_id, action } = req.body;
    if (!comment_id || !action) {
      res.send({ errmsg: "参数错误1" });
      return;
    }
    //    3、查询数据库，看看这条评论是否存在，不存在就return
    let commentResult = await handleDB(
      res,
      "info_comment",
      "find",
      "数据库查询出错",
      `id=${comment_id}`
    );
    if (!commentResult[0]) {
      res.send({ errmsg: "参数错误2" });
      return;
    }

    // 4、根据action的值是add还是remove来确定要执行点赞还是取消点赞
    // (info_comment表中的like_count+1 或者-1)
    if (action === "add") {
      // 执行点赞：把哪一个用户点赞了哪条评论的信息，作为一条记录保存到数据库， info_comment_like表
      await handleDB(res, "info_comment_like", "insert", "数据库添加出错", {
        comment_id,
        user_id: userInfo[0].id, // 点赞的用户就是这个登录用户
      });

      //+1
      var like_count = commentResult[0].like_count
        ? commentResult[0].like_count + 1
        : 1;
    } else {
      //取消点赞：在info_comment_like表中删除这条记录
      await handleDB(
        res,
        "info_comment_like",
        "delete",
        "数据库删除出错",
        `comment_id=${comment_id} and user_id=${userInfo[0].id}`
      );
      //-1
      var like_count = commentResult[0].like_count
        ? commentResult[0].like_count - 1
        : 0;
    }
    //更新数据库info_comment里面的like_count字段
    await handleDB(
      res,
      "info_comment",
      "update",
      "数据库更新失败",
      `id=${comment_id}`,
      { like_count }
    );

    // 5、返回操作成功
    res.send({ errno: "0", errmsg: "操作成功" });
  })();
});

// 处理关注和取消关注的接口
router.post("/news_detail/followed_user", (req, res) => {
  (async function () {
    /*

    业务流程：
        1、获取登录用户信息，没有获取到，就return
        2、获取参数，判空
        3、查询数据库 判断被关注用户是否存在， 不存在就return(为了确保user_id是有的)
        4、根据action的值 关注 或者  取消关注的功能
        5、返回操作成功
    */
    //    1、获取登录用户信息，没有获取到，就return
    let userInfo = await common.getUser(req, res); // [{...}]     []

    if (!userInfo[0]) {
      //如果没有登录， 就return
      res.send({ errno: "4101", errmsg: "用户未登录" });
      return;
    }
    //    2、获取参数，判空
    let { user_id, action } = req.body;
    if (!user_id || !action) {
      res.send({ errmsg: "参数错误1" });
      return;
    }
    //    3、查询数据库 判断被关注用户是否存在， 不存在就return(为了确保user_id是有的)
    let userResult = await handleDB(
      res,
      "info_user",
      "find",
      "数据库查询出错",
      `id=${user_id}`
    );
    if (!userResult[0]) {
      res.send({ errmsg: "参数错误2" });
      return;
    }
    //    4、根据action的值 关注 或者  取消关注的功能
    if (action === "follow") {
      //执行关注操作
      await handleDB(res, "info_user_fans", "insert", "数据库添加失败", {
        follower_id: userInfo[0].id,
        followed_id: user_id,
      });
    } else {
      //执行取消关注操作, 取消关注相当于删除这条记录
      await handleDB(
        res,
        "info_user_fans",
        "delete",
        "数据库添加失败",
        `follower_id=${userInfo[0].id} and followed_id=${user_id}`
      );
    }
    //    5、返回操作成功
    res.send({ errno: "0", errmsg: "操作成功" });
  })();
});
module.exports = router;
