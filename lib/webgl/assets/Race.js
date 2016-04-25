'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var THREE = require('three');

function Race (s, myPos) {
  this.type = s;
  this.pos = myPos;

  THREE.Object3D.call(this);
  this.position.set(this.pos.x, this.pos.y, this.pos.z);
  Events.on('updateScene', update.bind(this));
}

function update (delta) {
}

Race.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Race;
