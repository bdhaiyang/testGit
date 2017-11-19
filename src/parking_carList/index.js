import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import cookie from '../_commons/js/js.cookie.js';
import { getDomain } from '../_commons/js/business/domain';
import {pullToFresh} from '../_commons/js/pullToFresh.js';
/**
 * Sample
 */

$(function init() {
  var firstLogin = getUrlParam('firstLogin'); //是否第一次登录
  var token = cookie.get('token');
  var isClick = true;
  var wechatUrl = cookie.get('payUrl');
 
  $('#root').html(
    rootTpl({
      name: 'World',
      wechatUrl: wechatUrl
    })
  );
  $('section').hide();
  $('.g-loading').show();

  $("head").append('<meta name="x5-orientation" content="portrait"><meta name="screen-orientation" content="portrait">');
  
  //第一次登录的话弹出的提示框
  $('#firstLoginTipBtn').click(function () {  //关闭提示并跳转到绑定车牌号页
    $('#firstLoginTip').hide();
  });
  $('#delTipBtn').click(function () {
    $('#delTip').hide();
  });

  showD();

  //点击重新加载
  $('#reLoad').click(function(){
    $(this).addClass('curBtn');
    setTimeout(function(){
      $('#reLoad').removeClass('curBtn');
    }, 100);
    location.reload();
  });

  /**
   * 查询车牌列表
   * @param  {String} )
   * @return {[type]}   [description]
   */
  function showD(){
    $.ajax({
      url: getDomain('http://api.', 'ffan.com/iswxxapi/v1/cars'),//"http://api.sit.ffan.com/iswxxapi/v1/cars",
      dataType: "json",
      data: {
        token: token
      },
      success: getCarLiscense,
      error: (error) => {
        //404或网络不好          
        $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
        $('.g-loading').hide();
      },
      timeout:30000
    });
  }


  /**
   * 下拉重新加载页面
   */
  var pullEl = $('section');
  pullToFresh(pullEl);






  $('#closeBtn').on('click', function () {
    $('#inParkNone').hide();
  });
  $('#telBtn').on('click', function () {
    $('#inParkNone').hide();
  });
  $('#addCarLicenseBtn').on('click', function () {
    location.href = '/fe/fe/sea-parking/html/parking_bind.html?source=0';
  });


  function getCarLiscense(data) {
    data = data || {};
    $('.notWork').hide();
    $('.g-loading').hide();
    $('section').show();
    if (firstLogin == 1) {
      $('.errBox').show().find('.content').text('已实现与广场车辆信息共享');
      closePopDiv();
    }
    if (data && data.status == 200) {
      var result = data.data; //获取的车牌信息json数组
      if (result.data == null) {
        //$('#carLicenseData').append("<li style='box-shadow: none;color:#333;font-size:13px;'>您还未添加车辆</li>");
      } else {
        var listData = result.data;
        console.log('车牌信息：', result);
        var inParkType = result.inParkType; //如果都不在场，显示提示信息弹出层     0：用户车辆都不在场内  1：用户车牌仅在飞凡停车场  2：用户车牌仅在ETCP停车场  3：用户既有车牌在飞凡停车场又有车牌在ETCP停车场

        if (listData.length <= 3 && listData.length > 0) {
          $.each(listData, function (index, item) {
            if (listData.length == 3) {
              $('#addCarLicenseBtn').attr("disabled", true);
            }
            console.log('item:', item.isInPark, index);
            var btnText = '';
            if (item.isInPark == 0) {//isInPark = 0 未入场
              btnText = '未入场';
              $("#carLicenseData").append(
                "<li><p><span>" + item.carLicense + "</span><span class='delCarLicenseBtn' data-carlicense=" + item.carLicense +"><i class='iconfont icon-del1'></i></span></p></li>");

            } else if (item.isInPark == 3) {
              btnText = '已缴费';
              $("#carLicenseData").append(
                "<li><p><span>" + item.carLicense + "</span><span class='delCarLicenseBtn' data-carlicense=" + item.carLicense +"><i class='iconfont icon-del1'></i></span></p></li>");

            } else if (item.isInPark == 4) {
              btnText = '超时缴费';
              $("#carLicenseData").append(
                "<li><p><span>" + item.carLicense + "</span><span class='delCarLicenseBtn' data-carlicense=" + item.carLicense +"><i class='iconfont icon-del1'></i></span></p></li>");

            } else {
              //去缴费
              btnText = '去缴费';
              $("#carLicenseData").append(
                "<li><p><span>" + item.carLicense + "</span><span class='delCarLicenseBtn' data-carlicense=" + item.carLicense +"><i class='iconfont icon-del1'></i></span></p></li>");

            }

          });


          $('.delCarLicenseBtn').on('click', function () {
            var carLicense = $(this).data('carlicense');
            $('#tip').show().find('.content').text('您确定要删除该车辆吗？');
            $('#confirmBtn').click(function () {
              if(isClick){
                isClick = false;
                $('#tip').hide();
                $.ajax({
                  url: getDomain('http://api.', 'ffan.com/iswxxapi/v1/member/batchBindCarLicense'),//'http://api.sit.ffan.com/iswxxapi/v1/member/batchBindCarLicense',//'http://10.1.80.42:8081/iswx/xapi/member/batchBindCarLicense',
                  type: 'post',
                  dataType: 'json',
                  data: {
                    cars: carLicense,
                    token: token,
                    type: 2
                  },//encodeURI('carLicense=' + carLicense + '&type=1&token=' + token),
                  success: delCardNumber,
                  error: function (XMLHttpRequest, textStatus, errorThrown) {
                    $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
                    closePopDiv();
                    isClick = true;
                  },
                  timeout:30000
                });
              }
              
            });
            $('#cancleBtn').on('click', function () {
              $('#tip').hide();
            });

          });
        }

      }
      var inParkCount = result.inParkCount; //在场车牌数量
      var totalCount = result.totalCount; //车牌总数 用来判断新增车牌按钮是否可点
      var leftCount = 3 - totalCount;
      if(leftCount > 0){
        $('#leftCount').text(leftCount);
      }else{
        $('.tip').text('温馨提示：您已不能添加车辆');
      }
    }else if(data.status == 5500){
      location.href = wechatUrl;
    }else{
      $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
      //$('.errBox').show().find('.content').text(data.message);
      //closePopDiv();
      //$('section').html('<p>' + data.message + '</p>');

    }
  }


  /**
   * 2s后弹框自动消失
   */
  function closePopDiv() {
    setTimeout(function (){
      $('.errBox').hide();
    }, 2500);
  }

  function delCardNumber(data) {
    var token = cookie.get('token');
    isClick = true;
    data = data || {};
    if (data && data.status == 200) {
      var result = data.data;
      location.href = '/fe/fe/sea-parking/html/parking_carList.html';      
    }else if(data.status == 5500){
      location.href = wechatUrl;
    } else {
      $('.errBox').show().find('.content').text(data.message);
      closePopDiv();
    }
  }

  function getUrlParam(name) { //通过这个函数传递url中的参数名就可以获取到参数code的值
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    //var r = urlsearch.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }


});

