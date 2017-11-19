import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import {getDomain} from '../_commons/js/business/domain';

/**
 * Sample
 */
$(function init() {
  $('#root').html(
    rootTpl()
  );
});
