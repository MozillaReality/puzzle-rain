'use strict';

var THREE = require('../../three');

var settings = require('../../../settings');

var Creature = require('../Creature');
var State = require('../../../state/State');

function Terrestrial (race, index, pos, scale) {
  Creature.call(this, race, index, pos, scale);

  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  var material = new THREE.MeshStandardMaterial({color: settings.offColorCreature, roughness: 1, metalness: 0.5, emissive: this.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading, transparent: true});
  this.bodyMesh = new THREE.Mesh(geometry, material);
  this.bodyMesh.name = 'terrestrial_' + index;
  this.bodyMesh.receiveShadow = true;
  this.bodyMesh.castShadow = true;

  this.eyes.position.set(0, 0.5, 0.3);
  this.mouth.position.set(0, 0.3, 0.51);
  this.body.add(this.bodyMesh);
  this.init();
}

Terrestrial.prototype = Object.create(Creature.prototype);

module.exports = Terrestrial;
