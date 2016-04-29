'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var Stats = require('../utils/RaceStats');

var Arrive = require('../behaviours/Arrive');

var THREE = require('three');

function Race (s, initCuadrant) {
  this.race = s;

  this.creaturesArr = [];
  // asleep (awakeLevel from 0 to 0.5)
  // awake (awakeLevel from 0.5 to 1)
  // happy (awake + happyLevel = 1)
  // upset (awake + upsetLevel = 1)
  this.status = 'asleep';

  this.awakeLevel = 0;
  this.happyLevel = 0.5;
  this.upsetLevel = 0.5;

  this.scene = State.get('scene');

  THREE.Group.call(this);

  this.cuadrant = initCuadrant;
  this.gameArea = State.get('gameArea');
  var initPos = this.gameArea.getCuadrantPosition(this.cuadrant);
  this.position.set(initPos.x, initPos.y, initPos.z);

  this.boundingBoxCenter = new THREE.Mesh(new THREE.BoxBufferGeometry(0.05, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: settings[this.race + 'Color']}));

  this.arrive = new Arrive(this);
  // Add all group of races
  State.add(s, this);

  if (settings.debugRaceStatus) {
    // addStats(this);
    this.scene.add(this.boundingBoxCenter);
    this.add(this.arrive.view);
  }
  Events.on('activeRaceChanged', this.activeRaceChanged.bind(this));
  Events.on('updateScene', update.bind(this));
}

function update (delta) {
  this.boundingBox = new THREE.Box3().setFromObject(this);
  // var boxX = this.boundingBox.max.x - this.boundingBox.min.x;
  // var boxY = this.boundingBox.max.y - this.boundingBox.min.y;
  // var boxZ = this.boundingBox.max.z - this.boundingBox.min.z;
  // console.log(boxX, boxY, boxZ);
  var vector = this.boundingBox.center();
  this.boundingBoxCenter.position.x = vector.x;
  this.boundingBoxCenter.position.y = vector.y;
  this.boundingBoxCenter.position.z = vector.z;
  getStatus(this);
}

function getStatus (self) {
  var currentStatus = 'asleep';
  if (self.awakeLevel > 0.5) {
    currentStatus = 'awake';
    if (self.happyLevel === 1) {
      currentStatus = 'happy';
    }
    if (self.upsetLevel === 1) {
      currentStatus = 'upset';
    }
  }
  if (self.status !== currentStatus) {
    self.status = currentStatus;
    Events.emit('raceStatusChanged', self.type, self.status);
  }
}

function addStats (self) {
  var stats = new Stats();
  stats.sprite.position.y = 0;
  self.add(stats.sprite);
}
Race.prototype = Object.create(THREE.Group.prototype);

Race.prototype.activeRaceChanged = function (side, race) {
  if (race === this.race) {
    this.boundingBoxCenter.scale.set(2, 2, 2);
  } else {
    this.boundingBoxCenter.scale.set(1, 1, 1);
  }
};

module.exports = Race;
