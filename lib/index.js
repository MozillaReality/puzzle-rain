'use strict';
var App = require('./webgl/App');
var KeyManager = require('./managers/KeyManager');

global.window.onload = function () {
  document.getElementById('normalButton').addEventListener('click', function () {
    document.getElementById('launch').remove();
    App.init(false);
  });
  document.getElementById('spectatorButton').addEventListener('click', function () {
    document.getElementById('launch').remove();
    App.init(true);
  });
};
