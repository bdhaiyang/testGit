import run from './run';
import clean from './clean';
import watch from './watch';
import copy from './copy';
import server from './server';
import {getEntry, getConfig} from './lib/validEntry';

async function start() {

  try {
    const sourceDir = process.argv[3];

    if (!sourceDir) {
      console.error('-- source dir is empty! --');
      return
    }
    // TODO:
    const entries = await getEntry(sourceDir);
    const config = await getConfig(sourceDir);
    await run(clean.bind(undefined, sourceDir));
    await run(copy.bind(undefined, 'tmp'));
    const config2 = await run(watch.bind(undefined, config));
    await run(server.bind(undefined, sourceDir, config2));
  } catch (e) {
    console.log(e);
  }
}

export default start;
