'use strict';
var App = require('./webgl/App');
var KeyManager = require('./managers/KeyManager');

global.window.onload = function () {
  App.init();
};
