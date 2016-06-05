'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');

var AudioManager = require('../audio/AudioManager');

var ParticleSystem = require('./particles/ParticleSystem');

function IntroBall (obj) {
  THREE.Object3D.call(this);

  this.track;
  this.idAudio = 'intro';

  this.isCollided = false;

  this.gamepadR = State.get('gamepadR');
  this.gamepadL = State.get('gamepadL');

  this.particleSystemR = new ParticleSystem();
  this.addTrail('R');

  this.particleSystemL = new ParticleSystem();
  this.addTrail('L');

  var geometry = new THREE.OctahedronGeometry(0.1, 0);
  var material = new THREE.MeshStandardMaterial({color: 0x2e2d38, roughness: 1, metalness: 0.5,
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
    startSize: 0.1,
    endSize: 0.9,
    velocityRange: [0.20, 0.20, 0.20],
    spinSpeedRange: 0.04,
    billboard: true
  };
  this['g_trail' + side] = this['particleSystem' + side].createTrail(
    1000   ,
    g_trailParameters);
  this['g_trail' + side].setState(THREE.AdditiveBlending);
  this['g_trail' + side].setColorRamp(
    [1, 0, 0, 1,
      1, 1, 0, 1,
      1, 1, 1, 0]);
};

IntroBall.prototype.introBallCollided = function () {
  if (!this.isCollided) {
    this.isCollided = true;
    this.track.play();
    new TWEEN.Tween(this.mesh.position).to({
      y: 1.2
    }, 2000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
    new TWEEN.Tween(this.mesh.material).to({
      opacity: 0
    }, 1000)
      .delay(2000)
      .easing(TWEEN.Easing.Cubic.In)
      .start();
  }
};

IntroBall.prototype.addAudio = function () {
  this.track = new AudioManager(this.idAudio, this, false, false);
  this.track.setVolume(3);
};

IntroBall.prototype.update = function (delta, time) {
  if (State.get('stage') !== 'intro') {
    return;
  }
  this.particleSystemR.draw();
  this.particleSystemL.draw();

  if (this.isCollided) {
    var trailClock = (new Date().getTime() / 1000.0) * -0.8;
    this.g_trailR.birthParticles(
      [Math.sin(trailClock) * 4, 2, Math.cos(trailClock) * 4]);
    this.g_trailL.birthParticles(
      [Math.cos(trailClock) * 4, 2, Math.sin(trailClock) * 4]);
  }
};

module.exports = IntroBall;
