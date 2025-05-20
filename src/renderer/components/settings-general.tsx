import * as React from 'react';

import { Divider } from '@blueprintjs/core';
import { observer } from 'mobx-react';

import { AppearanceSettings } from './settings-general-appearance';
import { BlockAcceleratorsSettings } from './settings-general-block-accelerators';
import { FontSettings } from './settings-general-font';
import { AppState } from '../state';
import { EngineEnvSettings } from './settings-general-engine-env';

interface GeneralSettingsProps {
  appState: AppState;
  toggleHasPopoverOpen: () => void;
}

/**
 * Settings content to manage GitHub-related preferences.
 */
export const GeneralSettings = observer(
  class GeneralSettings extends React.Component<GeneralSettingsProps> {
    public render() {
      return (
        <div>
          <h1>General Settings</h1>
          <AppearanceSettings
            appState={this.props.appState}
            toggleHasPopoverOpen={() => this.props.toggleHasPopoverOpen()}
          />
          <Divider />
          <EngineEnvSettings appState={this.props.appState} />
          <Divider />
          <BlockAcceleratorsSettings appState={this.props.appState} />
          <Divider />
          <FontSettings appState={this.props.appState} />
        </div>
      );
    }
  },
);
