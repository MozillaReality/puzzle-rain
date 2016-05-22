'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Creature = require('../Creature');

function Bulrush (raceObj, index, pos, scale) {
  Creature.call(this, raceObj, index, pos, scale);

  var geometry = new THREE.BoxBufferGeometry(1, 5, 1);
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2.5, 0));
  this.originalColor = settings.bulrushesColor;
  var material = new THREE.MeshStandardMaterial({color: this.originalColor, roughness: 1, metalness: 0.5, shading: THREE.FlatShading});
  // var material = new THREE.MeshStandardMaterial({color: 0x444444, emissive: this.originalColor, emissiveIntensity: 0.5, shading: THREE.FlatShading});
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.name = 'bulrush_' + index;
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;
  this.rotation.y = - Math.PI / 2;

  this.eyes.position.set(0, 5, 0.2);
  this.body.add(this.mesh);
}

Bulrush.prototype = Object.create(Creature.prototype);

module.exports = Bulrush;
