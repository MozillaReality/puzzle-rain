'use strict';

var THREE = require('three');

var AudioManager = require('../../managers/AudioManager');

var Race = require('../Race');
var Bulrush = require('../creatures/Bulrush');

var cuadrantWidth = 0.2;
var cuadrantHeight = 0.2;

var totalCreatures = 12;
var groups = 2;

function Bulrushes (initCuadrant) {
  Race.call(this, 'bulrushes', initCuadrant);

  // Add 12 creatures
  for (var i = 0;i < totalCreatures;i++) {
    var group = 1;
    if (i > 5) {
      group = 2;
    }
    var bulrush = new Bulrush(this, group, i, getInCuadrantPosition(i), 0.1);
    this.creaturesArr.push(bulrush.mesh);
    this.add(bulrush);
  }

  this.track1 = new AudioManager(this.race + '_1', this.speaker, true, true);
  this.track1.setVolume(0);

  this.track2 = new AudioManager(this.race + '_2', this.speaker, true, true);
  this.track2.setVolume(0);
}

function getInCuadrantPosition (i) {
  var vec = new THREE.Vector3();
  var row = (i % 4) - 1;
  var column = Math.floor(i / 4) - 1;
  // vec.x = row * (cuadrantWidth + (Math.random() - 0.5) * 0.1);
  // vec.z = column * (cuadrantHeight + (Math.random() - 0.5) * 0.1);
  vec.x = row * cuadrantWidth;
  vec.z = column * cuadrantHeight;
  return vec;
}
Bulrushes.prototype = Object.create(Race.prototype);

Bulrushes.prototype.update = function (delta, time) {
  Race.prototype.update.call(this, delta, time);
  var volumeChange = (this.camera.position.y - this.arrive.position.y) * 0.1;
  var newVolume = THREE.Math.clamp(this.track1.getVolume() - volumeChange, 0, 1);
  // console.log(newVolume);
  this.track1.setVolume(newVolume);
  this.track2.setVolume(newVolume);

};

module.exports = Bulrushes;
