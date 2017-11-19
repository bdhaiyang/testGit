"use strict";

var $ = require('jquery');
var promiseFactory = require('./promiseFactory');


// $.ajaxSetup({
//   //cache: false,
//   scriptCharset: "utf-8",
//   contentType: "application/json; charset=utf-8",
//   //headers: { "cache-control": "no-cache" }
// });

/**
 * 获取 JSONP 数据
 * @param url
 * @param params
 * @returns {Promise}
 */
export function getJSONP(url, params) {
  if (!$.trim(url)) {
    return promiseFactory.getReject('url为空');
  }

  if ($.isPlainObject(params)) {
    var postParams = Object.assign({}, params);
  }

  var sendPromise = $.ajax({
    type: 'GET',
    url: url,
    data: postParams && $.param(postParams),
    dataType: 'jsonp',
    jsonp: 'callback'
  });
  return promiseFactory.getResult(sendPromise);
};

export function ajaxGet(url, params, options) {
  if (!$.trim(url)) {
    return promiseFactory.getReject('url为空');
  }

  if ($.isPlainObject(params)) {
    var postParams = Object.assign({}, params);
  }

  var ajaxOptions = $.extend({
    dataType: 'json',
  }, options,  {
    type: 'GET',
    url: url,
    data: params
  })

  console.log('ajaxOptions:', ajaxOptions)

  var sendPromise = $.ajax(ajaxOptions);

  return promiseFactory.getResult(sendPromise);
};

export function ajaxPost(url, params) {
  if (!$.trim(url)) {
    return promiseFactory.getReject('url为空');
  }

  if ($.isPlainObject(params)) {
    var postParams = Object.assign({}, params);
  }

  var sendPromise = $.ajax({
    type: 'POST',
    url: url,
    data: postParams,
    dataType: 'json',
  });
  return promiseFactory.getResult(sendPromise);
};