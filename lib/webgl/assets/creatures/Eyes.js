'use strict';

var THREE = require('../../three');

var settings = require('../../../settings');

function Eye (size, eye, eyelidColor) {
  THREE.Group.call(this);
  this.eye = eye;

  this.eyeballMaterial = new THREE.MeshStandardMaterial({color: settings.offColor, roughness: 1, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0, transparent: true, shading: THREE.FlatShading});

  this.eyeball = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), this.eyeballMaterial);
  this.add(this.eyeball);
}

Eye.prototype = Object.create(THREE.Group.prototype);
Eye.prototype.constructor = Eye;

module.exports = Eye;

//

function Eyes (size) {
  THREE.Group.call(this);

  var baseColor = 0xFFFFFF;
  this.left = new Eye(size, 'left', baseColor);
  this.right = new Eye(size, 'right', baseColor);
  this.setSeparation(0.3);

  this.add(this.left);
  this.add(this.right);

}

Eyes.prototype = Object.create(THREE.Group.prototype);
Eyes.prototype.constructor = Eyes;
Eyes.prototype.setSeparation = function (separation) {
  this.left.position.x = -separation;
  this.right.position.x = separation;
  this.separation = separation;
};

module.exports = Eyes;
