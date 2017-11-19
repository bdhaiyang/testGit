import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import {getDomain} from '../_commons/js/business/domain';
import {getParamByName} from '../_commons/js/urlUtil';
import {ajaxGet} from  '../_commons/js/ajaxUtil';

/**
 * Sample
 */

//接口调用
var loadInitData = () => {
	var urlId = getParamByName("id");
	var clientType = getParamByName("clientType");
	var token = getParamByName("token");
	var p1 = getParamByName("p1");
	var p2 = getParamByName("p2");
	var p3 = getParamByName("p3");
	var p4 = getParamByName("p4");
	var p5 = getParamByName("p5");
	var p6 = getParamByName("p6");
	var p7 = getParamByName("p7");
	var p8 = getParamByName("p8");
	var p9 = getParamByName("p9");
	var p10 = getParamByName("p10");
	var p11 = getParamByName("p11");
	var p12 = getParamByName("p12");
	var p13 = getParamByName("p13");
	var p14 = getParamByName("p14");
	var p15 = getParamByName("p15");
	var pInfo = "p1="+p1+"&p2="+p2+"&p3="+p3+"&p4="+p4+"&p5="+p5+"&p6="+p6+"&p7="+p7+"&p8="+p8+"&p9="+p9+"&p10="+p10+"&p11="+p11+"&p12="+p12+"&p13="+p13+"&p14="+p14+"&p15="+p15;
	//$.cookie('puid','cp02EFA0D183A01767FC2BD330C5E8E793');
	//document.cookie="puid=cp02EFA0D183A01767FC2BD330C5E8E793;domain=*.ffan.com;path=/";
	//var strCookie = document.cookie;  
	//var urlId = 26;
	//alert(strCookie);
	var domain = getDomain("https://api.","ffan.com/client/v1/coupons/"+ urlId +"/overview?clientType="+clientType+"&token="+token+"&"+pInfo);
	//return ajaxGet(domain, {}, { xhrFields: { withCredentials: true} });
	return ajaxGet(domain, {}, {});
}



$(async function init() {
 try{
 	const rootData = await loadInitData();
	
	if(rootData.explain != ""){
		$('#root').html(
		    rootTpl(rootData)
		);
	}else{
		$('#root').html(
		    rootTpl()
		);
		$(".items dd").text("暂无内容说明");	
	}
 }catch(e){
  
 }
});
