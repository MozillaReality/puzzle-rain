'use strict';

var THREE = require('three');
var settings = require('../../../settings');
var Creature = require('../Creature');

function Bouncer (race, index, pos, scale, minHeight, maxHeight) {
  Creature.call(this, race, index, pos, scale, minHeight, maxHeight);

  var geometry = new THREE.IcosahedronGeometry(0.75, 0);
  this.material = new THREE.MeshStandardMaterial({color: this.originalColor, roughness: 1, metalness: 0.5, shading: THREE.FlatShading});
  this.bodyMesh = new THREE.Mesh(geometry, this.material);
  this.bodyMesh.name = 'bouncer_' + index;
  this.bodyMesh.receiveShadow = true;
  this.bodyMesh.castShadow = true;

  this.eyes.position.set(0, 0.5, 0.2);
  this.mouth.position.set(0, 0.25, 0.7);
  this.body.add(this.bodyMesh);
}

Bouncer.prototype = Object.create(Creature.prototype);

Bouncer.prototype.update = function (delta, time) {
  Creature.prototype.update.call(this, delta, time);
  var userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(this.parent.position);
  if (this.race.status === 'awake') {
    this.body.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));
  }
};

module.exports = Bouncer;
