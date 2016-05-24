'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

function ActiveRaceArea (obj) {
  this.obj = obj;
  this.gameArea = State.get('gameArea');
  this.limitTerrestrials = State.get('gameArea').height / 2 - State.get('gameArea').height / 3;
  // this.cuadrantBouncers = State.get('bouncers').cuadrant;
  this.cuadrantBulrushes = State.get('bulrushes').cuadrant;
  // this.cuadrantMinerals = State.get('minerals').cuadrant;

  Events.on('updateScene', this.update.bind(this));
}

ActiveRaceArea.prototype.update = function () {
  this.getActiveRaceArea();
};

ActiveRaceArea.prototype.getActiveRaceArea = function () {
  // console.log(this.obj.position);
  var activeTmp = 'none';
  if (this.obj.position.y > 1.5) {
    activeTmp = 'flyers';
  } else {
    if (this.obj.position.z > this.limitTerrestrials) {
      activeTmp = 'terrestrials';
    } else {
      switch (this.gameArea.getCuadrantFromPosition(this.obj.position)) {
        case this.cuadrantBouncers:
          activeTmp = 'bouncers';
          break;
        case this.cuadrantBulrushes:
          activeTmp = 'bulrushes';
          break;
        case this.cuadrantMinerals:
          activeTmp = 'minerals';
          break;

      }
    }
  }
  if (this.obj.activeRace !== activeTmp) {
    Events.emit('activeRaceChanged', this.obj.side, activeTmp);
  }
};

module.exports = ActiveRaceArea;
