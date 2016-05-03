'use strict';

var THREE = require('three');

var Events = require('../../events/Events');
var settings = require('../../settings');

function Speaker (obj) {
  this.obj = obj;

  THREE.Mesh.call(this, new THREE.BoxBufferGeometry(0.05, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: settings[this.obj.race + 'Color']}));

  Events.on('activeRaceChanged', this.activeRaceChanged.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

Speaker.prototype = Object.create(THREE.Mesh.prototype);

Speaker.prototype.update = function (delta) {
  var boundingBox = new THREE.Box3().setFromObject(this.obj);
  // var boxX = this.boundingBox.max.x - this.boundingBox.min.x;
  // var boxY = this.boundingBox.max.y - this.boundingBox.min.y;
  // var boxZ = this.boundingBox.max.z - this.boundingBox.min.z;
  // console.log(boxX, boxY, boxZ);
  var vector = boundingBox.center();
  this.position.x = vector.x;
  this.position.y = vector.y;
  this.position.z = vector.z;
};

Speaker.prototype.activeRaceChanged = function (side, race) {
  if (race === this.obj.race) {
    this.scale.set(2, 2, 2);
  } else {
    // TODO improve this part because is called 4 times
    this.scale.set(1, 1, 1);
  }
};

module.exports = Speaker;
