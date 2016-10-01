var Analytics = require('./analytics')();
var App = require('./webgl/App');
var KeyManager = require('./managers/KeyManager');
var settings = require('./settings');

// State counter.
var state = 0;

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
  // App.init(bool)
  if (App.isReadyToStart) {
    App.enterVR();
  }else {
    App.modeSelected(bool);
  }
}

global.window.addEventListener('popstate', function () {
  window.location.reload();
});

global.window.onload = function () {
  App.init(false);
  if (getParameterByName('mode') === 'debug') {
    settings.debugMode = true;
    initApp(false);
  } else {
    if (navigator.getVRDisplays === undefined) {
      window.location.replace('fallback.html');
    } else {
      document.getElementById('launch').style.display = 'block';
      document.getElementById('normalButton').addEventListener('click', function () {
        initApp(false);
      });
      document.getElementById('spectatorButton').addEventListener('click', function () {
        initApp(true);
      });
      switch (getParameterByName('mode')) {
        case 'normal':
          initApp(false);
          break;
        case 'spectator':
          initApp(true);
          break;
      }
    }
  }
  KeyManager.init();
};
