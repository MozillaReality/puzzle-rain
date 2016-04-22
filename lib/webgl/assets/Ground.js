'use strict';

var THREE = require('three');

function Ground () {
  THREE.Object3D.call(this);

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/ground.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        value.geometry.computeFaceNormals();
        value.geometry.computeVertexNormals();
        value.receiveShadow = true;
        value.material.shading = THREE.FlatShading;
      }
    });
    self.add(obj);

  });
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Ground;
