import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
if (!process.env.GITHUB_ACTIONS || !process.env.GITHUB_TOKEN) throw new Error('Run from the migration workflow.');
const root = process.cwd();
const worktree = path.join(root, 'migration/publish-worktree');
function run(command, args, cwd = root) {
  if (spawnSync(command, args, { cwd, stdio: 'inherit' }).status !== 0) throw new Error(command + ' failed');
}
run('git', ['fetch', 'origin', 'main']);
run('git', ['worktree', 'add', '--detach', worktree, 'origin/main']);
run('rsync', ['-a', '--delete', '--exclude=.git', path.join(root, 'migration/public/'), worktree + '/']);
run('git', ['add', '--all'], worktree);
if (spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: worktree }).status !== 0) {
  run('git', ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-m', 'Redirect legacy English site to the bilingual blog'], worktree);
  run('git', ['push', 'origin', 'HEAD:main'], worktree);
}
const expected = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: worktree, encoding: 'utf8' }).trim();
const api = process.env.GITHUB_API_URL + '/repos/' + process.env.GITHUB_REPOSITORY + '/pages/builds';
const headers = { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
const response = await fetch(api, { method: 'POST', headers, signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error('Pages build request failed: HTTP ' + response.status + ' ' + await response.text());
for (let i = 0; i < 40; i++) {
  await new Promise(resolve => setTimeout(resolve, 15000));
  const response = await fetch(api + '/latest', { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('Cannot read Pages build status: HTTP ' + response.status);
  const build = await response.json();
  console.log('Pages: ' + build.status);
  if (build.commit !== expected) continue;
  if (build.status === 'errored') throw new Error(build.error?.message || 'Pages build failed');
  if (build.status === 'built') process.exit(0);
}
throw new Error('Timed out waiting for Pages.');
