'use strict';

const Events = require('../events/Events');

const THREE = require('three');

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.01, 1000000);
const scene = new THREE.Scene();
const renderer = require('./Renderer');
const listener = new THREE.AudioListener();
const WEBVR = require('./WebVR');
const VREffect = require('./effects/VREffect');
const VRControls = require('./controls/VRControls');
const OrbitControls = require('./controls/OrbitControls');

const Sky = require('./assets/Sky');
const Ground = require('./assets/Ground');
const SecureArea = require('./assets/SecureArea');

const MeshReferenceForLighting = require('./assets/MeshReferenceForLighting');

const GamepadsManager = require('./managers/GamepadsManager');

let sky, ground, gamepads;
let meshReferenceForLighting;

// const SHADOW_MAP_WIDTH = 4096, SHADOW_MAP_HEIGHT = 4096;
const SHADOW_MAP_WIDTH = 1024, SHADOW_MAP_HEIGHT = 1024;

let effect,
  controls,
  vrMode = false,
  vrDisplay = null,
  secureArea,
  userHeight = 1.7;

const clock = new THREE.Clock();

let isPaused = false;

function App () {
  function init () {
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

    scene.fog = new THREE.Fog(0xbc483e, 0, 65);
    // scene.fog = new THREE.FogExp2(0xbc483e, 0.005);

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
            secureArea = new SecureArea(vrDisplay.stageParameters.sizeX, vrDisplay.stageParameters.sizeZ);
            // secureArea.receiveShadow = true;
            secureArea.position.y = 0.1;
            scene.add(secureArea);
          }
          gamepads = new GamepadsManager(scene, vrDisplay);
        }
      });
    } else {
      vrFallback();
    }

    sky = new Sky();
    scene.add(sky);

    ground = new Ground();
    scene.add(ground);

    // Light for testing purposes
    const light = new THREE.PointLight(0xf4f4f4, 0.4, 0);
    light.castShadow = true;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 30;
    light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    light.shadow.bias = 0.01;
    light.position.set(0, 10, 0);
    // console.log(light);
    scene.add(light);
    animate();

    if (WEBVR.isAvailable() === true) {
      document.body.appendChild(WEBVR.getButton(effect));
    }

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
  }

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
    const delta = clock.getDelta();
    Events.emit('updateScene', delta);
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
    camera.position.set(0, userHeight, 0);
    secureArea = new SecureArea(3, 3);
    // secureArea.receiveShadow = true;
    secureArea.position.y = 0.1;
    scene.add(secureArea);

    meshReferenceForLighting = new MeshReferenceForLighting();
    meshReferenceForLighting.position.set(0, 1, -0.5);
    scene.add(meshReferenceForLighting);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
  }

  return {
    scene: scene,
    camera: camera,
    renderer: renderer,
    init: init
  };

}

module.exports = new App();
