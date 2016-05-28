'use strict';

var Events = require('../../events/Events');
var settings = require('../../settings');
var THREE = require('three');

function HandLight (obj) {
  this.obj = obj;
  THREE.SpotLight.call(this, 0xf4f4f4, 0.3);
  // Commented because do not show complete when is emmited
  // this.castShadow = true;
  this.position.set(0, 0, 0);
  this.angle = 0.3;
  this.penumbra = 0.05;
  this.decay = 1;
  this.distance = 5;
  this.target = this.obj.dummyLight;
  this.shadow.mapSize.width = 1024;
  this.shadow.mapSize.height = 1024;
  // this.lightHelper = new THREE.SpotLightHelper(this);
  // this.add(this.lightHelper);

}
HandLight.prototype = Object.create(THREE.SpotLight.prototype);

module.exports = HandLight;
