'use strict';

const CANNON = require('cannon');
const Creature = require('../Creature');
const MaterialsManager = require('../../managers/MaterialsManager');

function Terrestrial (pos, scale) {
  Creature.call(this, 'terrestrial', pos, scale);

}

Terrestrial.prototype = Object.create(Creature.prototype);

Terrestrial.prototype.init = function () {
  Creature.prototype.init.call(this);

  this.shape = new CANNON.Box(new CANNON.Vec3(this.box.size().x / 2, this.box.size().y / 2, this.box.size().z / 2));
  // shape.convexPolyhedronRepresentation;
  this.body = new CANNON.Body({
    mass: 0.1,
    material: MaterialsManager.groundMaterial
  });
// this.body.fixedRotation = true;
// this.body.updateMassProperties();
// this.body.allowSleep = true;
// this.body.sleepSpeedLimit = 1;
// this.body.sleepTimeLimit = 5;
};

module.exports = Terrestrial;
