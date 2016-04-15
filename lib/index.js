'use strict';
const App = require('./webgl/App');
const KeyManager = require('./managers/KeyManager');

global.window.onload = function () {
  App.init();
};
