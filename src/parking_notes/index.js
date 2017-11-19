import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import image from './assets/images/icon.png';
import imageGray from './assets/images/iconGray.png';
import { getDomain } from '../_commons/js/business/domain';
import cookie from '../_commons/js/js.cookie.js';
import {iScroll} from '../_commons/js/iScroll.js';
/**
 * Sample
 */
$(function init() {
  var zNum = 0;
  var totalNum = 0;
  var isFresh = true; 
  var carLicense = '';
  var token = cookie.get('token');
  var wechatUrl = cookie.get('payUrl');

  $("head").append('<meta name="x5-orientation" content="portrait"><meta name="screen-orientation" content="portrait">');
  $('#root').html(
    rootTpl({
    	name: 'World',
    	image: image,
      wechatUrl: wechatUrl
    })
  );

  $('#parkingNotes').hide();
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

loaded();
var myScroll,
  pullDownEl, pullDownOffset,
  pullUpEl, pullUpOffset,
  generatedCount = 0;

function pullDownAction() {

  setTimeout(function () {  // <-- Simulate network congestion, remove setTimeout from production!
    var el, li, i;
    el = document.getElementById('parkingNotes');

    location.reload();

    //myScroll.refresh();   // Remember to refresh when contents are loaded (ie: on ajax completion)
  }, 1000); // <-- Simulate network congestion, remove setTimeout from production!
}

function pullUpAction() {
  setTimeout(function () {  // <-- Simulate network congestion, remove setTimeout from production!
    var el, li, i;
    el = document.getElementById('parkingNotes');
    if(isFresh){
      zNum += 10;
      if(totalNum > zNum){
        $('.pullUpIcon').show();
        $.ajax({
          url:getDomain('http://api.', 'ffan.com/iswxxapi/v2/member/parkingRecords'),
          type:'get',
          dataType:'json',
          data:encodeURI('orderStatus=0&offset='+ zNum +'&limit=10&token=' + token),
          success:showData,
          error: function (XMLHttpRequest, textStatus, errorThrown) {
              //404或网络不好          
            $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
            $('.g-loading').hide();
            isFresh = false;
            $("#pullUp").hide();
            $("#pullDown").hide();
          },
          timeout:30000
        });
      }else{
        $('.pullUpIcon').hide();
        $('.pullUpLabel').text('已经到最底部了');
      }

      
    }
    
    //myScroll.refresh();   // Remember to refresh when contents are loaded (ie: on ajax completion)
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
      $('.pullUpIcon').show();
      if (pullDownEl.className.match('loading')) {
        pullDownEl.className = '';
        pullDownEl.querySelector('.pullDownLabel').innerHTML = '刷新...';
      } else if (pullUpEl.className.match('loading')) {
        pullUpEl.className = '';
        pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载更多...';
      }
    },
    onScrollMove: function () {
      //$('.pullUpIcon').show();
      if (this.y > 5 && !pullDownEl.className.match('flip')) {
        pullDownEl.className = 'flip';
        pullDownEl.querySelector('.pullDownLabel').innerHTML = '刷新...';
        this.minScrollY = 0;
      } else if (this.y < 5 && pullDownEl.className.match('flip')) {
        pullDownEl.className = '';
        pullDownEl.querySelector('.pullDownLabel').innerHTML = '刷新...';
        this.minScrollY = -pullDownOffset;
      } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
        $('.pullUpIcon').show();
        pullUpEl.className = 'flip';
        pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载更多...';
        this.maxScrollY = this.maxScrollY;
      } else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
        $('.pullUpIcon').show();
        pullUpEl.className = '';
        pullUpEl.querySelector('.pullUpLabel').innerHTML = '加载更多...';
        this.maxScrollY = pullUpOffset;
      }
    },
    onScrollEnd: function () {
      $('.pullUpIcon').show();
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

  


  function showD(){
      $.ajax({
        url:getDomain('http://api.', 'ffan.com/iswxxapi/v2/member/parkingRecords'),
        type:'get',
        dataType:'json',
        async:false,
        data:encodeURI('orderStatus=0&offset=' + zNum + '&limit=10&token=' + token),
        success:showData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            //404或网络不好          
            $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
            $('.g-loading').hide();
            isFresh = false;
            $("#pullUp").hide();
            $("#pullDown").hide();
          },
          timeout:30000
      });
  }
  

  //第一次登录的话弹出的提示框
   /* $('#firstLoginTipBtn').click(function () {  //关闭提示
      $('#firstLoginTip').hide();
    });*/

  function showData(data){
      $('#parkingNotes').show();
      $('.notWork').hide();
      $('.g-loading').hide(); 
	   	data = data || {};
      //data = {status:200,message:"成功",data:{total:0,data:[]}};
	  	if (data && data.status == 200) {
        totalNum = data.data.total;
        if(data.data.total < 10){ //停车记录少不加载更多
          isFresh = false;
          $("#pullUp").hide();
        }
  	    var result = data.data.data;

        if(result.length != 0){
          for (var i = 0 ; i < result.length; i++) {
            if(result[i].status == 1){ //待支付
              $('#parkingNotes').append(
              "<div class='plateItem'><ul><li class='orderStatus'><p class='num'>"
              + result[i].carLicense + "</p><a class='goPay' data-parkingsource=" + result[i].orderFlag +" data-carlicense='"+ result[i].carLicense +"' href='javascript:void(0)'>去缴费<i class='iconfont icon-xiangxia'></i></a></li><li class='pro'  data-orderflag="
              + result[i].orderFlag +" data-orderno="+ result[i].orderNo +"><span><img src="
              + image + "></span><ul><li>"
              + result[i].plazaName + "</li><li>" 
              + getLocalTime(result[i].payTime) +'&nbsp;&nbsp;'+ formatSeconds(result[i].parkingTime) +"<span class='fr red'>&yen;" 
              + parseFloat(result[i].money).toFixed(2) + "</span></li></ul></li></ul></div>"
              );
            }else{
              $('#parkingNotes').append(
              "<div class='plateItem'><ul><li class='orderStatus'><p class='num'>"
              + result[i].carLicense + "</p></li><li class='pro' data-orderflag="+ result[i].orderFlag +" data-orderno="+ result[i].orderNo +"><span><img src="
              + image + "></span><ul><li>"
              + result[i].plazaName + "</li><li>" 
              + getLocalTime(result[i].payTime) +'&nbsp;&nbsp;'+ formatSeconds(result[i].parkingTime) +"<span class='fr red'>&yen;" 
              + parseFloat(result[i].money).toFixed(2) + "</span></li></ul></li></ul></div>"

              );
            }            
          }
          $('.plateItem .pro').on('click', function(){
            //点击跳转到详情页
            location.href = '/fe/fe/sea-parking/html/parking_notesDesc.html?orderNo=' + $(this).data('orderno') + '&orderFlag=' + $(this).data('orderflag');
            //$(this).find('.num').text();
          });
          $('.goPay').on('click',function(){
            var carLicense = $(this).data('carlicense');
            var plateSource = $(this).data('parkingsource');
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

                    var returnUrl = encodeURIComponent(getDomain('http://h5.','ffan.com/fe/fe/sea-parking/html/parking_payResult.html?carLicense=') + encodeURIComponent(carLicense)+ '&plateSource=' + encodeURIComponent(plateSource));
                    var extInfo = {
                      body: "支付停车费用",
                      title: "车牌号：" + carLicense,
                      countDown: leftTime
                    };
                    extInfo = encodeURIComponent(JSON.stringify(extInfo));
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
          });
          myScroll.refresh(); 
        }else if(data.data.total == 0){
          //$('#parkingNotes').html("<p style='padding:20px;font-size:14px;'>暂无停车记录</p>");
          $('.noData').show().find('p').eq(0).html("<img src="+ imageGray + ">");
          isFresh = false;
        }
      
        
         // Remember to refresh when contents are loaded (ie: on ajax completion)

	    }else if(data.status == 5500){
        location.href = wechatUrl;
      }else {
        isFresh = false;
        $("#pullUp").hide();
        $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
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
   //另外一种把时间戳转化成日期-----------------------------

    function getLocalTime(nS) {     
       return new Date(parseInt(nS) * 1000).toLocaleDateString().replace(/年|月/g, "-").replace(/日/g, " ");      
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

});
