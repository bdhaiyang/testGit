import $ from 'jquery';
  import rootTpl from './assets/root.hbs';
  import './assets/index.less';
  import cookie from '../_commons/js/js.cookie.js';
  import { getDomain } from '../_commons/js/business/domain';
  //import {pullToFresh} from '../_commons/js/pullToFresh.js';
  import {iScroll} from '../_commons/js/iScroll.js';

  /**
   * Sample
   */
  var carLicense = '';
  carLicense = getQueryString('carLicense');
  var firstLogin = getUrlParam('firstLogin'); //是否第一次登录
  var postData = {};
  var token = cookie.get('token');
  var plateSource = getUrlParam('plateSource');
  var wechatUrl = cookie.get('payUrl');
  $("head").append('<meta name="x5-orientation" content="portrait"><meta name="screen-orientation" content="portrait">');
  $(function init() {
    $('#root').html(
      rootTpl({
      name: 'World',
      wechatUrl: wechatUrl
      })
    );

    $('section').hide();
    $('.g-loading').show();

    
    //第一次登录的话弹出的提示框
    $('#firstLoginTipBtn').click(function () {  //关闭提示
      $('#firstLoginTip').hide();
    });

    //点击重新加载
    $('#reLoad').click(function(){
      $(this).addClass('curBtn'); 
      setTimeout(function(){
        $('#reLoad').removeClass('curBtn'); 
      }, 100);
      location.reload();
    });

    showD();
    //查询该车牌是否有未支付订单，如有跳支付页
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
              countDown: leftTime
            };
            extInfo = encodeURIComponent(JSON.stringify(extInfo));
            location.href = getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo;

          }
        }else if(data.status == 5500){
          location.href = wechatUrl;
        }else{
          $('.errBox').show().find('.content').text('系统繁忙，请稍后重试！');
          closePopDiv();
          //$('#firstLoginTip').show().find('.content').text(data.message);
          /*$('.errBox').show().find('.content').text(data.message);
          closePopDiv();*/
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
        closePopDiv();
      },
      timeout:30000
    });
    function showD() {
      /*var couponIds = new Array();
      couponIds.push('003802482629');*/
      $.ajax({
        url: getDomain('http://api.', 'ffan.com/iswxxapi/v2/callPay'),//'http://api.sit.ffan.com/iswxxapi/v1/callPay',//'http://10.209.232.169:11042/iswx/xapi/' + encodeURI(carLicense) + '/calPay',
        type: 'post',
        async:false,
        dataType: 'json',
        /*jsonp:'callback',*/
        data: encodeURI('carLicense=' + carLicense + '&token=' + token + '&parkingSource=' + plateSource + '&useDiscountWay=3'),//encodeURI('carLicense=' + carLicense +'&token=' + token), //
        success: showData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          //404或网络不好
          $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
          $('.g-loading').hide();
        },
        timeout:30000
      });
      setTimeout(showD, 60000);
    }

    //判断是否是第一次登录
    if (firstLogin == 1) {
      setTimeout(function(){
        $('.errBox').show().find('.content').text('已实现与广场车辆信息共享');
        closePopDiv();
      },1000);
      
    } 


    //var pullEl = $('section');
    //pullToFresh(pullEl);
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




    $('#payBtn').click(function (e) {
      $(this).addClass('curBtn'); 
      setTimeout(function(){
        $('#payBtn').removeClass('curBtn'); 
      }, 100);
      postData.token = token;
      postData.parkingSource = plateSource;
      //var couponIds = ['003802482629'];
      //postData.couponIds = couponIds;
      postData.useDiscountWay = 3;

      if (!postData) {
        alert('订单不成功');
      } else {
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

                var returnUrl = encodeURIComponent(getDomain('http://h5.','ffan.com/fe/fe/sea-parking/html/parking_payResult.html?carLicense=') + encodeURIComponent(postData.carLicense) + '&plateSource=' + encodeURIComponent(plateSource));
                var extInfo = {
                  body: "支付停车费用",
                  title: "车牌号：" + postData.carLicense,
                  countDown: leftTime
                };
                extInfo = encodeURIComponent(JSON.stringify(extInfo));
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
                    //onSendMsgCodes(json);
                    $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
                    closePopDiv();
                  },
                  timeout:30000
                });
              }
            }else if(data.status == 5500){
              location.href = wechatUrl;
            }else {
              //$('#errOrderTip').show().find('.content').text(data.message);
              $('.errBox').show().find('.content').text(data.message);
              closePopDiv();
            }
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
          },
          timeout:30000
        });

      }
     // $(this).unbind("click");

    });

    $('#knowBtn').click(function () {
      $('#errOrderTip').hide();
      window.location.reload();
    });

  });

  function goPay(data) {  //去支付
    data = data || {};
    if (data && data.status == 200) {
      var result = data.data;

      if (result.payOrderNo != null) {
        var payOrderNo = result.payOrderNo;
        var returnUrl = encodeURIComponent(getDomain('http://h5.','ffan.com/fe/fe/sea-parking/html/parking_payResult.html?carLicense=') + encodeURIComponent(carLicense) + '&plateSource='+encodeURIComponent(plateSource));
        var extInfo = {
          body: "支付停车费用",
          title: "车牌号：" + carLicense,
          countDown: 300
        };

        extInfo = encodeURIComponent(JSON.stringify(extInfo));
        console.log(getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo);
        location.href = getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo;
      } else {//券完全抵扣花费的话不需要支付
        location.href = getDomain('http://h5.','ffan.com/fe/fe/sea-parking/html/parking_payResult.html?carLicense=') + carLicense + '&plateSource=' + plateSource;
      }

    }else if (data.status == 5011) {
      $('#errOrderTip').show().find('.content').text('停车费已变更，请重新确认。')
    }else if(data.status == 5500){
      location.href = wechatUrl;
    }else {
      //$('#errOrderTip').show().find('.content').text(data.message);
      $('.errBox').show().find('.content').text(data.message);
      closePopDiv();
    }

  }

  function showData(data) {
    $('.notWork').hide();
    $('section').show();
    data = data || {}; 
    $('.g-loading').hide();    
    
    if (data && data.status == 200) {
      var result = data.data;  
        $('#carLicense').text(carLicense);
        $('#plazaName').text(result.plazaName);
        $('#inTime').text(getLocalTime(result.inTime));
        $('#parkingTime').text(formatSeconds(result.parkingTime));
        $('#overParkingTime').text(formatSeconds(result.overParkingTime));
        if (result.overParkingTime == 0) {
          $('.parkingTime').show();
          $('.overParkingTime').hide();
        }else{
          $('.parkingTime').hide();
          $('.overParkingTime').show();
        }
        
        $('#shouldPay').html('&yen; ' + parseFloat(result.shouldPay).toFixed(2));

        if(result.discountActivity == null){
          $('#discountActivityLi').hide();
          if (result.discountCoupon) {
              if(result.discountCoupon.length){
                $('#discountCoupon').html('- &yen; ' + parseFloat(result.discountCoupon[0].origPrice).toFixed(2)); 
                $('.discount').show(); 
                $('#discountCouponLi').show();    
              }else{
                $('#discountCouponLi').hide();
                $('.discount').hide();
              }                
          } else {
              $('#discountCouponLi').hide();
              $('.discount').hide();
          }
        }else{
           if (result.discountActivity.activityId == null) {
            $('#discountActivityLi').hide();
            if (result.discountCoupon) {
              if(result.discountCoupon.length){
                $('#discountCoupon').html('- &yen; ' + parseFloat(result.discountCoupon[0].origPrice).toFixed(2));    
                $('.discount').show(); 
                $('#discountCouponLi').show();    
              }else{
                $('#discountCouponLi').hide();
                $('.discount').hide();
              }                
            } else {
              $('#discountCouponLi').hide();
              $('.discount').hide();
            }
          } else {
            $('#discountActivityLi').show();
            $('#promotionName').html(result.discountActivity.promotionName);
            $('#discountActivity').html('- &yen; ' + parseFloat(result.discountActivity.disPrice).toFixed(2));
            $('.discount').show();   
            if (result.discountCoupon) {
              if(result.discountCoupon.length){
                $('#discountCoupon').html('- &yen; ' + parseFloat(result.discountCoupon[0].origPrice).toFixed(2)); 
                $('#discountCouponLi').show();   
              }else{
                $('#discountCouponLi').hide();
              }                
            } else {
              $('#discountCouponLi').hide();
            }
          }
        }
        
        if (result.shouldPay <= 0) {
          $("#payBtn").attr('disabled', true);
        } else {
          $('#payBtn').attr('disabled', false);
        }
        $('#money').html('&yen; ' + parseFloat(result.money).toFixed(2));
        postData = {
          carLicense: carLicense,
          shouldPay: result.shouldPay,
          money: result.money
        };
      
      
    }else if(data.status == 5500){
        location.href = wechatUrl;
    }else if(data.status == 2023){
      $('.errBox').show().find('.content').text(data.message);
      closePopDiv();
      location.href = '/fe/fe/sea-parking/html/parking_carLicenseList.html';
    }else {
      $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
      //$("section").html('<p class="content">' + data.message + '</p>');
      $('#payBtn').attr('disabled', true);
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
  //通过这个函数传递url中的参数名就可以获取到参数code的值
  function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }

  function getQueryString(key) {
    var search = decodeURIComponent(location.search);
    var reg = new RegExp(".*" + key + "\\=" + "([^&]*)(&?.*|)", "g");
    return search.replace(reg, "$1");
  }


  //另外一种把时间戳转化成日期-----------------------------

  function getLocalTime(nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
  }


  /**
   * 将秒数换成时分秒格式
   */

  function formatSeconds(value) {
    if (value >= 60) {
      var theTime = parseInt(value - 60);// 秒
    } else {
      var theTime = parseInt(value);// 秒
    }
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