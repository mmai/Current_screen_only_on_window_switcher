const windowSwitcherPopup = imports.ui.altTab.WindowSwitcherPopup;
const Main = imports.ui.main;

let injections = {};

function init() {
}

function enable() {
  injections['_getWindowList'] = windowSwitcherPopup.prototype._getWindowList;
  windowSwitcherPopup.prototype._getWindowList = function() {
    let allWindows = injections['_getWindowList'].apply(this, arguments);
    return allWindows.filter(w => w.get_monitor() === global.display.get_current_monitor());
  }

  injections['_getPreferredWidth'] = windowSwitcherPopup.prototype._getPreferredWidth;
  windowSwitcherPopup.prototype._getPreferredWidth = function() {
  	let originalPrimaryMonitor = Main.layoutManager.primaryMonitor;
  	Main.layoutManager.primaryMonitor = Main.layoutManager.currentMonitor;
    let response = injections['_getPreferredWidth'].apply(this, arguments);
    Main.layoutManager.primaryMonitor = originalPrimaryMonitor;
    return response;
  }

  injections['_getPreferredHeight'] = windowSwitcherPopup.prototype._getPreferredHeight;
  windowSwitcherPopup.prototype._getPreferredHeight = function() {
  	let originalPrimaryMonitor = Main.layoutManager.primaryMonitor;
  	Main.layoutManager.primaryMonitor = Main.layoutManager.currentMonitor;
    let response = injections['_getPreferredHeight'].apply(this, arguments);
    Main.layoutManager.primaryMonitor = originalPrimaryMonitor;
    return response;
  }

  injections['_allocate'] = windowSwitcherPopup.prototype._allocate;
  windowSwitcherPopup.prototype._allocate = function() {
  	let originalPrimaryMonitor = Main.layoutManager.primaryMonitor;
  	Main.layoutManager.primaryMonitor = Main.layoutManager.currentMonitor;
    let response = injections['_allocate'].apply(this, arguments);
    Main.layoutManager.primaryMonitor = originalPrimaryMonitor;
    return response;
  }
}

function disable() {
  windowSwitcherPopup.prototype._getWindowList = injections['_getWindowList'];
  windowSwitcherPopup.prototype._getPreferredWidth = injections['_getPreferredWidth'];
  windowSwitcherPopup.prototype._getPreferredHeight = injections['_getPreferredHeight'];
  windowSwitcherPopup.prototype._allocate = injections['_allocate'];
}
