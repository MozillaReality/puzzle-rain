'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

var sumStep = 0.005;
var subtractionStep = 0.0025;

function Awake (obj) {
  this.obj = obj;
  // this.obj.status = 'asleep' (awakeLevel from 0 to 0.5)
  // this.obj.status = 'awake' (awakeLevel from 0.5 to 1)

  this.awakeLevel = 0;

  Events.on('magicDispatched', this.magicDispatched.bind(this));
  Events.on('creatureHappy', this.creatureHappy.bind(this));
  Events.on('creatureCollided', this.creatureCollided.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

Awake.prototype.update = function (timestamp) {
  this.getStatus();
  if (this.awakeLevel > 0) {
    this.awakeLevel -= subtractionStep;
  }
};

Awake.prototype.magicDispatched = function (side, race) {
  if (this.obj.race === race) {
    this.awakeLevel += sumStep;
  }
};

Awake.prototype.getStatus = function () {
  var currentStatus = 'asleep';
  if (this.awakeLevel > 0.5) {
    currentStatus = 'awake';
  }
  if (this.obj.status !== currentStatus) {
    if (this.obj.status === 'asleep') {
      this.awakeLevel = 1;
    }
    this.obj.status = currentStatus;
    Events.emit('raceStatusChanged', this.obj.race, this.obj.status);
  }
};

Awake.prototype.creatureHappy = function (creature) {
  if (creature.raceObj.race === this.obj.race) {
    this.awakeLevel += sumStep * 50;
  }
};

Awake.prototype.creatureCollided = function (creature) {
  if (creature.raceObj.race === this.obj.race) {
    this.awakeLevel -= subtractionStep * 50;
  }
};

module.exports = Awake;
