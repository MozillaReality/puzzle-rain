'use strict';

var THREE = require('three');
var Events = require('../../../events/Events');
var State = require('../../../state/State');
var settings = require('../../../settings');

var Creature = require('../Creature');
var SeparationAndSeek = require('../../behaviours/SeparationAndSeek');

var heightLimit = 1.5;

function Flyer (raceObj, index, pos, scale) {
  Creature.call(this, raceObj, index, pos, scale);

  this.separationAndSeek = new SeparationAndSeek(this, 2, raceObj.arrive);
  this.separationAndSeek.desiredSeparation = this.separationAndSeek.desiredSeparation * 10;
  var geometry = new THREE.IcosahedronGeometry(1, 0);
  geometry.translate(0, 0.5, 0);
  this.originalColor = settings.flyersColor;
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, transparent: true, opacity: 0.3, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'flyer_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.body.add(this.mesh);
}

Flyer.prototype = Object.create(Creature.prototype);

Flyer.prototype.update = function (delta) {
  var userPos = new THREE.Vector3().setFromMatrixPosition(this.parent.arrive.matrixWorld).sub(this.parent.position);
  this.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));
  var posYabs = this.position.y + this.parent.position.y;
  if (posYabs < heightLimit) {
    this.position.y = heightLimit - this.parent.position.y;
  }
};

module.exports = Flyer;
