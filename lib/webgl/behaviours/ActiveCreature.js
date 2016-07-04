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
  // if (this.controller.influencedCreature !== 'none') {
  //   return;
  // }

  if (!this.controller.active) {
    return;
  }
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
