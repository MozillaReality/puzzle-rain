'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var THREE = require('three');

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

Creature.prototype.makeNormal = function () {
  this.mesh.material.color = new THREE.Color(this.originalColor);
};

Creature.prototype.makeHappy = function () {
  // console.log("I'm happy");
  this.mesh.material.color = new THREE.Color(0xffffff);
  if (this.hiding) clearTimeout(this.hiding);
  this.hiding = setTimeout(this.makeNormal.bind(this), 2500);
};

Creature.prototype.makeCollision = function (side, point) {
  Events.emit('collided', side, this.mesh.name);
  this.mesh.material.color = new THREE.Color(0xff0000);
  if (this.hiding) clearTimeout(this.hiding);
  this.hiding = setTimeout(this.makeNormal.bind(this), 2500);
// console.log("I'm collided", point);
};

module.exports = Creature;
