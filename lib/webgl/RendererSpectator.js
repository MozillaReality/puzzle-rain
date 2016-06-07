'use strict';

var THREE = require('three');
var State = require('../state/State');
var settings = require('../settings');

function RendererSpectator () {
  if (settings.trailerMode) {
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.sortObjects = false;
    renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.BasicShadowMap;

    document.querySelector('#container').appendChild(renderer.domElement);

    return renderer;
  }
}

module.exports = new RendererSpectator();
