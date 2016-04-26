'use strict';

var Events = require('../../events/Events');
var THREE = require('three');

function HandLight (hand) {
  THREE.PointLight.call(this, 0xf4f4f4, 2, 1);
  var sphereSize = 0.05;
  var pointLightHelper = new THREE.PointLightHelper(this, sphereSize);
  this.add(pointLightHelper);
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

  Events.on('updateScene', update.bind(this));

}

function update () {
  // this.spotLightHelper.update();
}
// HandLight.prototype = Object.create(THREE.SpotLight.prototype);
HandLight.prototype = Object.create(THREE.PointLight.prototype);

module.exports = HandLight;
