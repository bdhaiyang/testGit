import $ from 'jquery';
import { getDomain } from '../_commons/js/business/domain';
import rootTpl from './assets/root.hbs';
import {bindEvent, getToken} from './assets/utils'

require('./assets/index.less');

$(function (){
  if(typeof wx !== 'undefined') {
    getToken();
  }
  $('#root').html(
    rootTpl({name: 'World'})
  );
  bindEvent('uploadPhoto', {}, true);
  wx.error(function (res) {
    console.log('wx.error');
    alert(res.errMsg);
  });
});
