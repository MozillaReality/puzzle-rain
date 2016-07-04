'use strict';

var THREE = require('three');

var Events = require('../../events/Events');
var State = require('../../state/State');

function ActiveCreature (obj) {
  this.controller = obj;

  this.lastActiveCreature;
  this.creaturesArr = State.get('allCreatures');
  this.intersectArr = [];
  if (State.get('allCreaturesLoaded')) {
    this.allCreaturesLoaded();
  } else {
    Events.on('allCreaturesLoaded', this.allCreaturesLoaded.bind(this));
  }

}
ActiveCreature.prototype.allCreaturesLoaded = function () {
  for (var i = 0; i < this.creaturesArr.length; i++) {
    this.intersectArr.push(this.creaturesArr[i].bodyMesh);
  }
  Events.on('updateScene', this.update.bind(this));
};
ActiveCreature.prototype.update = function () {
  var vector = new THREE.Vector3(0, -1, 0);
  vector.applyQuaternion(this.controller.quaternion);
  var raycaster = new THREE.Raycaster(this.controller.position, vector);
  var intersects = raycaster.intersectObjects(this.intersectArr);
  if (intersects.length > 0) {
    for (var i = 0;i < intersects.length;i++) {
      if (this.lastActiveCreature !== intersects[i].object.parent.parent) {
        Events.emit('activeCreatureChanged', this.controller.side, intersects[i].object.parent.parent);
        this.lastActiveCreature = intersects[i].object.parent.parent;
      }
    }
  } else {
    if (this.lastActiveCreature !== 'none') {
      Events.emit('activeCreatureChanged', this.controller.side, 'none');
      this.lastActiveCreature = 'none';
    }
  }
};

module.exports = ActiveCreature;

// if (State.get('stage') === 'ending' || Math.abs(this.controller.position.x) > 0.75 || Math.abs(this.controller.position.z) > 0.75) {
//   if (this.lastActiveCreature !== 'none') {
//     this.lastActiveCreature = 'none';
//     Events.emit('activeCreatureChanged', this.controller.side, 'none');
//   }
//   return;
// }
// var minDistance = 100000;
// this.nearIndexCreature = -1;
// for (var i = 0; i < this.creaturesArr.length; i++) {
//   var creaturePos = new THREE.Vector3().setFromMatrixPosition(this.creaturesArr[i].matrixWorld);
//   var handPos = new THREE.Vector3().setFromMatrixPosition(this.controller.matrixWorld);
//   var creaturePos2d = new THREE.Vector2(creaturePos.x, creaturePos.z);
//   var handPos2d = new THREE.Vector2(handPos.x, handPos.z);
//   var dist = creaturePos2d.distanceTo(handPos2d);
//   if (dist < minDistance) {
//     minDistance = dist;
//     this.nearIndexCreature = i;
//   }
// }
// if (minDistance < 1) {
//   if (this.lastActiveCreature !== this.creaturesArr[this.nearIndexCreature]) {
//     this.lastActiveCreature = this.creaturesArr[this.nearIndexCreature];
//     Events.emit('activeCreatureChanged', this.controller.side, this.creaturesArr[this.nearIndexCreature]);
//   }
// } else {
//   if (this.lastActiveCreature !== 'none') {
//     this.lastActiveCreature = 'none';
//     Events.emit('activeCreatureChanged', this.controller.side, 'none');
//   // console.log(this.controller.side, 'none');
//   }
// }
