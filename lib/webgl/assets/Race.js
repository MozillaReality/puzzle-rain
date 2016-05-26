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

  this.camera = State.get('camera');
  // asleep
  // awake
  this.status = 'asleep';

  this.creaturesArr = [];
  this.groupHandlersArr = [];

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
  this.add(this.arrive);

  // Control awake level depending on how much magic do you spare over this race
  this.awake = new Awake(this);

  this.track = new AudioManager(this.race, this.speaker, true, true);
  this.track.setVolume(0);
  // Add all group of races
  State.add(s, this);

  Events.on('updateScene', this.update.bind(this));
  Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
}

Race.prototype = Object.create(THREE.Group.prototype);

Race.prototype.update = function (delta) {
  // console.log(this.awake.awakeLevel);
  this.track.setVolume(this.awake.awakeLevel);

  var averageGroupVolume = 0;
  for (var i = 0; i < this.groupHandlersArr.length;i++) {
    averageGroupVolume += this.groupHandlersArr[i].track.getVolume();
  }
  averageGroupVolume = averageGroupVolume / this.groupHandlersArr.length;
  console.log(averageGroupVolume);
};

Race.prototype.raceStatusChanged = function (race, status) {
  if (this.race === race) {
    switch (status) {
      case 'awake':
        this.activateHandlers();
        break;
      case 'asleep':
        this.deactivateHandlers();
        break;
    }
  }
};

Race.prototype.activateHandlers = function () {
  for (var i = 0; i < this.groupHandlersArr.length;i++) {
    this.groupHandlersArr[i].activate();
  }
};

Race.prototype.deactivateHandlers = function () {
  for (var i = 0; i < this.groupHandlersArr.length;i++) {
    this.groupHandlersArr[i].deactivate();
  }
};

module.exports = Race;
