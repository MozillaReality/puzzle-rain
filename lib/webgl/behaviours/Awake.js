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
  Events.on('updateScene', this.update.bind(this));
}

Awake.prototype.update = function (delta, time) {
  this.delta = delta;
  this.getStatus();
  if (this.awakeLevel > 0) {
    // this.awakeLevel = THREE.Math.clamp(this.awakeLevel - this.delta / 48, 0, limitAwake);
  }
// console.log(this.awakeLevel);
};

Awake.prototype.magicDispatched = function (side, race) {
  if (this.obj.race === race) {
    var awakeVal = 6;
    if (!State.get('vrDisplay')) {
      // To awake earlier
      awakeVal = 2;
    }

    this.awakeLevel = THREE.Math.clamp(this.awakeLevel + this.delta / awakeVal, 0, limitAwake);

  }
};

Awake.prototype.getStatus = function () {
  var currentStatus = 'asleep';
  if (this.awakeLevel > 0.5) {
    currentStatus = 'awake';
  }
  if (this.obj.status !== currentStatus) {
    if (this.obj.status === 'asleep') {
      var tween = new TWEEN.Tween(this).to({
        awakeLevel: 1
      }, 3000)
        // .easing(TWEEN.Easing.Circular.In)
        .start();
    }
    this.obj.status = currentStatus;
    Events.emit('raceStatusChanged', this.obj.race, this.obj.status);
  }
};

module.exports = Awake;
