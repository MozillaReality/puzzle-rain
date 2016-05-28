'use strict';

var THREE = require('three');
var State = require('../state/State');

var Bouncers = require('./assets/races/Bouncers');
var Bulrushes = require('./assets/races/Bulrushes');
var Flyers = require('./assets/races/Flyers');
var Minerals = require('./assets/races/Minerals');
var Terrestrials = require('./assets/races/Terrestrials');

function Crowd () {
  this.scene = State.get('scene');
  this.addCreatures();
}

Crowd.prototype.addCreatures = function () {
  // var bouncers = new Bouncers();
  // this.scene.add(bouncers);
  var bulrushes = new Bulrushes();
  this.scene.add(bulrushes);
// var flyers = new Flyers();
// this.scene.add(flyers);
// var minerals = new Minerals();
// this.scene.add(minerals);
// var terrestrials = new Terrestrials();
// this.scene.add(terrestrials);
};

module.exports = Crowd;
