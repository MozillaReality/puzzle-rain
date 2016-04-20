'use strict';

const CANNON = require('cannon');
const Creature = require('../Creature');
const CannonManager = require('../../managers/CannonManager');

function Bouncer (pos, scale) {
  Creature.call(this, 'bouncer', pos, scale);

}

Bouncer.prototype = Object.create(Creature.prototype);

Bouncer.prototype.init = function () {
  Creature.prototype.init.call(this);

  this.shape = new CANNON.Sphere(this.box.size().x / 2);
  this.body = new CANNON.Body({
    mass: 0.1,
    material: CannonManager.bouncyMaterial,
    collisionFilterGroup: 8, // Put in group
    collisionFilterMask: 1 | 4 | 8 // It can only collide with

  });
};

module.exports = Bouncer;
