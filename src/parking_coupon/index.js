import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import { getDomain } from '../_commons/js/business/domain';
import cookie from '../_commons/js/js.cookie.js';
import noData from './assets/images/noData.png';
import {pullToFresh} from '../_commons/js/pullToFresh.js';

/**
 * Sample
 */
$(function init() {
  var carLicense = '';
  var token = cookie.get('token');
  var wechatUrl = cookie.get('payUrl');
  
  $('#root').html(
    rootTpl({
      name: 'World',
      wechatUrl: wechatUrl
    })
  );
  $("head").append('<meta name="x5-orientation" content="portrait"><meta name="screen-orientation" content="portrait">');
  $('section').hide();
  $('.g-loading').show();

  var pullEl = $('section');
  pullToFresh(pullEl);
   
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
        url:getDomain('http://api.', 'ffan.com/iswxxapi/v1/parkingCoupons'),//'http://api.sit.ffan.com/iswxxapi/v1/callPay',//'http://10.209.232.169:11042/iswx/xapi/' + encodeURI(carLicense) + '/calPay',
        type:'get',
        dataType:'json',
        /*jsonp:'callback',*/
        data:encodeURI('token=' + token),//encodeURI('carLicense=' + carLicense +'&token=' + token), //
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
      $('section').show();
	   	data = data || {};
	  	if (data && data.status == 200) {
        var result = data.data;
        if(result.length != 0){
          for (var i = 0 ; i < result.length; i++) {
            $('.couponList').append(
              "<li><div class='amount fl'>&yen;<span>"
              + result[i].origPrice + "</span></div><div class='desc'><h4>"
              + result[i].title + "</h4><p>"
              + result[i].subTitle + "</p><p>有效期至：<span>"
              + getLocalTime(result[i].endTime) + "</span></p><span class='timeOutTip' style='display:none;'>即将过期</span></div></li>"
              );
          }
        }else{
          $('.noData').show().find('p').eq(0).html("<img src="+ noData + ">");
          //$('.couponList').append("<li style='padding:20px;background:#fff;font-size:16px;'>您没有可用的停车券</li>");
        }     
      }else if(data.status == 5500){
        location.href = wechatUrl;
      }else{
        $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
        //$('#firstLoginTip').show().find('.content').text(data.message);
        //$('.errBox').show().find('.content').text(data.message);
        //closePopDiv();
      }
	
   }

   //第一次登录的话弹出的提示框
    /*$('#firstLoginTipBtn').click(function () {  //关闭提示
      $('#firstLoginTip').hide();
    });*/

    /**
   * 2s后弹框自动消失
   */
    function closePopDiv() {
      setTimeout(function (){
        $('.errBox').hide();
      }, 1500);
    }

    //另外一种把时间戳转化成日期-----------------------------毫秒转时间

    function getLocalTime(nS) {     
       return new Date(parseInt(nS)).toLocaleDateString().replace(/年|月/g, "-").replace(/日/g, " ");      
    } 

});
