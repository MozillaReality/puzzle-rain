'use strict';

var Events = require('../../events/Events');
var settings = require('../../settings');
var THREE = require('three');

function HandLight (obj) {
  THREE.PointLight.call(this, 0xf4f4f4, 2, 2);
  this.obj = obj;
  // var sphereSize = 0.05;
  // var pointLightHelper = new THREE.PointLightHelper(this, sphereSize);
  // this.add(pointLightHelper);
  // THREE.SpotLight.call(this, 0xf4f4f4, 1);
  // // this.castShadow = true;
  // this.position.y = 0;
  // this.angle = 0.3;
  // this.penumbra = 0.2;
  // this.decay = 2;
  // this.distance = 50;
  // this.shadow.mapSize.width = 1024;
  // this.shadow.mapSize.height = 1024;
  // this.target = hand;
  // this.spotLightHelper = new THREE.SpotLightHelper(this);
  // this.add(this.spotLightHelper);
  Events.on('activeRaceChanged', this.activeRaceChanged.bind(this));
  Events.on('updateScene', update.bind(this));

}

function update () {
  // this.spotLightHelper.update();
}
// HandLight.prototype = Object.create(THREE.SpotLight.prototype);
HandLight.prototype = Object.create(THREE.PointLight.prototype);

HandLight.prototype.activeRaceChanged = function (side, race) {
  if (this.obj.side === side) {
    this.color.setHex(settings[race + 'Color']);
  }
};

module.exports = HandLight;
