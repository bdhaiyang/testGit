import Promise from 'bluebird';
const globby = require('globby');

async function moveHTML(dist) {
  dist = dist || 'build';
  const ncp = Promise.promisify(require('ncp'));
  const htmlFiles = await globby([`*.html`], {
    cwd: dist
  });

  try {
    await Promise.all(htmlFiles.map(file => {
      return ncp(`${dist}/${file}`, `build/html/${file}`);
    }));
  } catch (e) {
    console.log(e);
  }
}

export default moveHTML;
