const { GObject } = imports.gi;

const Main = imports.ui.main;
const Layout = imports.ui.layout;
const AltTab = imports.ui.altTab;
const Config = imports.misc.config;

let injections = {};
let enabled = false;
let loaded = false;

function l() {
  // hide debug
  if (true) {
    return;
  }

  let args = Array.from(arguments);
  args.unshift('alttab_current_monitor');
  log.apply(this, args);
}

function load_3_32() {
  l('loading 3.32 code');

  injections['getWindows'] = AltTab.getWindows;
  AltTab.getWindows = function() {
    let allWindows = injections['getWindows'].apply(this, arguments);

    if (!enabled) {
      return allWindows;
    }

    return allWindows.filter(w => w.get_monitor() === global.display.get_current_monitor());
  }

  AltTab.WindowSwitcherPopup = GObject.registerClass(
  class CurrentMonitorWindowSwitcherPopup extends AltTab.WindowSwitcherPopup {
    vfunc_allocate() {
      if (!enabled) {
        return super.vfunc_allocate.apply(this, arguments);
      }

      l('CurrentMonitorWindowSwitcherPopup vfunc_allocate');

      let originalPrimaryMonitor = Main.layoutManager.primaryMonitor;
      Main.layoutManager.primaryMonitor = Main.layoutManager.currentMonitor;

      let response = super.vfunc_allocate.apply(this, arguments);

      Main.layoutManager.primaryMonitor = originalPrimaryMonitor;

      return response;
    }
  });

  AltTab.AppSwitcherPopup = GObject.registerClass(
  class CurrentMonitorAppSwitcherPopup extends AltTab.AppSwitcherPopup {
    vfunc_allocate() {
      if (!enabled) {
        return super.vfunc_allocate.apply(this, arguments);
      }

      l('CurrentMonitorAppSwitcherPopup vfunc_allocate');

      let originalPrimaryMonitor = Main.layoutManager.primaryMonitor;
      Main.layoutManager.primaryMonitor = Main.layoutManager.currentMonitor;

      let response = super.vfunc_allocate.apply(this, arguments);

      Main.layoutManager.primaryMonitor = originalPrimaryMonitor;

      return response;
    }
  });

  AltTab.AppSwitcher = GObject.registerClass(
  class CurrentMonitorAppSwitcher extends AltTab.AppSwitcher {
    _addIcon(icon) {
      if (!enabled) {
        return super._addIcon.apply(this, arguments);
      }

      l('CurrentMonitorAppSwitcher _addIcon');

      icon.cachedWindows = icon.cachedWindows.filter(w => w.get_monitor() === global.display.get_current_monitor());

      if(icon.cachedWindows.length === 0)
        return;

      return super._addIcon.call(this, icon);
    }
  });
}

function load_older() {
  l('loading code for older versions');

  injections['_getWindowList'] = AltTab.WindowSwitcherPopup.prototype._getWindowList;
  AltTab.WindowSwitcherPopup.prototype._getWindowList = function() {
    let allWindows = injections['_getWindowList'].apply(this, arguments);

    if (!enabled) {
      return allWindows;
    }

    return allWindows.filter(w => w.get_monitor() === global.display.get_current_monitor());
  }

  injections['_getPreferredWidth'] = AltTab.WindowSwitcherPopup.prototype._getPreferredWidth;
  AltTab.WindowSwitcherPopup.prototype._getPreferredWidth = function() {
    if (!enabled) {
      return injections['_getPreferredWidth'].apply(this, arguments);
    }

    let originalPrimaryMonitor = Main.layoutManager.primaryMonitor;
    Main.layoutManager.primaryMonitor = Main.layoutManager.currentMonitor;

    let response = injections['_getPreferredWidth'].apply(this, arguments);

    Main.layoutManager.primaryMonitor = originalPrimaryMonitor;

    return response;
  }

  injections['_getPreferredHeight'] = AltTab.WindowSwitcherPopup.prototype._getPreferredHeight;
  AltTab.WindowSwitcherPopup.prototype._getPreferredHeight = function() {
    if (!enabled) {
      return injections['_getPreferredHeight'].apply(this, arguments);
    }

    let originalPrimaryMonitor = Main.layoutManager.primaryMonitor;
    Main.layoutManager.primaryMonitor = Main.layoutManager.currentMonitor;

    let response = injections['_getPreferredHeight'].apply(this, arguments);

    Main.layoutManager.primaryMonitor = originalPrimaryMonitor;

    return response;
  }

  injections['_allocate'] = AltTab.WindowSwitcherPopup.prototype._allocate;
  AltTab.WindowSwitcherPopup.prototype._allocate = function() {
    if (!enabled) {
      return injections['_allocate'].apply(this, arguments);
    }

    let originalPrimaryMonitor = Main.layoutManager.primaryMonitor;
    Main.layoutManager.primaryMonitor = Main.layoutManager.currentMonitor;

    let response = injections['_allocate'].apply(this, arguments);

    Main.layoutManager.primaryMonitor = originalPrimaryMonitor;

    return response;
  }

  injections['_addIcon'] = AltTab.AppSwitcher.prototype._addIcon;
  AltTab.AppSwitcher.prototype._addIcon = function(icon) {
    if (!enabled) {
      return injections['_addIcon'].apply(this, arguments);
    }

    icon.cachedWindows = icon.cachedWindows.filter(w => w.get_monitor() === global.display.get_current_monitor());

    if(icon.cachedWindows.length === 0)
      return;

    return injections['_addIcon'].call(this, icon);
  }
}

function init() {
  l('extension init');

  if (loaded) {
    return;
  }

  loaded = true;

  l('shell version', Config.PACKAGE_VERSION);

  if (checkMiniumShellVersion('3.32')) {
    load_3_32();
  } else {
    load_older();
  }
}

function enable() {
  enabled = true;
}

function disable() {
  enabled = false;
}

function checkMiniumShellVersion(requiredVersion) {
  let requiredArray = requiredVersion.split('.');
  let currentArray = Config.PACKAGE_VERSION.split('.');

  for (let i = 0; i < requiredArray.length; i++) {
    if (currentArray[i] == undefined) {
      currentArray[i] = '0';
    }

    let currentPart = parseInt(currentArray[i], 10);
    let requiredPart = parseInt(requiredArray[i], 10);

    if (currentPart > requiredPart) {
      return true;
    }

    if (currentPart < requiredPart) {
      return false;
    }
  }

  return true;
}
