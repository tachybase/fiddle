import React, { useEffect } from 'react';

import { Spinner } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { AppState } from '../state';

export const MainViewer = observer(({ appState }: { appState: AppState }) => {
  useEffect(() => {
    const lockScreenChannel = 'lock-screen';
    const handler = (channel: string) => {
      const webview = document.getElementById(
        'mainView',
      ) as Electron.WebviewTag;
      if (webview) {
        webview.executeJavaScript(`
          window.postMessage('${channel}', '*');
        `);
      } else {
        console.warn('⚠️ webview not found!');
      }
    };
    window.ElectronFiddle?.addIpcRenderListener(lockScreenChannel, handler);
    return () => {
      window.ElectronFiddle?.removeIpcRenderListener(
        lockScreenChannel,
        handler,
      );
    };
  }, []);

  console.log('🚀 ~ MainViewer ~ appState:', appState.enginePort);
  if (
    (appState.engineStatus === 'ready' || appState.engineStatus === 'remote') &&
    appState.enginePort
  ) {
    return (
      <webview
        id="mainView"
        src={appState.enginePort}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }

  if (appState.engineStatus === 'stopped') {
    return <div style={{ width: '100%', height: '100%' }}>Stopped</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Spinner intent="primary" />
    </div>
  );
});
