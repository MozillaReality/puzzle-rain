'use strict';

var THREE = require('three');

var Events = require('../../events/Events');
var settings = require('../../settings');

var State = require('../../state/State');

function Speaker (obj) {
  this.obj = obj;
  // this.camera = State.get('camera');

  THREE.Object3D.call(this);

  if (settings.debugMode) {
    this.helper = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.05, 0.05, 0.05),
      new THREE.MeshBasicMaterial({ color: settings[this.obj.name + 'Color']})
    );
    this.add(this.helper);
  }

  Events.on('activeRaceChanged', this.activeRaceChanged.bind(this));
// Events.on('updateScene', this.update.bind(this));
}

Speaker.prototype = Object.create(THREE.Object3D.prototype);

// Speaker.prototype.update = function (delta) {
//   var boundingBox = new THREE.Box3().setFromObject(this.obj);
//   var vector = boundingBox.center().sub(this.obj.position);
//   this.position.x = vector.x;
//   // var adjustedYPos = this.camera.position.y - 0.3;
//   this.position.y = vector.y;
//   this.position.z = vector.z;
// };

Speaker.prototype.activeRaceChanged = function (side, race) {
  if (race === this.obj.race) {
    this.scale.set(2, 2, 2);
  } else {
    // TODO improve this part because is called 4 times
    this.scale.set(1, 1, 1);
  }
};

module.exports = Speaker;
