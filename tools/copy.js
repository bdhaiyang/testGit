import Promise from 'bluebird';
import fs from './lib/fs';

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
async function copy(dist) {
  const ncp = Promise.promisify(require('ncp'));
  try {
    await fs.makeDir('build');
    await fs.makeDir('build/html');
    await fs.makeDir('build/assets/js');
    await fs.makeDir('build/assets/css');
    await fs.makeDir('tmp/assets/js');
    await fs.makeDir('tmp/assets/css');

    await Promise.all([
      ncp('src/_commons/html/', `${dist}/html/`),
      ncp('src/_commons/source/', `${dist}/`),
      ncp('src/_commons/js/tpls/', `${dist}/assets/js/`),
      ncp('node_modules/jquery/dist/', `${dist}/assets/js/jquery`),
      ncp('node_modules/react/dist/', `${dist}/assets/js/react`),
      ncp('node_modules/react-dom/dist/', `${dist}/assets/js/react-dom`),
      ncp('node_modules/vue/dist/', `${dist}/assets/js/vue`),
    ]);
  }catch (e) {
    console.log(e);
  }

}

export default copy;
