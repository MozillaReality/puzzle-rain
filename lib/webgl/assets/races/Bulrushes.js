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
    if (group === 1) {
      bulrush.talking.setSpeech('aaaauuuu auuuu auuuuuuuuu');
    } else {
      bulrush.talking.setSpeech('eo oaaaaaeee eo eo eo eo');
    }
    this.creaturesArr.push(bulrush.mesh);
    this.add(bulrush);
  }

  var group1Handler = new GroupHandler(this, 0.02, settings[this.race + 'Color'], this.race + '_1', 0.8, 1.4);
  group1Handler.position.set(-0.2, 0, 0);
  this.groupHandlersArr.push(group1Handler);
  this.add(group1Handler);

  var group2Handler = new GroupHandler(this, 0.02, settings[this.race + 'Color'], this.race + '_2', 0.8, 1.4);
  group2Handler.position.set(0.4, 0, 0);
  this.groupHandlersArr.push(group2Handler);
  this.add(group2Handler);

}

function getInCuadrantPosition (i) {
  var vec = new THREE.Vector3();
  var row = (i % 4) - 1;
  var column = Math.floor(i / 4) - 1;
  vec.x = row * minSeparationX;
  vec.z = column * minSeparationZ;
  return vec;
}
Bulrushes.prototype = Object.create(Race.prototype);

Bulrushes.prototype.update = function (delta, time) {
  Race.prototype.update.call(this, delta, time);

};

module.exports = Bulrushes;
