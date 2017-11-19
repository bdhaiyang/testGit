import $ from 'jquery';
import './assets/index.less';
import cookie from '../_commons/js/js.cookie.js';
import { getDomain } from '../_commons/js/business/domain';


    var driving;
    var userdata = getuserdata();
    var lnglats = [];
    //lnglats = [{"pop":[116.230654,39.912747],"name":"石景山万达广场","total":1000,"price":"5.00元/小时","leaveNum":"未联网","distancedata":0},{"pop":[116.365868,39.912289],"name":"ETCP对接测试专用广场","total":1000,"price":"暂无","leaveNum":"未联网","distancedata":15.05},{"pop":[116.443849,39.978192],"name":"爱琴海测试停车场","total":256,"price":"2元/小时测试","leaveNum":"紧张","distancedata":23.95},{"pop":[116.47,39.9],"name":"北京通州万达广场","total":1000,"price":"0.01元/小时起","leaveNum":"充足","distancedata":26.65},{"pop":[125.288319,43.833513],"name":"南京大观天地mall","total":1000,"price":"4元/小时起","leaveNum":"充足","distancedata":1032.22}];
    try{
        /*初始化数据*/
        init();
        
    }catch(e){
        alert('数据错误');
    }    

    function init(){
        //基本地图加载
        window.map = new AMap.Map("container", {
            resizeEnable: true,
            center: [userdata.userLng, userdata.userLat],//地图中心点
            zoom: 12 //地图显示的缩放级别
        });
        map.clearMap();  // 清除地图覆盖物
        //构造路线导航类
        driving = new AMap.Driving({
            map: map,
            panel: "panel"
        }); 
        showD(userdata);
        addMarker(); 

        $('#reLoad').click(function() {
            $(this).addClass('curBtn');
            setTimeout(function() {
                $('#reLoad').removeClass('curBtn');
            }, 100);
            location.reload();
        });       
    }

   

    function addMarker(){
        //map.clearMap();  // 清除地图覆盖物
        var infoWindow = new AMap.InfoWindow({offset:new AMap.Pixel(0,-30)});       

        for (var i = 0; i < lnglats.length; i++) {
            var pop = lnglats[i].pop;
            var name = lnglats[i].name;
            var markers = new AMap.Marker({
                //icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                position:pop,
                map:map
            });
            markers.content = '<h5>' 
            + lnglats[i].name + '<span><i class="iconfont icon-dingwei"></i>'
            + lnglats[i].distancedata + '公里</span></h5><div class="parkingPlace"><p>总车位<span>'
            + lnglats[i].total + '</span><i>•</i></p><p>剩余车位<span>'
            + lnglats[i].leaveNum + '</span><i>•</i></p><p>收费标准<span>'
            + lnglats[i].price + '</span><i></i></p></div><a href="javascript:void(0)" data-pop='+ pop +' data-name='+ name+' class="toThere"><i class="iconfont icon-daohang"></i>到这去</a>';
            markers.on('click',markerClick);     
        }

        $('body').on('click','.toThere',function(e){         
            var pop = $(this).data('pop').split(","); 
            var name = $(this).data('name'); 
 
            driving.searchOnAMAP({
                origin:new AMap.LngLat(userdata.userLng, userdata.userLat),
                destination: new AMap.LngLat(Number(pop[0]),Number(pop[1]))
            });           
        });

        function markerClick(e) {
            $('.amap-marker').find('img').attr('src', 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png');
            $('#tipInfo').html(e.target.content).show();
            //infoWindow.setContent(e.target.content);
            //infoWindow.open(map, e.target.getPosition());
            // 点标记中的图标
            var markerImg = document.createElement("img");
            markerImg.className = "markerlnglat";
            markerImg.src = "http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png";

            e.target.setContent(markerImg); //更新点标记内容
            //e.target.setPosition(e.target.getPosition()); //更新点标记位置
            $('.markerlnglat').parent().removeClass('amap-marker-content').css({
                'position': 'absolute',
                'width': '19px',
                'height': '33px',
                'opacity': 1
            });

            
        }
      
    }   

    function showD(data) {
        let userdata = data;
        $.ajax({
            url: getDomain('http://api.', 'ffan.com/cloudparking/v3/carParks'),
            dataType: "json",
            async:false, 
            data: {
                offset: 0,
                limit: 10000,
                cityId: userdata.cityId,
                userLat: userdata.userLat,
                userLng: userdata.userLng,
            },
            success: allparkingdata,
            error: (error) => {
                $('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
            },
            timeout: 30000
        });
    }


    function allparkingdata(data){
        if (data && data.status == 0) {
            var result = data.data;
            for(var i = 0; i < result.length; i++){
                var itemPoint = new Array();
                if(result[i].latitude != '' && result[i].longitude != ''){
                    var latitudenow = userdata.userLat;
                    var longitudenow = userdata.userLng;
                    var distancedata = distance(latitudenow, longitudenow, result[i].latitude, result[i].longitude);
                    itemPoint = {
                        pop:[Number(result[i].longitude), Number(result[i].latitude)], 
                        name:result[i].name, 
                        total:result[i].totalParkingPlace, 
                        price:result[i].price,
                        leaveNum:result[i].availableParkingPlaceStr,
                        distancedata:distancedata
                    };
                    lnglats.push(itemPoint);
                }
                
            }
            
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