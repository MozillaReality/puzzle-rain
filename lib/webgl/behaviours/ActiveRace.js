'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var settings = require('../../settings');

var racesArr = ['bouncers', 'bulrushes', 'flyers', 'minerals', 'terrestrials'];

function ActiveRace (obj) {
  this.obj = obj;
  this.value = 'none';
  Events.on('updateScene', this.update.bind(this));
}

function getDistanceTo (pos, race) {
  var vector = new THREE.Vector3();
  // console.log(State.get(race));
  // vector.setFromMatrixPosition(State.get(race).matrixWorld);
  vector = State.get(race).boundingBox.center();
  if (race === 'terrestrials') {
    // console.log(vector);
  }

  return pos.distanceTo(vector);
}

ActiveRace.prototype.update = function () {
  // Return if there is an active race and the active one is closer than 0.55
  var activeIndex = racesArr.indexOf(this.value);
  // if (activeIndex !== -1) {
  //   console.log(activeIndex);
  //   if (activeIndex === 4) {
  //     console.log(activeIndex, getDistanceTo(this.obj.position, racesArr[activeIndex]));
  //   }
  // }
  if (activeIndex !== -1 && getDistanceTo(this.obj.position, racesArr[activeIndex]) < 0.55) {
    return;
  }
  var activeTmp = 'none';
  var arrTmp = [];
  for (var i = 0;i < racesArr.length;i++) {
    arrTmp.push(getDistanceTo(this.obj.position, racesArr[i]));
  }
  var indexMin = arrTmp.indexOf(Math.min(...arrTmp));
  if (arrTmp[indexMin] < 0.3 && arrTmp[indexMin] > 0) {
    activeTmp = racesArr[indexMin];
  }
  if (activeTmp !== this.value) {
    this.value = activeTmp;
    Events.emit('activeRaceChanged', this.obj.side, this.value);
    if (this.obj.light) {
      this.obj.light.color.setHex(settings[activeTmp + 'Color']);
    }

  }
};

module.exports = ActiveRace;
