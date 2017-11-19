import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import cookie from '../_commons/js/js.cookie.js';
import { getDomain } from '../_commons/js/business/domain';

/**
 * Sample
 */
var token = cookie.get('token');
var clickN = 0;
var plateSource = '';
var wechatUrl = cookie.get('payUrl');
$(function init() {
  $('#root').html(
    rootTpl({
      name: 'World',
      wechatUrl: wechatUrl
    })
  );
  $("head").append('<meta name="x5-orientation" content="portrait"><meta name="screen-orientation" content="portrait">');
  

  $('#firstLoginTipBtn').click(function () {  //关闭提示并跳转到绑定车牌号页
    $('#firstLoginTip').hide();
  });

  /**
   * 选择阅读协议
   * @param  {[type]} )
   * @return {[type]}     [description]
   */
  $('.selectAgreement').click(function(){
    if($(this).find('input').is(':checked')){
      $(this).find('i.iconfont').removeClass('icon-noselect').addClass('icon-select');
      if(telVerify() && $('#msgCodes').val() != ''){
        $('#loginBtn').attr('disabled', false);
      }
    }else{
      $(this).find('i.iconfont').removeClass('icon-select').addClass('icon-noselect');      
      $('#loginBtn').attr('disabled', true);
    }    
  });

  $('#telphone').keyup(function(){
    var v = $(this).val();
    if (telVerify()) {
      $("#sendBtn").attr('disabled', false);
      if($('#msgCodes').val() != '' && $('#isLooked').is(':checked')){
        $('#loginBtn').attr('disabled', false);
      }else{
        $('#msgCodes').keyup(function(){
          if($(this).val() != '' && telVerify() && $('#isLooked').is(':checked')){
            $('#loginBtn').attr('disabled', false);
          }else{
            $('#loginBtn').attr('disabled', true);
          }
        });
      }      
    }else{
      $('#loginBtn').attr('disabled', true);
      $("#sendBtn").attr('disabled', true);
    }
  });

  $('#sendBtn').click(function () {
    var telphone = $("#telphone").val();
    
    if (telVerify()) {
      $.ajax({
        url: getDomain('http://api.', 'ffan.com/iswxxapi/v1/oauth/msgcodes'),//"http://api.sit.ffan.com/iswxxapi/v1/oauth/msgcodes",
        type: 'post',
        dataType: "json",
        /*jsonp: "callback",*/
        data: encodeURI('mobile=' + telphone + '&token=' + token),
        success: onSendMsgCodes,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          //onSendMsgCodes(json);
          $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
        },
        timeout:30000
      });
    }

  })


  $('#loginBtn').click(function () { 
    $(this).addClass('curBtn'); 
    setTimeout(function(){
      $('#loginBtn').removeClass('curBtn'); 
    }, 100);
    var telphone = $("#telphone").val();
    var msgCode = $("#msgCodes").val();
    var token = cookie.get('token');
    
    if (telVerify()) {
      if (telphone.length != 0 && msgCode.length != 0) {
        if(clickN == 0){
          clickN = 1;
          $.ajax({
            url: getDomain('http://api.', 'ffan.com/iswxxapi/v1/oauth/login'),//"http://api.sit.ffan.com/iswxxapi/v1/oauth/login", //http://10.1.80.44:8080/iswx/xapi/oauth/token
            type: 'post',
            dataType: "json",
            data: encodeURI('mobile=' + telphone + '&msgCode=' + msgCode + '&token=' + token),
            /*context: document.body,*/
            success: login,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
              $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
              closePopDiv();
            },
            timeout:30000
          });
        }
        
      } else {
        $('#errLoginTip').text('请输入完整信息！');
      }
    }
  })

});

function login(data) {
  data = data || {};
  
  if (data && data.status == 200) {    
    var result = data.data;
    if (result.loginResult == 1) {
      $('#errLoginTip').text('');
      //cookie.set('firstLogin', result.firstLogin, {expires: 7, path: ''});
      if (result.returnId == 1) {  //未绑定车牌
        //跳入绑定车牌页 传递参数是否首次登录 ,如果首次登录下一页显示弹层 1代表首次登录 0代表否

        location.href = '/fe/fe/sea-parking/html/parking_bind.html';
        //$("#firstLoginTip").show();
      } else if (result.returnId == 2) {  //绑定1个车牌
        //跳入缴费确认信息页
        $.ajax({
          url: getDomain('http://api.', 'ffan.com/iswxxapi/v1/cars'),//"http://api.sit.ffan.com/iswxxapi/v1/cars", //?????????????? 获取在场的那个车牌号
          type: 'get',
          dataType: "json",
          data: encodeURI('token=' + token),
          /*context: document.body,*/
          success: getOneCarLicense,
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
            closePopDiv();
          },
          timeout:30000
        });

      } else if (result.returnId == 3) {  ////绑定n个车牌
        //跳入车牌列表页

        location.href = '/fe/fe/sea-parking/html/parking_carLicenseList.html?firstLogin=' + result.firstLogin;
      } else { //均为入场跳入车牌列表页  绑定了车牌未入场

        location.href = '/fe/fe/sea-parking/html/parking_carLicenseList.html?firstLogin=' + result.firstLogin;
      }

    } else {

      alert('登录失败');
    }

  }else if (data.status == 5500) {
    clickN = 0;
    location.href = wechatUrl;
  } else {
    $('.errBox').show().find('.content').text(data.message);
    closePopDiv();
    clickN = 0;
    //$('#firstLoginTip').show().find('.content').text(data.message);
  }
}

function getOneCarLicense(data){
  data = data || {};
  //data = test;
  var carLicense = '';
  var isInPark = 1;
  if (data && data.status == 200) {
    console.log('data.data', data.data);
    var result = data.data;
    if (result.inParkCount == 1) {
      var carLicenseList = result.data;
      for (var i = 0; i < carLicenseList.length; i++) {
        if(carLicenseList[i].isInPark != 0){
          carLicense = carLicenseList[i].carLicense;
          isInPark = carLicenseList[i].isInPark;
          plateSource = carLicenseList[i].parkingSource;
        }
      }
      if(isInPark == 1 || isInPark == 2  || isInPark == 4){
        //查询该车牌是否有未支付订单
        $.ajax({
          url: getDomain('http://api.', 'ffan.com/iswxxapi/v2/torders'), //'http://iswxxapi.intra.sit.ffan.com/iswx/xapi/parking/torders',//
          type: 'get',
          dataType: "json",
          data: encodeURI('token=' + cookie.get('token') + '&carLicense=' + carLicense),
          /*context: document.body,*/
          success: function (data){
                    data = data || {};
                    //data ={data: [{carLicense: "京N98765",payOrderNo: "50013825723653",systemTime: 1490179250,validTime: 1490179453}],message: "",status: 200};
                    if (data && data.status == 200) {
                      var result = data.data;
                      if (result.length != 0) {
                        if(result[0].validTime != "" && result[0].systemTime != ""){
                          var leftTime = result[0].validTime - result[0].systemTime;
                        }
                        var payOrderNo = result[0].payOrderNo;
                        var returnUrl = encodeURIComponent(getDomain('http://h5.','ffan.com/fe/fe/sea-parking/html/parking_payResult.html?firstLogin=1&carLicense=') + encodeURIComponent(carLicense) + '&plateSource=' + encodeURIComponent(plateSource));
                        var extInfo = {
                          body:"支付停车费用",
                          title:"车牌号：" + carLicense,
                          countDown:leftTime};
                          extInfo = encodeURIComponent(JSON.stringify(extInfo));
                        location.href =getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo;

                      }else{
                        location.href = '/fe/fe/sea-parking/html/parking_confirmAmount.html?carLicense=' + carLicense + '&firstLogin=1' + '&plateSource=' + plateSource;
                      }
                    } else if (data.status == 5500) {
                      location.href = wechatUrl;
                    } else {
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
      }else if(isInPark == 3){
        location.href = '/fe/fe/sea-parking/html/parking_payResult.html?carLicense=' + carLicense+ '&firstLogin=1' + '&plateSource=' + plateSource;
      }
    }
  } else if (data.status == 5500) {
    location.href = wechatUrl;
  } else {
    $('.errBox').show().find('.content').text('系统繁忙，请稍后重试！');
    closePopDiv();
  }
}

function onSendMsgCodes(data) { //发送手机验证码
  console.log('发送验证码返回的结果', data)
  data = data || {};
  if (data && data.status == 200) {
    var result = data.data;
    //$('#sendSuccessTip').text('发送验证码成功！');
    $('#sendBtn').attr('disabled', true);
    var timeSecend = 60;
    $('#sendBtn').attr('value', timeSecend + 's').addClass('time');
    var sendClock = setInterval(clock, 1000);
    function clock(){
      if(timeSecend>0){
        timeSecend--;
        $('#sendBtn').attr('value', timeSecend + 's');
      }else{
        clearInterval(sendClock);
        $('#sendBtn').attr('disabled', false).removeClass('time');
        $('#sendBtn').attr('value', '获取验证码');
      }
    }
  } else if (data.status == 5500) {
    location.href = wechatUrl;
  } else {
    $('.errBox').show().find('.content').text('系统繁忙，请稍后重试！');
    closePopDiv();
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

function getUrlParam(name) { //通过这个函数传递url中的参数名就可以获取到参数code的值
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  //var r = urlsearch.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

function telVerify() { //手机号验证
  var telphone = $("#telphone").val();
  var mobileReg = /^1[34578]\d{9}$/; //验证手机号
  var length = telphone.length;
  if (length == 11 && mobileReg.test(telphone)) {
    $('#telErr').text('');
    return true;
  } else {
    //$('#sendSuccessTip').text('');
    //$('#telErr').text('* 请正确填写手机号码');
    return false;
  }

}
