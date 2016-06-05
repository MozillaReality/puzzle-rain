'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

function ActiveCreature (obj) {
  this.obj = obj;

  this.activeObj;
  this.handlerList = State.get('allCreatures');

  Events.on('updateScene', this.update.bind(this));
  // Events.on('activeRaceChanged', this.activeRaceChanged.bind(this));
  Events.on('stageChanged', this.stageChanged.bind(this));
}

ActiveCreature.prototype.update = function () {
  if (State.get('stage') === 'ending') {
    return;
  }
  if (this.obj.lastPressed) {
    return;
  }
  var totalIntersections = 0;
  for (var i = 0; i < this.handlerList.length; i++) {
    if (this.handlerList[i].isActive) {
      var handlerPos = new THREE.Vector3().setFromMatrixPosition(this.handlerList[i].matrixWorld);
      var handPos = new THREE.Vector3().setFromMatrixPosition(this.obj.matrixWorld);
      var dist = handlerPos.distanceTo(handPos);
      if (dist < this.handlerList[i].radius * 1.2) {
        totalIntersections++;
        if (this.activeObj !== this.handlerList[i]) {
          this.activeObj = this.handlerList[i];
          Events.emit('activeHandlerDispatch', this.obj.side, this.handlerList[i]);
        }
      }
    }
  }
  if (totalIntersections === 0 && this.activeObj !== null) {
    this.activeObj = null;
    Events.emit('activeHandlerDispatch', this.obj.side, null);
  }
};

ActiveCreature.prototype.stageChanged = function () {
  switch (State.get('stage')) {
    case 'ending':
      Events.emit('activeHandlerDispatch', this.obj.side, null);
      break;
  }
};

module.exports = ActiveCreature;
