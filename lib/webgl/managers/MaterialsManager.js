'use strict';

const Events = require('../../events/Events');
const THREE = require('three');
const CANNON = require('cannon');

function materialsManager () {
}

materialsManager.prototype.init = function (world) {
  // Materials
  this.groundMaterial = new CANNON.Material('groundMaterial');
  this.slipperyMaterial = new CANNON.Material('slipperyMaterial');

  // Adjust constraint equation parameters for ground/ground contact
  const ground_ground_cm = new CANNON.ContactMaterial(this.groundMaterial, this.groundMaterial, {
    friction: 0.4,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRegularizationTime: 3
  });
  const slippery_ground_cm = new CANNON.ContactMaterial(this.slipperyMaterial, this.groundMaterial, {
    friction: 0.1,
    restitution: 0.6
  });

  // Add contact material to the world
  world.addContactMaterial(ground_ground_cm);
  world.addContactMaterial(slippery_ground_cm);
};

module.exports = new materialsManager();
