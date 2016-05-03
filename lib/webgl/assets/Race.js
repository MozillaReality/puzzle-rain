'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var Awake = require('../behaviours/Awake');
var Arrive = require('../assets/Arrive');

var Speaker = require('./Speaker');
var AudioManager = require('../managers/AudioManager');

var THREE = require('three');

function Race (s, initCuadrant) {
  this.race = s;

  // asleep
  // awake
  this.status = 'asleep';

  this.creaturesArr = [];

  THREE.Group.call(this);

  this.cuadrant = initCuadrant;
  this.gameArea = State.get('gameArea');
  var initPos = this.gameArea.getCuadrantPosition(this.cuadrant);
  this.position.set(initPos.x, initPos.y, initPos.z);

  // Where the track audio of this race emits
  this.speaker = new Speaker(this);
  this.add(this.speaker);
  // Control the pivot point of effects depending on gamepads positions (if they are affecting race behavoir)
  this.arrive = new Arrive(this);
  if (settings.debugRaceStatus) {
    this.add(this.arrive);
  }
  this.awake = new Awake(this);

  this.track = new AudioManager(this.race, this.speaker, true, true);
  this.track.setVolume(0);
  // Add all group of races
  State.add(s, this);

  Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

Race.prototype = Object.create(THREE.Group.prototype);

Race.prototype.update = function (delta) {
  // console.log(this.awake.awakeLevel);
  this.track.setVolume(this.awake.awakeLevel);
};

Race.prototype.raceStatusChanged = function (race, status) {
  if (this.race === race) {
    if (this.status !== status) {
      this.status = status;
    }
  }
};

module.exports = Race;
