const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'client');
const npmCmd = path.join(__dirname, 'nodejs', 'node-v20.10.0-win-x64', 'npm.cmd');
const out = path.join(clientDir, 'react-start.log');
const err = path.join(clientDir, 'react-start.err');

const outStream = fs.createWriteStream(out, { flags: 'a' });
const errStream = fs.createWriteStream(err, { flags: 'a' });

const child = spawn(npmCmd, ['start'], { cwd: clientDir, shell: true });
child.stdout.pipe(outStream);
child.stderr.pipe(errStream);

child.on('close', (code) => {
  outStream.end();
  errStream.end();
  console.log('react-scripts exited with code', code);
});

child.on('error', (e) => {
  console.error('spawn error', e);
});
