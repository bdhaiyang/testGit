import GitRepo from 'git-repository';
import run from './run';
import build from './build';
import copy from './copy';
import uploadCDN from './uploadCDN';
const repoPath = './build';
import { pullBranch, fetchBranch, checkoutBranch, getCurrentBranch, cleanBranch, deleteBranch, checkoutNewBranch } from './lib/git-repo';
import fse from 'fs-extra';

const getRemote = (slot) => {
  return {
    name: slot || '',
    url : `https://github.com/bdhaiyang/testGit.git`,
    //url : `http://work.dianshang.wanda.cn/web-fe/ffan-activity.git`,
  }
};


export async function commit(page, isCDN = 'no') {
  fse.ensureDirSync(repoPath)
  const remote = getRemote(process.argv.includes('--production') ? null : 'sit');
  const repo = await GitRepo.open(repoPath, {init: true});
  await repo.setRemote(remote.name, remote.url);
  let branch = await getCurrentBranch({cwd: './'});
  branch = branch.trim()
  // checkout -- .
  //await cleanBranch({cwd: repoPath});
  if ((await repo.hasRef(remote.url, branch))) {
    await repo.fetch(remote.name);
    await repo.reset(`${remote.name}/${branch}`, {hard: true});
    await repo.clean({force: true});
  } else {
    await checkoutBranch('master', {cwd: repoPath});
    await deleteBranch(branch, {cwd: repoPath});
    await checkoutNewBranch(branch, {cwd: repoPath});
  }
  await cleanBranch({cwd: repoPath});
  try {
    await checkoutBranch(branch, {cwd: repoPath});
  } catch (e) {
    await fetchBranch(branch,{cwd: repoPath});
    await checkoutBranch(branch, {cwd: repoPath});
  }
  await pullBranch(branch, {cwd: repoPath});
  try {
    process.argv.push('--release');
    await run(copy.bind(null, 'build'));
    //await repo.push(remote.name, branch);
    await Promise.all(page.map(async p => {
      await run(build.bind(null, p, isCDN));
      if (isCDN === "yes") {
        await run(uploadCDN.bind(null, p));
      }
    }))
    await repo.add('--all .');
    await repo.commit(JSON.stringify(page.toString()));
    // await repo.push(remote.name, branch, {force:true});
    await repo.push(remote.name, branch);
  } catch (e) {
    console.log('-- deploy error --');
    console.log(e);
  }
}
