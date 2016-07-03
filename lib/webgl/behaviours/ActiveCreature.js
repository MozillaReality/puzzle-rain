'use strict';

var THREE = require('three');

var Events = require('../../events/Events');
var State = require('../../state/State');

function ActiveCreature (obj) {
  this.controller = obj;

  this.lastActiveCreature;
  this.creaturesArr = State.get('allCreatures');
  Events.on('updateScene', this.update.bind(this));
}

ActiveCreature.prototype.update = function () {
  if (State.get('stage') === 'ending' || Math.abs(this.controller.position.x) > 0.75 || Math.abs(this.controller.position.z) > 0.75) {
    if (this.lastActiveCreature !== 'none') {
      this.lastActiveCreature = 'none';
      Events.emit('activeCreatureChanged', this.controller.side, 'none');
    }
    return;
  }
  var minDistance = 100000;
  this.nearIndexCreature = -1;
  for (var i = 0; i < this.creaturesArr.length; i++) {
    var creaturePos = new THREE.Vector3().setFromMatrixPosition(this.creaturesArr[i].matrixWorld);
    var handPos = new THREE.Vector3().setFromMatrixPosition(this.controller.matrixWorld);
    var creaturePos2d = new THREE.Vector2(creaturePos.x, creaturePos.z);
    var handPos2d = new THREE.Vector2(handPos.x, handPos.z);
    var dist = creaturePos2d.distanceTo(handPos2d);
    if (dist < minDistance) {
      minDistance = dist;
      this.nearIndexCreature = i;
    }
  }
  if (minDistance < 1) {
    if (this.lastActiveCreature !== this.creaturesArr[this.nearIndexCreature]) {
      this.lastActiveCreature = this.creaturesArr[this.nearIndexCreature];
      Events.emit('activeCreatureChanged', this.controller.side, this.creaturesArr[this.nearIndexCreature]);
    }
  } else {
    if (this.lastActiveCreature !== 'none') {
      this.lastActiveCreature = 'none';
      Events.emit('activeCreatureChanged', this.controller.side, 'none');
    // console.log(this.controller.side, 'none');
    }
  }

};

module.exports = ActiveCreature;
