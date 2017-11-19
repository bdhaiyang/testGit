import path from 'path';
const globby = require('globby');
import fs from './fs';
const pkg = require('../../package.json');


const defaultSourceDir = pkg.dirs.sourceDir;

export async function getEntry(dirName, isSlient=false) {
  const sourceDirs = await globby([dirName], {
    cwd: defaultSourceDir,
  });

  if (!sourceDirs.length && !isSlient) {
    console.log(`-- ${defaultSourceDir}/${dirName} is empty! --`);
  }

  return sourceDirs;
}

export async function getConfig(entry) {

  const defaultConfig = {
    name: entry,
  };

  try {
    const config = fs.readJsonSync(path.resolve(defaultSourceDir, entry, 'config.json'));
    config.html = config.html || {};

    if (!config.html.template) {
      const template = await getTemplate(entry);
      if (template) {
        config.html.template = template;
      }
    } else {
      config.html.template = path.resolve(defaultSourceDir, entry, config.html.template);
    }

    return Object.assign(defaultConfig, config);

  } catch (e) {
    return defaultConfig;
  }
}

export async function getTemplate(entry) {
  const templates = await globby(['index.html', 'index.hbs'], {
    cwd: path.resolve(defaultSourceDir, entry),
  });

  if (templates.length !== 1) {
    if (templates.length > 1) {
      console.log('-- Template must only one! --');
    }
    return "";
  } else {
    return path.resolve(defaultSourceDir, entry, templates[0]);
  }
}
