const windowSwitcherPopup = imports.ui.altTab.WindowSwitcherPopup;
const appSwitcher = imports.ui.altTab.AppSwitcher;

let injections = {};

function init() {
}

function enable() {
  injections['_getWindowList'] = windowSwitcherPopup.prototype._getWindowList;
  windowSwitcherPopup.prototype._getWindowList = function() {
    let allWindows = injections['_getWindowList'].call(this);
    return allWindows.filter(w => w.get_monitor() === global.screen.get_current_monitor());
  }
  
  injections['_addIcon'] = appSwitcher.prototype._addIcon;
  appSwitcher.prototype._addIcon = function(icon) {
    icon.cachedWindows = icon.cachedWindows.filter(w => w.get_monitor() === global.screen.get_current_monitor());
    if(icon.cachedWindows.length === 0) return;
    return injections['_addIcon'].call(this, icon);
  }
}

function disable() {
  windowSwitcherPopup.prototype._getWindowList = injections['_getWindowList'];
  appSwitcher.prototype._addIcon = injections['_addIcon'];
}
