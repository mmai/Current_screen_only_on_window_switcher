//  See the `gnome3` branch for a version compatible with gnome < 3.32

const { GObject } = imports.gi;

const PACKAGE_VERSION = imports.misc.config.PACKAGE_VERSION;
const altTab = imports.ui.altTab;
const main = imports.ui.main;

let CurrentMonitorWindowSwitcherPopup;
let CurrentMonitorAppSwitcherPopup;
let CurrentMonitorAppSwitcher;

let injections = {};

function getCurrentMonitorWindows() {
    let allWindows = injections['getWindows'].apply(this, arguments);
    return allWindows.filter(w => w.get_monitor() === global.display.get_current_monitor());
}

function init() {
  CurrentMonitorWindowSwitcherPopup = GObject.registerClass(
    class CurrentMonitorWindowSwitcherPopup extends altTab.WindowSwitcherPopup {
      vfunc_allocate() {
        let originalPrimaryMonitor = main.layoutManager.primaryMonitor;
        main.layoutManager.primaryMonitor = main.layoutManager.currentMonitor;
        let response = super.vfunc_allocate.apply(this, arguments);
        main.layoutManager.primaryMonitor = originalPrimaryMonitor;
        return response;
      }
  });

  CurrentMonitorAppSwitcherPopup = GObject.registerClass(
    class CurrentMonitorAppSwitcherPopup extends altTab.AppSwitcherPopup {
      vfunc_allocate() {
        let originalPrimaryMonitor = main.layoutManager.primaryMonitor;
        main.layoutManager.primaryMonitor = main.layoutManager.currentMonitor;
        let response = super.vfunc_allocate.apply(this, arguments);
        main.layoutManager.primaryMonitor = originalPrimaryMonitor;
        return response;
      }
  });

  CurrentMonitorAppSwitcher = GObject.registerClass(
    class CurrentMonitorAppSwitcher extends altTab.AppSwitcher {
      _addIcon(icon) {
        icon.cachedWindows = icon.cachedWindows.filter(w => w.get_monitor() === global.display.get_current_monitor());
        if(icon.cachedWindows.length === 0) {
          return;
        }
        return super._addIcon.call(this, icon);
      }
  });
}

function enable() {
  injections['getWindows'] = altTab.getWindows;
  altTab.getWindows = getCurrentMonitorWindows;

  injections['WindowSwitcherPopup'] = altTab.WindowSwitcherPopup;
  altTab.WindowSwitcherPopup = CurrentMonitorWindowSwitcherPopup;

  injections['appSwitcherPopup'] = altTab.AppSwitcherPopup;
  altTab.AppSwitcherPopup = CurrentMonitorAppSwitcherPopup;

  injections['appSwitcher'] = altTab.AppSwitcher;
  altTab.AppSwitcher = CurrentMonitorAppSwitcher;
}

function disable(){
  altTab.getWindows = injections['getWindows'];
  altTab.WindowSwitcherPopup = injections['WindowSwitcherPopup'];
  altTab.AppSwitcherPopup = injections['appSwitcherPopup'];
  altTab.AppSwitcher = injections['appSwitcher'];
}
