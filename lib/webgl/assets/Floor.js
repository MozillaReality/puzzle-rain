'use strict';

var THREE = require('three');

function Floor () {
  THREE.Object3D.call(this);

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/floor.json', function (obj) {
    obj.children.forEach(function (value) {
      if (value instanceof THREE.Mesh) {
        // console.log(value);
        var texture = new THREE.TextureLoader().load('models/groundPattern.png');
        // value.material = new THREE.MeshStandardMaterial({color: 0X2a2b2f, roughness: 0.5, metalness: 0, shading: THREE.FlatShading});
        value.material = new THREE.MeshStandardMaterial({color: 0Xffffff, map: texture, roughness: 0.5, metalness: 0, shading: THREE.FlatShading});
      //   value.geometry.computeFaceNormals();
      //   value.geometry.computeVertexNormals();
      //   value.material.shading = THREE.FlatShading;
      // // value.castShadow = false;
      }
    });
    self.add(obj);

  });
}

Floor.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Floor;
