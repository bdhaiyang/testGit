import del from 'del';
import fs from './lib/fs';

/**
 * Cleans up the output (build) directory.
 */
async function cleanAll() {
  await del(['tmp', 'build/*', '!build/.git'], { dot: true });
  await fs.makeDir('build/assets');
  await fs.makeDir('tmp/assets/js');
}

export default cleanAll;
