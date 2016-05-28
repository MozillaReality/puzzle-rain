'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Bulrush = require('../creatures/Bulrush');

var GroupHandler = require('../GroupHandler');

function Bulrushes () {
  Race.call(this, 'bulrushes');

  this.position.set(0.66, 0, 0.66);

  var bulrush = new Bulrush(this, 1, new THREE.Vector3(-0.3, 0, 0.1), 0.11, 0.8, 1.4);
  this.creaturesArr.push(bulrush.mesh);
  this.add(bulrush);
  bulrush = new Bulrush(this, 2, new THREE.Vector3(-0.3, 0, 0.3), 0.08, 0.8, 1.4);
  this.creaturesArr.push(bulrush.mesh);
  this.add(bulrush);

}

Bulrushes.prototype = Object.create(Race.prototype);

module.exports = Bulrushes;
