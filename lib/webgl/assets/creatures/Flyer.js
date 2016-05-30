'use strict';

var THREE = require('three');

var settings = require('../../../settings');
var State = require('../../../state/State');

var Creature = require('../Creature');

function Flyer (race, index, pos, scale, minHeight, maxHeight) {
  Creature.call(this, race, index, pos, scale, minHeight, maxHeight);

  var geometry = new THREE.IcosahedronGeometry(1, 0);
  var material = new THREE.MeshStandardMaterial({color: 0x39393c, roughness: 1, metalness: 0.5, emissive: this.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading});
  this.bodyMesh = new THREE.Mesh(geometry, material);
  this.bodyMesh.name = 'flyer_' + index;
  this.bodyMesh.receiveShadow = true;
  this.bodyMesh.castShadow = true;

  this.eyes.position.set(0, 0.6, 0.4);
  this.mouth.position.set(0, 0.25, 0.85);
  this.body.add(this.bodyMesh);
}

Flyer.prototype = Object.create(Creature.prototype);

Flyer.prototype.update = function (delta, time) {
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

module.exports = Flyer;
