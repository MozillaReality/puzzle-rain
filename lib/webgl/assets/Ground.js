'use strict';

const THREE = require('three');

function Ground (scene) {
  THREE.Object3D.call(this);

  const objectLoader = new THREE.ObjectLoader();
  const scope = this;
  objectLoader.load('models/ground.json', function (obj) {
    let arrObj = [];
    obj.children.forEach(value => {
      if (value instanceof THREE.Mesh) {
        arrObj.push(value);
      }
    });
    arrObj.forEach(value => {
      // console.log(value);
      scope.add(value);

      const fnh = new THREE.FaceNormalsHelper(value, 0.2);
      scope.add(fnh);
    });

  // scope.add(obj);
  });

}

Ground.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Ground;
