import * as React from 'react';

import { Callout, FormGroup, TextArea } from '@blueprintjs/core';
import { observer } from 'mobx-react';

import { AppState } from '../state';

interface EngineEnvSettingsProps {
  appState: AppState;
}

interface IEngineEnvSettingsState {
  value: string;
}

/**
 * Settings engine env
 */
export const EngineEnvSettings = observer(
  class EngineEnvSettings extends React.Component<
    EngineEnvSettingsProps,
    IEngineEnvSettingsState
  > {
    constructor(props: EngineEnvSettingsProps) {
      super(props);

      this.state = {
        value: this.props.appState.engineEnv,
      };

      this.handleEngineEnvChange = this.handleEngineEnvChange.bind(this);
    }

    /**
     * Set the engine env
     */
    public handleEngineEnvChange(event: React.FormEvent<HTMLTextAreaElement>) {
      const { value } = event.currentTarget;

      this.setState({
        value,
      });

      this.props.appState.engineEnv = value;
    }

    public render() {
      const engineEnvLabel = 'Set the engine env field.';

      return (
        <div>
          <h4>Engine Env</h4>
          <Callout>
            <FormGroup label={engineEnvLabel} labelFor="engine-env">
              <TextArea
                id="engine-env"
                className="bp3-fill"
                rows={10}
                value={this.state.value}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  this.handleEngineEnvChange(e)
                }
              />
            </FormGroup>
          </Callout>
        </div>
      );
    }
  },
);
