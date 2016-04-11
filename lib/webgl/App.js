'use strict';

const THREE = require('three');

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.01, 1000000);
const scene = new THREE.Scene();
const renderer = require('./Renderer');
const listener = new THREE.AudioListener();
const WEBVR = require('./WebVR');
const VREffect = require('./effects/VREffect');
const VRControls = require('./controls/VRControls');

let effect,
  controls,
  vrMode = false,
  vrDisplay = null,
  secureArea,
  userHeight = 1.7;

const clock = new THREE.Clock();

let isPaused = false;

function App () {
  function onWindowResize (event) {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  }

  function animate () {
    if (isPaused) {
      return;
    }
    requestAnimationFrame(animate);
    render();
  }

  function render () {
    let delta = clock.getDelta();
    // Signals.updateScene.dispatch( delta );
    // console.log(delta);
    renderer.clear();
    renderer.render(scene, camera);
  }

  function pauseAll (bool) {
    isPaused = bool;
    if (! isPaused) {
      animate();
    }
  }

  function vrFallback () {
    console.log('fallback VR');

  }

  return {
    scene: scene,
    camera: camera,
    renderer: renderer,
    init: function () {
      console.log('init');

      window.onfocus = function () {
        pauseAll(false);

      };
      window.onblur = function () {
        pauseAll(true);

      };

      if (WEBVR.isLatestAvailable() === false) {
        document.body.appendChild(WEBVR.getMessage());
      }

      camera.add(listener);

      effect = new THREE.VREffect(renderer);
      effect.setSize(window.innerWidth, window.innerHeight);

      // CONTROLS
      if (navigator.getVRDisplays || navigator.getVRDevices) {
        controls = new THREE.VRControls(camera, vrFallback);
        controls.standing = true;
        vrMode = true;

        navigator.getVRDisplays().then(function (displays) {
          if (displays.length > 0) {
            vrDisplay = displays[ 0 ];

            if (vrDisplay.stageParameters) {
              // console.log( vrDisplay.stageParameters );
              var secureGeo = new THREE.PlaneGeometry(vrDisplay.stageParameters.sizeX, vrDisplay.stageParameters.sizeZ, 32, 32);
              // initMinRadius = Math.max( vrDisplay.stageParameters.sizeX, vrDisplay.stageParameters.sizeZ );
              // initMaxRadius = initMinRadius + 4;

              secureGeo.rotateX(- Math.PI / 2);

              secureArea = new THREE.Mesh(secureGeo, new THREE.MeshLambertMaterial({ color: 0x999999 }));
              secureArea.receiveShadow = true;
              secureArea.position.y = - 0.01;
              scene.add(secureArea);

            }

          }

        });

      } else {
        camera.position.set(0, userHeight, 0);
        vrFallback();

      }
      onWindowResize();
      animate();
    }
  };

}

module.exports = new App();
