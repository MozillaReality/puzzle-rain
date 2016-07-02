'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var AudioManager = require('../audio/AudioManager');

var RaceMesh = require('./RaceMesh');

var ParticleSystem = require('./particles/ParticleSystem');

function Race (s) {
  THREE.Group.call(this);

  this.particleSystem = new ParticleSystem();
  this.camera = State.get('camera');
  this.cameraForGlow = State.get('camera');

  this.creaturesArr = [];
  this.name = s;

  this.addEmitter();

  this.track = new AudioManager(this.name, true, this, true, true);
  this.track.setVolume(0);

  this.trackAwake = new AudioManager('effects/awake', true, this, false, false);

  // Add all group of races
  State.add(s, this);
  this.raceMesh = new RaceMesh(this);
  this.add(this.raceMesh);

  Events.on('updateScene', this.update.bind(this));
  Events.on('stageChanged', this.stageChanged.bind(this));
  Events.on('updateSceneSpectator', this.updateSceneSpectator.bind(this));
}

Race.prototype = Object.create(THREE.Group.prototype);

Race.prototype.updateSceneSpectator = function (delta, time) {
  this.cameraForGlow = State.get('cameraSpectator');
  this.updateCommon(delta, time);
};

Race.prototype.update = function (delta, time) {
  this.cameraForGlow = State.get('camera');
  this.updateCommon(delta, time);
};

Race.prototype.updateCommon = function (delta, time) {
  this.particleSystem.draw(this.cameraForGlow);
  if (State.get('stage') === 'ending' && State.get('endMode') === 1) {
    return;
  }
  // this.track.setVolume();

};

Race.prototype.stageChanged = function (newStage) {
  switch (newStage) {
    case 'ending':
      var self = this;
      new TWEEN.Tween({
        volume: this.track.getVolume()
      })
        .to({ volume: 0 }, 2000)
        .onUpdate(function () {
          self.track.setVolume(this.volume);
        })
        .start();
      this.hideEmitter();
      break;
  }
};

Race.prototype.addEmitter = function () {};

Race.prototype.showEmitter = function () {
  if (this.emitter) {
    TWEEN.remove(this.semiShowTween);
    TWEEN.remove(this.semiHideTween);
    this.showTween = new TWEEN.Tween(this.emitter.material.uniforms.opacity).to({
      value: 1.0
    }, 3000)
      .start();
  }
};

Race.prototype.hideEmitter = function () {
  if (this.emitter) {
    TWEEN.remove(this.semiShowTween);
    TWEEN.remove(this.semiHideTween);
    TWEEN.remove(this.showTween);
    new TWEEN.Tween(this.emitter.material.uniforms.opacity).to({
      value: 0
    }, 1000)
      .start();
  }
};

module.exports = Race;
