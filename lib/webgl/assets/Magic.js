'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var GPUParticleSystem = require('../utils/GPUParticleSystem');

var AudioManager = require('../audio/AudioManager');

var scaleMagic = 0.01;

function Magic (obj) {
  THREE.Object3D.call(this);

  this.active = false;
  this.tick = 0;
  this.controller = obj;
  this.particleSystem = new THREE.GPUParticleSystem({
    maxParticles: 15000
  });
  this.particleSystem.scale.set(scaleMagic, scaleMagic, scaleMagic);
  this.add(this.particleSystem);

  this.options = {
    position: new THREE.Vector3(),
    positionRandomness: 2,
    velocity: new THREE.Vector3(),
    velocityRandomness: 1,
    color: settings.noneColor,
    colorRandomness: .2,
    turbulence: .1,
    lifetime: 5,
    size: 10,
    sizeRandomness: 5
  };

  this.spawnerOptions = {
    spawnRate: 800,
    horizontalSpeed: 1.5,
    verticalSpeed: 1.33,
    timeScale: 1
  };

  this.track = new AudioManager('effects/magic', true, this, true, true);
  this.track.setVolume(0);
  var self = this;

  Events.on('updateScene', this.update.bind(this));
  Events.on('gamepadAnimation', this.gamepadAnimation.bind(this));
}

Magic.prototype = Object.create(THREE.Object3D.prototype);

Magic.prototype.update = function (deltaOrig) {
  var delta = deltaOrig * this.spawnerOptions.timeScale;
  this.tick += delta;
  if (this.tick < 0) this.tick = 0;

  if (this.active) {
    if (delta > 0) {
      this.options.position.set(this.controller.position.x / scaleMagic, this.controller.position.y / scaleMagic, this.controller.position.z / scaleMagic);
      if (State.get('stage') === 'experience') {
        for (var x = 0; x < this.spawnerOptions.spawnRate * delta; x++) {
          this.particleSystem.spawnParticle(this.options);
        }

        Events.emit('magicDispatched', this.controller.side, this.controller.influencedRace);
      }
    }
  }
  this.particleSystem.update(this.tick);
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
