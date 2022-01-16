// 入口文件
const express = require("express");
const AppConfig = require("./config");

const app = express();

// 执行配置文件
// appConfig(app);  // 以函数的方式来进行调用
let appConfig = new AppConfig(app);
// appConfig.run()

app.listen(appConfig.listenPort, () => {
  console.log(`服务器已经启动，端口为：${appConfig.listenPort}`);
});
