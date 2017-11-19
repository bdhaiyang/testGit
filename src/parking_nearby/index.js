import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import { getDomain } from '../_commons/js/business/domain';
import goIcon from './assets/images/icon.png';
import {pullToFresh} from './assets/pull.js';

/**
 * Sample
 */
var zNum = 0;
var totalNum = 0;
var limit = 30;
var isFresh = true; 
var userdata = getuserdata();
$('.g-loading').show();
$(function init() {    
    var pullEl = $('#nearbyList');    
    showD(userdata);
    pullToFresh(pullEl,limit,zNum,userdata.cityId,userdata.userLat,userdata.userLng,isFresh,totalNum,allparkingdata);  
    
    $('#root').html(
        rootTpl({ name: 'World' })
    );
    $('#reLoad').click(function() {
        $(this).addClass('curBtn');
        setTimeout(function() {
            $('#reLoad').removeClass('curBtn');
        }, 100);
        location.reload();
    });

    //基本地图加载
    window.map = new AMap.Map("container", {
            resizeEnable: true,
            center: [userdata.userLng, userdata.userLat],//地图中心点
            zoom: 12 //地图显示的缩放级别
    });
    var driving = new AMap.Driving({map: map,
            panel: "panel"}); //构造驾车导航类

    $('body').on('click', '.bodyrightlast', function() {
        var bbb = $(this).attr("id")
        var name = $(this).data('name'); 
        var latitude = $(this).data('latitude'); 
        var longitude = $(this).data('longitude'); 
        driving.searchOnAMAP({
            origin:new AMap.LngLat(userdata.userLng, userdata.userLat),
            destination:new AMap.LngLat(longitude, latitude)
        });
        //location.href='http://m.amap.com/navi/?start='+ userdata.userLng +','+ userdata.userLat +'&dest='+ longitude +','+ latitude +'&destName='+ name +'&naviBy=car&key=de727091773166ebc0d2941077385be2'
    })

});

function showD(data) {
    let userdata = data;
    $.ajax({
        url: getDomain('http://api.', 'ffan.com/cloudparking/v3/carParks'),
        dataType: "json",
        async:false,
        data: {
            offset: zNum,
            limit: 30,
            cityId: userdata.cityId,
            userLat: userdata.userLat,
            userLng: userdata.userLng
        },
        success: allparkingdata,
        error: (error) => {
            $('.g-loading').hide();
            $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
        },
        timeout: 30000
    });
}

function allparkingdata(data) {
    //var userdata = getuserdata(); 
       
    if (data && data.status == 0) {
        let create = data.total;
        totalNum = create;
        if(totalNum <=30){ //停车记录少不加载更多
          isFresh = false;
          $("#pullUp").hide();
        }
        for (var i = 0; i < data.data.length; i++) {
            let row = data.data[i];
            if (row.availableParkingPlaceStr == "充足") {
                row.class = "enough";
            } else if(row.availableParkingPlaceStr == "紧张"){
                row.class = "noenough";
            }else{
                row.class ='nonetwork';
            }
            if ((row.latitude != '') && (row.longitude != '')) {
                row.latitudenow = userdata.userLat;
                row.longitudenow = userdata.userLng;
                var distancedata = distance(row.latitudenow, row.longitudenow, row.latitude, row.longitude);
            } else {
                var distancedata = " ";
            }
            var div = $("<div class='bodyboreder'><div class='bodyleft'><div class='title'>" 
                + row.name + "<div class='bodyrightfirst'><i class='iconfont icon-dingwei'></i><span>" 
                + distancedata + "</span>公里</div></div><div class='numberright'><span>总车位：" 
                + row.totalParkingPlace + "</span><span class='fr'>剩余车位：<a class='" 
                + row.class + "'> " + row.availableParkingPlaceStr + "</a></span></div><div class='numberright'><span>价格：" 
                + row.price + "</span><div data-latitude="
                + row.latitude + " data-longitude="
                + row.longitude +" id=" 
                + row.plazaId + " data-name=" + row.name + " class='bodyrightlast'><i class='iconfont icon-daohang'></i> 到这去</div></div></div><div class='bodyright'></div></div>")
            
            $("#nearbyList").append(div); // body 拼接一个 div
            $('.g-loading').hide();
        }
    } else {
        isFresh = false;
        $('.g-loading').hide();
        $("#pullUp").hide();
        $('.notWork').show().find('p').eq(1).text('系统繁忙，请稍后重试！');
    }
}

function distance(lon1, lat1, lon2, lat2) {
    var EARTH_RADIUS = 6378.137; //赤道半径(单位m)  
    let distances = GetDistance(lon1, lat1, lon2, lat2);
    return distances;
    /** 
     * 转化为弧度(rad) 
     * */
    function rad(d) {
        return d * Math.PI / 180.0;
    }
    /** 
     * 基于googleMap中的算法得到两经纬度之间的距离,计算精度与谷歌地图的距离精度差不多，相差范围在0.2米以下 
     * @param lon1 第一点的精度 
     * @param lat1 第一点的纬度 
     * @param lon2 第二点的精度 
     * @param lat3 第二点的纬度 
     * @return 返回的距离，单位km 
     * */
    function GetDistance(lon1, lat1, lon2, lat2) {
        let radLat1 = rad(lat1);
        let radLat2 = rad(lat2);
        let a = radLat1 - radLat2;
        let b = rad(lon1) - rad(lon2);
        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * EARTH_RADIUS;
        s = Math.round(s * 100) / 100;
        return s;
    }
}


function getUrlParam(name) { //通过这个函数传递url中的参数名就可以获取到参数code的值
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}
function getuserdata(){
    var userdata = {};
    userdata.cityId = getUrlParam('cityId');
    userdata.userLat = getUrlParam('userLat');
    userdata.userLng = getUrlParam('userLng');
    return userdata;
}