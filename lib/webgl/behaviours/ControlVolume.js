'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

function ControlVolume (obj) {
  this.obj = obj;
  this.gameArea = State.get('gameArea');

  this.prevTime = 0;
  this.prevObjPos = new THREE.Vector3();

  Events.on('updateScene', this.update.bind(this));
}

ControlVolume.prototype.update = function (delta, time) {
  this.setControlVolume(time);
};

ControlVolume.prototype.setControlVolume = function (time) {
  if (Math.abs(this.obj.position.x - this.prevObjPos.x) < 0.1) {
    if (this.obj.position.y > this.prevObjPos.y) {
      // console.log('up');
    } else if (this.obj.position.y < this.prevObjPos.y) {
      // console.log('down');
    }
  }
  if (time - this.prevTime > 1) {
    // console.log(this.obj.position.y, this.prevObjPos.y);
    this.prevObjPos.set(this.obj.position.x, this.obj.position.y, this.obj.position.z);
    this.prevTime = time;
  }
};

module.exports = ControlVolume;
