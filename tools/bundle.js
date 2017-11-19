import webpack from 'webpack';
import getConfig from './webpack.config';
import validModule from './validModule';

async function bundle(config, isCDN) {
  return new Promise((resolve, reject) => {

    // 这个略丑,待重构
    validModule(config).then(entry => {

      config.isCDN = isCDN || 'no';
      const webpackConfig = getConfig(config);

      webpackConfig.entry = entry;
      webpack(webpackConfig, (err, stats) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        console.log(stats.toString({
          colors  : true,
          children: false
        }));

        return resolve();
      });
    }, err => {
      console.log(err);
      reject(err);
    });

  });
}


export default bundle;
