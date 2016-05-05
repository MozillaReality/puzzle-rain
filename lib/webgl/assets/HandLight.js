'use strict';

var Events = require('../../events/Events');
var settings = require('../../settings');
var THREE = require('three');

function HandLight (obj) {
  this.obj = obj;
  THREE.SpotLight.call(this, 0xf4f4f4, 1);
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
  Events.on('activeRaceChanged', this.activeRaceChanged.bind(this));
  // Events.on('updateScene', this.update.bind(this));
  // this.add(this.lightHelper);

}
HandLight.prototype = Object.create(THREE.SpotLight.prototype);
// HandLight.prototype.update = function () {
//   // this.position.set(this.obj.position.x, this.obj.position.y, this.obj.position.z);
//   this.lightHelper.update();
// };

HandLight.prototype.activeRaceChanged = function (side, race) {
  if (this.obj.side === side) {
    this.color.setHex(settings[race + 'Color']);
  }
};

module.exports = HandLight;
