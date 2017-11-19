import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import {getParamByName} from '../_commons/js/urlUtil';

/**
 * Sample
 */
 function errorInfo(){
 	var errorInfo = getParamByName("parameter");
 	$(".errorInfo span").text(errorInfo);
 }
$(function init() {
  $('#root').html(
    rootTpl()
  );
  errorInfo();
});
