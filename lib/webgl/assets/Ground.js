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
            // self.worldFar.material.color = new THREE.Color(0xe03b5c);
            // self.worldFar.material.emissive = new THREE.Color(0xe03b5c);
            // self.worldFar.material.emissiveIntensity = 0.5;
            break;
          case 'shell':
            self.shell = value;
            // console.log(self.shell.material);
            // self.shell.material.color = new THREE.Color(0xffffff);
            // self.shell.material.emissive = new THREE.Color(0xe03b5c);
            // self.shell.material.emissiveIntensity = 0.3;
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

  this.isGroundFading = false;
  this.sunrise = 0;
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

Ground.prototype.addAudios = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));
  this.track = new AudioManager('base', false, this, true, true);
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
  }
};

Ground.prototype.shellRised = function () {
  this.worldFar.position.y;
  new TWEEN.Tween(this.worldFar.position).to({
    y: -3
  }, 10000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

Ground.prototype.update = function (delta, time) {
  if (this.isRainStarted) {
    this.particleSystemRipples.draw();
    this.particleSystemRain.draw();
  }
  if (this.isGroundFading) {
    this.worldFar.material.color = new THREE.Color(MathUtils.blendColors(0xffffff, 0xe03b5c, this.sunrise));
    this.worldFar.material.emissive = new THREE.Color(MathUtils.blendColors(0x000000, 0xe03b5c, this.sunrise));
    this.worldFar.material.emissiveIntensity = 0.5 * this.sunrise;
    this.shell.material.emissive = new THREE.Color(MathUtils.blendColors(0xffffff, 0xe03b5c, this.sunrise));
    this.shell.material.emissiveIntensity = 0.3 * this.sunrise;
  }
// this.shell.material
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
      this.volumeInTween = new TWEEN.Tween({
        volume: this.track.getVolume()
      })
        .to({ volume: 0 }, 1000)
        .onUpdate(function () {
          self.track.setVolume(this.volume);
        })
        .start();
      break;
  }
};

Ground.prototype.rainStarted = function () {
  this.isRainStarted = true;
  this.showRain();
};

Ground.prototype.elevationStarted = function () {
  new TWEEN.Tween(this).to({
    sunrise: 1
  }, 15000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  if (State.get('endMode') === 1) {
    this.isGroundFading = true;
  }
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
