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
  var bouncers = new Bouncers(new THREE.Vector3(0.184, 0, -0.878));
  this.scene.add(bouncers);
  var bulrushes = new Bulrushes(new THREE.Vector3(-1.063, 0, -0.399));
  this.scene.add(bulrushes);
  var flyers = new Flyers(new THREE.Vector3(0.897, 0, 0.938));
  this.scene.add(flyers);
  var minerals = new Minerals(new THREE.Vector3(1.51, 0, -0.41));
  this.scene.add(minerals);
  var terrestrials = new Terrestrials(new THREE.Vector3(-0.606, 0, 1.162));
  this.scene.add(terrestrials);
};

module.exports = Crowd;
