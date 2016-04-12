'use strict';

const THREE = require('three');

function SecureArea (w, h) {
  const geometry = new THREE.PlaneGeometry(w, h, 32, 32);
  const material = new THREE.MeshLambertMaterial(
    {
      color: 0x474a50,
      transparent: true,
      opacity: 0.3
    }
  );

  geometry.rotateX(- Math.PI / 2);

  THREE.Mesh.call(this, geometry, material);
}

SecureArea.prototype = Object.create(THREE.Mesh.prototype);

module.exports = SecureArea;
