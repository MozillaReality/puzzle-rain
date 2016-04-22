'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var THREE = require('three');
var CreaturesManager = require('../managers/CreaturesManager');

var SeparationAndSeek = require('../behaviours/SeparationAndSeek');

var behaviour;

function Creature (s, myPos, myScale) {
  this.rage = s;
  this.pos = myPos;
  this.myScale = myScale;

  var myCreature = CreaturesManager[this.rage + 'Mesh'];

  THREE.Mesh.call(this, myCreature.geometry, myCreature.material);
  this.scale.set(this.myScale, this.myScale, this.myScale);

  this.receiveShadow = true;
  this.castShadow = true;
  Events.on('allCreaturesAdded', allCreaturesAdded.bind(this));
  Events.on('updateScene', update.bind(this));
}

function update (delta) {
}

function allCreaturesAdded () {
  behaviour = new SeparationAndSeek(this);
}

Creature.prototype = Object.create(THREE.Mesh.prototype);

module.exports = Creature;
