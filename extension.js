const { GObject } = imports.gi;

const PACKAGE_VERSION = imports.misc.config.PACKAGE_VERSION;
const altTab = imports.ui.altTab;
const main = imports.ui.main;

let CurrentMonitorWindowSwitcherPopup;
let CurrentMonitorAppSwitcherPopup;
let CurrentMonitorAppSwitcher;

let injections = {};

function init() {
  if (PACKAGE_VERSION >= '3.32') {
    init_3_32();
  }
}

function enable() {
  if (cmpVersions(PACKAGE_VERSION, '3.32') < 0){
    enable_older();
  } else {
    enable_3_32();
  }
}

function disable() {
  if (cmpVersions(PACKAGE_VERSION, '3.32') < 0){
    disable_older();
  } else {
    disable_3_32();
  }
}

/*******************************
 *   gnome-shell >= 3.32       *
 *******************************/

function getCurrentMonitorWindows() {
    let allWindows = injections['getWindows'].apply(this, arguments);
    return allWindows.filter(w => w.get_monitor() === getCurrentMonitor());
}

function init_3_32() {
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
        icon.cachedWindows = icon.cachedWindows.filter(w => w.get_monitor() === getCurrentMonitor());
        if(icon.cachedWindows.length === 0) {
          return;
        }
        return super._addIcon.call(this, icon);
      }
  });
}

function enable_3_32() {
  injections['getWindows'] = altTab.getWindows;
  altTab.getWindows = getCurrentMonitorWindows;

  injections['WindowSwitcherPopup'] = altTab.WindowSwitcherPopup;
  altTab.WindowSwitcherPopup = CurrentMonitorWindowSwitcherPopup;

  injections['appSwitcherPopup'] = altTab.AppSwitcherPopup;
  altTab.AppSwitcherPopup = CurrentMonitorAppSwitcherPopup;

  injections['appSwitcher'] = altTab.AppSwitcher;
  altTab.AppSwitcher = CurrentMonitorAppSwitcher;
}

function disable_3_32(){
  altTab.getWindows = injections['getWindows'];
  altTab.WindowSwitcherPopup = injections['WindowSwitcherPopup'];
  altTab.AppSwitcherPopup = injections['appSwitcherPopup'];
  altTab.AppSwitcher = injections['appSwitcher'];
}

/*******************************
 *   gnome-shell < 3.32        *
 *******************************/

function enable_older() {
  injections['_getWindowList'] = altTab.WindowSwitcherPopup.prototype._getWindowList;
  altTab.WindowSwitcherPopup.prototype._getWindowList = function() {
    let allWindows = injections['_getWindowList'].apply(this, arguments);
    return allWindows.filter(w => w.get_monitor() === getCurrentMonitor());
  }

  injections['_getPreferredWidth'] = altTab.WindowSwitcherPopup.prototype._getPreferredWidth;
  altTab.WindowSwitcherPopup.prototype._getPreferredWidth = function() {
    let originalPrimaryMonitor = main.layoutManager.primaryMonitor;
    main.layoutManager.primaryMonitor = main.layoutManager.currentMonitor;
    let response = injections['_getPreferredWidth'].apply(this, arguments);
    main.layoutManager.primaryMonitor = originalPrimaryMonitor;
    return response;
  }

  injections['_getPreferredHeight'] = altTab.WindowSwitcherPopup.prototype._getPreferredHeight;
  altTab.WindowSwitcherPopup.prototype._getPreferredHeight = function() {
    let originalPrimaryMonitor = main.layoutManager.primaryMonitor;
    main.layoutManager.primaryMonitor = main.layoutManager.currentMonitor;
    let response = injections['_getPreferredHeight'].apply(this, arguments);
    main.layoutManager.primaryMonitor = originalPrimaryMonitor;
    return response;
  }

  injections['_allocate'] = altTab.WindowSwitcherPopup.prototype._allocate;
  altTab.WindowSwitcherPopup.prototype._allocate = function() {
    let originalPrimaryMonitor = main.layoutManager.primaryMonitor;
    main.layoutManager.primaryMonitor = main.layoutManager.currentMonitor;
    let response = injections['_allocate'].apply(this, arguments);
    main.layoutManager.primaryMonitor = originalPrimaryMonitor;
    return response;
  }

  injections['_addIcon'] = altTab.AppSwitcher.prototype._addIcon;
  altTab.AppSwitcher.prototype._addIcon = function(icon) {
    icon.cachedWindows = icon.cachedWindows.filter(w => w.get_monitor() === getCurrentMonitor());
    if(icon.cachedWindows.length === 0) {
      return;
    }
    return injections['_addIcon'].call(this, icon);
  }
}

function disable_older(){
  altTab.WindowSwitcherPopup.prototype._getWindowList = injections['_getWindowList'];
  altTab.WindowSwitcherPopup.prototype._getPreferredWidth = injections['_getPreferredWidth'];
  altTab.WindowSwitcherPopup.prototype._getPreferredHeight = injections['_getPreferredHeight'];
  altTab.WindowSwitcherPopup.prototype._allocate = injections['_allocate'];
  altTab.AppSwitcher.prototype._addIcon = injections['_addIcon'];
}

/*******************************
 *           utils             *
 *******************************/

function getCurrentMonitor(){
  if (cmpVersions(PACKAGE_VERSION, '3.30') < 0){
    return global.screen.get_current_monitor();
  }
  return global.display.get_current_monitor();
}

function cmpVersions (a, b) {
    var i, diff;
    var regExStrip0 = /(\.0+)+$/;
    var segmentsA = a.replace(regExStrip0, '').split('.');
    var segmentsB = b.replace(regExStrip0, '').split('.');
    var l = Math.min(segmentsA.length, segmentsB.length);

    for (i = 0; i < l; i++) {
        diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
        if (diff) {
            return diff;
        }
    }
    return segmentsA.length - segmentsB.length;
}
