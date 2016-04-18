'use strict';

const settings = require('../settings');
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

const CANNON = require('cannon');
const CannonDebugRenderer = require('./utils/CannonDebugRenderer');
const MaterialsManager = require('./managers/MaterialsManager');

const Crowd = require('./assets/Crowd');

let world, cannonDebugRenderer, crowd;
let lastCallTime = 0,
  resetCallTime = false,
  stepFrequency = 1 / 90;

const Performance = require('./utils/Performance');

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

    world = new CANNON.World();
    // Use fast quaternion normalization
    // world.quatNormalizeFast = false;
    // How often to normalize quaternions
    // world.quatNormalizeSkip = 8;

    // Tweak contact properties.
    // world.defaultContactMaterial.contactEquationStiffness = 1e11; // Contact stiffness - use to make softer/harder contacts
    // world.defaultContactMaterial.contactEquationRelaxation = 2; // Stabilization time in number of timesteps
    world.gravity.set(0, -10, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    if (settings.debugPhysics) {
      cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);
    }

    MaterialsManager.init(world);
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
            world.addBody(secureArea.body);
            scene.add(secureArea);
          }
          gamepads = new GamepadsManager(scene, world, vrDisplay);
        }
      });
    } else {
      vrFallback();
    }

    sky = new Sky();
    scene.add(sky);

    ground = new Ground();
    scene.add(ground);

    crowd = new Crowd(scene, world);

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
    Events.on('debugPhysicsChange', debugPhysicsChange);
    Events.on('debugPerformanceChange', debugPerformanceChange);
  }

  function debugPhysicsChange () {
    if (!cannonDebugRenderer) {
      cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);
    }
    settings.debugPhysics = !settings.debugPhysics;
    cannonDebugRenderer.container.visible = settings.debugPhysics;
  }

  function debugPerformanceChange () {
    if (!Performance.sprite) {
      addPerformanceSprite();
    }
    settings.debugPerformance = !settings.debugPerformance;
    Performance.sprite.visible = settings.debugPerformance;
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
    const delta = clock.getDelta();
    updatePhysics();
    if (settings.debugPhysics) {
      cannonDebugRenderer.update();
    }
    Events.emit('updateScene', delta);
    if (vrMode) {
      effect.render(scene, camera);
    } else {
      renderer.render(scene, camera);
    }
    // Update VR headset position and apply to camera.
    controls.update();

  // webGLRenderer.info.memory.programs;
  // 	msTexts[i++].textContent = "Geom: "+webGLRenderer.info.memory.geometries;
  // 	msTexts[i++].textContent = "Text: "	+ webGLRenderer.info.memory.textures;
  // 	msTexts[i++].textContent = "Calls: "	+ webGLRenderer.info.render.calls;
  // 	msTexts[i++].textContent = "Vert: "	+ webGLRenderer.info.render.vertices;
  // 	msTexts[i++].textContent = "Fac: "	+ webGLRenderer.info.render.faces;
  // 	msTexts[i++].textContent = "Pts: "	+ webGLRenderer.info.render.points;
  // console.log(renderer.info.render.calls);
  }

  function updatePhysics () {
    // Step world
    const timeStep = stepFrequency;
    const now = Date.now() / 1000;

    if (!lastCallTime) {
      // last call time not saved, cant guess elapsed time. Take a simple step.
      world.step(timeStep);
      lastCallTime = now;
      return;
    }

    var timeSinceLastCall = now - lastCallTime;
    if (resetCallTime) {
      timeSinceLastCall = 0;
      resetCallTime = false;
    }

    world.step(timeStep, timeSinceLastCall, 3);

    lastCallTime = now;
  }

  function pauseAll (bool) {
    isPaused = bool;
    resetCallTime = true;
    if (! isPaused) {
      animate();
    }
  }

  function vrFallback () {
    console.log('fallback VR');

    stepFrequency = 1 / 60;
    camera.position.set(0, userHeight, 0);
    secureArea = new SecureArea(3, 3);
    // secureArea.receiveShadow = true;
    scene.add(secureArea);
    world.addBody(secureArea.body);
    meshReferenceForLighting = new MeshReferenceForLighting(world);
    meshReferenceForLighting.position.set(0, 0.5, -0.2);
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
