'use strict';

var settings = require('../settings');
var State = require('../state/State');
var Events = require('../events/Events');

var THREE = require('three');
var TWEEN = require('tween.js');

var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.01, 1000000);
var scene = new THREE.Scene();
var renderer = require('./Renderer');
var listener = new THREE.AudioListener();
var VREffect = require('./effects/VREffect');
var VRControls = require('./controls/VRControls');
var OrbitControls = require('./controls/OrbitControls');

var Sky = require('./assets/Sky');
var Ground = require('./assets/Ground');
var Floor = require('./assets/Floor');
var SuperHead = require('./assets/SuperHead');
var Cracks = require('./assets/Cracks');
var Crowd = require('./Crowd');

var Gamepad = require('./assets/Gamepad');

var sky, ground, floor, superHead, cracks;

// var SHADOW_MAP_WIDTH = 4096, SHADOW_MAP_HEIGHT = 4096;
var SHADOW_MAP_WIDTH = 1024, SHADOW_MAP_HEIGHT = 1024;

var effect,
  controls,
  vrMode = false,
  vrDisplay = null,
  crowd,
  gamepadR,
  gamepadL,
  userHeight = 1.7,
  gameAreaWidth = 2,
  gameAreaHeight = 2;

var clock = new THREE.Clock();
global.clock = clock;

var isPaused = false;

function App () {
  function init () {
    console.log('init');

    window.onfocus = function () {
      pauseAll(false);

    };
    window.onblur = function () {
      pauseAll(true);

    };

    State.add('scene', scene);
    scene.fog = new THREE.Fog(0xbc483e, 0, 65);
    State.add('camera', camera);
    State.add('listener', listener);
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
            gameAreaWidth = vrDisplay.stageParameters.sizeX;
            gameAreaHeight = vrDisplay.stageParameters.sizeZ;
          }
          State.add('vrDisplay', vrDisplay);
          addObjects();
          setTimeout(function () {  effect.setFullScreen(true);}, 2000);
        }
      });
    } else {
      vrFallback();
      addObjects();
    }

    animate();

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
  }

  function addObjects () {
    sky = new Sky();
    scene.add(sky);

    ground = new Ground();
    scene.add(ground);
    // ground.position.y = -0.5;

    floor = new Floor();
    scene.add(floor);
    floor.position.y = -0.01;

    superHead = new SuperHead();
    // scene.add(superHead);
    superHead.position.y = -1.1;
    superHead.position.z = -1.5;

    cracks = new Cracks();
    // scene.add(cracks);
    // Events.emit('startCrack');

    // Light for testing purposes
    var light = new THREE.PointLight(0xf4f4f4, 0.3, 0);
    if (!State.get('vrDisplay')) {
      light.intensity = 0.8;
    }
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 10;
    light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    light.position.set(0, 2.5, 0);
    scene.add(light);

    addCrowd();
    addControllers();
  }
  function addCrowd () {
    crowd = new Crowd();
  }
  function addControllers () {
    gamepadR = new Gamepad('R');
    scene.add(gamepadR);
    gamepadL = new Gamepad('L');
    scene.add(gamepadL);
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
    render();
    requestAnimationFrame(animate);
  }

  function render () {
    var delta = clock.getDelta();
    var time = clock.getElapsedTime();
    Events.emit('updateScene', delta, time);
    if (vrMode) {
      effect.render(scene, camera);
    } else {
      renderer.render(scene, camera);
    }
    // Update VR headset position and apply to camera.
    controls.update();
    TWEEN.update();
  // console.log(renderer.info.render.calls);
  }

  function pauseAll (bool) {
    Events.emit('pauseAll', bool);
    isPaused = bool;
    if (! isPaused) {
      animate();
    }
  }

  function vrFallback () {
    console.log('fallback VR');
    camera.position.set(0, userHeight, 0);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableKeys = false;
  }

  return {
    scene: scene,
    camera: camera,
    renderer: renderer,
    init: init
  };

}

module.exports = new App();
