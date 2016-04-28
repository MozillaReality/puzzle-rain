'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var Stats = require('../utils/RaceStats');

var Arrive = require('../behaviours/Arrive');

var THREE = require('three');

function Race (s, myPos) {
  this.race = s;
  this.pos = myPos;

  this.creaturesArr = [];
  // asleep (awakeLevel from 0 to 0.5)
  // awake (awakeLevel from 0.5 to 1)
  // happy (awake + happyLevel = 1)
  // upset (awake + upsetLevel = 1)
  this.status = 'asleep';

  this.awakeLevel = 0;
  this.happyLevel = 0.5;
  this.upsetLevel = 0.5;

  THREE.Group.call(this);
  this.position.set(this.pos.x, this.pos.y, this.pos.z);

  this.boundingBoxCenter = new THREE.Mesh(new THREE.BoxBufferGeometry(0.05, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: settings[this.race + 'Color']}));
  this.add(this.boundingBoxCenter);
  this.arrive = new Arrive(this.race);
  // Add all group of races
  State.add(s, this);

  if (settings.debugRaceStatus) {
    // addStats(this);
    this.scene = State.get('scene');
    this.scene.add(this.arrive.view);
  }
  Events.on('activeRaceChanged', this.activeRaceChanged.bind(this));
  Events.on('updateScene', update.bind(this));
}

function update (delta) {
  this.boundingBox = new THREE.Box3().setFromObject(this);
  var vector = this.boundingBox.center().sub(this.position);
  if (settings.debugRaceStatus) {
    this.boundingBoxCenter.position.x = vector.x;
    this.boundingBoxCenter.position.y = vector.y;
    this.boundingBoxCenter.position.z = vector.z;
  }
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
