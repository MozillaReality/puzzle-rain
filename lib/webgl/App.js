'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var settings = require('../settings');
var State = require('../state/State');
var Events = require('../events/Events');

var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.01, 1000000);
var scene = new THREE.Scene();
var renderer = require('./Renderer');
var listener = new THREE.AudioListener();

if (settings.trailerMode) {
  // low resolution to improve the capture fps
  var VREffect = require('./effects/VREffectSpectator');
} else {
  var VREffect = require('./effects/VREffect');
}

var VRControls = require('./controls/VRControls');
var OrbitControls = require('./controls/OrbitControls');

var Sky = require('./assets/Sky');
var Ground = require('./assets/Ground');
var IntroBall = require('./assets/IntroBall');
var SuperHead = require('./assets/SuperHead');
var Cracks = require('./assets/Cracks');
var Sun = require('./assets/Sun');
var EndCredits = require('./assets/EndCredits');

var Crowd = require('./Crowd');

var Gamepad = require('./assets/Gamepad');

var sky, ground, introBall, superHead, cracks, sun, endCredits;
var crowd;
var keyLight, fillLight;

var SHADOW_MAP_WIDTH = 1024, SHADOW_MAP_HEIGHT = 1024;

var effect,
  controls,
  vrMode = false,
  vrDisplay = null,
  gamepadR,
  gamepadL,
  userHeight = 1.7,
  gameAreaWidth = 2,
  gameAreaHeight = 2;

var CameraController;
var rendererSpectator;
var cameraSpectator;
var Headset;
var headset;

var clock = new THREE.Clock();
global.clock = clock;

var isPaused = false;

function App () {
  function init () {
    window.onfocus = function () {
      pauseAll(false);

    };
    window.onblur = function () {
      pauseAll(true);

    };

    State.add('scene', scene);
    scene.fog = new THREE.Fog(0xbc483e, 0, 75);
    State.add('camera', camera);
    State.add('listener', listener);
    camera.add(listener);

    if (settings.spectatorMode) {
      initSpectatorMode();
    }

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
            gameAreaWidth = vrDisplay.stageParameters.sizeX;
            gameAreaHeight = vrDisplay.stageParameters.sizeZ;
          }
          State.add('vrDisplay', vrDisplay);
          SHADOW_MAP_WIDTH = 4096;
          SHADOW_MAP_HEIGHT = 4096;
          addObjects();
          // TODO Add setTimeout because if you requestPresent instantly 'WebGL Rats' error appears, perhaps needs to load things before call it
          setTimeout(function () {
            effect.requestPresent();
          }, 2000);
        }
      });
    } else {
      vrFallback();
      addObjects();
    }
  }

  function addObjects () {
    sky = new Sky();
    scene.add(sky);

    State.add('roomArea', gameAreaWidth * gameAreaHeight);

    // Room reference to place objects
    if (settings.debugMode) {
      var material = new THREE.MeshBasicMaterial({transparent: true,opacity: 0.1});
      var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1.5, 2), material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.5;
      scene.add(mesh);
    }

    ground = new Ground();
    scene.add(ground);

    superHead = new SuperHead();
    scene.add(superHead);
    superHead.scale.set(2.5, 2.5, 2.5);
    superHead.position.y = -3.3;
    superHead.position.z = -4.5;

    sun = new Sun();
    sun.position.set(-16, 20, -36);
    scene.add(sun);

    cracks = new Cracks();
    cracks.scale.set(3, 1, 3);
    scene.add(cracks);

    endCredits = new EndCredits();
    scene.add(endCredits);

    // Light for testing purposes
    keyLight = new THREE.DirectionalLight(0xf4f4f4, 0.6, 0);
    if (!State.get('vrDisplay')) {
      keyLight.intensity = 0.6;
    }
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 20;
    keyLight.shadow.camera.far = 26;
    keyLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    keyLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    keyLight.position.set(-8, 10, -18);
    keyLight.shadow.bias = - 0.001;
    scene.add(keyLight);
    State.add('keyLight', keyLight);

    if (settings.debugMode) {
      var directionalLightHelper = new THREE.DirectionalLightHelper(keyLight);
      scene.add(directionalLightHelper);
    }

    fillLight = new THREE.PointLight(0xf4f4f4, 0.2, 0);
    fillLight.position.set(8, 10, 18);
    scene.add(fillLight);

    crowd = new Crowd();

    gamepadR = new Gamepad('R');
    scene.add(gamepadR);
    State.add('gamepadR', gamepadR);
    gamepadL = new Gamepad('L');
    scene.add(gamepadL);
    State.add('gamepadL', gamepadL);

    introBall = new IntroBall();
    introBall.position.set(0, 1.2, -0.5);
    State.add('introBall', introBall);
    scene.add(introBall);

    if (settings.spectatorMode) {
      camera.add(headset);
      scene.add(headset);
    }
    Events.on('shellRised', shellRised);
    Events.on('hideAll', hideAll);

    Events.on('elevationStarted', elevationStarted);
    Events.on('changeSpectatorMode', changeSpectatorMode);

    Events.emit('stageChanged', 'intro');
    // Events.emit('stageChanged', 'experience');

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);

    animate();
    // TODO control if meshes are loaded to start render things
    scene.visible = false;
    Events.on('lastAssetIsLoaded', lastAssetIsLoaded);
  }

  function lastAssetIsLoaded () {
    document.getElementById('preloader').remove();
    scene.visible = true;
  }

  function shellRised () {
    moveShadowCamera();
  }

  function moveShadowCamera () {
    // Add wide shadow camera range to view the shadow of the final super head
    new TWEEN.Tween(keyLight.shadow.camera).to({
      near: 8,
      far: 35
    }, 10000)
      .onUpdate(function () {
        keyLight.shadow.camera.updateProjectionMatrix();
      })
      .start();
  }

  function elevationStarted () {
    if (State.get('endMode') === 1) {
      // Add wide shadow camera range to view the shadow of the final super head
      new TWEEN.Tween(keyLight.position).to({
        x: 0,
        z: 0
      }, 20000)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .start();
      moveShadowCamera();
    }
  }

  function hideAll () {
    // TODO imporve this hack to hide all and to prevent fps fallback
    scene.remove(sky);
    scene.remove(ground);
    scene.remove(superHead);
    scene.remove(cracks);
    scene.remove(keyLight);
    scene.remove(fillLight);
    scene.remove(gamepadR);
    scene.remove(gamepadL);
    scene.remove(introBall);
  }

  function cameraSwitched (i) {
    cameraSpectator = State.get('cameraSpectator');
    if (controls) {
      controls.object = cameraSpectator;
    }

    if (cameraSpectator === camera) {
      headset.visible = false;
    } else {
      headset.visible = true;
    }
    cameraSpectator.add(listener);
  }

  function onWindowResize (event) {
    if (settings.spectatorMode) {
      cameraSpectator.aspect = window.innerWidth / window.innerHeight;
      cameraSpectator.updateProjectionMatrix();
    }
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
    if (settings.spectatorMode) {
      rendererSpectator.setSize(window.innerWidth, window.innerHeight);
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
    if (settings.spectatorMode) {
      Events.emit('updateSceneSpectator', delta, time);
      rendererSpectator.render(scene, cameraSpectator);
      if (cameraSpectator !== camera) {
        var v = new THREE.Vector3();
        v.subVectors(cameraSpectator.position, camera.position).add(cameraSpectator.position);
        cameraSpectator.lookAt(camera.position);
      }
    }

    // Update VR headset position and apply to camera.
    controls.update();
    TWEEN.update();
    if (settings.debugMode) {
      // TODO control number of draw calls beside 100
      console.log('drawcalls', renderer.info.render.calls);
    }
  }

  function pauseAll (bool) {
    Events.emit('pauseAll', bool);
    isPaused = bool;
    if (! isPaused) {
      animate();
    }
  }

  function vrFallback () {
    if (settings.spectatorMode) {
      controls = new THREE.OrbitControls(camera, rendererSpectator.domElement);
    } else {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
    }
    controls.enableKeys = false;
    camera.position.set(0, userHeight, 0);
  }

  function initSpectatorMode () {
    CameraController = require('./cameras/CameraController');
    rendererSpectator = require('./RendererSpectator');
    Headset = require('./assets/Headset');

    headset = new Headset();
    Events.on('cameraSwitched', cameraSwitched);
    CameraController.init();
  }

  function changeSpectatorMode () {
    if (!settings.spectatorMode) {
      document.querySelector('#container').removeChild(renderer.domElement);
      if (!CameraController) {
        initSpectatorMode();
        camera.add(headset);
        scene.add(headset);
      } else {
        document.querySelector('#container').appendChild(rendererSpectator.domElement);
      }
    } else {
      document.querySelector('#container').removeChild(rendererSpectator.domElement);
      document.querySelector('#container').appendChild(renderer.domElement);
    }
    settings.spectatorMode ^= true;
    var modeSpectator = 'OFF';
    if (settings.spectatorMode) {
      modeSpectator = 'ON';
    }
    console.log('spectator mode', modeSpectator);
  }

  return {
    scene: scene,
    camera: camera,
    renderer: renderer,
    init: init
  };

}

module.exports = new App();
