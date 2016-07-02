'use strict';

var THREE = require('three');

var settings = require('../../../settings');
var State = require('../../../state/State');

var Creature = require('../Creature');

function Flyer (race, index, pos, scale) {
  Creature.call(this, race, index, pos, scale);

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/creatures/flyer.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        value.geometry.computeFaceNormals();
        value.geometry.computeVertexNormals();
        var material = new THREE.MeshStandardMaterial({color: settings.offColor, roughness: 1, metalness: 0.5, emissive: self.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading, transparent: true});
        self.bodyMesh = new THREE.Mesh(value.geometry, material);
        self.bodyMesh.name = 'flyer_' + index;
        self.bodyMesh.receiveShadow = true;
        self.bodyMesh.castShadow = true;

        self.eyes.position.set(0, 0.3, 0.45);
        self.mouth.position.set(0, 0, 0.62);
        self.body.add(self.bodyMesh);

        self.init();
      }
    });
  });
}

Flyer.prototype = Object.create(Creature.prototype);

Flyer.prototype.update = function (delta, time) {
  Creature.prototype.update.call(this, delta, time);
};

module.exports = Flyer;
