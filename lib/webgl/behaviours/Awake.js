'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

function Awake (obj) {
  this.obj = obj;
  // asleep (awakeLevel from 0 to 0.5)
  // awake (awakeLevel from 0.5 to 1)
  // happy (awake + happyLevel = 1)
  // upset (awake + upsetLevel = 1)
  this.status = 'asleep';

  this.awakeLevel = 0;
  this.happyLevel = 0.5;
  this.upsetLevel = 0.5;

  Events.on('updateScene', this.update.bind(this));
}

Awake.prototype.update = function (timestamp) {
  this.getStatus();
};

Awake.prototype.getStatus = function () {
  var currentStatus = 'asleep';
  if (this.awakeLevel > 0.5) {
    currentStatus = 'awake';
    if (this.happyLevel === 1) {
      currentStatus = 'happy';
    }
    if (this.upsetLevel === 1) {
      currentStatus = 'upset';
    }
  }
  if (this.status !== currentStatus) {
    this.status = currentStatus;
    Events.emit('raceStatusChanged', this.type, this.status);
  }
};

module.exports = Awake;
