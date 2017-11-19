import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import {getDomain} from '../_commons/js/business/domain';
import {getParamByName} from '../_commons/js/urlUtil';
import {ajaxGet} from  '../_commons/js/ajaxUtil';

/**
 * Sample
 */
var loadInitData = () => {
	var p = parameter();
	console.log(p);
	//上生产里改成https
	var domain = getDomain("https://api.","ffan.com/client/v1/cards/description");
	return ajaxGet(domain, p, {});
}

//获取第三方传来的必写参数
function parameter(){
	var clientType = getParamByName("clientType");
	var wid = getParamByName("wid");
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
	var p = {
		clientType,
		wid,
		token,
		p1,
		p2,
		p3,
		p4,
		p5,
		p6,
		p7,
		p8,
		p9,
		p10,
		p11,
		p12,
		p13,
		p14,
		p15
	}
	return p;
}

$(async function init() {
	try{
		const rootData = await loadInitData();
		if(rootData !="" && rootData.storeDesc != ""){
			$('#root').html(
			    rootTpl(rootData)
			);
		}else{
			$('#root').html(
			    rootTpl()
			);
			$(".storeIntroduce").hide();	
			$(".noInfo").show();
		}
	}catch(e){

	}
	parameter();
});
