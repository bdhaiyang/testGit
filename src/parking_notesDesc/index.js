import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import cookie from '../_commons/js/js.cookie.js';
import { getDomain } from '../_commons/js/business/domain';
import {pullToFresh} from '../_commons/js/pullToFresh.js';
//import test from './assets/test.js';

/**
 * Sample
 */
$(function init() {
  var token = cookie.get('token');
  var orderFlag = getUrlParam('orderFlag');
  var orderNo = getUrlParam('orderNo'); 
  var wechatUrl = cookie.get('payUrl');
  var pullEl = $('section'); 
  
  $('#root').html(
      rootTpl({
      name: 'World',
      wechatUrl: wechatUrl
    })
    );

  $("head").append('<meta name="x5-orientation" content="portrait"><meta name="screen-orientation" content="portrait">');

  $('section').hide();
  $('.g-loading').show();



   showD();

   //点击重新加载
    $('#reLoad').click(function(){
      $(this).addClass('curBtn'); 
      setTimeout(function(){
        $('#reLoad').removeClass('curBtn'); 
      }, 100);
      location.reload();
    });

    function showD(){
      $.ajax({
        url:getDomain('http://api.', 'ffan.com/iswxxapi/v2/parkingRecord'),//'http://10.209.232.169:11042//iswx/xapi/member/parkingRecord',//'http://api.sit.ffan.com/iswxxapi/v1/callPay',
        type:'get',
        dataType:'json',
        data:encodeURI('orderFlag=' + orderFlag + '&orderNo=' + orderNo + '&token=' + token),
        success:showData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //404或网络不好          
            $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
            $('.g-loading').hide();
          },
          timeout:30000
      });
    }

   function showData(data){      
      $('.notWork').hide();
      $('.g-loading').hide();
      data = data || {};
      //data =test;
      if (data && data.status == 200) {
        $('section').show();
        var result = data.data;
        var outTime = '';
        if(result.outTime == -1){
          outTime = '未离场';
        }else{
          outTime = getLocalTime(result.outTime);
        }
        $('.g-loading').hide();
        if(result.status == 1){
          $('.operation').show();
          $('#root').html(
            rootTpl({
              money: parseFloat(result.money).toFixed(2),
              carLicense: result.carLicense,
              plazaName: result.plazaName,
              inTime: getLocalTime(result.inTime),
              outTime: outTime,
              parkingTime: formatSeconds(result.parkingTime),
              discountMoney: parseFloat(result.discountMoney).toFixed(2),
              reduceMoney: parseFloat(result.reduceMoney).toFixed(2),
              activityName: result.activityName,
              couponMoney: parseFloat(result.couponMoney).toFixed(2),
              couponName: result.couponName,
              payMoney: parseFloat(result.payMoney).toFixed(2),
              moneyName:'需支付：',
              wechatUrl: wechatUrl

            })
          );
          pullToFresh(pullEl);
        }else if(result.status == 4){
          $('#root').html(
            rootTpl({
              money: parseFloat(result.money).toFixed(2),
              carLicense: result.carLicense,
              plazaName: result.plazaName,
              inTime: getLocalTime(result.inTime),
              outTime: outTime,
              parkingTime: formatSeconds(result.parkingTime),
              discountMoney: parseFloat(result.discountMoney).toFixed(2),
              reduceMoney: parseFloat(result.reduceMoney).toFixed(2),
              activityName: result.activityName,
              couponMoney: parseFloat(result.couponMoney).toFixed(2),
              couponName: result.couponName,
              payMoney: parseFloat(result.payMoney).toFixed(2),
              moneyName:'需支付：',
              wechatUrl: wechatUrl
            })
          );
          pullToFresh(pullEl);
          $('.operation').find('.btn').val('交易关闭').attr('disabled', 'disabled');
        }else{
          $('#root').html(
            rootTpl({
              money: parseFloat(result.money).toFixed(2),
              carLicense: result.carLicense,
              plazaName: result.plazaName,
              inTime: getLocalTime(result.inTime),
              outTime: outTime,
              parkingTime: formatSeconds(result.parkingTime),
              discountMoney: parseFloat(result.discountMoney).toFixed(2),
              reduceMoney: parseFloat(result.reduceMoney).toFixed(2),
              activityName: result.activityName,
              couponMoney: parseFloat(result.couponMoney).toFixed(2),
              couponName: result.couponName,
              payMoney: parseFloat(result.payMoney).toFixed(2),
              moneyName:'支付金额：',
              wechatUrl: wechatUrl

            })
          );
          pullToFresh(pullEl);
          $('.operation').hide();
        }
        $('#payBtn').on('click',function(){
            var carLicense = result.carLicense;
            var plateSource = getUrlParam('orderFlag');
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
                    console.log(getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo);
                    location.href = getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo;

                  }else{
                    $('.errBox').show().find('.content').text('该订单已支付或已取消！');
                    closePopDiv();                    
                  }
                }else if(data.status == 5500){
                  location.href = wechatUrl;
                }else{
                  $('.errBox').show().find('.content').text('系统繁忙，请稍后重试！');
                  closePopDiv();
                }
              },
              error: function (XMLHttpRequest, textStatus, errorThrown) {
                $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
                closePopDiv();
              },
              timeout:30000
            });
          });
      }else if(data.status == 5500){
        location.href = wechatUrl;
      }else{
        $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
      }
   }

    
   
    $('#firstLoginTipBtn').click(function () {  //关闭提示
      $('#firstLoginTip').hide();
    });

    /**
   * 2s后弹框自动消失
   */
function closePopDiv() {
  setTimeout(function (){
    $('.errBox').hide();
  }, 1500);
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
      if(theTime >= 60) {
          theTime1 = parseInt(theTime/60);
          theTime = parseInt(theTime%60);
              if(theTime1 >= 60) {
              theTime2 = parseInt(theTime1/60);
              theTime1 = parseInt(theTime1%60);
                if(theTime2 >= 24){
                  theTime3 = parseInt(theTime2/24);
                  theTime2 = parseInt(theTime2%24);
                }
              }
      }
          var result = "";
          //if(theTime > 0){
          //result = ""+parseInt(theTime)+"秒";
          //}
          //if(theTime1 > 0) {
          result = ""+parseInt(theTime1)+"分钟"+result;
          //}
          if(theTime2 > 0) {
          result = ""+parseInt(theTime2)+"小时"+result;
          }
          if(theTime3 > 0) {
          result = ""+parseInt(theTime3)+"天"+result;
          }
      return result;
  }
  function getUrlParam(name) { //通过这个函数传递url中的参数名就可以获取到参数code的值
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    //var r = urlsearch.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }

});
