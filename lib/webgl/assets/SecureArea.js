'use strict';

const THREE = require('three');
const CANNON = require('cannon');
const CannonManager = require('../managers/CannonManager');

function SecureArea (w, h) {
  const geometry = new THREE.PlaneGeometry(w, h, 32, 32);
  const material = new THREE.MeshLambertMaterial(
    {
      color: 0xffffff,
      transparent: true,
      opacity: 0.1
    }
  );

  // const shape = new CANNON.Box(new CANNON.Vec3(w, h, 0.2));
  const shape = new CANNON.Plane();
  this.body = new CANNON.Body({
    mass: 0,
    material: CannonManager.groundMaterial,
    collisionFilterGroup: 1,
    collisionFilterMask: 4 | 8
  });
  this.body.name = 'ground';
  this.body.addShape(shape);
  this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  geometry.rotateX(- Math.PI / 2);

  THREE.Mesh.call(this, geometry, material);
}

SecureArea.prototype = Object.create(THREE.Mesh.prototype);

module.exports = SecureArea;
