'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Mineral = require('../creatures/Mineral');

var GroupHandler = require('../GroupHandler');

function Minerals (initCuadrant) {
  Race.call(this, 'minerals', initCuadrant);

  var group1Handler = new GroupHandler(this, 0.02, settings[this.race + 'Color'], this.race + '_1', 0.8, 1.4);
  group1Handler.position.set(0, 0, -0.2);
  this.groupHandlersArr.push(group1Handler);
  this.add(group1Handler);

  var group2Handler = new GroupHandler(this, 0.02, settings[this.race + 'Color'], this.race + '_2', 0.8, 1.4);
  group2Handler.position.set(0, 0, 0.3);
  this.groupHandlersArr.push(group2Handler);
  this.add(group2Handler);

  // Add creatures of group 2
  var mineral = new Mineral(this, group1Handler, 1, new THREE.Vector3(-0.1, 0, -0.3), 0.04);
  this.creaturesArr.push(mineral.mesh);
  mineral.mouth.scale.x = 0.5;
  this.add(mineral);
  mineral = new Mineral(this, group1Handler, 2, new THREE.Vector3(-0.1, 0, -0.2), 0.04);
  this.creaturesArr.push(mineral.mesh);
  mineral.mouth.scale.x = 0.5;
  this.add(mineral);
  mineral = new Mineral(this, group1Handler, 3, new THREE.Vector3(-0.1, 0, -0.1), 0.04);
  this.creaturesArr.push(mineral.mesh);
  mineral.mouth.scale.x = 0.5;
  this.add(mineral);

  // Add creatures of group 2
  mineral = new Mineral(this, group2Handler, 4, new THREE.Vector3(-0.1, 0, 0.4), 0.03);
  this.creaturesArr.push(mineral.mesh);
  this.add(mineral);
  mineral = new Mineral(this, group2Handler, 5, new THREE.Vector3(-0.1, 0, 0.3), 0.03);
  this.creaturesArr.push(mineral.mesh);
  this.add(mineral);
  mineral = new Mineral(this, group2Handler, 6, new THREE.Vector3(-0.1, 0, 0.2), 0.03);
  this.creaturesArr.push(mineral.mesh);
  this.add(mineral);
}

Minerals.prototype = Object.create(Race.prototype);

module.exports = Minerals;
