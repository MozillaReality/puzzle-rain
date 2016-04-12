'use strict';

const THREE = require('three');

function Ground (scene) {
  THREE.Object3D.call(this);

  const objectLoader = new THREE.ObjectLoader();
  const scope = this;
  objectLoader.load('models/ground.json', function (obj) {
    scope.add(obj);
  });

}

Ground.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Ground;
