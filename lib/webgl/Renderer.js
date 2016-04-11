'use strict';

const THREE = require('three');

function Renderer () {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
	
  document.querySelector('#webglContent').appendChild(renderer.domElement);

  return renderer;

}

module.exports = new Renderer();
