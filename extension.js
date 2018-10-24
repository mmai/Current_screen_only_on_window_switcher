const windowSwitcherPopup = imports.ui.altTab.WindowSwitcherPopup;

let injections = {};

function init() {
}

function enable() {
  injections['_getWindowList'] = windowSwitcherPopup.prototype._getWindowList;
  windowSwitcherPopup.prototype._getWindowList = function() {
    let allWindows = injections['_getWindowList'].call(this);
    return allWindows.filter(w => w.get_monitor() === global.display.get_current_monitor());
  }
}

function disable() {
  windowSwitcherPopup.prototype._getWindowList = injections['_getWindowList'];
}
