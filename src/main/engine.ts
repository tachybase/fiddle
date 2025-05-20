import { spawn } from 'node:child_process';
import path from 'node:path';

import { ipcMainManager } from './ipc';
import { IpcEvents } from '../ipc-events';

const enginePath = '/Users/seal/Documents/projects/tb-starter/engine';
const workingDir = '/Users/seal/Documents/projects/tb-starter';

const appPort = '9876';

// 允许配置环境变量
const env = {
  APP_PORT: appPort,
  NODE_MODULES_PATH: path.join(workingDir, 'plugins/node_modules'),
};

export class TachybaseEngine {
  async start() {
    ipcMainManager.send(IpcEvents.ENGINE_STARTED);

    const checkRunning = async () => {
      try {
        const result = await fetch(
          `http://localhost:${appPort}/api/__health_check`,
        );
        const res = await result.text();
        if (res !== 'ok') {
          throw new Error('server not ready');
        }
        ipcMainManager.send(IpcEvents.ENGINE_READY, [appPort]);
      } catch {
        setTimeout(() => {
          checkRunning();
        }, 500);
      }
    };

    await checkRunning();

    const child = spawn(enginePath, ['start'], {
      cwd: workingDir,
      env,
      stdio: 'pipe',
    });
    child.stdout.on('data', (data) => {
      ipcMainManager.send(IpcEvents.ENGINE_STDOUT, [data.toString()]);
    });

    child.stderr.on('data', (data) => {
      ipcMainManager.send(IpcEvents.ENGINE_STDERR, [data.toString()]);
    });

    child.on('error', (error) => {
      console.error(`[Engine]: Error starting engine: ${error.message}`);
    });

    child.on('exit', (code) => {
      console.log(`[Engine]: engine exited with code ${code}`);
    });
  }
}
