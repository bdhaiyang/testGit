import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import cookie from '../_commons/js/js.cookie.js';
import { getDomain } from '../_commons/js/business/domain';
import {iScroll} from '../_commons/js/iScroll.js';
//import test from './assets/test.js';
/**
 * 跳转页
 */
var token = cookie.get('token');
var plateSource = '';
var payUrl = '';
var debug = getUrlParam('debug'); //截取code
var callId = getUrlParam('callId'); //截取code
var gettoken = getUrlParam('token');
var wechatUrl = cookie.get('payUrl');
//cookie.set('token', 'testtoken', {expires: 7, path: ''});
$(function init() {
  $('#root').html(
    rootTpl({
      name: 'World'
    })
  );

  /**
   * 设置横屏显示
   * @type {String}
   */
  $("head").append('<meta name="x5-orientation" content="portrait"><meta name="screen-orientation" content="portrait">');
  
  $('.g-loading').show();
  if (debug == 1) {
     var mobile = getUrlParam('mobile'); //截取code
     payUrl = location.href;
     cookie.set('payUrl', payUrl, {expires: 7, path: ''});
     wechatUrl = cookie.get('payUrl');
      $.ajax({
        async: false,
        type: 'post',
        url: getDomain('http://api.', 'ffan.com/iswxxapi/v1/oauth/token'),
        dataType: "json",
        data: {
          //debug:1,
          mobile: mobile,
          debug: debug,
          _: +new Date()
        },
        success: onGetUserFlag,
        error: (error) => {
          $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
          $('.g-loading').hide();
        },
        timeout:30000
      });

  }else if(callId && gettoken){
    payUrl = location.href;
    cookie.set('payUrl', payUrl, {expires: 7, path: ''});
    wechatUrl = cookie.get('payUrl');
    $.ajax({
        async: false,
        type: 'post',
        url: getDomain('http://api.', 'ffan.com/iswxxapi/v1/oauth/token'),
        dataType: "json",
        data: {
          //debug:1,
          callId: callId,
          token:gettoken,
          _: +new Date()
        },
        success: onGetUserFlag,
        error: (error) => {
          $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
          $('.g-loading').hide();
        },
        timeout:30000
      });


  } else {
    var code = getUrlParam('code'); //截取code
    var sta = getUrlParam('state'); //截取state
    payUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx33d00a8eec0678a2&redirect_uri=http://h5.ffan.com/fe/fe/sea-parking/html/parking_index.html&response_type=code&scope=snsapi_base&state='
    + sta +'REFRESH&connect_redirect=1#wechat_redirect'
    cookie.set('payUrl', payUrl, {expires: 7, path: ''});
    wechatUrl = cookie.get('payUrl');
    showD();
  }
  
  

  //点击重新加载
    $('#reLoad').click(function(){
      $(this).addClass('curBtn'); 
      setTimeout(function(){
        $('#reLoad').removeClass('curBtn'); 
      }, 100);
      location.href = wechatUrl;
    });
  
  /**
   * 把微信返回code传给后端，获取后端返回的token
   * @param  {[type]} ) {                 $('#firstLoginTip').hide();  });  loaded( [description]
   * @return {[type]}   [description]
   */
  function showD(){
    $.ajax({
      async: false,
      type: 'post',
      url: getDomain('http://api.', 'ffan.com/iswxxapi/v1/oauth/token'),
      dataType: "json",
      data: {
        //debug:1,
        code: code,
        state: sta,
        _: +new Date()
      },
      success: onGetUserFlag,
      error: (error) => {
        $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
        $('.g-loading').hide();
      },
      timeout:30000
    });
  }   


  $('#firstLoginTipBtn').click(function () {  //关闭提示
    $('#firstLoginTip').hide();
  });

  /**
   * 下拉重新加载页面
   */
  loaded();
  var myScroll,
    pullDownEl, pullDownOffset,
    pullUpEl, pullUpOffset,
    generatedCount = 0;

  function pullDownAction() {
    setTimeout(function () {  // <-- Simulate network congestion, remove setTimeout from production!
      var el, li, i;
      el = document.getElementById('loadBox');
      location.href = wechatUrl;

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


});

function onGetUserFlag(data) { //获取token授权信息
  data = data || {};
  $('.notWork').hide();
  $('.g-loading').hide();
  if (data && data.status == 200) {
    var result = data.data;
    var token = result.token ? result.token : null;
    //var userFlag = result.userFlag ? result.userFlag : 0;
    var userFlag = result.userFlag;
    //设置cookie
    cookie.set('token', token, {expires: 7, path: ''});
    if (userFlag == 1) {  //会员
      if (result.returnId == 1) {  //未绑定车牌
        //跳入绑定车牌页
        location.href = '/fe/fe/sea-parking/html/parking_bind.html';
      } else if (result.returnId == 2) {
        //绑定了一个
        $.ajax({
          url: getDomain('http://api.', 'ffan.com/iswxxapi/v1/cars'),//获取在场的那个车牌号
          type: 'get',
          dataType: "json",
          data: encodeURI('token=' + token),
          success: getOneCarLicense,
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
            $('.g-loading').hide();
          },
          timeout:30000
        });
      } else if (result.returnId == 3) {
        //绑定了多个
        location.href = '/fe/fe/sea-parking/html/parking_carLicenseList.html';
      } else if (result.returnId == 4) {
        //alert('跳入车牌列表页'); //绑定了未入场
        location.href = '/fe/fe/sea-parking/html/parking_carLicenseList.html';
      }
    }
    else if (userFlag == 0) {  //非会员跳转登录页
      location.href = '/fe/fe/sea-parking/html/parking_login.html';
    }
  } else if (data.status == 5500) {
    location.href = wechatUrl;
  } else {
    $('.g-loading').hide(); 
    $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
    //$('#firstLoginTip').show().find('.content').text(data.message);
   // $('.errBox').show().find('.content').text(data.message);
    //closePopDiv();
  }
}

function getOneCarLicense(data) {
  data = data || {};
  var carLicense = '';
  var isInPark = 1;
  //data = test;
  if (data && data.status == 200) {
    console.log('data.data', data.data);
    var result = data.data;
    if (result.inParkCount == 1) {
      var carLicenseList = result.data;
      for (var i = 0; i < carLicenseList.length; i++) {
        if (carLicenseList[i].isInPark == 1 || carLicenseList[i].isInPark == 2 || carLicenseList[i].isInPark == 3 || carLicenseList[i].isInPark == 4) {
          carLicense = carLicenseList[i].carLicense;
          isInPark = carLicenseList[i].isInPark;
          plateSource = carLicenseList[i].parkingSource;
        }
      }

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

                var returnUrl = encodeURIComponent(getDomain('http://h5.','ffan.com/fe/fe/sea-parking/html/parking_payResult.html?carLicense=') + encodeURIComponent(carLicense) + '&plateSource=' + encodeURIComponent(plateSource));
                var extInfo = {
                  body: "支付停车费用",
                  title: "车牌号：" + carLicense,
                  jumpUrl:getDomain("http://h5.","ffan.com/fe/fe/sea-parking/html/parking_notes.html"),
                  countDown: leftTime
                };
                extInfo = encodeURIComponent(JSON.stringify(extInfo));
                location.href = getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo;

              } else {
                if (isInPark == 1 || isInPark ==2 || isInPark == 4) {
                  location.href = '/fe/fe/sea-parking/html/parking_confirmAmount.html?carLicense=' + carLicense + '&plateSource=' + plateSource;
                } else if (isInPark == 3) {
                  location.href = '/fe/fe/sea-parking/html/parking_payResult.html?carLicense=' + carLicense + '&plateSource=' + plateSource;
                }

              }
            } else if (data.status == 5500) {
              location.href = wechatUrl;
            } else {
              $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
              //$('#firstLoginTip').show().find('.content').text(data.message);
            }
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
            $('.g-loading').hide();
          },
          timeout:30000
        });


      
    }
  } else if (data.status == 5500) {
    location.href = wechatUrl;
  } else {
    $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
   // $('#firstLoginTip').show().find('.content').text(data.message);
  }
}

function getUrlParam(name) { //通过这个函数传递url中的参数名就可以获取到参数code的值
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  //var r = urlsearch.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

/**
   * 2s后弹框自动消失
   */
function closePopDiv() {
  setTimeout(function (){
    $('.errBox').hide();
  }, 1500);
}