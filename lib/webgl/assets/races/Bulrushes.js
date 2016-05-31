'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Bulrush = require('../creatures/Bulrush');
var BulrushesMesh = require('./BulrushesMesh');

function Bulrushes (pos) {
  Race.call(this, 'bulrushes', pos);

  this.raceMesh = new BulrushesMesh(this);
  this.raceMesh.position.set(-0.3, -0.1, -0.3);
  this.add(this.raceMesh);

  var bulrush = new Bulrush(this, 1, new THREE.Vector3(-0.3, 0.3, 0.1), 0.11, 0.4, 1.9);
  this.creaturesArr.push(bulrush);
  this.add(bulrush);
  bulrush = new Bulrush(this, 2, new THREE.Vector3(0.2, 0.2, -0.6), 0.08, 0.3, 1.9);
  this.creaturesArr.push(bulrush);
  this.add(bulrush);
}

Bulrushes.prototype = Object.create(Race.prototype);

module.exports = Bulrushes;
