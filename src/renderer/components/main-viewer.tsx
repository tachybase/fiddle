import React from 'react';

import { observer } from 'mobx-react-lite';

import { AppState } from '../state';

export const MainViewer = observer(({ appState }: { appState: AppState }) => {
  return appState.isEngineReady ? (
    <webview
      id="mainView"
      src="http://127.0.0.1:9876"
      style={{ width: '100%', height: '100%' }}
    />
  ) : (
    <div style={{ width: '100%', height: '100%' }}>Loading...</div>
  );
});
