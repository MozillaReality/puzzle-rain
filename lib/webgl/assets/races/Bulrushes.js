'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var settings = require('../../../settings');

var Speaker = require('../Speaker');
var AudioManager = require('../../managers/AudioManager');

var Race = require('../Race');
var Bulrush = require('../creatures/Bulrush');

var GroupHandler = require('../GroupHandler');

var minSeparationX = 0.2;
var minSeparationZ = 0.2;

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

  var group1Handler = new GroupHandler(0.05, settings[this.race + 'Color'], this.race + '_1');
  group1Handler.position.set(-0.15, 0, 0.1);
  this.groupHandlersArr.push(group1Handler);
  this.add(group1Handler);

  var group2Handler = new GroupHandler(0.05, settings[this.race + 'Color'], this.race + '_2');
  group2Handler.position.set(0.35, 0, 0.1);
  this.groupHandlersArr.push(group2Handler);
  this.add(group2Handler);

}

function getInCuadrantPosition (i) {
  var vec = new THREE.Vector3();
  var row = (i % 4) - 1;
  var column = Math.floor(i / 4) - 1;
  // vec.x = row * (minSeparationX + (Math.random() - 0.5) * 0.1);
  // vec.z = column * (minSeparationZ + (Math.random() - 0.5) * 0.1);
  vec.x = row * minSeparationX;
  vec.z = column * minSeparationZ;
  return vec;
}
Bulrushes.prototype = Object.create(Race.prototype);

Bulrushes.prototype.update = function (delta, time) {
  Race.prototype.update.call(this, delta, time);
  // var volumeChange = ((this.camera.position.y - 0.6) - this.arrive.position.y) * 0.1;
  // var newVolume = THREE.Math.clamp(this.trackGroup1.getVolume() - volumeChange, 0, 1);
  // this.trackGroup1.setVolume(newVolume);
  // this.trackGroup2.setVolume(newVolume);

};

Bulrushes.prototype.activateHandlers = function () {
  Race.prototype.activateHandlers.call(this);
  for (var i = 0; i < this.groupHandlersArr.length;i++) {
    var tween = new TWEEN.Tween(this.groupHandlersArr[i].position).to({
      y: 1
    }, 3000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  }
};

Bulrushes.prototype.deactivateHandlers = function () {
  Race.prototype.deactivateHandlers.call(this);
  for (var i = 0; i < this.groupHandlersArr.length;i++) {
    var tween = new TWEEN.Tween(this.groupHandlersArr[i].position).to({
      y: 0
    }, 3000)
      .easing(TWEEN.Easing.Cubic.In)
      .start();
  }
};

module.exports = Bulrushes;
