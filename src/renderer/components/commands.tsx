import * as React from 'react';

import { Button, ControlGroup } from '@blueprintjs/core';
import classNames from 'classnames';
import { observer } from 'mobx-react';

import { BisectHandler } from './commands-bisect';
import { Runner } from './commands-runner';
import { AppState } from '../state';

interface CommandsProps {
  appState: AppState;
  isTabbingHidden?: boolean;
}

/**
 * The command bar, containing all the buttons doing
 * all the things
 */
export const Commands = observer(
  class Commands extends React.Component<CommandsProps> {
    constructor(props: CommandsProps) {
      super(props);
      this.state = {
        isTabbingHidden: true,
      };
    }

    private handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Only maximize if the toolbar itself is clicked (ignore for buttons, input, etc)
      if (e.currentTarget === e.target) {
        window.ElectronFiddle.macTitlebarClicked();
      }
    };

    componentDidMount() {
      window.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
      window.removeEventListener('keydown', this.handleKeyDown);
    }

    private handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.setState((prevState: CommandsProps) => ({
          isTabbingHidden: !prevState.isTabbingHidden,
        }));
      }
    };

    public render() {
      const { appState } = this.props;
      const { isBisectCommandShowing, title } = appState;
      const { isTabbingHidden } = this.state as CommandsProps;
      return (
        <div
          className={classNames(
            'commands',
            { 'is-mac': window.ElectronFiddle.platform === 'darwin' },
            { 'tabbing-hidden': isTabbingHidden },
          )}
          onDoubleClick={this.handleDoubleClick}
        >
          <div>
            <ControlGroup fill={true} vertical={false}>
              <Button
                onClick={() => window.ElectronFiddle.reloadWindows()}
                icon="repeat"
                title="Reload Window"
              />
              <Button
                icon="cog"
                title="Setting"
                onClick={appState.toggleSettings}
              />
            </ControlGroup>
            <ControlGroup fill={true} vertical={false}>
              <Runner appState={appState} />
            </ControlGroup>
            {isBisectCommandShowing && (
              <ControlGroup fill={true} vertical={false}>
                <BisectHandler appState={appState} />
              </ControlGroup>
            )}
            <ControlGroup fill={true} vertical={false}>
              <Button
                active={appState.isConsoleShowing}
                icon="console"
                text="Console"
                onClick={appState.toggleConsole}
              />
            </ControlGroup>
          </div>
          {window.ElectronFiddle.platform === 'darwin' ? (
            <div className="title">{title}</div>
          ) : undefined}
        </div>
      );
    }
  },
);
