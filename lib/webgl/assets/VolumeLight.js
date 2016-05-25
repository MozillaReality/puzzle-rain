'use strict';

var Events = require('../../events/Events');
var settings = require('../../settings');
var THREE = require('three');

function VolumeLight () {
  THREE.SpotLight.call(this, 0xf4f4f4, 0);

  // this.position.set(0, 0, 0);
  this.angle = 0.3;
  this.penumbra = 0.05;
  this.decay = 1;
  this.distance = 1.5;
  // this.target = this.obj.dummyLight;

  this.lightHelper = new THREE.SpotLightHelper(this);
  Events.on('updateScene', this.update.bind(this));
  this.add(this.lightHelper);

}
VolumeLight.prototype = Object.create(THREE.SpotLight.prototype);

VolumeLight.prototype.update = function () {
  this.lightHelper.update();
};

module.exports = VolumeLight;
