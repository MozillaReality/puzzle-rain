'use strict';
var App = require('./webgl/App');
var KeyManager = require('./managers/KeyManager');
var settings = require('./settings');

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
  document.getElementById('launch').remove();
  App.init(bool);
}

global.window.onload = function () {
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
