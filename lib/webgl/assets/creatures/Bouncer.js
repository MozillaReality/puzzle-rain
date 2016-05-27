'use strict';

var THREE = require('three');
var settings = require('../../../settings');
var Creature = require('../Creature');

function Bouncer (raceObj, group, index, pos, scale) {
  Creature.call(this, raceObj, group, index, pos, scale);

  var geometry = new THREE.IcosahedronGeometry(0.5, 1);
  geometry.translate(0, 0.5, 0);
  this.originalColor = settings.bouncersColor;
  this.material = new THREE.MeshStandardMaterial({color: this.originalColor, roughness: 1, metalness: 0.5, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, this.material);
  this.mesh.name = 'bouncer_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.eyes.position.set(0, 0.8, 0.2);
  this.mouth.position.set(0, 0.45, 0.5);
  this.body.add(this.mesh);
}

Bouncer.prototype = Object.create(Creature.prototype);

Bouncer.prototype.update = function (delta, time) {
  Creature.prototype.update.call(this, delta, time);
  var userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(this.parent.position);
  this.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));
};

module.exports = Bouncer;
