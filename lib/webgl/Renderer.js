'use strict';

var THREE = require('three');
var State = require('../state/State');

function Renderer () {
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // For old devices as my Macbook and Mac Mini
  // if (!State.get('vrDisplay')) {
  //   renderer.setPixelRatio(0.5);
  // } else {
  renderer.setPixelRatio(window.devicePixelRatio);
  // }
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.sortObjects = false;
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.querySelector('#container').appendChild(renderer.domElement);

  return renderer;

}

module.exports = new Renderer();
