'use strict';

const Events = require('../../events/Events');
const THREE = require('three');

function MeshReferenceForLighting (scene) {
  THREE.Object3D.call(this);

  const objectLoader = new THREE.ObjectLoader();
  const scope = this;
  objectLoader.load('models/handR.json', function (obj) {
    // obj.children[0].geometry.computeFaceNormals();
    // obj.children[0].geometry.computeVertexNormals();
    obj.children[0].material.shading = THREE.FlatShading;
    scope.add(obj);
    Events.on('updateScene', update.bind(scope));
  });

}

function update (delta) {
  this.rotation.z += delta * 0.3;
}

MeshReferenceForLighting.prototype = Object.create(THREE.Object3D.prototype);

module.exports = MeshReferenceForLighting;
