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
  Events.on('grabbed', this.grabbed.bind(this));
  Events.on('dropped', this.dropped.bind(this));

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
  this.isActive = true;
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
};

Creature.prototype.wakeOut = function () {
  this.isActive = false;
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
  var percent = 0.99;
  if (dist < 0.5) {
    percent = 0.95;
  }
  if (dist < 0.1) {
    percent = 0.9;
  }
  var posToGamepad = getPointInBetweenByPerc(State.get('gamepad' + this.handInfluencer).position, this.position, percent);
  this.position.set(posToGamepad.x, posToGamepad.y, posToGamepad.z);
};

Creature.prototype.awayToHand = function () {
  var posToGamepad = getPointInBetweenByPerc(this.pos, this.position, 0.99);
  this.position.set(posToGamepad.x, posToGamepad.y, posToGamepad.z);
};

function getPointInBetweenByPerc (pointA, pointB, percentage) {
  var dir = pointB.clone().sub(pointA);
  var len = dir.length();
  dir = dir.normalize().multiplyScalar(len * percentage);
  return pointA.clone().add(dir);
}

// CONTROL EVENT grabbed
Creature.prototype.grabbed = function (side, creature) {
  if (State.get('stage') === 'ending') {
    return;
  }
  if (creature === this && this.handInfluencer === side) {
    this.handGrabbed = side;
    this.track.setRefDistance(2);
  }
};

// CONTROL EVENT dropped
Creature.prototype.dropped = function (creature) {
  if (creature === this) {
    this.handGrabbed = '';
    this.track.setRefDistance(0.5);
    this.detectIfCollideWithOthers();
  }
};

Creature.prototype.detectIfCollideWithOthers = function () {
  var allCreatures = State.get('allCreatures');
  var isCollidedWithOther = false;
  for (var i = 0; i < allCreatures.length;i++) {
    if (allCreatures[i] !== this) {
      var myPos = new THREE.Vector3().setFromMatrixPosition(this.matrixWorld);
      var otherPos = new THREE.Vector3().setFromMatrixPosition(allCreatures[i].matrixWorld);
      var dist = myPos.distanceTo(otherPos);
      if (dist < allCreatures[i].radius * 2) {
        isCollidedWithOther = true;
      }
    }
  }
  // Return to original position
  if (isCollidedWithOther) {
    new TWEEN.Tween(this.position).to({
      x: this.pos.x,
      z: this.pos.z
    }, 2000)
      .easing(TWEEN.Easing.Circular.Out)
      .start();
    this.errorTrack.play();
  }
  this.rotation.set(0, 0, 0);
};

module.exports = Creature;
