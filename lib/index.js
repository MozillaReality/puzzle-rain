var Analytics = require('./analytics')();
var App = require('./webgl/App');
var KeyManager = require('./managers/KeyManager');
var settings = require('./settings');

var state = 0;  // State counter.

function getParameterByName (name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function initApp (bool) {
  if (getParameterByName('mode') !== 'debug') {
    state++;
    var modeTxt = 'normal';
    if (bool) {
      modeTxt = 'spectator';
    }
    var sObj = { 'state': state, 'message': bool },
      title = 'title',
      url = '?mode=' + modeTxt;

    // Push new state.
    history.pushState(sObj, title, url);
  }

  document.getElementById('launch').remove();

  // App.init(bool);

  if (App.isReadyToStart) {
    App.enterVR();
  } else {
    App.modeSelected(bool);
  }
}

global.window.addEventListener('load', function () {
  App.init(false);

  var mode = getParameterByName('mode');

  if (mode === 'debug') {
    settings.debugMode = true;
    initApp(false);
  } else {
    // `navigator.buildId` is our Firefox feature detection.
    // Temporarily disabling until Firefox has motion-controller
    // Gamepad support (for issue #78).
    if (navigator.getVRDisplays === undefined || navigator.buildId) {
      window.location.replace('fallback.html');
      return;
    }

    document.getElementById('launch').style.display = 'block';

    document.getElementById('button-mode-normal').addEventListener('click', function () {
      e.preventDefault();
      initApp(false);
    });

    document.getElementById('button-mode-spectator').addEventListener('click', function () {
      e.preventDefault();
      initApp(true);
    });

    switch (mode) {
      case 'normal':
        initApp(false);
        break;
      case 'spectator':
        initApp(true);
        break;
    }
  }

  KeyManager.init();
});
