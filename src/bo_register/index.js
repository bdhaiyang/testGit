import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import {getDomain} from '../_commons/js/business/domain';
import {getParamByName} from '../_commons/js/urlUtil';
import {ajaxPost,ajaxGet} from  '../_commons/js/ajaxUtil';
/**
 * Sample
 */

var errorTxt = {
	phone:{
		required:"请输入手机号",
		pattern:"手机号码格式不正确，请重新输入",
		valid:"手机号码已存在"
	},
	passord:{
		required:"请输入密码",
		pattern:"请输入8-16位密码",
		valid:"密码错误"
	},
	code:{ 
		required:"请输入验证码",
		pattern:"手机验证码错误"
	},
	agreement:{
		required:"请选择同意用户注册协议"
	}
}

//表单验证
function formRequired(parId){
	 $(".validate").find(".formtips").remove();
	 $(".textInput").css("border-color","#e7e7e7e");
	 $("#"+ parId +" .required").each(function(){
	 	if($(this).attr("id") == "phone"){
		 	var $value = $.trim($(this).val());
		 	if(!/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9]|17[0|1|2|3|5|6|7|8|9])\d{8}$/.test($value)){
				$("#"+ parId +" .validate").find(".formtips").remove();
				$("#"+ parId +" .validate").append('<span class="formtips onError">'+errorTxt.phone.pattern+'</span>');
				$(this).parent().addClass("error");
				return false;
			}else{
				$("#"+ parId +" .validate").find(".formtips").remove();
				$(this).parent().removeClass("error");
			}
		 }
		 if($(this).attr("id") == "agreement"){
		 	var $value = $(this).prop("checked");
		 	if($value == false ){
				$("#"+ parId +" .validate").append('<span class="formtips onError">'+errorTxt.agreement.required+'</span>');
			 	return false;
			}else{
				$("#"+ parId +" .validate").find(".formtips").remove();
			}
		 }
		 if($(this).attr("id") == "codeNum"){
		 	var $value = $.trim($(this).val());
		 	if($value.length == 0 ){
				$("#"+ parId +" .validate").append('<span class="formtips onError">'+errorTxt.code.required+'</span>');
				$(this).parent().addClass("error");
				return false;
			}else if(!/^\d{6}$/.test($value)){
				$("#"+ parId +" .validate").append('<span class="formtips onError">'+errorTxt.code.pattern+'</span>');
				$(this).parent().addClass("error");
				return false;
			}else{
				$("#"+ parId +" .validate").find(".formtips").remove();
				$(this).parent().removeClass("error");
			}
		 }
		 if($(this).attr("id") == "password"){
		 	var $value = $.trim($(this).val());
		 	if($value.length == 0 ){
			   $("#"+ parId +" .validate").append('<span class="formtips onError">'+errorTxt.passord.required+'</span>');
			   $(this).parent().addClass("error");
			   return false;
			}else if(!/^[A-Za-z0-9]{8,16}$$/.test($value)){
				$("#"+ parId +" .validate").find(".formtips").remove();
				$("#"+ parId +" .validate").append('<span class="formtips onError">'+errorTxt.passord.pattern+'</span>');
				$(this).parent().addClass("error");
				return false;
			}else{
				$("#"+ parId +" .validate").find(".formtips").remove();
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
		if($(this).val().length == 11 && $("#agreement").prop("checked") == true){
			$(".nextBtn").removeClass("defaultColor").removeAttr("disabled");
		}else{
			$(".nextBtn").addClass("defaultColor").attr("disabled","disabled");
		}
	});
	$('#codeNum').on('input propertychange', function(){
		if($(this).val().length>0){
			$(".codeClearTxt").removeClass("hide");
		}else{
			$(".codeClearTxt").addClass("hide");
		}
	});
	$('#password').on('input propertychange', function(){
		if($(this).val().length>0){
			$(".passClearTxt").removeClass("hide");
		}else{
			$(".passClearTxt").addClass("hide");
		}
	});
}

//手机号码为空时防止提交
function phoneDel(){
	$(".clearTxt").click(function(){
		$('#phone').val("");
		$(".nextBtn").addClass("defaultColor").attr("disabled","disabled");
		$(this).addClass("hide");
		$(".validate").find(".formtips").remove();
		$(this).parent().removeClass("error");
	});
	$(".codeClearTxt").click(function(){
		$('#codeNum').val("");
		$(this).addClass("hide");
		$(".validate").find(".formtips").remove();
		$(".textInput").removeClass("error");
	});
	$(".passClearTxt").click(function(){
		$('#password').val("");
		$(this).addClass("hide");
		$(".validate").find(".formtips").remove();
		$(".textInput").removeClass("error");
	});
}

//接口调用
var loadInitData = (url,params) => {
	var domain = getDomain("https://api.","ffan.com/bo/v1/partnerUser/"+url);
	if(url != "checkRegister"){
		return ajaxPost(domain,params);
	}else{
		return ajaxGet(domain,params,{});
	}
}

//获取第三方传来的必写参数
function parameter(){
	var promotionName = getParamByName("promotionName");
	var developerKey = getParamByName("developerKey");
	var wid = getParamByName("wid");
	var code = getParamByName("code");
	var backUrl = getParamByName("backUrl");
	var p = {
		promotionName,
		developerKey,
		wid,
		backUrl,
		code
	}
	return p;
}

//注册点击下一步(判定手机号是否注册)
function nextValidate(){
	$(".nextBtn").click(async function(){
		var parId = "registerContainer";
		formRequired(parId);
		var numError = $('.registerContainer .onError').length;
        if(numError){
            return false;
        }
        var url = "checkRegister";
        var userName = $("#phone").val();
        var code = getParamByName("code");
        var p = {
        	userName,
        	code
        }
		try{
			const rootData = await loadInitData(url,p);
       		$(".telephone").text(userName);
       		verification(userName,code);
       		phoneNum();
       		sendMessage();
		}catch(e){
			//已注册
			if(e.status == "0"){
				$(".popUpShow").show();
			}else{
				location.href = getDomain("https://h5.","ffan.com/fe/fe/sea-parking/html/bo_error_page.html?parameter="+e.message);
			}
		}
	});
}

//手机未注册过(发送验证码)
async function verification(userName,code){
	var url = "verifycodes";
　　　　var p = {
		userName,
		type:1,
		code
	}
	try{
		const rootData = await loadInitData(url,p);
		$("#registerContainer").addClass("hide");
       	$("#registerSecond").removeClass("hide");
	}catch(e){
		location.href = getDomain("https://h5.","ffan.com/fe/fe/sea-parking/html/bo_error_page.html?parameter="+e.message);
	}
}

//注册
function register(){
	$(".submitBtn").click(async function(){
		var parId = "registerSecond"
		formRequired(parId);
		var numError = $('.registerSecond .onError').length;
        if(numError){
            return false;
        }
        var url = "register"
		var verifyCode = $("#codeNum").val();
		var userName = $("#phone").val();
		var password = $("#password").val();
        var p = parameter();
        Object.assign(p, {
			verifyCode,
			userName,
			password
		})
		try{
			const rootData = await loadInitData(url,p);
			location.href = rootData.feedbackUrl;
		}catch(e){
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
        $(".btnSendCode").removeAttr("disabled").removeClass("disabled");//启用按钮  
        $(".btnSendCode").val("获取短信验证码");  
    }  
    else {  
        curCount--;  
        $(".btnSendCode").val("" + curCount + "秒后重新发送");;  
    }  
} 

//手机号中间四位星号
function phoneNum(){
	var phonetxt = $(".telephone").text();
    var mphonetxt = phonetxt.substr(0, 3) + '****' + phonetxt.substr(7);
    $(".telephone").text(mphonetxt);
}

//获取验证
function sendCode(){
	$(".btnSendCode").click(function(){
		sendMessage();
	});
}

//显示密码
function lookPass(){
	$(".pass-open").click(function(){
		if ($("#password").attr("type") == "password") {
	        $("#password").attr("type", "text");
	        $(this).removeClass("icon-eyes").addClass("icon-eyes-open");
	    }else {
	        $("#password").attr("type", "password");
	        $(this).removeClass("icon-eyes-open").addClass("icon-eyes");
	    }
	});
}

//弹窗关闭
function closePop(){
	$(".delBtn").click(function(){
		$(".popUpShow").hide();
	});
}

//跳转url
function urlAdd(){
	var parUrl = window.location.search;
    parUrl = parUrl.substring(parUrl.indexOf("?"),parUrl.length);
	var urlagreement = getDomain("https://h5.","ffan.com/fe/fe/sea-parking/html/bo_member_agreement.html"+parUrl);
	var urlLogin = getDomain("https://h5.","ffan.com/fe/fe/sea-parking/html/bo_login.html"+parUrl);
	$(".agreement a").attr("href",urlagreement);
	$(".affirmBtn").attr("href",urlLogin);
	$(".icon-return").click(function(){
		location.href = urlLogin;
	});
}

//验证（如果手机号或会员协议为空，下一步btn为灰色）
function checkboxNone(){
	$("#agreement").click(function(){
		if(this.checked == false || $("#phone").val().length != 11){
			$(".nextBtn").addClass("defaultColor").attr("disabled","disabled");
		}else{
			$(".nextBtn").removeClass("defaultColor").removeAttr("disabled");
		}
	});
}

//验证后重新输入验证信息消失
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
  sendCode();
  phoneNum();
  lookPass();
  nextValidate();
  phoneNone();
  phoneDel();
  register();
  closePop();
  urlAdd();
  keyDown();
  checkboxNone();
});
