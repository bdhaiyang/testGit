import webpack from 'webpack';
import fs from 'fs';
import path from 'path';
import run from './run';
import cleanAll from './cleanAll';
import copy from './copy';

async function build() {

  const sourceDir = process.argv[3];

  if (!sourceDir) {
    console.error('-- source dir is empty! --');
    return
  }

  await run(cleanAll);
  await run(copy);

}

export default build;

// 资源目录路径
const sourceDir = __dirname + '/src';

let config = {
  output: {
    path    : "./build",
    filename: "[name].js"
  }
};


const entries = fs.readdirSync(path.resolve(sourceDir)).filter(dirName => {
  return fs.statSync(path.join(sourceDir, dirName)).isDirectory() && dirName !== "node_modules";
}).map(dirName => {
  return { [dirName] : path.resolve(sourceDir, dirName, 'index.js')}
});

console.log(config.entry = entries[0]);

webpack(config, (err, ştats) => {
  if (err) {
    console.log(err);
  }
});
