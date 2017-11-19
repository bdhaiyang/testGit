import run from './run';
import clean from './clean';
import bundle from './bundle';
import copy from './copy';
//import moveHTML from './moveHTML';
import {getEntry, getConfig} from './lib/validEntry';


async function build(sourceDir, isCDN) {

  sourceDir = sourceDir || process.argv[3];

  if (!sourceDir) {
    console.error('-- source dir is empty! --');
    return
  }
  const entries = await getEntry(sourceDir);
  await Promise.all(entries.map(async entry => {
    await run(clean.bind(null, entry));
    const config = await getConfig(entry);
    await run(bundle.bind(null, config, isCDN));
  }));

}

export default build;
