import React, { useEffect } from 'react';

import { Spinner } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { AppState } from '../state';

export const MainViewer = observer(({ appState }: { appState: AppState }) => {
  useEffect(() => {
    const handler = () => {
      console.log('[系统事件] 收到 lock-screen, 跳转到 /signin');
      const webview = document.getElementById(
        'mainView',
      ) as Electron.WebviewTag;
      if (webview) {
        if (appState.enginePort) {
          webview.src = `${appState.enginePort}/signin`;
          webview.executeJavaScript(`
            localStorage.removeItem('TACHYBASE_TOKEN');
          `);
        } else {
          console.warn('⚠️ appState.enginePort is null!');
        }
      } else {
        console.warn('⚠️ webview not found!');
      }
    };

    window.ElectronFiddle?.onLockScreen(handler);

    // 可选：组件卸载时清理监听器（如果支持）
    return () => {
      // 假设支持取消监听，如：
      // window.ElectronFiddle?.offLockScreen(handler);
    };
  }, [appState.enginePort]);

  console.log('🚀 ~ MainViewer ~ appState:', appState.enginePort);
  if (
    (appState.engineStatus === 'ready' || appState.engineStatus === 'remote') &&
    appState.enginePort
  ) {
    return (
      <webview
        id="mainView"
        src={`${appState.enginePort}/signin`}
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
