
'use strict';

process.env.TF_ENABLE_ONEDNN_OPTS = '0';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const services = [
  {
    name: 'AUTH',
    directory: 'backend/auth',
    command: 'python',
    args: ['app.py'],
  },
  {
    name: 'IMAGE',
    directory: 'backend/Image-detector',
    command: 'python',
    args: ['app.py'],
  },
  {
    name: 'AUDIO',
    directory: 'backend/audio-detector',
    command: 'python',
    args: ['app.py'],
  },
  {
    name: 'VIDEO',
    directory: 'backend/video-detector',
    command: 'python',
    args: ['app.py'],
  },
  {
    name: 'FRONTEND',
    directory: 'frontend',
    command: 'npm',
    args: ['run', 'dev'],
  },
];

const children = [];
let stopping = false;

function stopAll(exitCode = 0) {
  if (stopping) return;

  stopping = true;

  console.log('\n==============================================');
  console.log('Stopping all services...');
  console.log('==============================================');

  for (const child of children) {
    if (!child.pid || child.exitCode !== null) {
      continue;
    }

    if (process.platform === 'win32') {
      spawn(
        'taskkill',
        ['/pid', String(child.pid), '/T', '/F'],
        {
          stdio: 'ignore',
          windowsHide: true,
        }
      );
    } else {
      child.kill('SIGTERM');
    }
  }

  setTimeout(() => {
    process.exit(exitCode);
  }, 1000);
}

function startService(service) {
  const cwd = path.join(root, service.directory);
  const appFile = path.join(cwd, 'app.py');

  // Check directory
  if (!fs.existsSync(cwd)) {
    throw new Error(
      `Missing ${service.name} working directory:\n${cwd}`
    );
  }

  // Check Python entry file
  if (
    service.command === 'python' &&
    !fs.existsSync(appFile)
  ) {
    throw new Error(
      `Missing ${service.name} entry point:\n${appFile}`
    );
  }

  console.log(
    `[${service.name}] starting: ${service.command} ${service.args.join(' ')}`
  );

  const command =
    process.platform === 'win32'
      ? `${service.command} ${service.args.join(' ')}`
      : service.command;

  const args =
    process.platform === 'win32'
      ? []
      : service.args;

  const child = spawn(
    command,
    args,
    {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      windowsHide: false,
    }
  );

  children.push(child);

  child.on('error', (error) => {
    console.error(
      `\n[${service.name}] ERROR: ${error.message}`
    );

    if (!stopping) {
      stopAll(1);
    }
  });

  child.on('exit', (code, signal) => {
    if (stopping) {
      return;
    }

    if (code !== 0 && code !== null) {
      console.error(
        `\n[${service.name}] exited with code ${code}`
      );

      stopAll(code);
    } else if (signal) {
      console.log(
        `[${service.name}] stopped by signal ${signal}`
      );
    }
  });
}

// Start all services
for (const service of services) {
  startService(service);
}

console.log('\n==============================================');
console.log(' DeepAnalysis - AI Detect');
console.log(' All services are starting...');
console.log('==============================================\n');

// Ctrl + C
process.on('SIGINT', () => {
  stopAll(0);
});

process.on('SIGTERM', () => {
  stopAll(0);
});

