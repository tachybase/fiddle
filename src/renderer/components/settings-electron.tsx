import * as React from 'react';

import {
  AnchorButton,
  Button,
  ButtonGroup,
  ButtonProps,
  Callout,
  Checkbox,
  FormGroup,
  HTMLTable,
  Icon,
  IconName,
  Spinner,
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { observer } from 'mobx-react';

import {
  ElectronReleaseChannel,
  InstallState,
  RunnableVersion,
  VersionSource,
} from '../../interfaces';
import { AppState } from '../state';
import { disableDownload } from '../utils/disable-download';
import { getReleaseChannel } from '../versions';

interface ElectronSettingsProps {
  appState: AppState;
}

/**
 * Settings content to manage Electron-related preferences.
 */
export const ElectronSettings = observer(
  class ElectronSettings extends React.Component<ElectronSettingsProps> {
    constructor(props: ElectronSettingsProps) {
      super(props);

      this.handleAddVersion = this.handleAddVersion.bind(this);
      this.handleChannelChange = this.handleChannelChange.bind(this);
      this.handleDeleteAll = this.handleDeleteAll.bind(this);
      this.handleDownloadAll = this.handleDownloadAll.bind(this);
      this.handleStopDownloads = this.handleStopDownloads.bind(this);
      this.handleUpdateElectronVersions =
        this.handleUpdateElectronVersions.bind(this);
      this.handleShowObsoleteChange = this.handleShowObsoleteChange.bind(this);
      this.handleStateChange = this.handleStateChange.bind(this);
    }

    public handleUpdateElectronVersions() {
      this.props.appState.updateElectronVersions();
    }

    /**
     * Toggles visibility of non-downloaded versions
     */
    public handleStateChange(event: React.FormEvent<HTMLInputElement>) {
      const { appState } = this.props;
      const { checked } = event.currentTarget;
      appState.showUndownloadedVersions = checked;
    }

    /**
     * Toggles visibility of obsolete versions
     */
    public handleShowObsoleteChange(event: React.FormEvent<HTMLInputElement>) {
      const { appState } = this.props;
      const { checked } = event.currentTarget;
      appState.showObsoleteVersions = checked;
    }

    /**
     * Handles a change in which channels should be displayed.
     */
    public handleChannelChange(event: React.FormEvent<HTMLInputElement>) {
      const { id, checked } = event.currentTarget;
      const { appState } = this.props;

      if (!checked) {
        appState.hideChannels([id as ElectronReleaseChannel]);
      } else {
        appState.showChannels([id as ElectronReleaseChannel]);
      }
    }

    /**
     * Download all visible versions of Electron.
     */
    public async handleDownloadAll(): Promise<void> {
      const {
        downloadVersion,
        versionsToShow,
        startDownloadingAll,
        stopDownloadingAll,
      } = this.props.appState;

      startDownloadingAll();

      for (const ver of versionsToShow) {
        await downloadVersion(ver);

        if (!this.props.appState.isDownloadingAll) break;
      }

      stopDownloadingAll();
    }

    /**
     * Delete all downloaded versions of Electron.
     */
    public async handleDeleteAll(): Promise<void> {
      const { versions, removeVersion, startDeletingAll, stopDeletingAll } =
        this.props.appState;

      startDeletingAll();

      for (const ver of Object.values(versions)) {
        await removeVersion(ver);
      }

      stopDeletingAll();
    }

    /**
     * Stops the downloads
     */
    public handleStopDownloads = (): void => {
      this.props.appState.stopDownloadingAll();
    };

    /**
     * Opens the "add local version" dialog
     */
    public handleAddVersion(): void {
      this.props.appState.toggleAddVersionDialog();
    }

    public render() {
      return (
        <div className="settings-electron">
          <h1>Electron Settings</h1>
          <Callout>{this.renderVersionShowOptions()}</Callout>
          <br />
          <Callout>{this.filterSection()}</Callout>
          <br />
          <Callout>
            {this.renderAdvancedButtons()}
            {this.renderTable()}
          </Callout>
        </div>
      );
    }

    /**
     * Renders the various buttons for advanced operations
     */
    private renderAdvancedButtons(): JSX.Element {
      const { isUpdatingElectronVersions, isDownloadingAll, isDeletingAll } =
        this.props.appState;

      const isWorking = isDownloadingAll || isDeletingAll;

      return (
        <ButtonGroup fill={true}>
          <Button
            disabled={isUpdatingElectronVersions}
            onClick={this.handleUpdateElectronVersions}
            loading={isUpdatingElectronVersions}
            icon="numbered-list"
            text="Update Electron Release List"
          />
          {isDownloadingAll ? (
            <Button
              icon="stop"
              onClick={this.handleStopDownloads}
              text="Stop Downloads"
            />
          ) : (
            <Button
              disabled={isWorking}
              icon="download"
              onClick={this.handleDownloadAll}
              text="Download All Versions"
            />
          )}
          <Button
            disabled={isWorking}
            icon="trash"
            onClick={this.handleDeleteAll}
            text="Delete All Downloads"
          />
          <Button
            icon="document-open"
            onClick={this.handleAddVersion}
            text="Add Local Electron Build"
          />
        </ButtonGroup>
      );
    }
    private filterSection(): JSX.Element {
      const { appState } = this.props;
      return (
        <FormGroup label="Filters:">
          <Checkbox
            checked={appState.showUndownloadedVersions}
            id="showUndownloadedVersions"
            label="Not Downloaded"
            onChange={this.handleStateChange}
          />
        </FormGroup>
      );
    }

    /**
     * Renders the various options for which versions should be displayed
     */
    private renderVersionShowOptions(): JSX.Element {
      const { appState } = this.props;

      const getIsChecked = (channel: ElectronReleaseChannel) => {
        return appState.channelsToShow.includes(channel);
      };

      const getIsCurrentVersionReleaseChannel = (
        channel: ElectronReleaseChannel,
      ) => {
        return getReleaseChannel(appState.version) === channel;
      };

      const channels = {
        stable: ElectronReleaseChannel.stable,
        beta: ElectronReleaseChannel.beta,
        nightly: ElectronReleaseChannel.nightly,
      };

      return (
        <FormGroup label="Channels:">
          {Object.values(channels).map((channel) => (
            <Tooltip2
              content={`Can't disable channel of selected version (${appState.version})`}
              disabled={!getIsCurrentVersionReleaseChannel(channel)}
              position="bottom"
              intent="primary"
              key={channel}
            >
              <Checkbox
                checked={getIsChecked(channel)}
                label={channel}
                id={channel}
                onChange={this.handleChannelChange}
                disabled={getIsCurrentVersionReleaseChannel(channel)}
                inline={true}
              />
            </Tooltip2>
          ))}
          <Tooltip2
            content={`Include versions that have reached end-of-life (older than ${window.ElectronFiddle.getOldestSupportedMajor()}.0.0)`}
            position="bottom"
            intent="primary"
          >
            <Checkbox
              checked={appState.showObsoleteVersions}
              id="showObsoleteVersions"
              inline={true}
              label="Obsolete"
              onChange={this.handleShowObsoleteChange}
            />
          </Tooltip2>
        </FormGroup>
      );
    }

    /**
     * Renders the table with Electron versions.
     */
    private renderTable(): JSX.Element {
      return (
        <HTMLTable className="electron-versions-table" striped={true}>
          <thead>
            <tr>
              <th>Version</th>
              <th>Status</th>
              <th className="action">Action</th>
            </tr>
          </thead>
          <tbody>{this.renderTableRows()}</tbody>
        </HTMLTable>
      );
    }

    /**
     * Renders the rows with Electron version, returning an Array.
     */
    private renderTableRows(): Array<JSX.Element | null> {
      return this.props.appState.versionsToShow.map((item) => (
        <tr key={item.version}>
          <td>{item.version}</td>
          <td>{this.renderHumanState(item)}</td>
          <td className="action">{this.renderAction(item)}</td>
        </tr>
      ));
    }

    /**
     * Returns a human-readable state indicator for an Electron version.
     */
    private renderHumanState(item: RunnableVersion): JSX.Element {
      const { state, source } = item;
      const isLocal = source === VersionSource.local;
      let icon: IconName = 'box';
      let humanState = isLocal ? 'Available' : 'Downloaded';

      if (state === InstallState.downloading) {
        icon = 'cloud-download';
        humanState = 'Downloading';
      } else if (state === InstallState.missing) {
        // The only way for a local version to be missing
        // is for it to have been deleted. Mark as unavailable.
        icon = isLocal ? 'issue' : 'cloud';
        humanState = isLocal ? 'Not Available' : 'Not Downloaded';
      }

      return (
        <span>
          <Icon icon={icon} /> {humanState}
        </span>
      );
    }

    /**
     * Renders the action for a single Electron version.
     */
    private renderAction(ver: RunnableVersion): JSX.Element {
      const { state, source, version } = ver;
      const { appState } = this.props;
      const isLocal = source === VersionSource.local;
      const buttonProps: ButtonProps = {
        fill: true,
        small: true,
      };

      switch (state) {
        case InstallState.installed:
        case InstallState.downloaded:
          buttonProps.icon = 'trash';
          buttonProps.onClick = () => appState.removeVersion(ver);
          buttonProps.text = isLocal ? 'Remove' : 'Delete';
          break;

        case InstallState.installing:
        case InstallState.downloading:
          buttonProps.disabled = true;
          buttonProps.icon = <Spinner size={16} value={ver.downloadProgress} />;
          buttonProps.text = 'Downloading';
          break;

        case InstallState.missing:
          buttonProps.disabled = false;
          buttonProps.loading = false;
          buttonProps.icon = isLocal ? 'trash' : 'cloud-download';
          buttonProps.text = isLocal ? 'Remove' : 'Download';
          buttonProps.onClick = () => {
            if (isLocal) {
              appState.removeVersion(ver);
            } else {
              appState.downloadVersion(ver);
            }
          };
          break;
      }

      if (version === appState.currentElectronVersion.version) {
        return (
          <Tooltip2
            position="auto"
            intent="primary"
            content={`Can't remove currently active Electron version (${version})`}
          >
            <AnchorButton
              className={'disabled-version'}
              disabled={true}
              text={buttonProps.text}
              icon={buttonProps.icon}
            />
          </Tooltip2>
        );
      } else if (disableDownload(version)) {
        return (
          <Tooltip2
            position="auto"
            intent="primary"
            content={`Version is not available on your current OS`}
          >
            <AnchorButton
              className={'disabled-version'}
              disabled={true}
              text={buttonProps.text}
              icon={buttonProps.icon}
            />
          </Tooltip2>
        );
      }

      return <Button {...buttonProps} type={undefined} />;
    }
  },
);
