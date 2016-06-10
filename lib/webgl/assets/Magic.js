'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var ParticleSystem = require('./particles/ParticleSystem');

var AudioManager = require('../audio/AudioManager');

var scaleMagic = 0.01;

function Magic (obj) {
  THREE.Object3D.call(this);

  this.active = false;
  this.controller = obj;

  this.particleSystem = new ParticleSystem();
  this.addTrail();
  this.track = new AudioManager('effects/magic', true, this, true, true);
  this.track.setVolume(0);
  var self = this;

  Events.on('updateScene', this.update.bind(this));
  Events.on('gamepadAnimation', this.gamepadAnimation.bind(this));
}

Magic.prototype = Object.create(THREE.Object3D.prototype);

Magic.prototype.update = function (deltaOrig) {
  if (this.active && State.get('stage') === 'experience') {
    var paticlePos = new THREE.Vector3().setFromMatrixPosition(this.controller.matrixWorld);
    this.trail.birthParticles(
      [paticlePos.x, paticlePos.y, paticlePos.z]);
    Events.emit('magicDispatched', this.controller.side, this.controller.influencedRace);
  }
  this.particleSystem.draw();
};

Magic.prototype.gamepadAnimation = function (side, animation, isPressed) {
  if (State.get('stage') === 'experience') {
    if (side === this.controller.side) {
      switch (animation) {
        case 'close':
          this.active = isPressed;
          if (isPressed) {
            this.fadeInAudio();
          } else {
            this.fadeOutAudio();
          }
          break;
      }
    }
  }
};

Magic.prototype.addTrail = function () {
  var g_trailParameters = {
    numParticles: 2,
    lifeTime: 3,
    startSize: 0.02,
    endSize: 0.01,
    velocity: [0, -0.05, 0],
    velocityRange: [0.02, 0.03, 0.02],
    acceleration: [0, -0.05, 0],
    accelerationRange: [0, -0.03, 0],
    // spinSpeedRange: 0.08,
    billboard: true
  };
  this.trail = this.particleSystem.createTrail(
    300   ,
    g_trailParameters,
    new THREE.TextureLoader().load('textures/magic.png'));
  this.trail.setState(THREE.AdditiveBlending);
  this.trail.setColorRamp(
    [1, 1, 1, 0.3,
      1, 1, 1, 0.5,
      1, 1, 1, 0.3,
      1, 1, 1, 0]);
};

Magic.prototype.fadeInAudio = function () {
  TWEEN.remove(this.volumeOutTween);
  var self = this;
  this.volumeInTween = new TWEEN.Tween({
    volume: this.track.getVolume()
  })
    .to({ volume: 1 }, 1000)
    .onUpdate(function () {
      self.track.setVolume(this.volume);
    })
    .start();
};

Magic.prototype.fadeOutAudio = function () {
  TWEEN.remove(this.volumeInTween);
  var self = this;
  this.volumeOutTween = new TWEEN.Tween({
    volume: this.track.getVolume()
  })
    .to({ volume: 0 }, 1000)
    .onUpdate(function () {
      self.track.setVolume(this.volume);
    })
    .start();
};

module.exports = Magic;
