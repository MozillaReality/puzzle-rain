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
  // var bouncers = new Bouncers(3);
  // this.scene.add(bouncers);
  var bulrushes = new Bulrushes(1);
  this.scene.add(bulrushes);
  // var flyers = new Flyers(7);
  // this.scene.add(flyers);
  var minerals = new Minerals(5);
  this.scene.add(minerals);
// var terrestrials = new Terrestrials(6);
// this.scene.add(terrestrials);
};

module.exports = Crowd;
