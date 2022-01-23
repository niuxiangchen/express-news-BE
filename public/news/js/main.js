$(function () {
  // 打开登录框
  $(".login_btn").click(function () {
    $(".login_form_con").show();
  });

  // 点击关闭按钮关闭登录框或者注册框
  $(".shutoff").click(function () {
    $(this).closest("form").hide();
  });

  // 隐藏错误
  $(".login_form #mobile").focus(function () {
    $("#login-mobile-err").hide();
  });
  $(".login_form #password").focus(function () {
    $("#login-password-err").hide();
  });

  $(".register_form #mobile").focus(function () {
    $("#register-mobile-err").hide();
  });
  $(".register_form #imagecode").focus(function () {
    $("#register-image-code-err").hide();
  });
  $(".register_form #smscode").focus(function () {
    $("#register-sms-code-err").hide();
  });
  $(".register_form #password").focus(function () {
    $("#register-password-err").hide();
  });

  $(".form_group").on("click", function () {
    $(this).children("input").focus();
  });

  $(".form_group input").on("focusin", function () {
    $(this)
      .siblings(".input_tip")
      .animate({ top: -5, "font-size": 12 }, "fast");
    $(this).parent().addClass("hotline");
  });

  // 打开注册框
  $(".register_btn").click(function () {
    $(".register_form_con").show();
    generateImageCode();
  });

  // 登录框和注册框切换
  $(".to_register").click(function () {
    $(".login_form_con").hide();
    $(".register_form_con").show();
    generateImageCode();
  });

  // 登录框和注册框切换
  $(".to_login").click(function () {
    $(".login_form_con").show();
    $(".register_form_con").hide();
  });

  // 根据地址栏的hash值来显示用户中心对应的菜单
  var sHash = window.location.hash;
  if (sHash != "") {
    var sId = sHash.substring(1);
    var oNow = $("." + sId);
    var iNowIndex = oNow.index();
    $(".option_list li")
      .eq(iNowIndex)
      .addClass("active")
      .siblings()
      .removeClass("active");
    oNow.show().siblings().hide();
  }

  // 用户中心菜单切换
  var $li = $(".option_list li");
  var $frame = $("#main_frame");

  $li.click(function () {
    if ($(this).index() == 5) {
      $("#main_frame").css({ height: 900 });
    } else {
      $("#main_frame").css({ height: 660 });
    }
    $(this).addClass("active").siblings().removeClass("active");
    $(this).find("a")[0].click();
  });

  // TODO 登录表单提交
  $(".login_form_con").submit(function (e) {
    e.preventDefault();
    var username = $(".login_form #mobile").val();
    var password = $(".login_form #password").val();

    if (!username) {
      $("#login-mobile-err").show();
      return;
    }

    if (!password) {
      $("#login-password-err").show();
      return;
    }

    // 发起登录请求
    // 拼接参数
    var params = {
      username: username,
      password: password,
    };

    $.ajax({
      url: "/passport/login",
      type: "post",
      data: JSON.stringify(params),
      contentType: "application/json",
      headers: { "X-CSRFToken": getCookie("csrf_token") },
      success: function (resp) {
        //判断是否登陆成功
        if (resp.errno == "0") {
          alert("登录成功");
          window.location.reload();
        } else {
          alert(resp.errmsg);
        }
      },
    });
  });

  // TODO 注册按钮点击
  $(".register_form_con").submit(function (e) {
    // 阻止默认提交操作,不让其往默认的action提交
    e.preventDefault();
    console.log("点击了注册按钮");

    // 取到用户输入的内容
    var username = $("#register_mobile").val();
    var imageCode = $("#imagecode").val();
    var password = $("#register_password").val();
    var agree = $(".register_form_con .agree_input").prop("checked");
    console.log(username, imageCode, password, agree);
    if (!username) {
      $("#register-mobile-err").show();
      return;
    }
    if (!imageCode) {
      $("#register-image-code-err").html("请填写验证码！").show();
      return;
    }
    if (!password) {
      $("#register-password-err").html("请填写密码!").show();
      return;
    }

    if (password.length < 6) {
      $("#register-password-err").html("密码长度不能少于6位");
      $("#register-password-err").show();
      return;
    }
    if (!agree) {
      alert("请勾选同意协议，谢谢！");
      return;
    }

    // 发起注册请求
    // 拼接请求参数
    var params = {
      username: username,
      image_code: imageCode,
      password: password,
      agree: agree,
    };

    $.ajax({
      url: "/passport/register",
      type: "post",
      data: JSON.stringify(params),
      contentType: "application/json",
      headers: { "X-CSRFToken": getCookie("csrf_token") },
      success: function (resp) {
        console.log("回调成功了");
        //判断是否注册成功
        if (resp.errno == "0") {
          //重新加载当前页面
          alert(resp.errmsg);
          window.location.reload();
        } else {
          alert(resp.errmsg);
        }
      },
    });
  });
});

//退出登陆
function logout() {
  $.ajax({
    url: "/passport/logout",
    type: "post",
    headers: { "X-CSRFToken": getCookie("csrf_token") },
    success: function (resp) {
      window.location.reload();
    },
  });
}

// 生成图片验证码，原理：设置图片的路径(请求路径)，浏览器向服务器请求一个验证码图片
function generateImageCode() {
  // 1.设置图片url地址
  image_url = "/passport/image_code/" + Math.random();

  // 2.将地址设置到img标签的src属性中,为image_url
  $(".get_pic_code").attr("src", image_url);
}

// 调用该函数模拟点击左侧按钮
function fnChangeMenu(n) {
  var $li = $(".option_list li");
  if (n >= 0) {
    $li.eq(n).addClass("active").siblings().removeClass("active");
    // 执行 a 标签的点击事件
    $li.eq(n).find("a")[0].click();
  }
}

// 一般页面的iframe的高度是660
// 新闻发布页面iframe的高度是900
function fnSetIframeHeight(num) {
  var $frame = $("#main_frame");
  $frame.css({ height: num });
}

function getCookie(name) {
  var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
  return r ? r[1] : undefined;
}
