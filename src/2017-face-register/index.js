import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import {bindEvent, getToken, setEleBackground} from '../2017-face-index/assets/utils'
import {getParamByName} from '../_commons/js/urlUtil'

/**
 * Sample
 */
function getImgKey() {
  return getParamByName('img');
}
function getImgUrl() {
  let imgKey = getImgKey();
  if (imgKey) {
    return `http://api.ffan.com/tfs/v1/files/${getImgKey()}`
  }

  return null;
}
$(function () {
  if(typeof wx !== 'undefined') {
    getToken();
  }
  $('#root').html(
    rootTpl()
  );
  let resultObj = {};
  bindEvent('uploadPhoto', resultObj);
  wx.error(function (res) {
    console.log('wx.error');
    alert(res.errMsg);
  });

  let $uploadPhoto = $('#uploadPhoto');
  let bgUrl = getImgUrl();
  resultObj.bgKey = getImgKey();

  if (bgUrl) {
    setEleBackground($uploadPhoto, bgUrl);
  }

  let $phoneNumberInput = $('#phoneNumberInput'),
    $btnContent = $('#btnContent'),
    $sendCode = $('#sendCode'),
    $registerBtn = $('#registerBtn'),
    $validateCodeInput = $('#validateCodeInput'),
    $roundedTwo = $('#roundedTwo');

  $phoneNumberInput.on('input', () => {
    let val = $phoneNumberInput.val();
    if (val && (/^1[3456789]\d{9}$/.test(val))) {
      $sendCode.addClass('active')
    } else {
      $sendCode.removeClass('active')
    }
  });

  $sendCode.bind('click', () => {
    let phone = $phoneNumberInput.val();
    if (!phone) {
      alert("手机号不能为空");
      return;
    }
    if (!(/^1[3456789]\d{9}$/.test(phone))) {
      alert("手机号码有误，请重填");
      return false;
    }
    $.ajax({
      method: "POST",
      url: "http://api.ffan.com/faceperception/v1/user/verifycode",
      data: {mobile: phone},
      success: function (res) {
        $sendCode.attr('disabled', true);
        let allTime = 60;
        $btnContent.html(allTime);
        let timerId = setInterval(() => {
          if (allTime) {
            allTime--;
            $btnContent.html(allTime);
          } else {
            clearInterval(timerId);
            $sendCode.attr('disabled', false);
            $btnContent.html('发送验证码');
          }
        }, 1000);
      },
      error: function (e) {
        alert('验证码发送失败');
      }
    });
  });
  let registerHandler = () => {
    if (!$validateCodeInput.val()) {
      alert('请输入验证码');
      return;
    }
    if (!resultObj.bgKey) {
      alert("请先完成人脸采集");
      return false;
    }
    $registerBtn.unbind('click');
    $.ajax({
      method: "POST",
      url: "http://api.ffan.com/faceperception/v1/user/mobile",
      data: {
        mobile: $phoneNumberInput.val(),
        verifyCode: $validateCodeInput.val(),
        imgKey: resultObj.bgKey,
        BizID: 'BO_319726'
      },
      success: function (res) {
        if (typeof res == 'string') {
          res = JSON.parse(res);
        }
        if (res && res.status == 200) {
          location.href = 'http://h5.ffan.com/fe/fe/sea-parking/html/2017-face-success.html'
        } else {
          $registerBtn.bind('click', registerHandler);

          alert(res.message);
        }
      },
      error: function (e) {
        $registerBtn.bind('click', registerHandler);

        alert(`注册失败：${e.message}`);
      }
    })
  };
  $registerBtn.bind('click', registerHandler);
});
