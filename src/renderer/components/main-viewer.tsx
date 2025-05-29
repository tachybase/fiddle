import React, { useEffect } from 'react';

import { Spinner } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { AppState } from '../state';

export const MainViewer = observer(({ appState }: { appState: AppState }) => {
  useEffect(() => {
    window.ElectronFiddle?.onLockScreen(() => {
      console.log('[系统事件] 收到 lock-screen, 跳转到 /signin');
      window.location.href = '/signin';
    });
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
