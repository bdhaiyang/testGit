import $ from 'jquery';
import rootTpl from './assets/root.hbs';
import './assets/index.less';
import './assets/fmap.css'
import FMap from './assets/fmap.js';
import 'bootstrap'
import 'ffan-bootstrap/dist/bootstrap.css'

/**
 * Sample
 */
let markers = [];
let lastActiveMarker = null;
let ACTIVEURL = 'http://timg.ffan.com/convert/resize/url_T1oqZTBTKg1RCvBVdK/tfs/71fbc0cd27c97643a49993cc4671fe3e.png';
let NORMALURL = 'http://timg.ffan.com/convert/resize/url_T16qDTBTdv1RCvBVdK/tfs/c76367102d2b0498acca1178a1bb7992.png';
$(function init() {
  $('#root').html(
    rootTpl({
      btns: [
        '卫生间',
        'ATM',
        '电梯',
        '广场出口',
        '收银台',
        '服务台',
        '自动扶梯',
        '车场出口'
      ]
    })
  );
  const ffanMap = window.ffanMap = new FMap.Map('map', {
    zoom: 18,
    editable: false,
    // drawControl: true,
    // fullscreenControl : true,
    regionInteractive: true,
    // showReginName: false,
    // baseAPI: 'http://yunjin.intra.sit.ffan.com/mapeditor/map'
    baseAPI: 'http://imap.sit.ffan.com/poi'
  });

  ffanMap.loadBuilding(1100289);
  addEvent(ffanMap);
});
function addEvent(ffanMap) {
  let $searchBtn = $('#searchBtn'),
    $cancelBtn = $('#cancelBtn'),
    $searchIcon = $('#searchIcon'),
    $keywordInput = $('#keywordInput'),
    $clearBtn = $('#clearBtn'),
    $searchPanel = $('#searchPanel'),
    $resultPanel = $('#resultPanel'),
    $resultsList = $('#resultsList'),
    $resultKeywordSpan = $('#resultKeywordSpan'),
    $resultsCount = $('#resultsCount'),
    $storeName = $('#storeName'),
    $storeFloor = $('#storeFloor'),
    $selectedStore = $('#selectedStore');

  $searchBtn.bind('click', () => {
    $searchPanel.show();
    $searchBtn.hide()
  });

  $cancelBtn.bind('click', () => {
    $searchPanel.hide();
  });

  $searchIcon.bind('click', () => {
    let val = $keywordInput.val();
    if (!val) {
      alert('关键字不能为空');
      return
    }
    let results = ffanMap.serachStoreByName(val);

    if (results && results.length) {
      $searchPanel.hide();
      $('#resultKeywordInput').val(val);
      console.log(results);
      $resultKeywordSpan.html(val);
      $resultsCount.html(results.length);
      updateResultsView(results, ffanMap, $resultsList, $storeName, $storeFloor, $resultPanel, $selectedStore);
    } else {
      $searchPanel.css('background', `#f0f0f0 url("${require('./assets/images/no-results.png')}") no-repeat center`)
    }
  });

  $clearBtn.bind('click', () => {
    $keywordInput.val('');
  });

  $resultsList.bind('click', e => {
    console.log(e.target);
    let id = $(e.target).data('id');
    console.log(id);

    if (id) {
      if (lastActiveMarker) {
        lastActiveMarker.setIcon({
          iconUrl: NORMALURL
        })
      }
      markers.forEach(marker => {
        if (id == marker.storeId) {
          marker.setIcon({
            iconUrl: ACTIVEURL
          });
          ffanMap.panTo(marker.getLatLngs());
          lastActiveMarker = marker;
        }
      })
    }
  });

  $('#btns button').bind('click', e => {
    $keywordInput.val($(e.target).html());
    $searchIcon.trigger('click');
  });

  $('#iconClose').bind('click', () => {
    $resultPanel.hide();
    $selectedStore.hide();
    $searchBtn.show();
    clearMarkers(ffanMap);
  })
}

function updateResultsView(results, ffanMap, $resultsList, $storeName, $storeFloor, $resultPanel, $selectedStore) {
  let html = '';
  clearMarkers(ffanMap);
  // if (results.length == 1) {
  //   $storeName.html(results[0]._name);
  //   $storeFloor.html(formatFloor(ffanMap.getCurrentFloor()));
  //   addMarker(results[0]);
  //   $selectedStore.show();
  //   return;
  // }

  results.forEach(v => {
    html += `<li data-id="${v.id}">${v._name} <span data-id="${v.id}" class="pull-right" style="pointer-events: 'stroke'">${formatFloor(ffanMap.getCurrentFloor())}</span></li>`;
    addMarker(v);
  });
  $resultsList.html(html);
  $resultPanel.show();

  function addMarker(v) {
    let marker = new FMap.Marker([v._feature.feature.properties.centerx, v._feature.feature.properties.centery], {
      icon: {
        iconUrl: results.length == 1 ? ACTIVEURL : NORMALURL
      }
    });
    marker.storeId = v.id;
    ffanMap.addOverlay(marker);
    markers.push(marker);
  }
}

function formatFloor(floor) {
  if (Number(floor) > 0) {
    return `F${Number(floor)}`
  } else {
    return `B${Math.abs(Number(floor))}`
  }
}

function clearMarkers(ffanMap) {
  if (markers && markers.length) {
    markers.forEach(marker => {
      ffanMap.removeOverlay(marker);
    });
    markers = [];
  }
}