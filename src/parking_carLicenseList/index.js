import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import cookie from '../_commons/js/js.cookie.js';
import { getDomain } from '../_commons/js/business/domain';
import image from './assets/images/icon.png';
//import {pullToFresh} from '../_commons/js/pullToFresh.js';
import {iScroll} from '../_commons/js/iScroll.js';
/**
 * Sample
 */

$(function init() {
  var wechatUrl = cookie.get('payUrl');
  $('#root').html(
    rootTpl({
      name: 'World',
      image: image,
      wechatUrl: wechatUrl
  })
  );
  var firstLogin = getUrlParam('firstLogin'); //是否第一次登录
  var token = cookie.get('token');
  $('section').hide();
  $('.g-loading').show();

  $("head").append('<meta name="x5-orientation" content="portrait"><meta name="screen-orientation" content="portrait">');
  $('#carLicenseData').hide();
  
  //第一次登录的话弹出的提示框
  $('#firstLoginTipBtn').click(function () {  //关闭提示并跳转到绑定车牌号页
    $('#firstLoginTip').hide();
    //cookie.remove('firstLogin', { path: '' });
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
  if (firstLogin == 1) {
      setTimeout(function(){
        $('.errBox').show().find('.content').text('已实现与广场车辆信息共享');
        closePopDiv();
     },1000);
    }

  /**
   * 下拉重新加载页面
   */
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
      el = $('section');//document.getElementById('loadBox');
      //location.reload();
      $("#carLicenseData").find('li').remove();
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
    
    if (data && data.status == 200) {
      var result = data.data; //获取的车牌信息json数组
      $('#carLicenseData').show();
      $('.loadBox').hide();
      if (result.data == null) {
        $('section').hide();
        $('.noData').show();
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
                "<li><p class='img'><img src="
                + image + "></p><p class='content'><span>" 
                + item.carLicense + "</span><span>" 
                + btnText + "</span></p></li>");

            } else if (item.isInPark == 3) {
              btnText = '已缴费';
              $("#carLicenseData").append(
                "<li><p class='img'><img src="
                + image + "></p><p class='content'><span>" 
                + item.carLicense + "</span><span>" 
                + btnText + "</span></p>"
                + "<input type='button' class='btn btnBlue goPayPageBtn' value='查看' data-source=" + item.parkingSource 
                + " data-text=" + btnText + " data-carlicense=" + item.carLicense + "></li>");

            } else if (item.isInPark == 4) {
              btnText = '已超时';
              $("#carLicenseData").append(
                "<li><p class='img'><img src="
                + image + "></p><p class='content'><span>" 
                + item.carLicense + "</span><span class='red'>" 
                + btnText + "</span></p>"
                + "<input type='button' class='btn btnBlue goPayPageBtn' value='去缴费' data-source=" + item.parkingSource 
                + " data-text=" + btnText + " data-carlicense=" + item.carLicense + "></li>");

            }else {
              //去缴费
              btnText = '待缴费';
              $("#carLicenseData").append(
                "<li><p class='img'><img src="
                + image + "></p><p class='content'><span>" 
                + item.carLicense + "</span><span>" 
                + btnText + "</span></p>"
                + "<input type='button' class='btn btnBlue goPayPageBtn' value='去缴费' data-source=" + item.parkingSource
                + " data-text=" + btnText + " data-carlicense=" + item.carLicense + "></li>");
            }

          });

          $('.goPayPageBtn').on('click', function () {
            var carLicense = $(this).data('carlicense');            
            var plateSource = $(this).data('source');
            var btnText = $(this).data('text');
            goPayPage(carLicense, btnText, plateSource);
          });
          
        }
        var inParkCount = result.inParkCount; //在场车牌数量
        var totalCount = result.totalCount; //车牌总数 用来判断新增车牌按钮是否可点
        var leftCount = 3 - totalCount;
        console.log('totalCount',data.totalCount);
        $('#leftCount').text(leftCount);
      }
    }else if(data.status == 5500){
      location.href = wechatUrl;
    }else{
      $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
    }
  }

  function delCardNumber(data) {
    var token = cookie.get('token');
    data = data || {};
    if (data && data.status == 200) {
      var result = data.data;
      $('#tip').hide();
      location.href = '/fe/fe/sea-parking/html/parking_carLicenseList.html';
    }else if(data.status == 5500){
      location.href = wechatUrl;
    } else {
      $('#tip').hide();
      $('#delTip').show().find('.content').text(data.message);
    }
  }

  function goPayPage(carLicense,btnText,plateSource) {
    if(btnText == '已缴费'){
      location.href = '/fe/fe/sea-parking/html/parking_payResult.html?carLicense=' + carLicense + '&plateSource=' +plateSource;
    }else{
      //查询该车牌是否有未支付订单
      $.ajax({
        url: getDomain('http://api.', 'ffan.com/iswxxapi/v2/torders'), //'http://iswxxapi.intra.sit.ffan.com/iswx/xapi/parking/torders',//
        type: 'get',
        dataType: "json",
        data: encodeURI('token=' + cookie.get('token') + '&carLicense=' + carLicense),
        success: function (data) {
          data = data || {};
          if (data && data.status == 200) {
            var result = data.data;
            if (result.length != 0) {
              if (result[0].validTime != "" && result[0].systemTime != "") {
                var leftTime = result[0].validTime - result[0].systemTime;
              }
              var payOrderNo = result[0].payOrderNo;
              var returnUrl = encodeURIComponent(getDomain('http://h5.','ffan.com/fe/fe/sea-parking/html/parking_payResult.html?carLicense=') + encodeURIComponent(carLicense) + '&plateSource=' + encodeURIComponent(plateSource));
              var extInfo = {
                body: "支付停车费用",
                title: "车牌号：" + carLicense,
                countDown: leftTime
              };
              extInfo = encodeURIComponent(JSON.stringify(extInfo));
              location.href = getDomain('https://pu.','ffan.com/pay/order/') + payOrderNo + '/?returnUrl=' + returnUrl + '&extInfo=' + extInfo;

            }else {
              location.href = '/fe/fe/sea-parking/html/parking_confirmAmount.html?carLicense=' + carLicense + '&plateSource=' +plateSource;
            }
          }else if(data.status == 5500){
            location.href = wechatUrl;
          }else{
            //$('#firstLoginTip').show().find('.content').text(data.message);
            $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          $('.errBox').show().find('.content').text('网络请求失败，请检查您的网络设置。');
          closePopDiv();
        }
      }); 
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


});

