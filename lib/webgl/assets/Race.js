'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var Awake = require('../behaviours/Awake');

var Speaker = require('./Speaker');
var AudioManager = require('../audio/AudioManager');

var RaceMesh = require('./RaceMesh');

var ParticleSystem = require('./particles/ParticleSystem');

function Race (s, pos) {
  THREE.Group.call(this);
  this.pos = pos;
  this.position.set(pos.x, pos.y, pos.z);

  this.particleSystem = new ParticleSystem();
  this.camera = State.get('camera');
  this.cameraForGlow = State.get('camera');
  // asleep
  // awake
  this.status = 'asleep';

  this.creaturesArr = [];
  this.name = s;

  // Where the track audio of this race emits
  this.speaker = new Speaker(this);
  this.add(this.speaker);

  this.addEmitter();

  // Control awake level depending on how much magic do you spare over this race
  this.awake = new Awake(this);
  this.track = new AudioManager(this.name, true, this.speaker, true, true);
  this.track.setVolume(0);

  this.trackAwake = new AudioManager('effects/awake', true, this, false, false);

  // Add all group of races
  State.add(s, this);
  this.raceMesh = new RaceMesh(this);
  this.add(this.raceMesh);

  Events.on('updateScene', this.update.bind(this));
  Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
  Events.on('stageChanged', this.stageChanged.bind(this));
  if (settings.spectatorMode) {
    Events.on('updateSceneSpectator', this.updateSceneSpectator.bind(this));
  }
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
  if (this.status === 'awake') {
    this.particleSystem.draw(this.cameraForGlow);
  }
  if (State.get('stage') === 'ending' && State.get('endMode') === 1) {
    return;
  }
  this.track.setVolume(this.awake.awakeLevel);

  var averageCreaturesVolume = 0;
  var averageCreaturesHeight = 0;
  for (var i = 0; i < this.creaturesArr.length;i++) {
    averageCreaturesVolume += this.creaturesArr[i].track.getVolume();
    averageCreaturesHeight += this.creaturesArr[i].position.y;
  }
  averageCreaturesVolume = averageCreaturesVolume / this.creaturesArr.length;
  averageCreaturesHeight = averageCreaturesHeight / this.creaturesArr.length;
  // if (averageCreaturesVolume < 0.1 && this.status === 'awake') {
  //   this.awake.awakeLevel = 0;
  // }
  this.speaker.position.y = averageCreaturesHeight;
};

Race.prototype.raceStatusChanged = function (race, status) {
  // TODO do not change this.status value here because comes changed from Awake.js
  if (State.get('stage') === 'ending') {
    return;
  }
  if (this === race) {
    switch (status) {
      case 'awake':
        this.showEmitter();
        this.activateHandlers();
        this.trackAwake.play();
        break;
      case 'asleep':
        this.hideEmitter();
        this.deactivateHandlers();
        break;
    }
  }
};

Race.prototype.activateHandlers = function () {
  for (var i = 0; i < this.creaturesArr.length;i++) {
    this.creaturesArr[i].activate();
  }
};

Race.prototype.deactivateHandlers = function () {
  for (var i = 0; i < this.creaturesArr.length;i++) {
    this.creaturesArr[i].deactivate();
  }
};

Race.prototype.stageChanged = function (newStage) {
  switch (newStage) {
    case 'ending':
      if (State.get('endMode') === 1) {
        var self = this;
        new TWEEN.Tween({
          volume: this.track.getVolume()
        })
          .to({ volume: 0 }, 2000)
          .onUpdate(function () {
            self.track.setVolume(this.volume);
          })
          .start();
      } else {
        new TWEEN.Tween(this.awake).to({
          awakeLevel: 0
        }, 3000)
          .start();
      }
      this.hideEmitter();
      break;
  }
};

Race.prototype.addEmitter = function () {};

Race.prototype.showEmitter = function () {
  if (this.emitter) {
    this.showTween = new TWEEN.Tween(this.emitter.material.uniforms.opacity).to({
      value: 1.0
    }, 3000)
      .start();
  }
};

Race.prototype.hideEmitter = function () {
  if (this.emitter) {
    TWEEN.remove(this.showTween);
    new TWEEN.Tween(this.emitter.material.uniforms.opacity).to({
      value: 0
    }, 1000)
      .start();
  }
};
module.exports = Race;
