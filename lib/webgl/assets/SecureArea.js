'use strict';

var THREE = require('three');

function SecureArea (w, h) {
  var geometry = new THREE.PlaneGeometry(w, h, 32, 32);
  var material = new THREE.MeshLambertMaterial(
    {
      color: 0xffffff,
      transparent: true,
      opacity: 0.1
    }
  );
  geometry.rotateX(- Math.PI / 2);

  THREE.Mesh.call(this, geometry, material);
}

SecureArea.prototype = Object.create(THREE.Mesh.prototype);

module.exports = SecureArea;
