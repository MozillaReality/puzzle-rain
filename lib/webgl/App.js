'use strict';

var settings = require('../settings');
var State = require('../state/State');
var Events = require('../events/Events');

var THREE = require('three');

var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.01, 1000000);
var scene = new THREE.Scene();
var renderer = require('./Renderer');
var listener = new THREE.AudioListener();
var WEBVR = require('./WebVR');
var VREffect = require('./effects/VREffect');
var VRControls = require('./controls/VRControls');
var OrbitControls = require('./controls/OrbitControls');

var Sky = require('./assets/Sky');
var Ground = require('./assets/Ground');
var GameArea = require('./assets/GameArea');

var HandLight = require('./assets/HandLight');

var GamepadsManager = require('./managers/GamepadsManager');

var sky, ground, gamepads, gamepadDummy;

var Performance = require('./utils/Performance');

// var SHADOW_MAP_WIDTH = 4096, SHADOW_MAP_HEIGHT = 4096;
var SHADOW_MAP_WIDTH = 1024, SHADOW_MAP_HEIGHT = 1024;

var effect,
  controls,
  vrMode = false,
  vrDisplay = null,
  gameArea,
  userHeight = 1.7,
  gameAreaWidth = 3,
  gameAreaHeight = 3;

var clock = new THREE.Clock();

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

    if (WEBVR.isLatestAvailable() === false) {
      // document.body.appendChild(WEBVR.getMessage());
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
            gameAreaWidth = vrDisplay.stageParameters.sizeX;
            gameAreaHeight = vrDisplay.stageParameters.sizeZ;
          }
          State.add('vrDisplay', vrDisplay);
          gamepads = new GamepadsManager(scene);
        }
      });
      State.add('vrEnabled', true);
    } else {
      vrFallback();
    }

    sky = new Sky();
    scene.add(sky);

    ground = new Ground();
    scene.add(ground);

    var d = 10;
    // Light for testing purposes
    var light = new THREE.PointLight(0xf4f4f4, 0.1, 0);
    // light.castShadow = true;
    // light.shadow.camera.near = 0.1;
    // light.shadow.camera.far = 30;
    // light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    // light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    // light.shadow.bias = 0.0001;
    // light.shadow.camera.left = -d;
    // light.shadow.camera.right = d;
    // light.shadow.camera.top = d;
    // light.shadow.camera.bottom = -d;
    light.position.set(0, 2, 0);
    scene.add(light);

    if (settings.debugPerformance) {
      addPerformanceSprite();
    }

    addEvents();

    animate();

    if (WEBVR.isAvailable() === true) {
      document.body.appendChild(WEBVR.getButton(effect));
    }

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
  }

  function addPerformanceSprite () {
    Performance.init(renderer);
    Performance.sprite.position.y = 0.5;
    scene.add(Performance.sprite);
    Performance.sprite.lookAt(camera);
  }
  function addEvents () {
    Events.on('debugPerformanceChange', debugPerformanceChange);
    Events.on('gamepadsLoaded', gamepadsLoaded);
  }

  function debugPerformanceChange () {
    if (!Performance.sprite) {
      addPerformanceSprite();
    }
    settings.debugPerformance = !settings.debugPerformance;
    Performance.sprite.visible = settings.debugPerformance;
  }

  function gamepadsLoaded () {
    gameArea = new GameArea(gameAreaWidth, gameAreaHeight);
    // gameArea.receiveShadow = true;
    scene.add(gameArea);
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
    State.add('vrEnabled', false);
    camera.position.set(0, userHeight, 0);
    gamepads = new GamepadsManager(scene);
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
