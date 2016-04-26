'use strict';

var THREE = require('three');

function HandLight () {
  THREE.SpotLight.call(this, 0xf4f4f4, 0.4);
  this.castShadow = true;
  this.angle = 0.3;
  this.penumbra = 0.2;
  this.decay = 2;
  this.distance = 50;
  this.shadow.mapSize.width = 1024;
  this.shadow.mapSize.height = 1024;
  var spotLightHelper = new THREE.SpotLightHelper(this);
  this.add(spotLightHelper);

}

HandLight.prototype = Object.create(THREE.SpotLight.prototype);

module.exports = HandLight;
