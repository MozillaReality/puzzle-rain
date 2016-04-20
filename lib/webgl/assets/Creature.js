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
  this.sleepyEyesMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});
  this.asleepEyesMaterial = new THREE.MeshLambertMaterial({color: 0x444444});
  this.wakeupEyesMaterial;
  this.sleepyBodyMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
  this.asleepBodyMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
  this.wakeupBodyMaterial;

  this.status = 'wakeup';
  const myCreature = CreaturesManager[s + 'Mesh'];

  // const geometry = new THREE.BoxGeometry(1,1,1);
  // const material = new THREE.MeshBasicMaterial();
  // console.log(myCreature.material);
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
  console.log(this.indexEyesMaterial, this.indexBodyMaterial);
  THREE.Mesh.call(this, myCreature.geometry, myCreature.material);
  this.scale.set(this.myScale, this.myScale, this.myScale);
  // this.receiveShadow = true;
  this.castShadow = true;
  this.init();
  this.body.addShape(this.shape);
  this.body.position.set(this.pos.x, this.pos.y, this.pos.z);
  this.world.addBody(this.body);

  const scope = this;
  this.body.addEventListener('sleepy', function (event) {
    // console.log(s + ' is feeling sleepy...');
    changeMaterial(scope, 'sleepy');
  });

  this.body.addEventListener('sleep', function (event) {
    // console.log(s + ' fell asleep!');
    changeMaterial(scope, 'asleep');
  });

  this.body.addEventListener('wakeup', function (event) {
    // console.log(s + ' woke up!');
    changeMaterial(scope, 'wakeup');
  });

  Events.on('updateScene', update.bind(this));
}

function update (delta) {
  this.position.copy(this.body.position);
  this.quaternion.copy(this.body.quaternion);
}

function changeMaterial (scope, status) {
  console.log(scope.status, status);
  if (scope.status !== status) {
    scope.status = status;
    console.log(scope.indexEyesMaterial);
    switch (status) {
      case 'sleepy':
        scope.material.materials[scope.indexEyesMaterial] = scope.sleepyEyesMaterial;
        scope.material.materials[scope.indexBodyMaterial] = scope.sleepyBodyMaterial;
        break;
      case 'asleep':
        scope.material.materials[scope.indexEyesMaterial] = scope.asleepEyesMaterial;
        scope.material.materials[scope.indexBodyMaterial] = scope.asleepBodyMaterial;
        break;
      case 'wakeup':
        scope.material.materials[scope.indexEyesMaterial] = scope.wakeupEyesMaterial;
        scope.material.materials[scope.indexBodyMaterial] = scope.wakeupBodyMaterial;
        break;
    }
    console.log(status);
  // scope.material.needsUpdate = true;
  }
}

Creature.prototype = Object.create(THREE.Mesh.prototype);

Creature.prototype.init = function () {
  this.box = new THREE.Box3().setFromObject(this);
};

module.exports = Creature;
