'use strict';

var THREE = require('three');
var settings = require('../../../settings');
var Creature = require('../Creature');
var State = require('../../../state/State');

function Bouncer (race, index, pos, scale, minHeight, maxHeight) {
  Creature.call(this, race, index, pos, scale, minHeight, maxHeight);

  var geometry = new THREE.IcosahedronGeometry(0.75, 0);
  this.material = new THREE.MeshStandardMaterial({color: 0x2e2d38, roughness: 1, metalness: 0.5, emissive: this.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading, transparent: true});
  this.bodyMesh = new THREE.Mesh(geometry, this.material);
  this.bodyMesh.name = 'bouncer_' + index;
  this.bodyMesh.receiveShadow = true;
  this.bodyMesh.castShadow = true;

  this.eyes.position.set(0, 0.5, 0.2);
  this.mouth.position.set(0, 0.25, 0.7);
  this.body.add(this.bodyMesh);
}

Bouncer.prototype = Object.create(Creature.prototype);

module.exports = Bouncer;
