'use strict';

const Events = require('../../events/Events');
const THREE = require('three');
const CANNON = require('cannon');

let meshes = [];
let bodies = [];
const N = 100;

function Crowd (scene, world) {
  THREE.Object3D.call(this);

  // cubes
  const cubeGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05, 10, 10);
  const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
  for (var i = 0; i < N; i++) {
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMaterial);
    cubeMesh.castShadow = true;
    meshes.push(cubeMesh);
    scene.add(cubeMesh);
  }
  // Create boxes
  const mass = 0.1;
  const boxShape = new CANNON.Box(new CANNON.Vec3(0.025, 0.025, 0.025));
  for (var i = 0; i < N; i++) {
    const boxBody = new CANNON.Body({ mass: mass });
    boxBody.addShape(boxShape);
    boxBody.position.set(
      Math.random() * 2 - 1,
      Math.random() * 2 + 1,
      Math.random() * 2 - 1
    );
    world.addBody(boxBody);
    bodies.push(boxBody);
  }
  Events.on('updateScene', update.bind(this));
}

function update (delta) {
  for (var i = 0; i !== meshes.length; i++) {
    meshes[i].position.copy(bodies[i].position);
    meshes[i].quaternion.copy(bodies[i].quaternion);
  }
}

Crowd.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Crowd;
