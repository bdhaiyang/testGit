import {getEntry} from './lib/validEntry';
import fs from './lib/fs';
import inquirer from 'inquirer'
const pkg = require('../package.json');
var fse = require('fs-extra');
var colors = require('colors');

var questions = [
  {
    type: 'list',
    name: 'framework',
    message: 'Which framework do you choose? [CTRL-C to Exit]',
    choices: ['jQuery.js', 'React.js', 'Vue.js'],
    filter: function (val) {
      return val.toLowerCase().split('.')[0];
    }
  }
];

var businessPrompt = [
  {
    type: 'list',
    name: 'business',
    message: 'Which type of business do you choose? [CTRL-C to Exit]',
    choices: ['default', 'WeChat', 'NativeShare']
  }
]

function getFramework() {
  return new Promise(resolve => {
    inquirer.prompt(questions).then(function (answers) {
      console.log(answers);
      if (answers.framework === 'jquery') {
        inquirer.prompt(businessPrompt).then(function (ans) {
          return resolve({...answers, ...ans})
        })
      } else {
        return resolve({...answers, ...{business: 'default'}})
      }
    });
  })
}

async function newPage() {
  const dirName = process.argv[3];

  if (!dirName) {
    console.log('You must enter pageName like '.cyan,'[ npm run new 161001_main ]'.yellow);
    return
  }

  const sourceDir = pkg.dirs.sourceDir;
  const entries = await getEntry(dirName, true);
  if (entries.length) {
    console.log(`-- ${sourceDir}/${dirName} is exist! --`);
  } else {
    const {framework, business} = await getFramework();
    const pageDir = `${sourceDir}/${dirName}`;
    await fs.makeDir(pageDir);
    fse.copySync(`${sourceDir}/_commons/page/${framework}/${business}`,
      `${pageDir}`
    );

    console.log("\n-------------".yellow);
    console.log('-- Done! Please start page as follow command:\n'.cyan);
    console.log(`npm run start ${dirName}`.blue);
    console.log("-------------\n".yellow);
  }
}

export default newPage;
