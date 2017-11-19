/**
 * Created by fjywan on 2017/5/19.
 */
import { getDomain } from '../../_commons/js/business/domain';
function getWXinfoSuccess(data) {
  wx.config({
    debug: false,
    appId: data.appId, // 必填，公众号的唯一标识
    timestamp: data.timestamp, // 必填，生成签名的时间戳
    nonceStr: data.nonceStr, // 必填，生成签名的随机串
    signature: data.signature,// 必填，签名，见附录1
    jsApiList: [
      "chooseImage",
      'getLocalImgData',
      'uploadImage',
      'downloadImage'
    ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
  });
}

export function bindEvent(id, resultObj, needGoTo) {
  $(`#${id}`).bind('click', () => {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        let localId = res.localIds[0];
        if (needGoTo) {
          $('#root').html('').css('backgroundImage', `url("${require('./imgs/uploading.png')}")`);
        }
        wx.uploadImage({
          localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
          isShowProgressTips: 0, // 默认为1，显示进度提示
          success: function (res) {
            let serverId = res.serverId; // 返回图片的服务器端ID
            wx.downloadImage({
              serverId: serverId, // 需要下载的图片的服务器端ID，由uploadImage接口获得
              isShowProgressTips: 0, // 默认为1，显示进度提示
              success: function (res) {
                let localId = res.localId; // 返回图片下载后的本地ID
                wx.getLocalImgData({
                  localId: localId,
                  success: function (res) {
                    let localData = res.localData;
                    $.ajax({
                      type: 'POST',
                      url: 'http://api.ffan.com/faceperception/v1/user/imageCheck',
                      data: {
                        imgStr: localData.includes('base64,') ? localData.split('base64,')[1] : localData
                      },
                      success: function (res){
                        if (typeof res == 'string') {
                          res = JSON.parse(res);
                        }
                        if(res && res.status == 200) {
                          let imgKey = res.data.imgKey;
                          let imgUrl = res.data.imgUrl;
                          if (needGoTo) {
                            location.href = `${getDomain('http://h5.', 'ffan.com/fe/fe/sea-parking/html/2017-face-register.html')}?img=${imgKey}`;
                          }
                          let ele = $(`#${id}`);
                          setEleBackground(ele, imgUrl);
                          resultObj.bgKey = imgKey;
                        } else {
                          if (needGoTo) {
                            $('#root').css('background', `white`);

                            setTimeout(() => {
                              location.href = getDomain('http://h5.', 'ffan.com/fe/fe/sea-parking/html/2017-face-register.html');
                            }, 2000);
                          }
                          alert('上传的图片无法采集到人脸');
                        }
                      },
                      error: function (e) {
                        if (needGoTo) {
                          $('#root').css('background', `white`);
                          setTimeout(() => {
                            location.href = getDomain('http://h5.', 'ffan.com/fe/fe/sea-parking/html/2017-face-register.html');
                          }, 2000);
                        }
                        alert('上传图片失败。请确认网络连接状态后重试。');
                      }

                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  })
}

function base64encode(str){
  var out,i,len,base64EncodeChars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var c1,c2,c3;
  len=str.length;
  i=0;
  out="";
  while(i<len){
    c1=str.charCodeAt(i++)&0xff;
    if(i==len){
      out+=base64EncodeChars.charAt(c1>>2);
      out+=base64EncodeChars.charAt((c1&0x3)<<4);
      out+="==";
      break;
    }
    c2=str.charCodeAt(i++);
    if(i==len){
      out+=base64EncodeChars.charAt(c1>>2);
      out+=base64EncodeChars.charAt(((c1&0x3)<<4)|((c2&0xF0)>>4));
      out+=base64EncodeChars.charAt((c2&0xF)<<2);
      out+="=";
      break;
    }
    c3=str.charCodeAt(i++);
    out+=base64EncodeChars.charAt(c1>>2);
    out+=base64EncodeChars.charAt(((c1&0x3)<<4)|((c2&0xF0)>>4));
    out+=base64EncodeChars.charAt(((c2&0xF)<<2)|((c3&0xC0)>>6));
    out+=base64EncodeChars.charAt(c3&0x3F);
  }
  return out;
}

export function getToken() {
  $.ajax({
    type: 'get',
    url: 'http://api.ffan.com/app/v1/bo/v1/public/wechat/signTicket',
    data: {shareUrl: base64encode(window.location.href)},
    success: function (res){
      if(res && res.status == 200) {
        getWXinfoSuccess(res.data);
      }
    }
  });
}

export function setEleBackground(ele, imgUrl) {
  ele.html('');
  ele.css('backgroundImage', `url(${imgUrl})`);
  ele.css('backgroundSize', `contain`);
  ele.css('backgroundPosition', `0 0`);
}
