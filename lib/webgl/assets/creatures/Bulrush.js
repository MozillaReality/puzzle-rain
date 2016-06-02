'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Creature = require('../Creature');
var State = require('../../../state/State');

function Bulrush (race, index, pos, scale, minHeight, maxHeight) {
  Creature.call(this, race, index, pos, scale, minHeight, maxHeight);

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/creatures/bulrush.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        value.geometry.computeFaceNormals();
        value.geometry.computeVertexNormals();
        var material = new THREE.MeshStandardMaterial({color: 0x2e2d38, roughness: 1, metalness: 0.5, emissive: self.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading, transparent: true});
        self.bodyMesh = new THREE.Mesh(value.geometry, material);
        self.bodyMesh.name = 'bulrush_' + index;
        self.bodyMesh.receiveShadow = true;
        self.bodyMesh.castShadow = true;

        self.eyes.position.set(0, 0.2, 0.48);
        self.mouth.position.set(0, -0.1, 0.51);
        self.body.add(self.bodyMesh);

        self.init();
      }
    });
  });

  // var geometry = new THREE.SphereBufferGeometry(1, 6, 2);
  // var material = new THREE.MeshStandardMaterial({color: 0x2e2d38, roughness: 1, metalness: 0, emissive: this.originalColor, emissiveIntensity: 0, shading: THREE.FlatShading, transparent: true});
  // this.bodyMesh = new THREE.Mesh(geometry, material);
  // this.bodyMesh.name = 'bulrush_' + index;
  // this.bodyMesh.receiveShadow = true;
  // this.bodyMesh.castShadow = true;
  //
  // this.eyes.position.set(0, 0.5, 0.2);
  // this.mouth.position.set(0, 0.3, 0.85);
  // this.body.add(this.bodyMesh);

  this.init();
}

Bulrush.prototype = Object.create(Creature.prototype);

module.exports = Bulrush;
