import colors from 'colors'
import run from './run';
//const argv = require('minimist')(process.argv.slice(2));

import * as gitGepo from './lib/git-repo'
import select from './deploy/selectPage'
import {commit} from './commit'

async function deploys() {
  const status = await gitGepo.gitCommand('status -s')
  console.log(`$ git status -s`.blue)
  console.log(status ? status.red : '---------------'.blue)
  var {page, isCDN} = await select()
  if (!page.length) {
    return console.log('You didn\'t choose any page!')
  }
  run(commit.bind(null, page, isCDN))
}

export default deploys;
