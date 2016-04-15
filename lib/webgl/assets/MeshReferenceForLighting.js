'use strict';

const Events = require('../../events/Events');
const THREE = require('three');
const CANNON = require('cannon');

function MeshReferenceForLighting (world) {
  THREE.Object3D.call(this);

  const objectLoader = new THREE.ObjectLoader();
  const scope = this;
  objectLoader.load('models/handR.json', function (obj) {
    // obj.children[0].geometry.computeFaceNormals();
    // obj.children[0].geometry.computeVertexNormals();
    obj.children[0].material.shading = THREE.FlatShading;
    scope.add(obj);

    var box = new THREE.Box3().setFromObject(obj.children[0]);
    const shape = new CANNON.Box(new CANNON.Vec3(box.size().x / 2, box.size().y / 2, box.size().z / 2));
    scope.body = new CANNON.Body({
      mass: 0
    });
    scope.body.addShape(shape);
    world.addBody(scope.body);

    Events.on('updateScene', update.bind(scope));
  });

}

function update (delta) {
  this.rotation.z += delta * 0.3;
  this.body.position.copy(this.position);
  this.body.quaternion.copy(this.quaternion);
}

MeshReferenceForLighting.prototype = Object.create(THREE.Object3D.prototype);

module.exports = MeshReferenceForLighting;
