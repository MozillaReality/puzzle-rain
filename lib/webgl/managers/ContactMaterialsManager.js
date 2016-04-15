'use strict';

const Events = require('../../events/Events');
const THREE = require('three');
const CANNON = require('cannon');

function ContactMaterialsManager (world) {
  // Materials
  const groundMaterial = new CANNON.Material('groundMaterial');

  // Adjust constraint equation parameters for ground/ground contact
  const ground_ground_cm = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
    friction: 0,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRegularizationTime: 3,
  });

  // Add contact material to the world
  world.addContactMaterial(ground_ground_cm);
}

module.exports = ContactMaterialsManager;
