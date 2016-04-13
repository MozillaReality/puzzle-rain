'use strict';

const THREE = require('three');

function Ground () {
  THREE.Object3D.call(this);

  const objectLoader = new THREE.ObjectLoader();
  const scope = this;
  objectLoader.load('models/ground.json', function (obj) {
    obj.children.forEach(value => {
      if (value instanceof THREE.Mesh) {
        value.geometry.computeFaceNormals();
        value.geometry.computeVertexNormals();
        value.receiveShadow = true;
        value.material.shading = THREE.FlatShading;
      }
    });
    scope.add(obj);

  });
}

Ground.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Ground;
