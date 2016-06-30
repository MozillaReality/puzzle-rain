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

  this.camera = State.get('camera');
  this.cameraForGlow = State.get('camera');

  this.active = false;
  this.controller = obj;

  this.particleSystem = new ParticleSystem();
  this.addTrails();
  this.track = new AudioManager('effects/magic', true, this, true, true);
  this.track.setVolume(0);
  var self = this;

  Events.on('updateScene', this.update.bind(this));
  Events.on('gamepadAnimation', this.gamepadAnimation.bind(this));
  Events.on('updateSceneSpectator', this.updateSceneSpectator.bind(this));
  Events.on('activeRaceChanged', this.activeRaceChanged.bind(this));
}

Magic.prototype = Object.create(THREE.Object3D.prototype);

Magic.prototype.updateSceneSpectator = function (delta, time) {
  this.cameraForGlow = State.get('cameraSpectator');
  this.updateCommon(delta, time);
};

Magic.prototype.update = function (delta, time) {
  this.cameraForGlow = this.camera;
  this.updateCommon(delta, time);
};

Magic.prototype.updateCommon = function (delta, time) {
  var paticlePos = new THREE.Vector3().setFromMatrixPosition(this.controller.matrixWorld);

  if (this.active) {
    switch (State.get('stage')) {
      case 'intro':
        this.trailOff.birthParticles(
          [paticlePos.x, paticlePos.y, paticlePos.z]);
        break;
      case 'experience':
        this.trail.birthParticles(
          [paticlePos.x, paticlePos.y, paticlePos.z]);
        Events.emit('magicDispatched', this.controller.side, this.controller.influencedRace);
        break;
    }

  }
  this.particleSystem.draw(this.cameraForGlow);
};

Magic.prototype.gamepadAnimation = function (side, animation, isPressed) {
  // if (State.get('stage') === 'experience') {
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
// }
};

Magic.prototype.addTrails = function () {
  var g_trailParameters = {
    numParticles: 2,
    lifeTime: 3,
    startSize: 0.01,
    endSize: 0.005,
    velocity: [0, -0.05, 0],
    velocityRange: [0.06, 0.03, 0.06],
    acceleration: [0, -0.05, 0],
    accelerationRange: [0.02, -0.03, 0.02],
    spinSpeedRange: 0.8,
    billboard: true
  };
  this.trail = this.particleSystem.createTrail(
    200   ,
    g_trailParameters,
    new THREE.TextureLoader().load('textures/magic.png'));
  this.trail.setState(THREE.AdditiveBlending);
  this.trail.setColorRamp(
    [1, 1, 1, 0.3,
      1, 1, 1, 0.5,
      1, 1, 1, 0.3,
      1, 1, 1, 0]);

  var g_trailParametersOff = {
    numParticles: 1,
    numFrames: 8,
    frameDuration: 20,
    frameStartRange: 8,
    // lifeTime: 10,
    // timeRange: 5,
    lifeTime: 5,
    startSize: 0.02,
    // timeRange: 50,
    endSize: 0.01,
    velocity: [0, -0.05, 0],
    velocityRange: [0.06, 0.03, 0.06],
    acceleration: [0, -0.05, 0],
    accelerationRange: [0.02, -0.03, 0.02],
    spinSpeedRange: 0.8,
    billboard: true
  };
  this.trailOff = this.particleSystem.createTrail(
    800  ,
    g_trailParametersOff,
    new THREE.TextureLoader().load('textures/magicOff.png'));
  this.trailOff.setState(THREE.NormalBlending);
  this.trailOff.setColorRamp(
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

Magic.prototype.activeRaceChanged = function (side, race) {
  var newColorMult = [1, 1, 1, 1];
  if (side === this.controller.side) {
    // TODO create a function to transform hex race colors to array
    switch (race.name) {
      case 'bouncers':
        newColorMult = [158 / 255, 63 / 255, 54 / 255, 1];
        break;
      case 'bulrushes':
        newColorMult = [57 / 255, 182 / 255, 32 / 255, 1];
        break;
      case 'flyers':
        newColorMult = [201 / 255, 204 / 255, 30 / 255, 1];
        break;
      case 'minerals':
        newColorMult = [159 / 255, 64 / 255, 155 / 255, 1];
        break;
      case 'terrestrials':
        newColorMult = [3 / 255, 86 / 255, 136 / 255, 1];
        break;
    }
  }

  this.trail.parameters.colorMult = newColorMult;
  // console.log(this.trailOff.parameters.colorMult);

};

module.exports = Magic;
