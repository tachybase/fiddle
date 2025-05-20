import React from 'react';

import { Spinner } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { AppState } from '../state';

export const MainViewer = observer(({ appState }: { appState: AppState }) => {
  if (appState.engineStatus === 'ready' && appState.enginePort) {
    return (
      <webview
        id="mainView"
        src={`http://127.0.0.1:${appState.enginePort}`}
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
