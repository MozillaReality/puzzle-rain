'use strict';

const Events = require('../../../events/Events');
const THREE = require('three');
const CANNON = require('cannon');
const Creature = require('../Creature');

function Bouncer (world, pos, scale) {
  Creature.call(this, 'bouncer', world, pos, scale);

}

Bouncer.prototype = Object.create(Creature.prototype);

Bouncer.prototype.init = function (obj) {
  // Creature.prototype.init.call(this, obj);

  this.add(obj);

  var box = new THREE.Box3().setFromObject(obj.children[0]);
  // console.log(box.size());
  const shape = new CANNON.Sphere(box.size().x / 2 * this.myScale);
  this.body = new CANNON.Body({
    mass: 0.1
  });
  this.body.addShape(shape);
  this.body.position.set(this.pos.x, this.pos.y, this.pos.z);
  this.world.addBody(this.body);

};

module.exports = Bouncer;
