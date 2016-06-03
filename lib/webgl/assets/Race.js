'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var Awake = require('../behaviours/Awake');
var Arrive = require('../assets/Arrive');

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
  // asleep
  // awake
  this.status = 'asleep';

  this.creaturesArr = [];
  this.name = s;

  this.isEnding = false;

  // Where the track audio of this race emits
  this.speaker = new Speaker(this);
  this.add(this.speaker);

  // Control the pivot point of effects depending on gamepads positions (if they are affecting race behavoir)
  this.arrive = new Arrive(this);
  this.add(this.arrive);

  this.addEmitter();

  // Control awake level depending on how much magic do you spare over this race
  this.awake = new Awake(this);
  this.track = new AudioManager(this.name, this.speaker, true, true);
  this.track.setVolume(0);
  // Add all group of races
  State.add(s, this);
  this.raceMesh = new RaceMesh(this);
  this.add(this.raceMesh);

  Events.on('updateScene', this.update.bind(this));
  Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
  Events.on('onEnding', this.onEnding.bind(this));
}

Race.prototype = Object.create(THREE.Group.prototype);

Race.prototype.update = function (delta) {
  this.track.setVolume(this.awake.awakeLevel);
  // if (this.status === 'awake') {
  this.particleSystem.draw();
  // }
  if (this.isEnding) {
    // this.updateAtEnding(delta, time);
    return;
  }
  var averageCreaturesVolume = 0;
  var averageCreaturesHeight = 0;
  for (var i = 0; i < this.creaturesArr.length;i++) {
    averageCreaturesVolume += this.creaturesArr[i].track.getVolume();
    averageCreaturesHeight += this.creaturesArr[i].position.y;
  }
  averageCreaturesVolume = averageCreaturesVolume / this.creaturesArr.length;
  averageCreaturesHeight = averageCreaturesHeight / this.creaturesArr.length;
  if (averageCreaturesVolume < 0.1 && this.status === 'awake') {
    this.awake.awakeLevel = 0;
  }
  this.speaker.position.y = averageCreaturesHeight;
// this.position.set(this.pos.x + this.arrive.position.x, this.pos.y + this.arrive.position.y - this.speaker.position.y, this.pos.z + this.arrive.position.z);
};

Race.prototype.raceStatusChanged = function (race, status) {
  // TODO do not change this.status value here because comes changed from Awake.js
  if (this === race) {
    switch (status) {
      case 'awake':
        this.showEmitter();
        this.activateHandlers();
        break;
      case 'asleep':
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

Race.prototype.onEnding = function () {
  this.isEnding = true;
  new TWEEN.Tween(this.awake).to({
    awakeLevel: 0
  }, 3000)
    .start();
};

Race.prototype.addEmitter = function () {};

Race.prototype.showEmitter = function () {
  if (this.emitter) {
    new TWEEN.Tween(this.emitter.material.uniforms.opacity).to({
      value: 1.0
    }, 3000)
      .start();
  }
};

module.exports = Race;
