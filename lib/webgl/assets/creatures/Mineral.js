'use strict';

var THREE = require('three');

var settings = require('../../../settings');
var State = require('../../../state/State');

var Creature = require('../Creature');

function Mineral (race, index, pos, scale, minHeight, maxHeight) {
  Creature.call(this, race, index, pos, scale, minHeight, maxHeight);

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/creatures/mineral.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        value.geometry.computeFaceNormals();
        value.geometry.computeVertexNormals();
        var material = new THREE.MeshStandardMaterial({color: 0x2e2d38, roughness: 1, metalness: 0.5, emissive: self.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading, transparent: true});
        self.bodyMesh = new THREE.Mesh(value.geometry, material);
        self.bodyMesh.name = 'mineral_' + index;
        self.bodyMesh.receiveShadow = true;
        self.bodyMesh.castShadow = true;

        self.eyes.position.set(0, 0.5, 0.65);
        self.mouth.position.set(0, 0, 0.9);
        self.body.add(self.bodyMesh);

        self.init();
      }
    });
  });
}

Mineral.prototype = Object.create(Creature.prototype);

module.exports = Mineral;
