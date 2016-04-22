'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var THREE = require('three');

var SeparationAndSeek = require('../behaviours/SeparationAndSeek');
var behaviour;

function Creature (s, myPos, myScale) {
  this.rage = s;
  this.pos = myPos;
  this.myScale = myScale;

  THREE.Object3D.call(this);
  this.scale.set(this.myScale, this.myScale, this.myScale);
  this.position.set(this.pos.x, this.pos.y, this.pos.z);
  Events.on('updateScene', update.bind(this));
  behaviour = new SeparationAndSeek(this);
}

function update (delta) {
}

Creature.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Creature;
