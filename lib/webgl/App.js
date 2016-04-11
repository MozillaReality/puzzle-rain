'use strict';

const THREE = require('three');

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.01, 1000000);
const scene = new THREE.Scene();
const renderer = require('./Renderer');
const listener = new THREE.AudioListener();
const WEBVR = require('./WebVR');
const VREffect = require('./effects/VREffect');
const VRControls = require('./controls/VRControls');

const SHADOW_MAP_WIDTH = 4096, SHADOW_MAP_HEIGHT = 4096;

let effect,
  controls,
  vrMode = false,
  vrDisplay = null,
  secureArea,
  userHeight = 1.7,
  light, pointL1;

const clock = new THREE.Clock();

let isPaused = false;

function App () {
  function onWindowResize (event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    if (vrMode) {
      if (vrDisplay && vrDisplay.isPresenting) {
        var leftEye = vrDisplay.getEyeParameters('left');
        var rightEye = vrDisplay.getEyeParameters('right');

        var width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
        var height = Math.max(leftEye.renderHeight, rightEye.renderHeight);

        effect.setSize(width, height);

      } else {
        effect.setSize(window.innerWidth, window.innerHeight);

      }

    } else {
      renderer.setSize(window.innerWidth, window.innerHeight);

    }
  }

  function animate () {
    if (isPaused) {
      return;
    }
    requestAnimationFrame(animate);
    render();
  }

  function render () {
    if (vrMode) {
      effect.render(scene, camera);

    } else {
      renderer.render(scene, camera);

    }
    // Update VR headset position and apply to camera.
    controls.update();
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
    enterVR: function () {
      onWindowResize();
    },
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
              // console.log(vrDisplay.stageParameters);
              var secureGeo = new THREE.PlaneGeometry(vrDisplay.stageParameters.sizeX, vrDisplay.stageParameters.sizeZ, 32, 32);

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

      // Lights
      light = new THREE.AmbientLight(0x404050, 3);
      scene.add(light);

      pointL1 = new THREE.PointLight(0x404050, 3, 0);
      pointL1.castShadow = true;
      pointL1.shadow.camera.near = 1;
      pointL1.shadow.camera.far = 30;
      pointL1.shadow.mapSize.width = SHADOW_MAP_WIDTH;
      pointL1.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
      pointL1.shadow.bias = 0.001;
      pointL1.position.set(- 3, 5, - 3);
      scene.add(pointL1);

      if (WEBVR.isAvailable() === true) {
        document.body.appendChild(WEBVR.getButton(effect));

      }

      onWindowResize();
      window.addEventListener('resize', onWindowResize, false);
      animate();
    }
  };

}

module.exports = new App();
