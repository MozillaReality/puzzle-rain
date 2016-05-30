'use strict';

var THREE = require('three');

var settings = require('../../../settings');
var State = require('../../../state/State');

var Creature = require('../Creature');

function Mineral (race, index, pos, scale, minHeight, maxHeight) {
  Creature.call(this, race, index, pos, scale, minHeight, maxHeight);

  var geometry = new THREE.CylinderBufferGeometry(1, 1, 1, 6);
  var material = new THREE.MeshStandardMaterial({color: 0x2e2d38, roughness: 0.5, metalness: 0.5, emissive: this.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading});
  this.bodyMesh = new THREE.Mesh(geometry, material);
  this.bodyMesh.name = 'mineral_' + index;
  this.bodyMesh.receiveShadow = true;
  this.bodyMesh.castShadow = true;
  this.bodyMesh.rotation.y = - Math.PI / 2;
  // this.rotation.y = - Math.PI / 2;

  this.eyes.position.set(0, 0.5, 0.45);
  this.mouth.position.set(0, 0.3, 0.90);
  this.body.add(this.bodyMesh);
}

Mineral.prototype = Object.create(Creature.prototype);

Mineral.prototype.update = function (delta, time) {
  Creature.prototype.update.call(this, delta, time);

  var userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(this.parent.position);
  if (this.handGrabbed !== '') {
    var hand = State.get('gamepad' + this.handGrabbed);
    userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(hand.position);
  }
  if (this.race.status === 'awake') {
    this.body.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));
  }

};

module.exports = Mineral;
