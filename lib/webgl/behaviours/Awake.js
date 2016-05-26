'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var limitAwake = 1.5;

function Awake (obj) {
  this.delta = 0;
  this.obj = obj;
  // this.obj.status = 'asleep' (awakeLevel from 0 to 0.5)
  // this.obj.status = 'awake' (awakeLevel from 0.5 to 1)

  this.awakeLevel = 0;

  Events.on('magicDispatched', this.magicDispatched.bind(this));
  // Events.on('creatureHappy', this.creatureHappy.bind(this));
  Events.on('creatureCollided', this.creatureCollided.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

Awake.prototype.update = function (delta, time) {
  this.delta = delta;
  this.getStatus();
  if (this.awakeLevel > 0) {
    this.awakeLevel = THREE.Math.clamp(this.awakeLevel - this.delta / 96, 0, limitAwake);
  }
};

Awake.prototype.magicDispatched = function (side, race) {
  if (this.obj.race === race) {
    this.awakeLevel = THREE.Math.clamp(this.awakeLevel + this.delta / 12, 0, limitAwake);
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

// Awake.prototype.creatureHappy = function (creature) {
//   if (creature.raceObj.race === this.obj.race) {
//     this.awakeLevel = THREE.Math.clamp(this.awakeLevel + this.delta * 50, 0, limitAwake);
//   }
// };

Awake.prototype.creatureCollided = function (creature) {
  if (creature.raceObj.race === this.obj.race) {
    var tween = new TWEEN.Tween(this).to({
      awakeLevel: 0
    }, 1000)
      // .easing(TWEEN.Easing.Circular.In)
      .start();
  }
};

module.exports = Awake;
