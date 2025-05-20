import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  app,
  shell,
} from 'electron';

import { ipcMainManager } from './ipc';
import { SetUpMenuOptions } from '../interfaces';
import { IpcEvents } from '../ipc-events';

/**
 * Is the passed object a constructor for an Electron Menu?
 */
function isSubmenu(
  submenu?: Array<MenuItemConstructorOptions> | Menu,
): submenu is Array<MenuItemConstructorOptions> {
  return !!submenu && Array.isArray(submenu);
}

/**
 * Returns additional items for the help menu
 */
function getHelpItems(): Array<MenuItemConstructorOptions> {
  const items: MenuItemConstructorOptions[] = [];

  items.push(
    {
      type: 'separator',
    },
    {
      label: 'Toggle Developer Tools',
      accelerator: 'CmdOrCtrl+Option+i',
      click() {
        const browserWindow = BrowserWindow.getFocusedWindow();

        if (browserWindow && !browserWindow.isDestroyed()) {
          browserWindow.webContents.toggleDevTools();
        }
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Open Fiddle Repository...',
      click() {
        shell.openExternal('https://github.com/tachybase/fiddle');
      },
    },
    {
      label: 'Open Tachybase Repository...',
      click() {
        shell.openExternal('https://github.com/tachybase/tachybase');
      },
    },
    {
      label: 'Open Tachybase Issue Tracker...',
      click() {
        shell.openExternal('https://github.com/tachybase/tachybase/issues');
      },
    },
  );

  // on macOS, there's already the About Tachybase Fiddle menu item
  // under the first submenu set by the electron-default-menu package
  if (process.platform !== 'darwin') {
    items.push(
      {
        type: 'separator',
      },
      {
        label: 'About Tachybase Fiddle',
        click() {
          app.showAboutPanel();
        },
      },
    );
  }

  return items;
}

/**
 * Depending on the OS, the `Preferences` either go into the `Fiddle`
 * menu (macOS) or under `File` (Linux, Windows)
 */
function getPreferencesItems(): Array<MenuItemConstructorOptions> {
  return [
    {
      type: 'separator',
    },
    {
      label: 'Preferences',
      accelerator: 'CmdOrCtrl+,',
      click() {
        ipcMainManager.send(IpcEvents.OPEN_SETTINGS);
      },
    },
    {
      type: 'separator',
    },
  ];
}

/**
 * Creates the app's window menu.
 */
export function setupMenu(_?: SetUpMenuOptions) {
  // Get template for default menu
  const defaultMenu = require('electron-default-menu');
  const menu = (
    defaultMenu(app, shell) as Array<MenuItemConstructorOptions>
  ).map((item) => {
    const { label } = item;

    // Append the "Settings" item
    if (
      process.platform === 'darwin' &&
      label === app.name &&
      isSubmenu(item.submenu)
    ) {
      item.submenu.splice(2, 0, ...getPreferencesItems());
    }

    // Custom handler for "Select All" for Monaco
    if (label === 'Edit' && isSubmenu(item.submenu)) {
      const selectAll = item.submenu.find((i) => i.label === 'Select All')!;
      delete selectAll.role; // override default role
      selectAll.click = () => {
        ipcMainManager.send(IpcEvents.SELECT_ALL_IN_EDITOR);

        // Allow selection to occur in text fields outside the editors.
        if (process.platform === 'darwin') {
          Menu.sendActionToFirstResponder('selectAll:');
        }
      };

      const undo = item.submenu.find((i) => i.label === 'Undo')!;
      delete undo.role; // override default role
      undo.click = () => {
        ipcMainManager.send(IpcEvents.UNDO_IN_EDITOR);

        // Allow undo to occur in text fields outside the editors.
        if (process.platform === 'darwin') {
          Menu.sendActionToFirstResponder('undo:');
        }
      };

      const redo = item.submenu.find((i) => i.label === 'Redo')!;
      delete redo.role; // override default role
      redo.click = () => {
        ipcMainManager.send(IpcEvents.REDO_IN_EDITOR);

        // Allow redo to occur in text fields outside the editors.
        if (process.platform === 'darwin') {
          Menu.sendActionToFirstResponder('redo:');
        }
      };
    }

    // Tweak "View" menu
    if (label === 'View' && isSubmenu(item.submenu)) {
      // remove "Reload" (has weird behaviour) and "Toggle Developer Tools"
      item.submenu = item.submenu.filter(
        (subItem) =>
          subItem.label !== 'Toggle Developer Tools' &&
          subItem.label !== 'Reload',
      );
      item.submenu.push(
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
      ); // Add zooming actions
    }

    // Append items to "Help"
    if (label === 'Help' && isSubmenu(item.submenu)) {
      item.submenu = getHelpItems();
    }

    return item;
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}
