import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import {getDomain} from '../_commons/js/business/domain';
import {getParamByName} from '../_commons/js/urlUtil';
import {ajaxPost} from  '../_commons/js/ajaxUtil';

var errorTxt = {
	phone:{
		required:"请输入手机号",
		pattern:"手机号码格式不正确，请重新输入",
		valid:"手机号码错误"
	},
	code:{
		required:"请输入验证码",
		pattern:"手机验证码错误"
	}
}

//表单验证
function formRequired(){
	 $(".validate").find(".formtips").remove();
	 $(".textInput").css("border-color","#e7e7e7e");
	 $(".required").each(function(){
	 	if($(this).attr("id") == "phone"){
		 	var $value = $.trim($(this).val());
		 	if($value.length == 0 ){
				$(".validate").append('<span class="formtips onError">'+errorTxt.phone.required+'</span>');
				$(this).parent().addClass("error");
				return false;
			}else if(!/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/.test($value)){
				$(".validate").find(".formtips").remove();
				$(".validate").append('<span class="formtips onError">'+errorTxt.phone.pattern+'</span>');
				$(this).parent().addClass("error");
				return false;
			}else{
				$(".validate").find(".formtips").remove();
				$(this).parent().removeClass("error");
			}
		 }
		 if($(this).attr("id") == "codeNum"){
		 	var $value = $.trim($(this).val());
		 	if($value.length == 0 ){
				$(".validate").append('<span class="formtips onError">'+errorTxt.code.required+'</span>');
				$(this).parent().addClass("error");
				return false;
			}else if(!/^\d{6}$/.test($value)){
				$(".validate").append('<span class="formtips onError">'+errorTxt.code.pattern+'</span>');
				$(this).parent().addClass("error");
				return false;
			}else{
				$(".validate").find(".formtips").remove();
				$(this).parent().removeClass("error");
			}
		 }
	 }); 
}

//手机号码是否为空
function phoneNone(){
	$('#phone').on('input propertychange', function(){
		if($(this).val().length>0){
			$(".clearTxt").removeClass("hide");
		}else{
			$(".clearTxt").addClass("hide");
		}
	});
	$('#codeNum').on('input propertychange', function(){
		if($(this).val().length>0){
			$(".codeClearTxt").removeClass("hide");
		}else{
			$(".codeClearTxt").addClass("hide");
		}
	});
}

//文本框内容清除
function phoneDel(){
	$(".clearTxt").click(function(){
		$('#phone').val("");
		$(this).addClass("hide");
		$(".validate").find(".formtips").remove();
		$(".textInput").removeClass("error");
	});
	$(".codeClearTxt").click(function(){
		$('#codeNum').val("");
		$(this).addClass("hide");
		$(".validate").find(".formtips").remove();
		$(".textInput").removeClass("error");
	});
}

//接口调用
var loadInitData = (url, params) => {
	var domain = getDomain("https://api.","ffan.com/bo/v1/partnerUser/"+url);
	return ajaxPost(domain, params);
}

//获取第三方传来的必写参数
function parameter(){
	var promotionName = getParamByName("promotionName");
	var developerKey = getParamByName("developerKey");
	var wid = getParamByName("wid");
	var backUrl = getParamByName("backUrl");
	var code = getParamByName("code");
	var p = {
		promotionName,
		developerKey,
		wid,
		backUrl,
		code
	}
	return p;
}

//登录提交
function formSubmit(){
	$(".submitBtn").click(async function(){
		formRequired();
		var numError = $('.validate .onError').length;
        if(numError){
            return false;
        }
        var url = "login";
        var userName = $("#phone").val();
        var verifyCode = $("#codeNum").val();
        var p = parameter();
        Object.assign(p, {
        	userName,
        	verifyCode
        })
		try{
			const rootData = await loadInitData(url, p);
       		location.href = rootData.feedbackUrl;
		} catch(e){
			console.log(e);
			if(e.status == 4027 || e.status == 4025 || e.status == 4056 || e.status == 4057){
				$(".validate").append('<span class="formtips onError">'+e.message+'</span>');
			}else{
				location.href = getDomain("https://h5.","ffan.com/fe/fe/sea-parking/html/bo_error_page.html?parameter="+e.message);
			}
		}
	});
}

var InterValObj; //timer变量，控制时间  
var count = 60; //间隔函数，1秒执行  
var curCount;//当前剩余秒数
  
//倒计时 
function sendMessage() {  
	curCount = count;  
　　//设置button效果，开始计时  
     $(".btnSendCode").attr("disabled", "true").addClass("disabled");  
     $(".btnSendCode").val("" + curCount + "秒后重新发送");  
     InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次 
    
}  

//timer处理函数  
function SetRemainTime() {  
    if (curCount == 0) {                  
        window.clearInterval(InterValObj);//停止计时器  
        $(".btnSendCode").removeAttr("disabled").removeClass("disabled");;//启用按钮  
        $(".btnSendCode").val("获取短信验证码");  
    }  
    else {  
        curCount--;  
        $(".btnSendCode").val("" + curCount + "秒后重新发送");;  
    }  
}

//获取验证
function sendCode(){
	$(".btnSendCode").click(function(){
		var userName = $("#phone").val(); 
		var code = getParamByName("code");
		if(userName != ""){
			if(!/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/.test(userName)){
				$(".validate").find(".formtips").remove();
				$(".validate").append('<span class="formtips onError">'+errorTxt.phone.pattern+'</span>');
				return false;
			}else{
				$(".validate").find(".formtips").remove();
				verification(userName,code);
			}
		}else{
			$(".validate").append('<span class="formtips onError">请输入手机号</span>');
		}
     	
	});
}

//发送手机验证码
async function verification(userName,code){
	try{
		var url = "verifycodes";
		var p = {
			userName,
			type: 2,
			code

		}
		const rootData = await loadInitData(url,p);
		sendMessage();
	}catch(e){
		console.log(e.status);
		//status为1110表示未注册过
		if(e.status == "1110"){
			$(".popUpShow").show();
		}else{
			//$(".validate").append('<span class="formtips onError">'+e.message+'</span>');
			location.href = getDomain("https://h5.","ffan.com/fe/fe/sea-parking/html/bo_error_page.html?parameter="+e.message);
		}
	}
}

//未注册弹窗关闭
function closePop(){
	$(".delBtn").click(function(){
		$(".popUpShow").hide();
	});
}

//第三方名称增加
function thirdParty(){
 $(".title span").text(getParamByName("thirdParty"));
}

//页面跳转url加参数
function urlAdd(){
	var parUrl = window.location.search;
    parUrl = parUrl.substring(parUrl.indexOf("?"),parUrl.length);
	var url = getDomain("https://h5.","ffan.com/fe/fe/sea-parking/html/bo_register.html"+parUrl);
	$(".affirmBtn").attr("href",url);
	$(".registerBtn").attr("href",url);
}

//错误提示后，重新输入验证信息消失
function keyDown(){
	$("input").keydown(function(){
  		$(".validate").find(".formtips").remove();
		$(this).parent().removeClass("error");
	});
}

//初始化
$(function init() {
  $('#root').html(
    rootTpl()
  );
  formSubmit();
  sendCode();
  phoneDel();
  phoneNone();
  parameter();
  closePop();
  thirdParty();
  urlAdd();
  keyDown();
});