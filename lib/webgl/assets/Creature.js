'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var THREE = require('three');

var AudioManager = require('../managers/AudioManager');

function Creature (raceObj, index, myPos, myScale) {
  this.index = index;
  this.raceObj = raceObj;
  this.pos = myPos;
  this.myScale = myScale;

  // normal
  // happy
  // upset
  this.status = 'normal';

  THREE.Object3D.call(this);
  this.scale.set(this.myScale, this.myScale, this.myScale);
  this.position.set(this.pos.x, this.pos.y, this.pos.z);

  this.happyTrack = new AudioManager('happy', this, false, false);
  this.upsetTrack = new AudioManager('upset', this, false, false);

  Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

Creature.prototype = Object.create(THREE.Object3D.prototype);

Creature.prototype.update = function (delta) {};

Creature.prototype.raceStatusChanged = function (type, status) {
  console.log(type);
};

Creature.prototype.makeNormal = function () {
  this.status = 'normal';
  this.mesh.material.color = new THREE.Color(this.originalColor);
};

Creature.prototype.makeHappy = function () {
  console.log("I'm happy", this.mesh.name, this.raceObj.status);
  if (this.raceObj.status === 'awake' && this.status !== 'happy') {
    this.status = 'happy';
    this.happyTrack.play();
    this.mesh.material.color = new THREE.Color(0xffffff);
    if (this.hiding) clearTimeout(this.hiding);
    this.hiding = setTimeout(this.makeNormal.bind(this), 2500);
  }
};

Creature.prototype.makeCollision = function (side, point) {
  if (this.status !== 'upset') {
    this.status = 'upset';
    this.upsetTrack.play();
    Events.emit('collided', side, this.mesh.name);
    this.mesh.material.color = new THREE.Color(0xff0000);
    if (this.hiding) clearTimeout(this.hiding);
    this.hiding = setTimeout(this.makeNormal.bind(this), 2500);
  // console.log("I'm collided", point);
  }
};

module.exports = Creature;
