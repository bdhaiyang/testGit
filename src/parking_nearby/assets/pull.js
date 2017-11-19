import {iScroll} from '../../_commons/js/iScroll.js';
import { getDomain } from '../../_commons/js/business/domain';
export function pullToFresh(el,limit,zNum,cityId,userLat,userLng,isFresh,totalNum,allparkingdata){
loaded();
var myScroll,
  pullDownEl, pullDownOffset,
  pullUpEl, pullUpOffset,
  generatedCount = 0;

function pullDownAction() {
    location.reload();
}

function pullUpAction() {
  setTimeout(function () {  // <-- Simulate network congestion, remove setTimeout from production!
    if(isFresh){
      zNum += 5;
      if(totalNum > zNum){
        $('.pullUpIcon').show();
        $.ajax({
          url:getDomain('http://api.', 'ffan.com/cloudparking/v3/carParks'),
          type:'get',
          dataType:'json',
          async:false,
          data:encodeURI('offset='+ zNum +'&limit='+limit+'&cityId=' + cityId + '&userLat=' + userLat + '&userLng=' + userLng),
          success:allparkingdata,
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
}