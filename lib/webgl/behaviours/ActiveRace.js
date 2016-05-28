'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

function ActiveRace (obj) {
  this.obj = obj;

  this.lastActiveRace;
  this.racesArr = [State.get('bulrushes')];
  Events.on('updateScene', this.update.bind(this));
}

ActiveRace.prototype.update = function () {
  var minDistance = 100000;
  this.nearIndexRace = -1;
  for (var i = 0; i < this.racesArr.length; i++) {
    var racePos = new THREE.Vector3().setFromMatrixPosition(this.racesArr[i].matrixWorld);
    var handPos = new THREE.Vector3().setFromMatrixPosition(this.obj.matrixWorld);
    var dist = racePos.distanceTo(handPos);
    if (dist < minDistance) {
      this.nearIndexRace = i;
    }
  }
  if (this.lastActiveRace !== this.racesArr[this.nearIndexRace]) {
    this.lastActiveRace = this.racesArr[this.nearIndexRace];
    Events.emit('activeRaceChanged', this.obj.side, this.racesArr[this.nearIndexRace]);
  }
};

module.exports = ActiveRace;
