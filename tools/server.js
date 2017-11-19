import {spawnSync} from  'child_process';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import getip from './lib/ip.js';
var colors = require('colors');

const port = 8080;

async function server(sourceDir, config) {
  for(var key in config.entry){
    config.entry[key].unshift("webpack-dev-server/client?http://0.0.0.0:"+port+"/", "webpack/hot/dev-server");
  }

  let compiler = webpack(Object.assign({}, config));

  var server = new WebpackDevServer(compiler, {
    contentBase: 'tmp',
    hot        : true,
    noInfo     : true,
    proxy      : {
      '/zzq/*'        : {
        target      : "http://h5.sit.ffan.com/",
        changeOrigin: true,
        secure      : false
      },
      '/fe/*': {
        target : 'http://127.0.0.1:'+port+'/',
        pathRewrite: function (path, req) {
          path = path.replace('/fe/assets/', '/assets/');
          return path.replace('/fe/', '/html/');
        }
      }
    },
    disableHostCheck: true
  }).listen(port, '0.0.0.0', function (err) {
    if (err) console.log(err);

    let myIp = getip();
    console.log("\n-------------\n");
    console.log(`http://${myIp}:${port}/fe/${sourceDir}.html`);

    // for (let num = 0; num < 11; num++) {
    //   const en = spawnSync('ipconfig', ['getifaddr', `en${num}`]).stdout;
    //   if (en && en.toString()) {
    //     console.log("\n-------------\n");
    //     // TODO:
    //     console.log(`http://${en.toString().replace('\n', '')}:${port}/newactivity/${sourceDir}.html`);
    //   }
    // }
  });
}


export default server;
