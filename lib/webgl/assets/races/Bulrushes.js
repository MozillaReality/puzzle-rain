'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Bulrush = require('../creatures/Bulrush');

function Bulrushes (pos) {
  Race.call(this, 'bulrushes', pos);

  this.raceMesh.position.set(-0.05, -0.2, -0.035);

  var bulrush = new Bulrush(this, 1, new THREE.Vector3(0, 0, 0.2), 0.11, 0.2, 2.3);
  this.creaturesArr.push(bulrush);
  this.add(bulrush);
  bulrush = new Bulrush(this, 2, new THREE.Vector3(0.1, 0.2, -0.2), 0.08, 0.3, 2.3);
  this.creaturesArr.push(bulrush);
  this.add(bulrush);
}

Bulrushes.prototype = Object.create(Race.prototype);

module.exports = Bulrushes;
