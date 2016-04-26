'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var Stats = require('../utils/RaceStats');

var Arrive = require('../behaviours/Arrive');

var THREE = require('three');

function Race (s, myPos) {
  this.race = s;
  this.pos = myPos;

  // asleep (awakeLevel from 0 to 0.5)
  // awake (awakeLevel from 0.5 to 1)
  // happy (awake + happyLevel = 1)
  // upset (awake + upsetLevel = 1)
  this.status = 'asleep';

  this.awakeLevel = 0;
  this.happyLevel = 0.5;
  this.upsetLevel = 0.5;

  THREE.Object3D.call(this);
  this.position.set(this.pos.x, this.pos.y, this.pos.z);
  this.behavior = new Arrive(this.race);

  if (settings.debugRaceStatus) {
    addStats(this);
    this.add(this.behavior.view);
  }

  Events.on('updateScene', update.bind(this));
}

function update (delta) {
  getStatus(this);
}

function getStatus (self) {
  var currentStatus = 'asleep';
  if (self.awakeLevel > 0.5) {
    currentStatus = 'awake';
    if (self.happyLevel === 1) {
      currentStatus = 'happy';
    }
    if (self.upsetLevel === 1) {
      currentStatus = 'upset';
    }
  }
  if (self.status !== currentStatus) {
    self.status = currentStatus;
    Events.emit('raceStatusChanged', self.type, self.status);
  }
}

function addStats (self) {
  var stats = new Stats();
  stats.sprite.position.y = 0;
  self.add(stats.sprite);
}
Race.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Race;
