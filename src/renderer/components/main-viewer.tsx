import React from 'react';

import { Spinner } from '@blueprintjs/core';
import { observer } from 'mobx-react-lite';

import { AppState } from '../state';

export const MainViewer = observer(({ appState }: { appState: AppState }) => {
  return appState.engineStatus === 'ready' && appState.enginePort ? (
    <webview
      id="mainView"
      src={`http://127.0.0.1:${appState.enginePort}`}
      style={{ width: '100%', height: '100%' }}
    />
  ) : (
    <div style={{ width: '100%', height: '100%' }}>
      <Spinner intent="primary" />
    </div>
  );
});
