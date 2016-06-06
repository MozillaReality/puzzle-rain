'use strict';

var THREE = require('three');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var GPUParticleSystem = require('../utils/GPUParticleSystem');

var scaleMagic = 0.01;

function Magic (obj) {
  THREE.Object3D.call(this);

  this.active = false;
  this.tick = 0;
  this.obj = obj;
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
      this.options.position.set(this.obj.position.x / scaleMagic, this.obj.position.y / scaleMagic, this.obj.position.z / scaleMagic);
      if (State.get('stage') === 'experience') {
        for (var x = 0; x < this.spawnerOptions.spawnRate * delta; x++) {
          this.particleSystem.spawnParticle(this.options);
        }

        Events.emit('magicDispatched', this.obj.side, this.obj.influencedRace);
      }
    }
  }
  this.particleSystem.update(this.tick);
};

Magic.prototype.gamepadAnimation = function (side, animation, isPressed) {
  if (State.get('stage') === 'experience') {
    if (side === this.obj.side) {
      switch (animation) {
        case 'close':
          this.active = isPressed;
          break;
      }
    }
  }
};

module.exports = Magic;
