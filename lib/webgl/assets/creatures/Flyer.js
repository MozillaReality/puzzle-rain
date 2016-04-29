'use strict';

var THREE = require('three');
var State = require('../../../state/State');
var settings = require('../../../settings');

var Creature = require('../Creature');
var SeparationAndSeek = require('../../behaviours/SeparationAndSeek');

function Flyer (index, pos, scale) {
  Creature.call(this, 'flyer', index, pos, scale);

  this.camera = State.get('camera');

  this.separationAndSeek = new SeparationAndSeek(this);

  var geometry = new THREE.IcosahedronGeometry(1, 0);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
  this.originalColor = settings.flyersColor;
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'flyer_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;

  this.add(this.mesh);
}

Flyer.prototype = Object.create(Creature.prototype);

Flyer.prototype.update = function (delta) {
  this.lookAt(new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z));
  var posYabs = this.position.y + this.parent.position.y;
  if (posYabs < 1.5) {
    this.position.y = 1.5 - this.parent.position.y;
  }
};

module.exports = Flyer;
