'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

function CollideCreature (obj) {
  this.controller = obj;

  this.activeObj;
  this.handlerList = State.get('allCreatures');
  Events.on('updateScene', this.update.bind(this));
  Events.on('stageChanged', this.stageChanged.bind(this));
}

CollideCreature.prototype.update = function () {
  if (State.get('stage') === 'ending') {
    return;
  }
  // if (!this.controller.lastPressed) {
  //   return;
  // }
  var totalIntersections = 0;
  for (var i = 0; i < this.handlerList.length; i++) {
    // if (this.handlerList[i].isActive) {
    var handlerPos = new THREE.Vector3().setFromMatrixPosition(this.handlerList[i].matrixWorld);
    var handPos = new THREE.Vector3().setFromMatrixPosition(this.controller.matrixWorld);
    var dist = handlerPos.distanceTo(handPos);
    if (dist < this.handlerList[i].radius * 1.2) {
      totalIntersections++;
      if (this.activeObj !== this.handlerList[i]) {
        this.activeObj = this.handlerList[i];
        if (this.controller.whoIsGrabbed === '') {
          Events.emit('creatureCollided', this.controller.side, this.handlerList[i]);
        }
      }
    }
  // }
  }
  if (totalIntersections === 0 && this.activeObj !== null) {
    this.activeObj = null;
    Events.emit('creatureCollided', this.controller.side, null);
  }
};

CollideCreature.prototype.stageChanged = function (newStage) {
  switch (newStage) {
    case 'ending':
      Events.emit('creatureCollided', this.controller.side, null);
      break;
  }
};

module.exports = CollideCreature;
