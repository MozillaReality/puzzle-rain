'use strict';

const Events = require('../../events/Events');
const State = require('../../state/State');

const THREE = require('three');
const CANNON = require('cannon');
const CreaturesManager = require('../managers/CreaturesManager');
const CannonManager = require('../managers/CannonManager');

function Creature (s, myPos, myScale, godToFollow) {
  this.world = CannonManager.world;
  this.pos = myPos;
  this.myScale = myScale;
  if (!godToFollow) {
    this.godToFollow = null;
  } else {
    this.godToFollow = godToFollow;
  }

  this.isCaught = false;
  this.whomCollide;

  this.secureDistanceToGod = 0.2;
  this.maxSpeed = 0.005;
  this.maxForce = 0.0002;
  this.acceleration = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  this.separateFactor = 8;
  this.seekFactor = 6;
  this.desiredSeparation = 0.05;

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

  this.receiveShadow = true;
  this.castShadow = true;
  this.init();
  this.body.addShape(this.shape);
  this.body.position.set(this.pos.x, this.pos.y, this.pos.z);
  this.body.allowSleep = false;
  this.world.addBody(this.body);

  const scope = this;
  this.body.addEventListener('collide', function (e) {
    // console.log('Collided with body:', e.body.name);
    scope.whomCollide = e.body.name;
    if (scope.whomCollide === 'handL') {
      scope.controllerCaught = State.get('controllerL');
      scope.isCaught = true;
    }else if (scope.whomCollide === 'handR') {
      scope.controllerCaught = State.get('controllerR');
      scope.isCaught = true;
    } else {
      scope.isCaught = false;
    }
  // console.log('Contact between bodies:', e.contact);
  });

  Events.on('updateScene', update.bind(this));
}

function update (delta) {
  if (this.isCaught) {
    console.log(this.name, this.isCaught);
    let isHandCaught;
    if (this.whomCollide === 'handL') {
      isHandCaught = CannonManager.caughtL;
    } else {
      isHandCaught = CannonManager.caughtR;
    }
    if (isHandCaught) {
      // Uses other logic
      // console.log(this.controllerCaught.position);
      this.position.copy(this.controllerCaught.position);
      this.quaternion.copy(this.controllerCaught.quaternion);
      this.body.position.copy(this.position);
      this.body.quaternion.copy(this.quaternion);
    } else {
      this.isCaught = false;
    }
  } else {
    // Uses physics
    this.position.copy(this.body.position);
    this.quaternion.copy(this.body.quaternion);
  }
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
