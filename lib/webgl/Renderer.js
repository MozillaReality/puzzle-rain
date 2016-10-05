'use strict';

var THREE = require('./three');
var State = require('../state/State');
var settings = require('../settings');

function Renderer () {
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.sortObjects = false;
  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.BasicShadowMap;
  if (settings.spectatorMode) {
    if (settings.trailerMode) {
      // To optimize the spectator renderer
      renderer.setPixelRatio(0.25);
      renderer.shadowMap.enabled = false;

    }
  } else {
    renderer.setPixelRatio(window.devicePixelRatio);
    document.querySelector('#container').appendChild(renderer.domElement);
  }

  return renderer;

}

module.exports = new Renderer();
