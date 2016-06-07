'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var AudioManager = require('../audio/AudioManager');

var ParticleSystem = require('./particles/ParticleSystem');

function Ground () {
  THREE.Object3D.call(this);

  this.idBaseLoopAudio = 'baseLoop';
  this.idAudio = 'base';
  this.timeAtEnding = 217;
  this.timeAtRaining = 245;
  this.isRainStarted = false;

  this.timeAtStartEating = 258;
  this.isEatStarted = false;

  this.timeAtEndEating = 276.5;
  this.isEatEnded = false;

  this.camera = State.get('camera');
  this.scene = State.get('scene');

  this.counter = 0;

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/ground.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        value.geometry.computeFaceNormals();
        value.geometry.computeVertexNormals();
        value.material.shading = THREE.FlatShading;
        if (value.name === 'WorldFar') {
          self.worldFar = value;
        }
      }
    });
    self.add(obj);
    self.addIntroAudio();
  });

  this.particleSystemRain = new ParticleSystem();
  this.addEmitterRain();

  this.particleSystemRipples = new ParticleSystem();
  this.addEmitterRipples();

  Events.on('stageChanged', this.stageChanged.bind(this));
  Events.on('surprise', this.surprise.bind(this));
  Events.on('forceEnding', this.forceEnding.bind(this));
  Events.on('closerEnding', this.closerEnding.bind(this));
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

Ground.prototype.addIntroAudio = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));

  this.trackIntro = new AudioManager(this.idBaseLoopAudio, false, this, true, true);
  this.trackIntro.setVolume(5);
};

Ground.prototype.audioLoaded = function (id) {
  if (id === this.idBaseLoopAudio) {
    Events.on('updateScene', this.update.bind(this));
  }
};

Ground.prototype.stageChanged = function () {
  switch (State.get('stage')) {
    case 'experience':
      this.addAudio();
      break;
  }
};

Ground.prototype.surprise = function () {
  this.worldFar.position.y;
  new TWEEN.Tween(this.worldFar.position).to({
    y: -3
  }, 10000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

Ground.prototype.addAudio = function () {
  this.trackIntro.sound.stop();
  this.track = new AudioManager(this.idAudio, false, this, false, true);
  this.track.sound.position.y = 2.5;
// this.track.setVolume(1);
};

Ground.prototype.update = function (delta, time) {
  if (this.isRainStarted) {
    this.particleSystemRipples.draw();
    this.particleSystemRain.draw();
  }

  if (State.get('stage') !== 'intro') {
    this.counter += delta;
    if (this.counter > this.timeAtEnding && State.get('stage') === 'experience') {
      this.track.setStartTime(this.timeAtEnding);
      this.dispatchEnding();
    }
    if (this.counter > this.timeAtRaining && !this.isRainStarted) {
      this.isRainStarted = true;
      this.showRain();
      Events.emit('rainStarted');
    }
    if (this.counter > this.timeAtStartEating && !this.isEatStarted) {
      this.isEatStarted = true;
      Events.emit('eatStarted');
    }
    if (this.counter > this.timeAtEndEating && !this.isEatEnded) {
      this.isEatEnded = true;
      this.hideRain();
      Events.emit('endCredtisStarted');
    }
  }
};

Ground.prototype.forceEnding = function () {
  this.counter = this.timeAtEnding;
  this.track.setStartTime(this.timeAtEnding);
  this.dispatchEnding();
};

Ground.prototype.closerEnding = function () {
  this.track.setStartTime(this.timeAtEnding - 30);
  this.counter = this.timeAtEnding - 30;
};

Ground.prototype.dispatchEnding = function () {
  State.add('stage', 'ending');
  Events.emit('stageChanged');
};

Ground.prototype.addEmitterRipples = function () {
  this.emitterRipples = this.particleSystemRipples.createParticleEmitter(new THREE.TextureLoader().load('textures/magicOver.png'));
  this.emitterRipples.setTranslation(0, 0.1, 0);
  this.emitterRipples.setState(THREE.NormalBlending);
  this.emitterRipples.setColorRamp(
    [1, 1, 1, 1,
      1, 1, 1, 0]);
  this.emitterRipples.setParameters({
    numParticles: 200,
    lifeTime: 2,
    timeRange: 2,
    startSize: 0.02,
    endSize: 0.3,
    positionRange: [5, 0, 5],
    opacity: 0,
  billboard: false});

  this.emitterRipples.frustumCulled = false;
  this.add(this.emitterRipples);
};

Ground.prototype.addEmitterRain = function () {
  this.emitterRain = this.particleSystemRain.createParticleEmitter(new THREE.TextureLoader().load('textures/rain.png'));
  this.emitterRain.setTranslation(-2.5, 2.5, 0);
  this.emitterRain.setState(THREE.NormalBlending);
  this.emitterRain.setColorRamp(
    [1, 1, 1, 1]);
  this.emitterRain.setParameters({
    numParticles: 600,
    lifeTime: 2,
    timeRange: 2,
    startSize: 0.1,
    endSize: 0.1,
    positionRange: [5, 0, 5],
    velocity: [0, -3.5, 0],
    opacity: 0,
  billboard: true});

  this.emitterRain.frustumCulled = false;
  this.add(this.emitterRain);
};

Ground.prototype.showRain = function () {
  new TWEEN.Tween(this.emitterRain.material.uniforms.opacity).to({
    value: 1.0
  }, 3000)
    .start();
  new TWEEN.Tween(this.emitterRipples.material.uniforms.opacity).to({
    value: 1.0
  }, 2000)
    .start();
};

Ground.prototype.hideRain = function () {
  new TWEEN.Tween(this.emitterRain.material.uniforms.opacity).to({
    value: 0
  }, 1000)
    .start();
  new TWEEN.Tween(this.emitterRipples.material.uniforms.opacity).to({
    value: 0
  }, 1000)
    .start();
};

module.exports = Ground;
