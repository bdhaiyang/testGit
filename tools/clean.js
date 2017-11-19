import del from 'del';
import fs from './lib/fs';
/**
 * Cleans up the output (build) directory.
 */
async function clean(sourceDir) {

  if (!sourceDir) {
    console.error('-- source dir is empty! --');
    return
  }

  await del([
    //'.tmp',
    //`tmp/*`,
    `build/${sourceDir}.html`,
    `build/assets/css/${sourceDir}*`,
    `build/assets/js/${sourceDir}*`,
    `build/assets/img/${sourceDir}*`,
  ], { dot: true });
}

export default clean;
