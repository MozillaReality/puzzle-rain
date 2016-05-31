'use strict';

var THREE = require('three');

function Race01 () {
  THREE.Object3D.call(this);

  var objectLoader = new THREE.ObjectLoader();
  var self = this;
  objectLoader.load('models/race01.json', function (obj) {
    // obj.children.forEach(function (value) {
    //   if (value instanceof THREE.Mesh) {
    //   }
    // });
    self.add(obj);
  });
}

Race01.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Race01;
