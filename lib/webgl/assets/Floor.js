'use strict';

var THREE = require('three');

function Floor () {
  THREE.Object3D.call(this);

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/floor.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        value.material = new THREE.MeshStandardMaterial({color: 0X2e2d38, roughness: 1, metalness: 0, shading: THREE.FlatShading});
      }
    });
    self.add(obj);

  });
}

Floor.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Floor;
