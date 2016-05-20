'use strict';

var THREE = require('three');

var Events = require('../../events/Events');
var settings = require('../../settings');

var State = require('../../state/State');

function Speaker (obj) {
  this.obj = obj;

  this.camera = State.get('camera');

  THREE.Mesh.call(this, new THREE.BoxBufferGeometry(0.05, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: settings[this.obj.race + 'Color']}));
  Events.on('activeRaceChanged', this.activeRaceChanged.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

Speaker.prototype = Object.create(THREE.Mesh.prototype);

Speaker.prototype.update = function (delta) {
  var boundingBox = new THREE.Box3().setFromObject(this.obj);
  // var boxX = boundingBox.max.x - boundingBox.min.x;
  // var boxY = boundingBox.max.y - boundingBox.min.y;
  // var boxZ = boundingBox.max.z - boundingBox.min.z;
  // if (this.obj.race === 'bouncers') {
  //   console.log(boxX, boxY, boxZ);
  // }
  //
  // var vector = boundingBox.center().sub(this.obj.position);
  var vector = boundingBox.center().sub(this.obj.position);
  this.position.x = vector.x;
  // this.position.y = vector.y;
  var adjustedYPos = this.camera.position.y;
  switch (this.obj.race) {
    case 'terrestrials':
      adjustedYPos -= 0.3;
      break;
    case 'flyers':
      adjustedYPos += 0.3;
      break;

  }
  this.position.y = adjustedYPos;
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
