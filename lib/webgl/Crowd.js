'use strict';

var THREE = require('./three');
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

  State.add('allCreaturesLoaded', false);

  this.totalCreatures = 12;
  // TODO start on 3 because terrestrials ar loaded now
  this.totalCreaturesLoaded = 3;
  this.allCreatures = [];
  this.addCreatures();

  Events.on('hideAll', this.hideAll.bind(this));
  Events.on('creatureLoaded', this.creatureLoaded.bind(this));
}

Crowd.prototype.addCreatures = function () {
  // TODO adjust initial position of each race, raceMesh and creaturesArr (now is so messy)
  var bouncers = new Bouncers();
  this.scene.add(bouncers);
  this.allRaces.push(bouncers);
  this.allCreatures.push.apply(this.allCreatures, bouncers.creaturesArr);

  var minerals = new Minerals();
  this.scene.add(minerals);
  this.allRaces.push(minerals);
  this.allCreatures.push.apply(this.allCreatures, minerals.creaturesArr);

  var flyers = new Flyers();
  this.scene.add(flyers);
  this.allRaces.push(flyers);
  this.allCreatures.push.apply(this.allCreatures, flyers.creaturesArr);

  var terrestrials = new Terrestrials();
  this.scene.add(terrestrials);
  this.allRaces.push(terrestrials);
  this.allCreatures.push.apply(this.allCreatures, terrestrials.creaturesArr);

  var bulrushes = new Bulrushes();
  this.scene.add(bulrushes);
  this.allRaces.push(bulrushes);
  this.allCreatures.push.apply(this.allCreatures, bulrushes.creaturesArr);

  State.add('allCreatures', this.allCreatures);
};

Crowd.prototype.hideAll = function () {
  var self = this;
  this.scene.remove(this.allRaces[0]);
  this.scene.remove(this.allRaces[1]);
  this.scene.remove(this.allRaces[2]);
  this.scene.remove(this.allRaces[3]);
  this.scene.remove(this.allRaces[4]);
};

Crowd.prototype.creatureLoaded = function () {
  this.totalCreaturesLoaded++;
  if (this.totalCreaturesLoaded === this.totalCreatures) {
    this.switchPositions();
    State.add('allCreaturesLoaded', true);
    Events.emit('allCreaturesLoaded');
  }
};

Crowd.prototype.switchPositions = function () {
  this.allCreatures[0].switchPos(this.allCreatures[4]);
  this.allCreatures[1].switchPos(this.allCreatures[7]);
  this.allCreatures[2].switchPos(this.allCreatures[9]);
  this.allCreatures[3].switchPos(this.allCreatures[6]);
  this.allCreatures[4].switchPos(this.allCreatures[11]);
  this.allCreatures[5].switchPos(this.allCreatures[2]);
  this.allCreatures[6].switchPos(this.allCreatures[10]);
  this.allCreatures[7].switchPos(this.allCreatures[0]);
  this.allCreatures[8].switchPos(this.allCreatures[3]);
  this.allCreatures[9].switchPos(this.allCreatures[8]);
  this.allCreatures[10].switchPos(this.allCreatures[5]);
  this.allCreatures[11].switchPos(this.allCreatures[1]);
};
module.exports = Crowd;
