'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var THREE = require('three');

var behaviour;

function Creature (s, index, myPos, myScale) {
  this.index = index;
  this.type = s;
  this.pos = myPos;
  this.myScale = myScale;

  THREE.Object3D.call(this);
  this.scale.set(this.myScale, this.myScale, this.myScale);
  this.position.set(this.pos.x, this.pos.y, this.pos.z);
  Events.on('updateScene', this.update.bind(this));
}

Creature.prototype = Object.create(THREE.Object3D.prototype);

Creature.prototype.update = function (delta) {};

Creature.prototype.makeHappy = function () {
  // console.log("I'm happy");
};

Creature.prototype.makeCollision = function (point) {
  Events.emit('collided', this.mesh.name);
  console.log("I'm collided", point);
};

module.exports = Creature;
