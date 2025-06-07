import React, { useEffect } from 'react';

import { Spinner } from '@blueprintjs/core';
import type { WebviewTag } from 'electron';
import { observer } from 'mobx-react-lite';

import { AppState } from '../state';

export const MainViewer = observer(({ appState }: { appState: AppState }) => {
  const ref = React.useRef<WebviewTag>(null);
  useEffect(() => {
    window.ElectronFiddle.addEventListener('power-monitor', (event: string) => {
      if (ref.current) {
        ref.current.executeJavaScript(`
          window.postMessage('${event}', '*');
        `);
      } else {
        console.warn('⚠️ webview not found!');
      }
    });

    return () => {
      window.ElectronFiddle.removeAllListeners('power-monitor');
    };
  }, []);

  if (
    (appState.engineStatus === 'ready' || appState.engineStatus === 'remote') &&
    appState.enginePort
  ) {
    return (
      <webview
        ref={ref}
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
