'use strict';

var THREE = require('three');

var Events = require('../../events/Events');
var State = require('../../state/State');

function ActiveRace (obj) {
  this.controller = obj;

  this.lastActiveRace;
  this.racesArr = [State.get('bouncers'), State.get('bulrushes'), State.get('flyers'), State.get('minerals'), State.get('terrestrials')];
  Events.on('updateScene', this.update.bind(this));
}

ActiveRace.prototype.update = function () {
  if (State.get('stage') === 'ending') {
    return;
  }
  var minDistance = 100000;
  this.nearIndexRace = -1;
  for (var i = 0; i < this.racesArr.length; i++) {
    var racePos = new THREE.Vector3().setFromMatrixPosition(this.racesArr[i].matrixWorld);
    var handPos = new THREE.Vector3().setFromMatrixPosition(this.controller.matrixWorld);
    var racePos2d = new THREE.Vector2(racePos.x, racePos.z);
    var handPos2d = new THREE.Vector2(handPos.x, handPos.z);
    var dist = racePos2d.distanceTo(handPos2d);
    if (dist < minDistance) {
      minDistance = dist;
      this.nearIndexRace = i;
    }
  }
  if (minDistance < 1) {
    if (this.lastActiveRace !== this.racesArr[this.nearIndexRace]) {
      this.lastActiveRace = this.racesArr[this.nearIndexRace];
      Events.emit('activeRaceChanged', this.controller.side, this.racesArr[this.nearIndexRace]);
    // console.log(this.controller.side, this.racesArr[this.nearIndexRace]);
    }
  } else {
    if (this.lastActiveRace !== 'none') {
      this.lastActiveRace = 'none';
      Events.emit('activeRaceChanged', this.controller.side, 'none');
    // console.log(this.controller.side, 'none');
    }
  }

};

module.exports = ActiveRace;
