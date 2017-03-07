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
    bool = !!bool;
    var modeTxt = bool ? 'spectator' : 'normal';
    var state = {
      state: state,
      message: bool,
      mode: modeTxt
    };
    var title = document.title;
    var url = window.location.pathname + '?mode=' + modeTxt;

    // Push new state.
    history.pushState(state, title, url);
  }

  var launch = document.getElementById('launch');
  if (launch && launch.remove) {
    launch.remove();
  }

  // App.init(bool);

  if (App.isReadyToStart) {
    console.log('Ready to start ...');
    App.enterVR();
  } else {
    console.log('Selected app mode "%s" (%s) ...', modeTxt, bool);
    App.modeSelected(bool);
  }
}

(function (win, doc) {
  var isDev = win.location.port !== 80 && win.location.port !== 443;
  var originWithoutPort = win.location.protocol + '//' + win.location.hostname;

  var webvrAgentScript = doc.querySelector('script[src*="agent"][src*="/client.js"]');
  var webvrAgentScriptSrcLocal = originWithoutPort + ':4040/client.js';

  if (webvrAgentScript) {
    if (isDev) {
      if (webvrAgentScript) {
        webvrAgentScript.abort = true;
        webvrAgentScript.src = webvrAgentScript.src.replace(/(.+)client.js/, originWithoutPort + ':4040/client.js');
      }
    }
  } else {
    webvrAgentScript = doc.createElement('script');
    webvrAgentScript.src = isDev ? webvrAgentScriptSrcLocal : 'https://agent.webvr.rocks/client.js';
    webvrAgentScript.async = webvrAgentScript.defer = true;
    doc.head.appendChild(webvrAgentScript);
  }
})(window, document);

global.window.addEventListener('load', function () {
  App.init(false);

  var mode = getParameterByName('mode');

  if (mode === 'debug') {
    settings.debugMode = true;
    initApp(false);
  } else {
    var launch = document.getElementById('launch');
    if (launch) {
      launch.classList.remove('hidden');
    }

    var buttonModeNormal = document.getElementById('button-mode-normal');
    var buttonModeSpectator = document.getElementById('button-mode-spectator');

    if (buttonModeNormal) {
      buttonModeNormal.addEventListener('click', function (evt) {
        evt.preventDefault();
        initApp(false);
      });
    }

    if (buttonModeSpectator) {
      buttonModeSpectator.addEventListener('click', function (evt) {
        evt.preventDefault();
        initApp(true);
      });
    }

    switch (mode) {
      case 'normal':
        initApp(false);
        break;
      case 'spectator':
        initApp(true);
        break;
      default:
        document.documentElement.dataset.showSplash = 'true';
        break;
    }
  }

  KeyManager.init();
});
