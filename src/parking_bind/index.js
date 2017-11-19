import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import cookie from '../_commons/js/js.cookie.js';
import { getDomain } from '../_commons/js/business/domain';
/**
 * 添加车辆
 */
  var firstLogin = getUrlParam('firstLogin'); //是否第一次登录
  var source = getUrlParam('source');
  var token = cookie.get('token');
  var clickN = true;
  var wechatUrl = cookie.get('payUrl');

$(function init() {
  $('#root').html(
    rootTpl({
      name: 'World',
      wechatUrl: wechatUrl
  })
  );
  $("head").append('<meta name="x5-orientation" content="portrait"><meta name="screen-orientation" content="portrait">');
 
  //第一次登录的话弹出的提示框
  $('#firstLoginTipBtn').click(function () {  //关闭提示
    $('#firstLoginTip').hide();
  });
  $('#telBtn').on('click', function () {
    $('#errCarLicenseTip').hide();
  });

  //绑定车牌
  $('#bindBtn').click(function(){
    $(this).addClass('curBtn'); 
    setTimeout(function(){
      $('#bindBtn').removeClass('curBtn'); 
    }, 100);

    var carLicense = $('.cardNumber').find('li').first().find('span').text();
    $('.cardNumber').find('li').slice(1).each(function (index) {
      carLicense = carLicense + $(this).children('p').text();      
    });
  	if(carLicense!=''){ //验证通过
      if(isVehicleNumber(carLicense)){
        if(clickN){
          clickN = false;
          $.ajax({
            url:getDomain('http://api.', 'ffan.com/iswxxapi/v1/member/batchBindCarLicense'),//'http://api.sit.ffan.com/iswxxapi/v1/member/batchBindCarLicense',//'http://10.1.80.42:8081/iswx/xapi/member/batchBindCarLicense',
            type:'post',
            dataType:'json',
            data:{
              cars:carLicense,
              token:token,
              type:1
            },//encodeURI('carLicense=' + carLicense + '&type=1&token=' + token),
            success:bindCardNumber,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
                closePopDiv();
              },
              timeout:30000
          })
        }else{
          clickN = true;
        }  
      }else{
        $('.errBox').show().find('.content').text('请输入正确的车牌');
        closePopDiv();
      }    
          
  	}else{
      $('.errBox').show().find('.content').text('车牌不能为空');
      closePopDiv();
    }
  });


  $('#closeBtn').on('click',function(){
    $('#errCarLicenseTip').hide();
  })

  /*
       * 点击省份输入框
       * */
      $('.cardNumber').find('li').first().click(function () {
        $(this).siblings().find('p').removeClass('selectIpt');
        $(this).find('p').addClass('selectIpt');
        $('.numBox').hide();
        $('.provinceBox').show();
      });

      /*
       * 点击数字字母输入框
       * */
      $('.cardNumber').find('li').slice(1).click(function () {
        $(this).siblings().find('p').removeClass('selectIpt');
        $(this).find('p').addClass('selectIpt');
        $('.numBox').show();
        $('.provinceBox').hide();
      });

      /**
       * 点击数字字母键盘
       */
      $('.numBox').find('li').click(function () {
        if ($('.selectIpt').parent().next().length && $('.selectIpt').parent().next().children('p').text() == '') {
          $('.selectIpt').text($(this).children('p').text()).removeClass('selectIpt').parent().next().children('p').addClass('selectIpt');
        } else {
          $('.selectIpt').text($(this).children('p').text()).removeClass('selectIpt');
          $('.cardNumber').find('li').slice(1).each(function (index) {
            if ($(this).children('p').text() == '') {
              $(this).children('p').addClass('selectIpt');
              return false;
            }else{
              if(index == 5){
                $('#bindBtn').attr('disabled', false);
              }
            }
            
          });
        }
      });

      /**
       * 点击省份键盘
       */
      $('.provinceBox').find('li').click(function () {
        $('.provinceBox').hide();
        $('.numBox').show();
        $('.selectIpt').find('span').text($(this).children('p').text()).parent('p').removeClass('selectIpt').parent().next().children('p').addClass('selectIpt');
      });

      /**
       * 删除车牌
       */
      $('.del').click(function(){
        var n = 0;
        $('.cardNumber').find('li').slice(1).each(function(index){
          if($(this).children('p').text() != ''){
            n = index + 1;
          }
        });

        if(n > 0){
          $('.cardNumber').find('li').slice(1).each(function(index){
            $('.cardNumber').find('li').slice(1).eq(n-index-1).siblings().find('p').removeClass('selectIpt');
            $('.cardNumber').find('li').slice(1).eq(n-index-1).find('p').addClass('selectIpt').text('');
            return false;
          });
        }

      });

      $('#newEnergy').click(function(){
        if($(this).is(':checked')){
          $('.cardNumber').find('li').css({'width':'12%'});
          $('.cardNumber').find('li').last().show();
        }else{
          $('.cardNumber').find('li').last().hide();
          $('.cardNumber').find('li').css({'width':'14%'});
        }
      })


});

function bindCardNumber(data){
  var carLicense = $('.cardNumber').find('li').first().find('span').text();
  $('.cardNumber').find('li').slice(1).each(function (index) {
    carLicense = carLicense + $(this).children('p').text();      
  });
	var token = cookie.get('token');
  data = data || {};
  if (data && data.status == 200) {
    var result = data.data;
    if (source == 0){ //来源车牌列表
	  	location.href = '/fe/fe/sea-parking/html/parking_carList.html'; //绑定完成跳车牌号列表页
	  }else
 	  { //绑定完成如果在场跳缴费页，车辆不在场跳车牌列表页(停车缴费页)
    	$.ajax({
  			url:getDomain('http://api.', 'ffan.com/iswxxapi/v1/cars'),//'http://api.sit.ffan.com/iswxxapi/v1/cars',
  			type:'get',
  			dataType:'json',
  			/*jsonp:'callback',*/
  			data:encodeURI('carLicense=' + carLicense + '&token=' + token),
  			success:verifyPresence,
  			error: function (XMLHttpRequest, textStatus, errorThrown) {
          	$('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
            closePopDiv();
        	},
        timeout:30000
  		});

	  }
  }else if (data.status == 5500) {
    clickN = true;
    location.href = wechatUrl;
  } else {
    clickN = true;
    $('.errBox').show().find('.content').text(data.message);
    closePopDiv();
  }
}
//验证车辆是否入场
function verifyPresence(data){
	data = data || {};
	var carLicense = $('.cardNumber').find('li').first().find('span').text();
  $('.cardNumber').find('li').slice(1).each(function (index) {
    carLicense = carLicense + $(this).children('p').text();      
  });
  if (data && data.status == 200) {
    var result = data.data;
	    $.each(result.data,function(index,value){
	     if (value.carLicense == carLicense){
	     	if(value.isInPark != 0) { //该车辆已入场
	     	//跳入缴费确认信息页
	     	location.href = '/fe/fe/sea-parking/html/parking_confirmAmount.html?carLicense=' + encodeURI(value.carLicense) + '&plateSource=' + encodeURI(value.parkingSource);
		     }else{
		     	//跳入车牌列表页
		     location.href = '/fe/fe/sea-parking/html/parking_carLicenseList.html';
		     }
	     }
		});
	}else if(data.status == 5500){
    location.href = wechatUrl;
  }else{
    $('.errBox').show().find('.content').text(data.message);
    closePopDiv();
  }
}


//车牌验证
function isVehicleNumber(vehicleNumber) {
      var result = false;
      if (vehicleNumber.length == 7){
        var express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
        result = express.test(vehicleNumber);
      }
      return result;
  }

function provinceVerify(){ //验证省份
	var provinceReg = /^[\u4e00-\u9fa5]{1}/;
	var province = $('#province').val();
	console.log(province);
	  if(!provinceReg.test(province)){
      $('#firstLoginTip').show().find('.content').text('省份输入错误');
	  	return false;
	  }else{
	  	return true;
	  }
}

function cardNumberVerify(){ //验证车牌号码
	var cardNumberReg = /^[a-zA-Z]{1}[a-zA-Z_0-9]{5}$/;
	var cardNumber = $('#cardNumber').val();
	  if(!cardNumberReg.test(cardNumber)){
      $('#firstLoginTip').show().find('.content').text('车牌号输入错误');
	  	return false;
	  }else{
	  	return true;
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
  var r = decodeURIComponent(window.location.search).substr(1).match(reg);
  //var r = urlsearch.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

function getQueryString(key) {
    var search = decodeURIComponent(location.search);
    var reg = new RegExp(".*" + key + "\\=" + "([^&]*)(&?.*|)", "g");
    return search.replace(reg, "$1");
}