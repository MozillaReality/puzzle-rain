'use strict';

var THREE = require('three');
var Events = require('../../../events/Events');
var State = require('../../../state/State');
var settings = require('../../../settings');

var Creature = require('../Creature');

var heightLimit = 1.5;

function Flyer (raceObj, index, pos, scale) {
  Creature.call(this, raceObj, index, pos, scale);

  var geometry = new THREE.IcosahedronGeometry(1, 0);
  geometry.translate(0, 0.5, 0);
  this.originalColor = settings.flyersColor;
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, roughness: 1, metalness: 0.5,  shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'flyer_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.eyes.position.set(0, 1.2, 0.4);
  this.body.add(this.mesh);
}

Flyer.prototype = Object.create(Creature.prototype);

Flyer.prototype.update = function (delta) {
  var userPos = new THREE.Vector3().setFromMatrixPosition(this.parent.arrive.matrixWorld).sub(this.parent.position);
  this.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));

};

module.exports = Flyer;
