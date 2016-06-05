'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

function CollideIntroBall (obj) {
  this.controller = obj;

  Events.on('updateScene', this.update.bind(this));
}

CollideIntroBall.prototype.update = function () {
  if (State.get('stage') !== 'intro') {
    return;
  }
  var introBallPos = new THREE.Vector3().setFromMatrixPosition(State.get('introBall').matrixWorld);
  var handPos = new THREE.Vector3().setFromMatrixPosition(this.controller.matrixWorld);
  var dist = introBallPos.distanceTo(handPos);
  if (dist < 0.1) {
    Events.emit('introBallCollided', this.controller.side);
  }
};

module.exports = CollideIntroBall;
