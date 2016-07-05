'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var GameplayManager = require('../../managers/GameplayManager');

var AudioManager = require('../audio/AudioManager');

var ParticleSystem = require('./particles/ParticleSystem');

var MathUtils = require('../utils/MathUtils');

function Ground () {
  THREE.Object3D.call(this);

  this.isRainStarted = false;

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
        switch (value.name) {
          case 'world':
            self.worldFar = value;
            break;
          case 'shell':
            self.shell = value;
            break;
          case 'grow':
            self.grow = value;
            self.grow.material.transparent = true;
            self.grow.material.emissive = new THREE.Color(0xffffff);
            self.grow.material.emissiveMap = self.grow.material.map;
            self.grow.material.emissiveIntensity = 0;
            self.grow.position.y = -1;
            break;
        }

      }
    });
    self.add(obj);
    self.addAudios();
  });

  this.particleSystemRain = new ParticleSystem();
  this.addEmitterRain();

  this.particleSystemRipples = new ParticleSystem();
  this.addEmitterRipples();

  this.particleSystemHappy = new ParticleSystem();
  this.addEmitterHappy();

  this.isGroundFading = false;
  this.sunrise = 0;
  this.growFactor = 0;
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

Ground.prototype.addAudios = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));
  // if (!settings.debugMode) {
  this.track = new AudioManager('base', false, this, true, true);
  // } else {
  // this.track = new AudioManager('base', false, this, true, false);
  // }
  this.trackEnd01 = new AudioManager('end01', false, this, false, false);
  this.trackEnd02 = new AudioManager('end02', false, this, false, false);
};

Ground.prototype.audioLoaded = function (id) {
  if (id === 'base') {
    Events.on('updateScene', this.update.bind(this));
    Events.on('stageChanged', this.stageChanged.bind(this));
    GameplayManager.init();
    Events.on('shellRised', this.shellRised.bind(this));
    Events.on('rainStarted', this.rainStarted.bind(this));
    Events.on('elevationStarted', this.elevationStarted.bind(this));
    Events.on('endCreditsStarted', this.endCreditsStarted.bind(this));

    Events.emit('lastAssetIsLoaded');
  }
};

Ground.prototype.shellRised = function () {
  new TWEEN.Tween(this.worldFar.position).to({
    y: -3
  }, 10000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

Ground.prototype.update = function (delta, time) {
  // this.particleSystemHappy.draw();
  if (this.isRainStarted) {
    this.particleSystemRipples.draw(this.camera);
    this.particleSystemRain.draw(this.camera);
    this.particleSystemHappy.draw(this.camera);
    this.grow.position.y = -1 + this.growFactor;
    this.grow.material.emissiveIntensity = 1 * this.growFactor;
    this.grow.material.opacity = 1 - (0.7 * this.growFactor);
  }
  if (this.isGroundFading) {
    this.worldFar.material.color = new THREE.Color(MathUtils.blendColors(0xffffff, 0xe03b5c, this.sunrise));
    this.worldFar.material.emissive = new THREE.Color(MathUtils.blendColors(0x000000, 0xe03b5c, this.sunrise));
    this.worldFar.material.emissiveIntensity = 0.5 * this.sunrise;
    this.shell.material.emissive = new THREE.Color(MathUtils.blendColors(0xffffff, 0xe03b5c, this.sunrise));
    this.shell.material.emissiveIntensity = 0.3 * this.sunrise;
  }
};

Ground.prototype.stageChanged = function (newStage) {
  var self = this;
  switch (newStage) {
    case 'ending':
      if (State.get('endMode') === 1) {
        this.trackEnd01.play();
      } else {
        this.trackEnd02.play();
      }
      break;
  }
};

Ground.prototype.rainStarted = function () {
  this.isRainStarted = true;
  this.showRain();
  new TWEEN.Tween(this).to({
    growFactor: 1
  }, 20000)
    .easing(TWEEN.Easing.Quadratic.In)
    .start();
};

Ground.prototype.elevationStarted = function () {
  new TWEEN.Tween(this).to({
    sunrise: 1
  }, 15000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  if (State.get('endMode') === 1) {
    this.isGroundFading = true;
    this.hideMagicEnd();
  }
  var self = this;
  this.volumeInTween = new TWEEN.Tween({
    volume: this.track.getVolume()
  })
    .to({ volume: 0 }, 5000)
    .onUpdate(function () {
      self.track.setVolume(this.volume);
    })
    .start();
};

Ground.prototype.endCreditsStarted = function () {
  this.hideRain();
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

Ground.prototype.addEmitterHappy = function () {
  this.emitterHappy = this.particleSystemHappy.createParticleEmitter(new THREE.TextureLoader().load('textures/magicEnd.png'));
  this.emitterHappy.setTranslation(0, 0.1, 0);
  this.emitterHappy.setState(THREE.AdditiveBlending);
  this.emitterHappy.setColorRamp(
    [1, 1, 1, 1,
      1, 1, 1, 0]);
  this.emitterHappy.setParameters({
    numParticles: 100,
    lifeTime: 6,
    timeRange: 6,
    startSize: 0.1,
    endSize: 0.4,
    positionRange: [5, 0, 5],
    velocity: [0, 0.1, 0],
    velocityRange: [0, 0.02, 0],
    opacity: 0,
  billboard: true});

  this.emitterHappy.frustumCulled = false;
  this.add(this.emitterHappy);
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
  new TWEEN.Tween(this.emitterHappy.material.uniforms.opacity).to({
    value: 1.0
  }, 3000)
    .delay(1000)
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

Ground.prototype.hideMagicEnd = function () {
  new TWEEN.Tween(this.emitterHappy.material.uniforms.opacity).to({
    value: 0
  }, 1000)
    .start();
};

module.exports = Ground;
