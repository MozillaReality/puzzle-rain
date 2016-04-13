'use strict';

const Events = require('../../events/Events');
const THREE = require('three');

function MeshReferenceForLighting (scene) {
  THREE.Object3D.call(this);

  const objectLoader = new THREE.ObjectLoader();
  const scope = this;
  objectLoader.load('models/handR.json', function (obj) {
    scope.add(obj);
    Events.on('updateScene', update.bind(scope));
  });

}

function update (delta) {
  this.rotation.z += delta * 0.3;
}

MeshReferenceForLighting.prototype = Object.create(THREE.Object3D.prototype);

module.exports = MeshReferenceForLighting;
