'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Mineral = require('../creatures/Mineral');

var GroupHandler = require('../GroupHandler');

function Minerals (pos) {
  Race.call(this, 'minerals', pos);

  var mineral = new Mineral(this, 1, new THREE.Vector3(-0.1, 0.04, -0.3), 0.04, 0.8, 1.4);
  this.creaturesArr.push(mineral);
  this.add(mineral);

  mineral = new Mineral(this, 2, new THREE.Vector3(-0.1, 0.03, 0.3), 0.03, 0.7, 1.3);
  this.creaturesArr.push(mineral);
  this.add(mineral);

}

Minerals.prototype = Object.create(Race.prototype);

module.exports = Minerals;
