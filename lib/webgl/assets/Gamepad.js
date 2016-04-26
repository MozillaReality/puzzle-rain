'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var BlendCharacter = require('../animation/BlendCharacter');
var THREE = require('three');

var HandLight = require('./HandLight');

var racesArr = ['bouncers', 'bulrushes', 'flyers', 'minerals', 'terrestrials'];

function Gamepad (index) {
  THREE.BlendCharacter.call(this);

  this.activeRace = 'none';
  var side = 'L';
  if (index === 0) {
    side = 'R';
  }
  this.myName = 'hand' + side;
  var self = this;
  this.load('models/hand' + side + '.json', function () {
    var box = new THREE.Box3().setFromObject(self);
    State.add('controller' + side, self);
    Events.emit('gamepad' + side + 'Loaded');
    Events.on('updateScene', self.update.bind(self));
    Events.on('updateScene', self.getActiveRace.bind(self));
    self.addLight();
  });
}

function getDistanceTo (pos, race) {
  if (!State.get(race)) {
    return 0;
  }
  var vector = new THREE.Vector3();
  vector.setFromMatrixPosition(State.get(race).matrixWorld);
  vector.y = pos.y;
  return pos.distanceTo(vector);
}

Gamepad.prototype = Object.create(THREE.BlendCharacter.prototype);

Gamepad.prototype.getActiveRace = function () {
  // Return if there is an active race and the active one is closer than 0.8
  var activeIndex = racesArr.indexOf(this.activeRace);
  if (activeIndex !== -1 && getDistanceTo(this.position, racesArr[activeIndex]) < 0.8) {
    return;
  }
  var activeTmp = 'none';
  var arrTmp = [];
  for (var i = 0;i < racesArr.length;i++) {
    arrTmp.push(getDistanceTo(this.position, racesArr[i]));
  }
  var indexMin = arrTmp.indexOf(Math.min(...arrTmp));
  if (arrTmp[indexMin] < 0.5) {
    activeTmp = racesArr[indexMin];
  }
  if (activeTmp !== this.activeRace) {
    this.activeRace = activeTmp;
    this.light.color.setHex(settings[activeTmp + 'Color']);
  }
};

Gamepad.prototype.addLight = function () {
  this.light = new HandLight(this);
  this.add(this.light);
};

module.exports = Gamepad;
