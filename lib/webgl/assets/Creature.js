'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');
var glslify = require('glslify');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var Eyes = require('./creatures/Eyes.js');
var Mouth = require('./creatures/Mouth.js');

var AudioManager = require('../audio/AudioManager');

var MathUtils = require('../utils/MathUtils');

var ParticleSystem = require('./particles/ParticleSystem');

function Creature (race, index, myPos, myScale) {
  this.index = index;
  this.race = race;
  this.pos = myPos;
  this.radius = 1 * myScale;

  this.particleSystem = new ParticleSystem();

  this.idAudio = this.race.name + '_' + index;

  this.originalColor = settings[this.race.name + 'Color'];

  THREE.Object3D.call(this);
  this.camera = State.get('camera');
  this.cameraForGlow = State.get('camera');

  this.scale.set(this.radius, this.radius, this.radius);
  this.position.set(this.pos.x, this.pos.y, this.pos.z);
  this.addBody();
  this.addGlow();
  this.addRing();
  this.addAudio();

  this.addTrail();

  this.handInfluencer = '';
  this.handGrabbed = '';

  this.isActive = false;

  this.awakeLevel = 0;
  // Ammount of increase/decrease for awakeLevel
  this.awakeAmmount = 0.01;
}

Creature.prototype = Object.create(THREE.Object3D.prototype);

Creature.prototype.addBody = function () {
  this.body = new THREE.Group();
  this.add(this.body);

  this.eyes = new Eyes(0.1);
  this.eyes.right.eyeball.material.opacity = 0;
  this.eyes.left.eyeball.material.opacity = 0;
  this.body.add(this.eyes);

  this.mouth = new Mouth();
  this.mouth.mesh.material.opacity = 0;
  this.body.add(this.mouth);
};

Creature.prototype.addGlow = function () {
  var glowGeometry = new THREE.SphereGeometry(1, 16, 16);
  var glowMaterial = new THREE.ShaderMaterial(
    {
      uniforms: {
        'c': { type: 'f', value: 0.0 },
        'p': { type: 'f', value: 6.0 },
        'opacity': { type: 'f', value: 0.0 },
        glowColor: { type: 'c', value: new THREE.Color(MathUtils.blendColors(settings[this.race.name + 'Color'], 0xffffff, 0.25)) },
        viewVector: { type: 'v3', value: this.cameraForGlow.position }
      },
      vertexShader: glslify('../shaders/glow.vert'),
      fragmentShader: glslify('../shaders/glow.frag'),
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true
    });

  this.glow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
  this.add(this.glow);
};

Creature.prototype.addRing = function () {
  this.ringSides = 32;
  this.ringIndex = 32;
  var geometryCircleLine = new THREE.CircleGeometry(1, this.ringSides, Math.PI, Math.PI * 2);
  // Remove center vertex
  geometryCircleLine.vertices.shift();

  var materialCircleLine = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false});
  materialCircleLine.linewidth = 2;

  this.ring = new THREE.Line(geometryCircleLine, materialCircleLine);

  this.ring.doubleSided = true;
  this.ring.scale.set(1.5, 1.5, 1.5);
  this.add(this.ring);
};

Creature.prototype.addAudio = function () {
  this.track = new AudioManager(this.idAudio, true, this, true, true);
  this.track.setVolume(0);
};

Creature.prototype.addTrail = function () {
  this.trailTime = 0;
  var g_trailParameters = {
    numParticles: 20,
    lifeTime: 2,
    startSize: 0.01,
    endSize: 0.05,
    velocityRange: [0.3, 0.3, 0.3],
    accelerationRange: [0.1, 0.1, 0.1],
    billboard: true
  };
  this.trail = this.particleSystem.createTrail(
    200   ,
    g_trailParameters,
    new THREE.TextureLoader().load('textures/magicOver-' + this.race.name + '.png'));
  this.trail.setState(THREE.AdditiveBlending);
  this.trail.setColorRamp(
    [1, 1, 1, 1,
      1, 1, 1, 0.5,
      1, 1, 1, 0]);
};

Creature.prototype.init = function () {
  Events.emit('creatureLoaded');

  Events.on('updateSceneSpectator', this.updateSceneSpectator.bind(this));
  Events.on('updateScene', this.update.bind(this));

  Events.on('activeCreatureChanged', this.activeCreatureChanged.bind(this));

};

Creature.prototype.updateSceneSpectator = function (delta, time) {
  this.cameraForGlow = State.get('cameraSpectator');
  this.updateCommon(delta, time);
};

Creature.prototype.update = function (delta, time) {
  this.cameraForGlow = this.camera;
  this.updateCommon(delta, time);
};

Creature.prototype.updateCommon = function (delta, time) {
  this.particleSystem.draw(this.cameraForGlow);
  this.updateGlowOrientation();
  this.updateMouth();
  this.updatePosition();
  this.updateVolume();
  this.updateBody();
  this.updateActive();
};

Creature.prototype.updatePosition = function () {
  // Update position
  if (this.handGrabbed !== '') {
    var hand = State.get('gamepad' + this.handGrabbed);
    this.position.x = hand.position.x;
    this.position.y = hand.position.y;
    this.position.z = hand.position.z;
  } else {
    if (this.handInfluencer !== '' && State.get('gamepad' + this.handInfluencer).lastPressed) {
      this.closeToHand();
    } else {
      this.awayToHand();
    }
  }
};

Creature.prototype.updateVolume = function () {
  this.track.setVolume(this.awakeLevel);
};

Creature.prototype.updateBody = function () {
  if (this.isActive) {
    var valTmp = THREE.Math.mapLinear(this.track.averageAnalyser * this.track.getVolume(), 0, 100, 0, 1);
    this.bodyMesh.material.emissiveIntensity = valTmp;
    this.glow.material.uniforms.opacity.value = valTmp;
  }
  var userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(this.position).sub(this.parent.position);
  // if (this.handGrabbed !== '') {
  //   var hand = State.get('gamepad' + this.handGrabbed);
  //   userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(hand.position);
  // }
  this.body.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));
};

// CONTROL if is active
Creature.prototype.updateActive = function () {
  if (this.handGrabbed !== '') {
    if (!this.isActive) {
      this.activate();
    }
  }
  if (Math.abs(this.position.x) > 0.75 || Math.abs(this.position.z) > 0.75) {
    if (this.isActive) {
      this.deactivate();
    }
  } else {
    if (!this.isActive) {
      this.activate();
    }
  }
};

Creature.prototype.activate = function () {
  this.isActive = true;
  TWEEN.remove(this.tweenBodyOff);
  TWEEN.remove(this.tweenGlowOff);
  this.tweenBodyOn = new TWEEN.Tween(this.bodyMesh.material).to({
    opacity: 0.5
  }, 1500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  this.tweenGlowOn = new TWEEN.Tween(this.glow.material.uniforms.opacity).to({
    value: 1.0
  }, 2500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

Creature.prototype.deactivate = function () {
  this.isActive = false;
  TWEEN.remove(this.tweenBodyOn);
  TWEEN.remove(this.tweenGlowOn);
  this.tweenBodyOff = new TWEEN.Tween(this.bodyMesh.material).to({
    opacity: 1,
    emissiveIntensity: 0
  }, 1000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
  this.tweenGlowOff = new TWEEN.Tween(this.glow.material.uniforms.opacity).to({
    value: 0.0
  }, 1500)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
};

// CONTROL EVENT activeCreatureChanged
Creature.prototype.activeCreatureChanged = function (side, creature) {
  if (State.get('stage') !== 'experience') {
    return;
  }
  if (creature === this && this.handInfluencer === '') {
    this.handInfluencer = side;
    this.wakeOver();
  }else if (this.handInfluencer === side) {
    this.handInfluencer = '';
    this.wakeOut();
  }

};

Creature.prototype.wakeOver = function () {
  this.bodyMesh.material.opacity = 1;
  tweenEmissive('mouth', this.mouth.mesh.material, 1, 500, 'out');
  tweenEmissive('leftEye', this.eyes.left.eyeball.material, 1, 500, 'out');
  tweenEmissive('rightEye', this.eyes.right.eyeball.material, 1, 500, 'out');
  TWEEN.remove(this.tweenEyeROff);
  TWEEN.remove(this.tweenEyeLOff);
  this.tweenEyeROn = new TWEEN.Tween(this.eyes.right.eyeball.material).to({
    opacity: 1
  }, 500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  this.tweenEyeROn = new TWEEN.Tween(this.eyes.left.eyeball.material).to({
    opacity: 1
  }, 500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();

  TWEEN.remove(this.tweenMouthOff);
  this.tweenMouthOn = new TWEEN.Tween(this.mouth.mesh.material).to({
    opacity: 1
  }, 100)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

Creature.prototype.wakeOut = function () {
  tweenEmissive('mouth', this.mouth.mesh.material, 0, 500, 'in');
  tweenEmissive('leftEye', this.eyes.left.eyeball.material, 0, 500 , 'in');
  tweenEmissive('rightEye', this.eyes.right.eyeball.material, 0, 500, 'in');
  TWEEN.remove(this.tweenEyeROn);
  TWEEN.remove(this.tweenEyeLOn);
  this.tweenEyeROff = new TWEEN.Tween(this.eyes.right.eyeball.material).to({
    opacity: 0
  }, 500)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
  this.tweenEyeLOff = new TWEEN.Tween(this.eyes.left.eyeball.material).to({
    opacity: 0
  }, 500)
    .easing(TWEEN.Easing.Cubic.In)
    .start();

  TWEEN.remove(this.tweenMouthOn);
  this.tweenMouthOff = new TWEEN.Tween(this.mouth.mesh.material).to({
    opacity: 0
  }, 1000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
};

function tweenEmissive (id, obj, value, time, ease) {
  TWEEN.remove(id);

  if (ease === 'in') {
    ease = TWEEN.Easing.Quadratic.In;
  } else {
    ease = TWEEN.Easing.Quadratic.Out;
  }
  id = new TWEEN.Tween(obj).to({
    emissiveIntensity: value
  }, time)
    .easing(ease)
    .start();
  TWEEN.add(id);
}

// CONTROL position
Creature.prototype.closeToHand = function () {
  var dist = State.get('gamepad' + this.handInfluencer).position.distanceTo(this.position);
  if (dist < 0.1) {
    this.grabbed(this.handInfluencer);
  } else {
    this.increaseAwake();
    var posToGamepad = getPointInBetweenByPerc(State.get('gamepad' + this.handInfluencer).position, this.position, 0.99);
    this.position.set(posToGamepad.x, posToGamepad.y, posToGamepad.z);
  }

};

Creature.prototype.awayToHand = function () {
  this.decreaseAwake();
  var posToGamepad = getPointInBetweenByPerc(this.pos, this.position, 0.99);
  this.position.set(posToGamepad.x, posToGamepad.y, posToGamepad.z);
};

Creature.prototype.grabbed = function (side) {
  this.handGrabbed = side;
  this.tweenAwakeLevel = new TWEEN.Tween(this).to({
    awakeLevel: 1
  }, 1000)
    .start();
  this.track.setRefDistance(2);
  Events.emit('grabbed', side, this);
};

// To control awakeLevel
Creature.prototype.increaseAwake = function () {
  this.awakeLevel = THREE.Math.clamp(this.awakeLevel + this.awakeAmmount, 0, 1);
};
Creature.prototype.decreaseAwake = function () {
  this.awakeLevel = THREE.Math.clamp(this.awakeLevel - this.awakeAmmount, 0, 1);
};

// Dispatched from Gamepad when stop to press
Creature.prototype.dropped = function () {
  this.handGrabbed = '';
  this.handInfluencer = '';
  TWEEN.remove(this.tweenAwakeLevel);
  this.track.setRefDistance(0.5);
};

function getPointInBetweenByPerc (pointA, pointB, percentage) {
  var dir = pointB.clone().sub(pointA);
  var len = dir.length();
  dir = dir.normalize().multiplyScalar(len * percentage);
  return pointA.clone().add(dir);
}

// Glow control
Creature.prototype.updateGlowOrientation = function () {
  var cameraRelPos = new THREE.Vector3().setFromMatrixPosition(this.cameraForGlow.matrixWorld);
  var glowPos = new THREE.Vector3().setFromMatrixPosition(this.glow.matrixWorld);
  this.glow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(cameraRelPos, glowPos);
};

// Mouth animationif (this.track) {
Creature.prototype.updateMouth = function () {
  this.mouth.scale.y = THREE.Math.mapLinear(this.track.averageAnalyser * Math.min(1, this.track.getVolume()), 0, 100, 1, 25);
};

module.exports = Creature;
