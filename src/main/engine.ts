import { spawn } from 'node:child_process';
import path from 'node:path';

import { ipcMainManager } from './ipc';
import { IpcEvents } from '../ipc-events';

const enginePath = '/Users/seal/Documents/projects/tb-starter/engine';
const workingDir = '/Users/seal/Documents/projects/tb-starter';

const appPort = '9876';

const env = {
  ...process.env, // 保留原有环境变量
  APP_PORT: appPort,
  NODE: undefined,
  NODE_PATH: undefined,
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
        ipcMainManager.send(IpcEvents.ENGINE_READY);
      } catch {
        setTimeout(() => {
          checkRunning();
        }, 500);
      }
    };

    await checkRunning();

    // TODO: fix env
    delete env['NODE'];
    delete env['NODE_PATH'];
    const child = spawn(enginePath, ['start'], {
      cwd: workingDir,
      env,
      stdio: 'inherit',
    });
    child.on('error', (error) => {
      console.error(`Error starting engine: ${error.message}`);
    });

    child.on('exit', (code) => {
      console.log(`engine exited with code ${code}`);
    });
  }
}
