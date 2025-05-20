import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import path from 'node:path';

import dotenv from 'dotenv';
import { IpcMainEvent } from 'electron';

import { ipcMainManager } from './ipc';
import { IpcEvents } from '../ipc-events';

export class TachybaseEngine {
  private engineStatus = 'stopped';
  private enginePort = '';
  private child: ChildProcessWithoutNullStreams | null = null;

  constructor() {
    ipcMainManager.on(IpcEvents.GET_ENGINE_STATUS, (event) => {
      event.returnValue = this.engineStatus + '|' + this.enginePort;
    });

    ipcMainManager.handle(
      IpcEvents.ENGINE_START,
      (_: IpcMainEvent, env: string) => this.start.bind(this)(env),
    );
    ipcMainManager.handle(IpcEvents.ENGINE_STOP, (_: IpcMainEvent) =>
      this.stop.bind(this)(),
    );
  }

  async start(rawEnvString: string) {
    const env = dotenv.parse(rawEnvString);

    const enginePath = env.ENGINE_PATH;
    const workingDir = env.ENGINE_WORKING_DIR;
    const appPort = env.APP_PORT;

    if (!enginePath || !workingDir || !appPort) {
      throw new Error(
        'ENGINE_PATH, ENGINE_WORKING_DIR, and APP_PORT must be set',
      );
    }

    env.NODE_MODULES_PATH = path.join(workingDir, 'plugins/node_modules');

    this.engineStatus = 'started';
    ipcMainManager.send(IpcEvents.ENGINE_STATUS_CHANGED, ['started']);

    const checkRunning = async () => {
      try {
        const result = await fetch(
          `http://localhost:${appPort}/api/__health_check`,
        );
        const res = await result.text();
        if (res !== 'ok') {
          throw new Error('server not ready');
        }
        this.enginePort = appPort;
        this.engineStatus = 'ready';
        ipcMainManager.send(IpcEvents.ENGINE_STATUS_CHANGED, [
          'ready',
          appPort,
        ]);
      } catch {
        setTimeout(() => {
          checkRunning();
        }, 500);
      }
    };

    await checkRunning();

    this.child = spawn(enginePath, ['start'], {
      cwd: workingDir,
      env,
      stdio: 'pipe',
    });
    this.child.stdout.on('data', (data) => {
      ipcMainManager.send(IpcEvents.ENGINE_STDOUT, [data.toString()]);
    });

    this.child.stderr.on('data', (data) => {
      ipcMainManager.send(IpcEvents.ENGINE_STDERR, [data.toString()]);
    });

    this.child.on('error', (error) => {
      console.error(`[Engine]: Error starting engine: ${error.message}`);
    });

    this.child.on('exit', (code) => {
      console.log(`[Engine]: engine exited with code ${code}`);
    });
  }

  async stop() {
    this.child?.kill();
    this.engineStatus = 'stopped';
    ipcMainManager.send(IpcEvents.ENGINE_STATUS_CHANGED, ['stopped']);
  }
}
