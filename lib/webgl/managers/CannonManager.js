'use strict';

const Events = require('../../events/Events');
const THREE = require('three');
const CANNON = require('cannon');

let initialized = false;

function CannonManager () {
}

CannonManager.prototype.init = function (world) {
  if (initialized) {
    return;
  }
  initialized = true;

  this.caughtL = false;
  this.caughtR = false;
  // group IDs of collisionFilterMask
  // Power of 2 values. See http://localhost/cannon.js/DEMOS/collisionFilter.html
  // 1- ground
  this.groupGround = 1;
  // 2- hands
  this.groupHands = 2;
  // 4- terrestrials
  this.groupTerrestrials = 4;
  // 8- bouncers
  this.groupBouncers = 8;

  // To be accesible from other classes
  this.world = world;
  // Materials
  this.groundMaterial = new CANNON.Material('groundMaterial');
  this.bouncyMaterial = new CANNON.Material('bouncyMaterial');
  this.slipperyMaterial = new CANNON.Material('slipperyMaterial');
  this.handMaterial = new CANNON.Material('handMaterial');
  // Adjust constraint equation parameters for ground/ground contact
  const ground_ground_cm = new CANNON.ContactMaterial(this.groundMaterial, this.groundMaterial, {
    friction: 0.4,
    restitution: 0.4,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRegularizationTime: 3
  });
  const bouncyMaterial_ground_cm = new CANNON.ContactMaterial(this.bouncyMaterial, this.groundMaterial, {
    friction: 0.4,
    restitution: 0.4
  });
  const slippery_ground_cm = new CANNON.ContactMaterial(this.slipperyMaterial, this.groundMaterial, {
    friction: 0.1,
    restitution: 0.2
  });

  const slippery_hand_cm = new CANNON.ContactMaterial(this.slipperyMaterial, this.handMaterial, {
    friction: 2.1,
    restitution: 0
  });

  const bouncy_hand_cm = new CANNON.ContactMaterial(this.bouncyMaterial, this.handMaterial, {
    friction: 2.1,
    restitution: 0
  });

  // Add contact material to the world
  world.addContactMaterial(ground_ground_cm);
  world.addContactMaterial(bouncyMaterial_ground_cm);
  world.addContactMaterial(slippery_ground_cm);
  world.addContactMaterial(slippery_hand_cm);
  world.addContactMaterial(bouncy_hand_cm);

  Events.on('catching', catching.bind(this));
};

function catching (hand, bool) {
  if (hand === 'handL') {
    this.caughtL = bool;
  }
  if (hand === 'handR') {
    this.caughtR = bool;
  }
}

module.exports = new CannonManager();
