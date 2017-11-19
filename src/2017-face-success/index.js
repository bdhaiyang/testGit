import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import weixin_lanhai from './assets/imgs/weixin_lanhai.jpg';
import icon from './assets/imgs/icon.png';

/**
 * Sample
 */
$(function init() {
  $('#root').html(
    rootTpl({
    	name: 'World',
    	wechat: weixin_lanhai,
    	icon: icon
	})
  );
});
