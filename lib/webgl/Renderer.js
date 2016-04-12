'use strict';

const THREE = require('three');

function Renderer () {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.sortObjects = false;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.querySelector('#container').appendChild(renderer.domElement);

  return renderer;

}

module.exports = new Renderer();
