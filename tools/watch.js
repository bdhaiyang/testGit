import webpack from 'webpack';
import validModule from './validModule';
import getConfig from './webpack.hot.config';

async function watch(config) {
  return new Promise((resolve, reject) => {

    validModule(config).then(entry => {
      const webpackConfig = Object.assign({},
        {watch: true}, getConfig(config));
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

        return resolve(webpackConfig);
      });
    }, err => {
      console.log(err);
      reject(err);
    });
  });

}

export default watch;
