'use strict';

var THREE = require('three');
var State = require('../state/State');
var settings = require('../settings');

function Renderer () {
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.sortObjects = false;
  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.BasicShadowMap;
  if (!settings.trailerMode) {
    document.querySelector('#container').appendChild(renderer.domElement);
  } else {
    // To optimize the spectator renderer
    // renderer.shadowMap.enabled = false;
  }

  return renderer;

}

module.exports = new Renderer();
