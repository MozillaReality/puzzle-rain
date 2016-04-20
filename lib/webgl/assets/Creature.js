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

  this.indexEyesMaterial;
  this.indexBodyMaterial;
  this.asleepEyesMaterial = new THREE.MeshPhongMaterial({color: 0x474a50, shading: THREE.FlatShading, shininess: 0});
  this.wakeupEyesMaterial;
  this.asleepBodyMaterial = new THREE.MeshPhongMaterial({color: 0x474a50, shading: THREE.FlatShading, shininess: 0});
  this.wakeupBodyMaterial;

  this.status = 'wakeup';
  const myCreature = CreaturesManager[s + 'Mesh'];

  // Only valid for objects with 2 materials
  for ( var i = 0; i < myCreature.material.materials.length; i++) {
    if (myCreature.material.materials[i].name === 'eyes') {
      this.indexEyesMaterial = i;
      this.wakeupEyesMaterial = myCreature.material.materials[i];
    } else {
      this.indexBodyMaterial = i;
      this.wakeupBodyMaterial = myCreature.material.materials[i];
    }
  }

  THREE.Mesh.call(this, myCreature.geometry, myCreature.material);
  this.scale.set(this.myScale, this.myScale, this.myScale);

  // this.setStatus('asleep');

  // this.receiveShadow = true;
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

Creature.prototype.setStatus = function (status) {
  if (this.status !== status) {
    this.status = status;
    switch (status) {
      case 'asleep':
        this.material.materials[this.indexEyesMaterial] = this.asleepEyesMaterial;
        this.material.materials[this.indexBodyMaterial] = this.asleepBodyMaterial;
        break;
      case 'wakeup':
        this.material.materials[this.indexEyesMaterial] = this.wakeupEyesMaterial;
        this.material.materials[this.indexBodyMaterial] = this.wakeupBodyMaterial;
        break;
    }
  }
};

module.exports = Creature;
