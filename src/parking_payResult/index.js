import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import cookie from '../_commons/js/js.cookie.js';
import { getDomain } from '../_commons/js/business/domain';
import wechat from './assets/images/wechat.png';
//import {pullToFresh} from '../_commons/js/pullToFresh.js';
import {iScroll} from '../_commons/js/iScroll.js';
/**
 * Sample
 */
var carLicense = '';
carLicense = getQueryString('carLicense');
var firstLogin = getUrlParam('firstLogin'); //是否第一次登录
var token = cookie.get('token');
var postData = {};
var clickN = true;
var plateSource = getUrlParam('plateSource');
var wechatUrl = cookie.get('payUrl');
var urlPayResult= getDomain('http://h5.','ffan.com/fe/fe/sea-parking/html/parking_payResult.html?carLicense=');
$(function init() {
  console.log(wechat);
  $('#root').html(
    rootTpl({
      name: 'World',
      wechat:wechat,
      wechatUrl: wechatUrl
  })
  );
  $("head").append('<meta name="x5-orientation" content="portrait"><meta name="screen-orientation" content="portrait">');

  //$('section').append("<div class='loadBox'><span class='loadings'></span>加载中……</div>");
  $('section').hide();
  $('.g-loading').show();
  showD();//显示该页数据



  //var pullEl = $('section');
  //pullToFresh(pullEl);
  loaded();
  var myScroll,
    pullDownEl, pullDownOffset,
    pullUpEl, pullUpOffset,
    generatedCount = 0;

  function pullDownAction() {
    setTimeout(function () {  // <-- Simulate network congestion, remove setTimeout from production!
      var el, li, i;
      //el = $('section');//document.getElementById('loadBox');
      //location.reload();
      $('.g-loading').show();
      showD();
      myScroll.refresh();   // Remember to refresh when contents are loaded (ie: on ajax completion)
    }, 1000); // <-- Simulate network congestion, remove setTimeout from production!
  }

  function pullUpAction() {
    setTimeout(function () {  // <-- Simulate network congestion, remove setTimeout from production!
       
        myScroll.refresh();   // Remember to refresh when contents are loaded (ie: on ajax completion)
      }, 1000); // <-- Simulate network congestion, remove setTimeout from production!
  }

  function loaded() {
    pullDownEl = document.getElementById('pullDown');
    pullDownOffset = pullDownEl.offsetHeight;
    pullUpEl = document.getElementById('pullUp');
    pullUpOffset = pullUpEl.offsetHeight;

    myScroll = new iScroll('wrapper', {
      useTransition: true,
      topOffset: pullDownOffset,
      onRefresh: function () {
        if (pullDownEl.className.match('loading')) {
          pullDownEl.className = '';
          pullDownEl.querySelector('.pullDownLabel').innerHTML = '刷新...';
        } else if (pullUpEl.className.match('loading')) {
          pullUpEl.className = '';
          pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载更多...';
        }
      },
      onScrollMove: function () {
        if (this.y > 5 && !pullDownEl.className.match('flip')) {
          pullDownEl.className = 'flip';
          pullDownEl.querySelector('.pullDownLabel').innerHTML = '刷新...';
          this.minScrollY = 0;
        } else if (this.y < 5 && pullDownEl.className.match('flip')) {
          pullDownEl.className = '';
          pullDownEl.querySelector('.pullDownLabel').innerHTML = '刷新...';
          this.minScrollY = -pullDownOffset;
        } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
          pullUpEl.className = 'flip';
          pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载更多...';
          this.maxScrollY = this.maxScrollY;
        } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
          pullUpEl.className = '';
          pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载更多...';
          this.maxScrollY = pullUpOffset;
        }
      },
      onScrollEnd: function () {
        if (pullDownEl.className.match('flip')) {
          pullDownEl.className = 'loading';
          pullDownEl.querySelector('.pullDownLabel').innerHTML = '加载中...';
          pullDownAction(); // Execute custom function (ajax call?)
        } else if (pullUpEl.className.match('flip')) {
          pullUpEl.className = 'loading';
          pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载中...';
          pullUpAction(); // Execute custom function (ajax call?)
        }
      }
    });

    setTimeout(function () {
      document.getElementById('wrapper').style.left = '0';
    }, 800);
  }

  document.addEventListener('touchmove', function (e) {
     e.preventDefault();
  }, false);

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(loaded, 200);
  }, false);



  
  //第一次登录的话弹出的提示框
  /*$('#firstLoginTipBtn').click(function () {  //关闭提示
    $('#firstLoginTip').hide();
  });*/

  $('#timeOut').hide();

  //点击重新加载
  $('#reLoad').click(function(){
    $(this).addClass('curBtn');
    setTimeout(function(){
      $('#reLoad').removeClass('curBtn');
    }, 100);
    location.reload();
  });
  
  //判断是否是第一次登录
  if (firstLogin == 1) {
    setTimeout(function(){
        $('.errBox').show().find('.content').text('已实现与广场车辆信息共享');
        closePopDiv();
    },1000);
  }

  //查询该车牌是否有未支付订单，如有跳支付页
  $.ajax({
    url: getDomain('http://api.', 'ffan.com/iswxxapi/v2/torders'), //'http://iswxxapi.intra.sit.ffan.com/iswx/xapi/parking/torders',//
    type: 'get',
    dataType: "json",
    data: encodeURI('token=' + cookie.get('token') + '&carLicense=' + carLicense + '&time=' + new Date().getTime()),
    /*context: document.body,*/
    success: function (data) {
      data = data || {};
      //data ={data: [{carLicense: "京N98765",payOrderNo: "50013825723653",systemTime: 1490179250,validTime: 1490179453}],message: "",status: 200};
      if (data && data.status == 200) {
        var result = data.data;
        if (result.length != 0) {
          var payOrderNo = result[0].payOrderNo;
          if (result[0].validTime != "" && result[0].systemTime != "") {
            var leftTime = result[0].validTime - result[0].systemTime;
          }
          var returnUrl = encodeURIComponent(urlPayResult + encodeURIComponent(postData.carLicense) + '&plateSource=' + encodeURIComponent(plateSource));
          var extInfo = {
            body: "支付停车费用",
            title: "车牌号：" + carLicense,
            countDown: leftTime
          };
          extInfo = encodeURIComponent(JSON.stringify(extInfo));
          location.href = getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo;

        }
      }else if(data.status == 5500){
        location.href = wechatUrl;
      }else {
        //$('#firstLoginTip').show().find('.content').text(data.message);
        $('.errBox').show().find('.content').text(data.message);
        closePopDiv();
      }
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
      closePopDiv();
    },
    timeout:30000
  });


  function showD() {
    $.ajax({
      url: getDomain('http://api.', 'ffan.com/iswxxapi/v2/memberCars'),
      type: 'get',
      dataType: "json",
      async:false,
      data: encodeURI('carLicense=' + carLicense + '&type=1&parkingSource='+ plateSource +'&token=' + token + '&time=' + new Date().getTime()),
      /*context: document.body,*/
      success: getResult,
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        //404或网络不好
        $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
        $('.g-loading').hide();
      },
      timeout:30000
    });
    setTimeout(showD, 60000);
  };

  $('#payBtn').click(function () {
    $(this).addClass('curBtn');
    setTimeout(function(){
      $('#payBtn').removeClass('curBtn');
    }, 100);
    postData.token = token;
    //console.log(postData);
    if (!postData) {
      alert('订单不成功');
    } else {
      if(clickN){
        clickN = false;
        //查询该车牌是否有未支付订单
        $.ajax({
          url: getDomain('http://api.', 'ffan.com/iswxxapi/v2/torders'), //'http://iswxxapi.intra.sit.ffan.com/iswx/xapi/parking/torders',//
          type: 'get',
          dataType: "json",
          data: encodeURI('token=' + cookie.get('token') + '&carLicense=' + postData.carLicense),
          /*context: document.body,*/
          success: function (data) {
            data = data || {};
            //data ={data: [{carLicense: "京N98765",payOrderNo: "50013825723653",systemTime: 1490179250,validTime: 1490179453}],message: "",status: 200};
            if (data && data.status == 200) {
              var result = data.data;
              if (result.length != 0) {
                var payOrderNo = result[0].payOrderNo;
                if (result[0].validTime != "" && result[0].systemTime != "") {
                  var leftTime = result[0].validTime - result[0].systemTime;
                }

                var returnUrl = encodeURIComponent(urlPayResult + encodeURIComponent(postData.carLicense) + '&plateSource=' + encodeURIComponent(plateSource));
                //returnUrl = timestamp(returnUrl);
                var extInfo = {
                  body: "支付停车费用",
                  title: "车牌号：" + postData.carLicense,
                  countDown: leftTime
                };
                extInfo = encodeURIComponent(JSON.stringify(extInfo));
                clickN = true;
                location.href = getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo;

              } else {
                //location.href = '/fe/fe/sea-parking/html/parking_confirmAmount.html?carLicense=' + carLicense;
                $.ajax({
                  url: getDomain('http://api.', 'ffan.com/iswxxapi/v2/weborders'),//'http://api.sit.ffan.com/iswxxapi/v1/weborders',
                  type: 'post',
                  dataType: 'json',
                  jsonp: 'callback',
                  data: postData,
                  success: goPay,
                  error: function (XMLHttpRequest, textStatus, errorThrown) {
                    $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
                    closePopDiv();
                  },
                  timeout:30000
                });
              }
            }else if(data.status == 5500){
              clickN = true;
              location.href = wechatUrl;
            }else {
              clickN = true;
              //$('#firstLoginTip').show().find('.content').text(data.message);
              $('.errBox').show().find('.content').text(data.message);
              closePopDiv();
            }
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
            closePopDiv();
          },
          timeout:30000
        });
      }

    }
    //$(this).unbind("click");
  });

  /*$('#knowBtn').click(function () {
    $('#errOrderTip').hide();
    window.location.reload();
  });*/

});

function goPay(data) {  //去支付
  data = data || {};
  if (data && data.status == 200) {
    var result = data.data;
    /*var orderNo = result.orderNo;
     var realPay = result.realPay;*/
    if (result.payOrderNo != null) {
      var payOrderNo = result.payOrderNo;
      var returnUrl = encodeURIComponent(urlPayResult + encodeURIComponent(carLicense) + '&plateSource=' + encodeURIComponent(plateSource));
      //returnUrl = timestamp(returnUrl);
      var extInfo = {
        body: "支付停车费用",
        title: "车牌号：" + carLicense,
        countDown: 300
      };

      extInfo = encodeURIComponent(JSON.stringify(extInfo));
      console.log(getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo);
      clickN = true;
      location.href = getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo;
    }

  } else if (data.status == 5500) {
    clickN = true;
    location.href = wechatUrl;
  } else if (data.status == 5011) {
    clickN = true;
    //$('#errOrderTip').show().find('.content').text('停车费已变更，请重新确认。')
    $('.errBox').show().find('.content').text('停车费已变更，请重新确认。');
    closePopDiv();
  } else {
    clickN = true;
    //$('#errOrderTip').show().find('.content').text(data.message);
    $('.errBox').show().find('.content').text(data.message);
    closePopDiv();
  }

}
function getResult(data) {
  data = data || {};
  $('.g-loading').hide();
  $('section').show();
  $('.notWork').hide();
  
  if (data && data.status == 200) {
    var result = data.data;
    if (result.parkingInfo != null) {
      //离场剩余时间
      if (result.parkingInfo.leftTimeLeave != null) {
        var leftTimeLeave = result.parkingInfo.leftTimeLeave;
        var validLimit = result.parkingInfo.validLimitMinutes*60;
        if(leftTimeLeave >= validLimit){
          leftTimeLeave = leftTimeLeave-60;
        }
        $('#remainingTime').text(formatSecondsOver(leftTimeLeave));
      }

      if (result.parkingInfo.feeStatus == 4) { //已经超时
        location.href = '/fe/fe/sea-parking/html/parking_confirmAmount.html?carLicense=' + carLicense + '&plateSource=' +plateSource;

      } else if (result.parkingInfo.feeStatus == 3) {

        //查询该车牌是否有未支付订单
        $.ajax({
          url: getDomain('http://api.', 'ffan.com/iswxxapi/v2/torders'), //'http://iswxxapi.intra.sit.ffan.com/iswx/xapi/parking/torders',//
          type: 'get',
          dataType: "json",
          data: encodeURI('token=' + cookie.get('token') + '&carLicense=' + carLicense),
          /*context: document.body,*/
          success: function (data) {
            data = data || {};
            //data ={data: [{carLicense: "京N98765",payOrderNo: "50013825723653",systemTime: 1490179250,validTime: 1490179453}],message: "",status: 200};
            if (data && data.status == 200) {
              var result = data.data;
              if (result.length != 0) {
                var payOrderNo = result[0].payOrderNo;
                if (result[0].validTime != "" && result[0].systemTime != "") {
                  var leftTime = result[0].validTime - result[0].systemTime;
                }

                var returnUrl = encodeURIComponent(urlPayResult + encodeURIComponent(carLicense)+'&plateSource=' + encodeURIComponent(plateSource));
                //returnUrl = timestamp(returnUrl);
                console.log(returnUrl);
                var extInfo = {
                  body: "支付停车费用",
                  title: "车牌号：" + carLicense,
                  countDown: leftTime
                };
                extInfo = encodeURIComponent(JSON.stringify(extInfo));
                location.href = getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo;

              } else {
                location.href = '/fe/fe/sea-parking/html/parking_confirmAmount.html?carLicense=' + carLicense + '&plateSource=' +plateSource;
              }
            }else if(data.status == 5500){
              location.href = wechatUrl;
            }else {
              $('.errBox').show().find('.content').text(data.message);
              closePopDiv();
              //$('#firstLoginTip').show().find('.content').text(data.message);
            }
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
            closePopDiv();
          },
          timeout:30000
        });

      } else {    //未超时
        $('#noneTimeOut').css("display", "block");
        $('#timeOut').css("display", "none");
      }

      $('.plazaName').text(result.parkingInfo.plazaName);//广场名称
      $('.carLicense').text(result.carLicense); //车牌号


      $('.payTime').text(getLocalTime(result.parkingInfo.feeTime)); //缴费时间

      //超时时间
      var overParkingTime = result.parkingInfo.overParkingTime;
      $('#overParkingTime').text(formatSeconds(overParkingTime));//超时时间
      $('#unPayMoney').html('&yen;'+parseFloat(result.parkingInfo.unPayMoney).toFixed(2)); //待支付金额

      postData = {
        carLicense: carLicense,
        shouldPay: result.parkingInfo.unPayMoney,
        money: result.parkingInfo.unPayMoney,
        parkingSource:plateSource,
        useDiscountWay:3
      };
    } else {
      $('.errBox').show().find('.content').text('该车辆无停车信息');
      closePopDiv();
      location.href = '/fe/fe/sea-parking/html/parking_carLicenseList.html';
    }

  }else if(data.status == 5500){
    location.href = wechatUrl;
  }else {
    $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
    //$('.errBox').show().find('.content').text(data.message);
    //closePopDiv();
    //$('#firstLoginTip').show().find('.content').text(data.message);
  }
}

/**
 * 2s后弹框自动消失
 */
function closePopDiv() {
  setTimeout(function (){
    $('.errBox').hide();
  }, 1500);
}
//地址栏加入时间戳，解决浏览器缓存
function timestamp(url){
  //  var getTimestamp=Math.random();
  var getTimestamp=new Date().getTime();
  if(url.indexOf("?")>-1){
    url=url+"&timestamp="+getTimestamp
  }else{
    url=url+"?timestamp="+getTimestamp
  }
  return url;
}

function getQueryString(key) {
  var search = decodeURIComponent(location.search);
  var reg = new RegExp(".*" + key + "\\=" + "([^&]*)(&?.*|)", "g");
  return search.replace(reg, "$1");
}

//倒计时
function show_time(limitTime) {
  var time_start = new Date().getTime(); //设定当前时间
  var time_end = new Date(limitTime).getTime(); //设定目标时间
  // 计算时间差
  var time_distance = time_end - time_start;
  // 天
  var int_day = Math.floor(time_distance / 86400000)
  time_distance -= int_day * 86400000;
  // 时
  var int_hour = Math.floor(time_distance / 3600000)
  time_distance -= int_hour * 3600000;
  // 分
  var int_minute = Math.floor(time_distance / 60000)
  time_distance -= int_minute * 60000;
  // 秒
  var int_second = Math.floor(time_distance / 1000)
  // 时分秒为单数时、前面加零
  if (int_day < 10) {
    int_day = "0" + int_day;
  }
  if (int_hour < 10) {
    int_hour = "0" + int_hour;
  }
  if (int_minute < 10) {
    int_minute = "0" + int_minute;
  }
  if (int_second < 10) {
    int_second = "0" + int_second;
  }
  // 显示时间
  /*$("#time_d").val(int_day);
   $("#time_h").val(int_hour);
   $("#time_m").val(int_minute);
   $("#time_s").val(int_second); */
  var calc = int_day * 86400 + int_hour * 3600 + int_minute * 60 + int_second; //转换成秒 parseInt(str) 转成整数
  if (!calc) { //超时

  }
  var remainingTime = int_day + int_hour + int_minute + int_second;
  $('#remainingTime').text(remainingTime);
  // 设置定时器
  setTimeout("show_time()", 1000);
}

//把时间戳转化成日期
function convertTime(unixTime, isFull, timeZone) {
  if (typeof (timeZone) == 'number') {
    unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
  }
  var time = new Date(unixTime * 1000);
  var ymdhis = "";
  ymdhis += time.getUTCFullYear() + "-";
  ymdhis += (time.getUTCMonth() + 1) + "-";
  ymdhis += time.getUTCDate();
  if (isFull === true) {
    ymdhis += " " + time.getUTCHours() + ":";
    ymdhis += time.getUTCMinutes() + ":";
    ymdhis += time.getUTCSeconds();
  }
  return ymdhis;
}


//另外一种把时间戳转化成日期-----------------------------

function getLocalTime(nS) {
  return new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
}


/**
 * 将秒数换成时分秒格式
 */

function formatSeconds(value) {
  var theTime = parseInt(value);// 秒
  var theTime1 = 0;// 分
  var theTime2 = 0;// 小时
  var theTime3 = 0;// 天
  if (theTime > 60) {
    theTime1 = parseInt(theTime / 60);
    theTime = parseInt(theTime % 60);
    if (theTime1 > 60) {
      theTime2 = parseInt(theTime1 / 60);
      theTime1 = parseInt(theTime1 % 60);
      if (theTime2 > 24) {
        theTime3 = parseInt(theTime2 / 24);
        theTime2 = parseInt(theTime2 % 24);
      }
    }
  }
  var result = "";
  /*if(theTime > 0){
   result = ""+parseInt(theTime)+"秒";
   }*/
  //if(theTime1 > 0) {
  result = "" + parseInt(theTime1) + "分钟" + result;
  //}
  if (theTime2 > 0) {
    result = "" + parseInt(theTime2) + "小时" + result;
  }
  if (theTime3 > 0) {
    result = "" + parseInt(theTime3) + "天" + result;
  }
  if (result == '') {
    result = 0
  }
  return result;
}

/**
 * 将秒数换成时分格式
 */

function formatSecondsOver(value) {
  var theTime = parseInt(value + 60);// 秒
  var theTime1 = 0;// 分
  var theTime2 = 0;// 小时
  var theTime3 = 0;// 天
  if (theTime >= 60) {
    theTime1 = parseInt(theTime / 60);
    theTime = parseInt(theTime % 60);
    if (theTime1 >= 60) {
      theTime2 = parseInt(theTime1 / 60);
      theTime1 = parseInt(theTime1 % 60);
      if (theTime2 >= 24) {
        theTime3 = parseInt(theTime2 / 24);
        theTime2 = parseInt(theTime2 % 24);
      }
    }
  }
  var result = "";
  /*if(theTime > 0){
   result = ""+parseInt(theTime)+"秒";
   }*/
  //if(theTime1 > 0) {
  result = "" + parseInt(theTime1) + "分钟" + result;
  //}
  if (theTime2 > 0) {
    result = "" + parseInt(theTime2) + "小时" + result;
  }
  if (theTime3 > 0) {
    result = "" + parseInt(theTime3) + "天" + result;
  }
  return result;
}
//通过这个函数传递url中的参数名就可以获取到参数code的值
function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  //var r = urlsearch.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}
