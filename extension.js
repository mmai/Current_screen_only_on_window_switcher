//  See the `gnome3` branch for a version compatible with gnome < 3.32

const { GObject } = imports.gi;

const PACKAGE_VERSION = imports.misc.config.PACKAGE_VERSION;
const altTab = imports.ui.altTab;
const main = imports.ui.main;

let originals = {};

function getCurrentMonitorWindows() {
  let allWindows = originals['getWindows'].apply(this, arguments);
  return allWindows.filter(w => w.get_monitor() === global.display.get_current_monitor());
}

let CurrentMonitorWindowSwitcherPopup = GObject.registerClass(
  class CurrentMonitorWindowSwitcherPopup extends altTab.WindowSwitcherPopup {
    vfunc_allocate() {
      let originalPrimaryMonitor = main.layoutManager.primaryMonitor;
      main.layoutManager.primaryMonitor = main.layoutManager.currentMonitor;
      let response = super.vfunc_allocate.apply(this, arguments);
      main.layoutManager.primaryMonitor = originalPrimaryMonitor;
      return response;
    }
  });

let CurrentMonitorAppSwitcherPopup = GObject.registerClass(
  class CurrentMonitorAppSwitcherPopup extends altTab.AppSwitcherPopup {
    vfunc_allocate() {
      let originalPrimaryMonitor = main.layoutManager.primaryMonitor;
      main.layoutManager.primaryMonitor = main.layoutManager.currentMonitor;
      let response = super.vfunc_allocate.apply(this, arguments);
      main.layoutManager.primaryMonitor = originalPrimaryMonitor;
      return response;
    }
  });

let CurrentMonitorAppSwitcher = GObject.registerClass(
  class CurrentMonitorAppSwitcher extends altTab.AppSwitcher {
    _addIcon(icon) {
      icon.cachedWindows = icon.cachedWindows.filter(w => w.get_monitor() === global.display.get_current_monitor());
      if(icon.cachedWindows.length === 0) {
        return;
      }
      return super._addIcon.call(this, icon);
    }
  });

function enable() {
  originals['getWindows'] = altTab.getWindows;
  altTab.getWindows = getCurrentMonitorWindows;

  originals['WindowSwitcherPopup'] = altTab.WindowSwitcherPopup;
  altTab.WindowSwitcherPopup = CurrentMonitorWindowSwitcherPopup;

  originals['appSwitcherPopup'] = altTab.AppSwitcherPopup;
  altTab.AppSwitcherPopup = CurrentMonitorAppSwitcherPopup;

  originals['appSwitcher'] = altTab.AppSwitcher;
  altTab.AppSwitcher = CurrentMonitorAppSwitcher;
}

function disable(){
  altTab.getWindows = originals['getWindows'];
  altTab.WindowSwitcherPopup = originals['WindowSwitcherPopup'];
  altTab.AppSwitcherPopup = originals['appSwitcherPopup'];
  altTab.AppSwitcher = originals['appSwitcher'];
}
