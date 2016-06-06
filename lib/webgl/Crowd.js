'use strict';

var THREE = require('three');
var State = require('../state/State');
var Events = require('../events/Events');

var Bouncers = require('./assets/races/Bouncers');
var Bulrushes = require('./assets/races/Bulrushes');
var Flyers = require('./assets/races/Flyers');
var Minerals = require('./assets/races/Minerals');
var Terrestrials = require('./assets/races/Terrestrials');

function Crowd () {
  this.scene = State.get('scene');
  this.allRaces = [];

  this.allCreatures = [];
  this.addCreatures();

  Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
}

Crowd.prototype.addCreatures = function () {
  // TODO adjust initial position of each race, raceMesh and creaturesArr (now is so messy)
  var bouncers = new Bouncers(new THREE.Vector3(0.184, 0, -0.878));
  this.scene.add(bouncers);
  this.allRaces.push(bouncers);
  this.allCreatures.push.apply(this.allCreatures, bouncers.creaturesArr);

  var bulrushes = new Bulrushes(new THREE.Vector3(-1.063, 0, -0.399));
  this.scene.add(bulrushes);
  this.allRaces.push(bulrushes);
  this.allCreatures.push.apply(this.allCreatures, bulrushes.creaturesArr);

  var flyers = new Flyers(new THREE.Vector3(0.897, 0, 0.938));
  this.scene.add(flyers);
  this.allRaces.push(flyers);
  this.allCreatures.push.apply(this.allCreatures, flyers.creaturesArr);

  var minerals = new Minerals(new THREE.Vector3(1.51, 0, -0.41));
  this.scene.add(minerals);
  this.allRaces.push(minerals);
  this.allCreatures.push.apply(this.allCreatures, minerals.creaturesArr);

  var terrestrials = new Terrestrials(new THREE.Vector3(-0.606, 0, 1.162));
  this.scene.add(terrestrials);
  this.allRaces.push(terrestrials);
  this.allCreatures.push.apply(this.allCreatures, terrestrials.creaturesArr);

  State.add('allCreatures', this.allCreatures);
};

Crowd.prototype.raceStatusChanged = function (race, status) {
  if (status === 'awake') {
    if (this.areAllRacesAwake()) {
      Events.emit('closerEnding');
    }
  }
};

Crowd.prototype.areAllRacesAwake = function () {
  var allAwake = true;
  for (var i = 0;i < this.allRaces.length;i++) {
    if (this.allRaces[i].status !== 'awake') {
      allAwake = false;
      return allAwake;
    }
  }
  return allAwake;
};

module.exports = Crowd;
