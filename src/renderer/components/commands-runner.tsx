import * as React from 'react';

import { Button, ButtonProps, Spinner } from '@blueprintjs/core';
import { observer } from 'mobx-react';

import { AppState } from '../state';

interface RunnerProps {
  appState: AppState;
}

/**
 * The runner component is responsible for actually launching the fiddle
 * with Electron. It also renders the button that does so.
 */
export const Runner = observer(
  class Runner extends React.Component<RunnerProps> {
    public render() {
      const { engineStatus, engineEnv } = this.props.appState;

      const props: ButtonProps = { disabled: false };

      switch (engineStatus) {
        case 'stopped': {
          props.text = 'Run';
          props.onClick = async () => {
            try {
              await window.ElectronFiddle.startEngine(engineEnv);
            } catch (err) {
              this.props.appState.pushError(err.message, err);
            }
          };
          props.icon = 'play';
          break;
        }
        case 'ready': {
          props.active = true;
          props.text = 'Stop';
          props.icon = 'stop';
          props.onClick = () => {
            window.ElectronFiddle.stopEngine();
          };
          break;
        }
        case 'starting': {
          props.text = 'Starting';
          props.icon = <Spinner size={16} />;
          break;
        }
        default: {
          props.text = 'Checking status';
          props.icon = <Spinner size={16} />;
        }
      }

      return <Button id="button-run" {...props} type={undefined} />;
    }
  },
);
