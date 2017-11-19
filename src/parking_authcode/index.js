import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import {getDomain} from '../_commons/js/business/domain';
import {getParamByName} from '../_commons/js/urlUtil';
import {ajaxPost} from  '../_commons/js/ajaxUtil';

/**
 * Sample
 */
$(function init() {
  $('#root').html(
    rootTpl({name: 'World'})
  );

  var postData = {};
  postData.callId = getParamByName('callId');
  postData.signValue = getParamByName('signValue');
  postData.mobile = getParamByName('mobile');
  postData.authType = getParamByName('authType');
  postData.callback = getParamByName('callback');

  if(postData.authType && postData.authType == 3 && postData.signValue && postData.callId && postData.mobile && postData.callback){
	$.ajax({
	  	url:getDomain('http://api.','ffan.com/iswxxapi/v1/tauth/authcodes'),
	  	type:'post',
	  	data:postData,
	  	success:function(data){
	  		if(data.status == 200){
	  			var url = postData.callback + '?authCode=' + encodeURIComponent(data.data) + '&status=' + data.status + '&message=' + encodeURIComponent(data.message);
		  		location.href = postData.callback + '?authCode=' + encodeURIComponent(data.data) + '&status=' + data.status + '&message=' + encodeURIComponent(data.message);
	  		}else{
	  			var url = postData.callback + '?status=' + data.status + '&message=' + encodeURIComponent(data.message);
	  			location.href = postData.callback + '?status=' + data.status + '&message=' +data.message;			
	  		}
	  	},
	  	error:function(XMLHttpRequest, textStatus, errorThrown){
	  		$('.notWork').show().find('p').eq(1).text('网络请求失败，请检查您的网络设置。');
	  	},
	  	timeout:50000
	});
  }else{
  	let item = [];
  	let msg = '';
  	for(var key in postData){
  		if(!postData[key]){
  			item.push(key);
  		}
  	}
  	if(!item.length && postData.authType != 2){
  		msg = 'authtype的值不符合要求';
  	}else{
  		msg = item + '不能为空';
  	}
  	location.href = 'http://www.ffan.com/new/index.html?status=4001&message=' + msg;
  } 

});
