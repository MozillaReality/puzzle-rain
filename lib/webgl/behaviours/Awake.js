'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

function Awake (obj) {
  this.obj = obj;
  // this.obj.status = 'asleep' (awakeLevel from 0 to 0.5)
  // this.obj.status = 'awake' (awakeLevel from 0.5 to 1)

  this.awakeLevel = 0;

  Events.on('updateScene', this.update.bind(this));
}

Awake.prototype.update = function (timestamp) {
  this.getStatus();
};

Awake.prototype.getStatus = function () {
  var currentStatus = 'asleep';
  if (this.awakeLevel > 0.5) {
    currentStatus = 'awake';
  }
  if (this.obj.status !== currentStatus) {
    this.obj.status = currentStatus;
    Events.emit('raceStatusChanged', this.type, this.obj.status);
  }
};

module.exports = Awake;
