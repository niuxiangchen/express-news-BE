# node-js-news
node和原生js项目

- 基于express 框架，以 前后端不分离 的形式实现具体业务逻辑
- 数据存储采用mysql，使用orm
- 封装自己的操作数据可的工具函数handleDB(兼容其他node框架)
- 用户图片数据使用对象存储（七牛云）
- 采用session实现保持用户登录状态机制
- 实现对CSRF请求伪造进行防护功能
- （提供jwt的获取接口）
- 采用art-template 模板引擎技术
- 界面局部刷新使用 ajax 请求接口
- 实现模块：注册、登录、首页新闻数据展示模块，滑动到底部加载更多、点击排行、基页模板的抽取与模板继承、详情页数据展示、用户收藏新闻、用户评论模块、回复评论模块、新闻作者数据展示、用户关注模块、个人中心模块(修改基本资料、密码、用户头像)等。

项目截图：
![](https://github.com/niuxiangchen/node-js-news/blob/master/screenshot/node%E6%96%B0%E9%97%BB1.png)
![](https://github.com/niuxiangchen/node-js-news/blob/master/screenshot/node%E6%96%B0%E9%97%BB2.png)
![](https://github.com/niuxiangchen/node-js-news/blob/master/screenshot/node%E6%96%B0%E9%97%BB3.png)
![](https://github.com/niuxiangchen/node-js-news/blob/master/screenshot/node%E6%96%B0%E9%97%BB4.png)
