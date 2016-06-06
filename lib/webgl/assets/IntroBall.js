'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var AudioManager = require('../audio/AudioManager');

var ParticleSystem = require('./particles/ParticleSystem');

function IntroBall (obj) {
  THREE.Object3D.call(this);

  this.track;
  this.idAudio = 'intro';

  this.isCollided = false;

  this.distanceToGamepad = 1;
  this.fadeOutOpacity = 1;

  this.isActive = true;

  this.gamepadR = State.get('gamepadR');
  this.gamepadL = State.get('gamepadL');

  this.particleSystemR = new ParticleSystem();
  this.addTrail('R');

  this.particleSystemL = new ParticleSystem();
  this.addTrail('L');

  var geometry = new THREE.OctahedronGeometry(0.1, 0);
  var material = new THREE.MeshStandardMaterial({color: settings.offColor, roughness: 1, metalness: 0.5,
    emissive: 0xffffff, emissiveIntensity: 0.5, shading: THREE.FlatShading,
  transparent: true, opacity: 0.5});
  this.mesh = new THREE.Mesh(geometry, material);
  this.add(this.mesh);

  this.addAudio();
  Events.on('updateScene', this.update.bind(this));
  Events.on('introBallCollided', this.introBallCollided.bind(this));
}

IntroBall.prototype = Object.create(THREE.Object3D.prototype);

IntroBall.prototype.addTrail = function (side) {
  var g_trailParameters = {
    numParticles: 2,
    lifeTime: 2,
    startSize: 0.02,
    endSize: 0.05,
    velocity: [ 0.05, -0.1, 0.05],
    velocityRange: [0.1, 0.05, 0.1],
    spinSpeedRange: 0.08,
    billboard: true
  };
  this['g_trail' + side] = this['particleSystem' + side].createTrail(
    100   ,
    g_trailParameters,
    new THREE.TextureLoader().load('textures/magic.png'));
  this['g_trail' + side].setState(THREE.AdditiveBlending);
  this['g_trail' + side].setColorRamp(
    [1, 1, 1, 1,
      1, 1, 1, 0.5,
      1, 1, 1, 0]);
};

IntroBall.prototype.introBallCollided = function () {
  if (!this.isCollided) {
    this.isCollided = true;
    this.track.play();
    var self = this;
    new TWEEN.Tween(this.position).to({
      y: 2
    }, 2000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
    new TWEEN.Tween(this.track.position).to({
      y: -1.2
    }, 2000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
    new TWEEN.Tween(this.mesh.material).to({
      opacity: 0
    }, 1000)
      .delay(2000)
      .easing(TWEEN.Easing.Cubic.In)
      .onComplete(function () {
        Events.emit('introBallStarted');
      })
      .start();

    new TWEEN.Tween(this).to({
      distanceToGamepad: 0
    }, 5200)
      .delay(1000)
      .easing(TWEEN.Easing.Cubic.In)
      .onComplete(function () {
        self.mesh.visible = false;
        Events.emit('introBallCatched');
        State.add('stage', 'experience');
        Events.emit('stageChanged');
        self.awayBall();
      })
      .start();

    new TWEEN.Tween(this).to({
      fadeOutOpacity: 0
    }, 6000)
      .delay(6000)
      .onComplete(function () {
        self.isActive = false;
      })
      .start();
  }
};

IntroBall.prototype.awayBall = function () {
  var self = this;
  new TWEEN.Tween({
    volume: this.track.getVolume()
  })
    .to({ volume: 0 }, 5000)
    .onUpdate(function () {
      self.track.setVolume(this.volume);
    })
    .start();
};
IntroBall.prototype.addAudio = function () {
  this.track = new AudioManager(this.idAudio, this, false, false);
  this.track.setVolume(3);
};

IntroBall.prototype.update = function (delta, time) {
  if (!this.isActive) {
    return;
  }
  this.particleSystemR.draw();
  this.particleSystemL.draw();
  if (this.distanceToGamepad < 1) {
    var posToGamepadR = this.gamepadR.position.clone().multiplyScalar(1 - this.distanceToGamepad);
    var posToGamepadL = this.gamepadL.position.clone().multiplyScalar(1 - this.distanceToGamepad);

    var posToIntroBall = this.position.clone().multiplyScalar(this.distanceToGamepad);

    posToGamepadR.add(posToIntroBall);
    posToGamepadL.add(posToIntroBall);

    this.g_trailR.birthParticles(
      [posToGamepadR.x, posToGamepadR.y, posToGamepadR.z], this.fadeOutOpacity);
    this.g_trailL.birthParticles(
      [posToGamepadL.x, posToGamepadL.y, posToGamepadL.z], this.fadeOutOpacity);
  }
};

module.exports = IntroBall;
