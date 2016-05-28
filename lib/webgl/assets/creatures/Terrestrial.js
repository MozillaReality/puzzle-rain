'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Creature = require('../Creature');

function Terrestrial (race, index, pos, scale, minHeight, maxHeight) {
  Creature.call(this, race, index, pos, scale, minHeight, maxHeight);

  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, roughness: 1, metalness: 0.5, shading: THREE.FlatShading});
  this.bodyMesh = new THREE.Mesh(geometry, material);
  this.bodyMesh.name = 'terrestrial_' + index;
  this.bodyMesh.receiveShadow = true;
  this.bodyMesh.castShadow = true;

  this.eyes.position.set(0, 0.5, 0.3);
  this.mouth.position.set(0, 0.3, 0.51);
  this.body.add(this.bodyMesh);

}

Terrestrial.prototype = Object.create(Creature.prototype);

Terrestrial.prototype.update = function (delta, time) {
  Creature.prototype.update.call(this, delta, time);

  var userPos = new THREE.Vector3().setFromMatrixPosition(this.parent.arrive.matrixWorld).sub(this.parent.position);
  if (this.race.status === 'awake') {
    this.body.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));
  }

};

module.exports = Terrestrial;
