'use strict';

const THREE = require('three');

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000000);
const scene = new THREE.Scene();
const renderer = require('./Renderer');

const clock = new THREE.Clock();

function App () {

	function onWindowResize (event) {
	  const newWidth = window.innerWidth;
	  const newHeight = window.innerHeight;
	  camera.aspect = newWidth / newHeight;
	  camera.updateProjectionMatrix();
	  renderer.setSize(newWidth, newHeight);
	}

	function update() {
		requestAnimationFrame( update );
		render();
	};

	function render () {
		let delta = clock.getDelta();
		// Signals.updateScene.dispatch( delta );
		renderer.clear();
		renderer.render(scene, camera);
	};

  return {
    scene: scene,
    camera: camera,
    renderer: renderer,
    init: function () {
			console.log('init');
			window.addEventListener( 'resize', onWindowResize, false );
			onWindowResize();
			update();
    }
  };

}

module.exports = new App();
