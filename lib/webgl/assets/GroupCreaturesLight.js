'use strict';

var Events = require('../../events/Events');
var settings = require('../../settings');
var THREE = require('three');

function GroupCreaturesLight (side) {
  this.side = side;

  THREE.SpotLight.call(this, 0xf4f4f4, 0);

  // this.position.set(0, 0, 0);
  this.angle = 0.3;
  this.penumbra = 0.05;
  this.decay = 1;
  this.distance = 1.5;
  // this.target = this.obj.dummyLight;

  this.lightHelper = new THREE.SpotLightHelper(this);
  Events.on('updateScene', this.update.bind(this));
  Events.on('gamepadAnimation', this.gamepadAnimation.bind(this));
  this.add(this.lightHelper);

}
GroupCreaturesLight.prototype = Object.create(THREE.SpotLight.prototype);

GroupCreaturesLight.prototype.update = function () {
  this.lightHelper.update();
};

GroupCreaturesLight.prototype.gamepadAnimation = function (side, animation, isPressed) {
  if (animation !== 'pointing' || side !== this.side) {
    return;
  }
  this.intensity = isPressed;
};

module.exports = GroupCreaturesLight;
