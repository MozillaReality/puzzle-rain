'use strict';

const Events = require('../../events/Events');
const THREE = require('three');
const CANNON = require('cannon');
const CreaturesManager = require('../managers/CreaturesManager');
const MaterialsManager = require('../managers/MaterialsManager');

function Creature (s, myPos, myScale) {
  this.world = MaterialsManager.world;
  this.pos = myPos;
  this.myScale = myScale;

  const myCreature = CreaturesManager[s + 'Mesh'];

  THREE.Mesh.call(this, myCreature.geometry, myCreature.material);
  this.scale.set(this.myScale, this.myScale, this.myScale);
  this.receiveShadow = true;
  this.castShadow = true;
  this.init();
  this.body.addShape(this.shape);
  this.body.position.set(this.pos.x, this.pos.y, this.pos.z);
  this.world.addBody(this.body);

  Events.on('updateScene', update.bind(this));
}

function update (delta) {
  this.position.copy(this.body.position);
  this.quaternion.copy(this.body.quaternion);
}

Creature.prototype = Object.create(THREE.Mesh.prototype);

Creature.prototype.init = function () {
  this.box = new THREE.Box3().setFromObject(this);
};

module.exports = Creature;
