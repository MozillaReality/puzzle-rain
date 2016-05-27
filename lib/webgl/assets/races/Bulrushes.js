'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Bulrush = require('../creatures/Bulrush');

var GroupHandler = require('../GroupHandler');

function Bulrushes (initCuadrant) {
  Race.call(this, 'bulrushes', initCuadrant);

  var group1Handler = new GroupHandler(this, 0.02, settings[this.race + 'Color'], this.race + '_1', 0.8, 1.4);
  group1Handler.position.set(-0.2, 0, 0.2);
  this.groupHandlersArr.push(group1Handler);
  this.add(group1Handler);

  var group2Handler = new GroupHandler(this, 0.02, settings[this.race + 'Color'], this.race + '_2', 0.8, 1.4);
  group2Handler.position.set(0.4, 0, 0.2);
  this.groupHandlersArr.push(group2Handler);
  this.add(group2Handler);

  // Add 8 creatures
  // Add creatures of group 1
  var bulrush = new Bulrush(this, group1Handler, 1, new THREE.Vector3(-0.3, 0, 0.1), 0.11);
  this.creaturesArr.push(bulrush.mesh);
  bulrush.mouth.scale.x = 0.5;
  this.add(bulrush);
  bulrush = new Bulrush(this, group1Handler, 2, new THREE.Vector3(-0.3, 0, 0.3), 0.08);
  this.creaturesArr.push(bulrush.mesh);
  bulrush.mouth.scale.x = 0.5;
  this.add(bulrush);
  bulrush = new Bulrush(this, group1Handler, 3, new THREE.Vector3(-0.1, 0, 0.1), 0.09);
  this.creaturesArr.push(bulrush.mesh);
  bulrush.mouth.scale.x = 0.5;
  this.add(bulrush);
  bulrush = new Bulrush(this, group1Handler, 4, new THREE.Vector3(-0.1, 0, 0.3), 0.10);
  this.creaturesArr.push(bulrush.mesh);
  bulrush.mouth.scale.x = 0.5;
  this.add(bulrush);

  // Add creatures of group 2
  var bulrush = new Bulrush(this, group2Handler, 5, new THREE.Vector3(0.5, 0, 0.1), 0.12);
  this.creaturesArr.push(bulrush.mesh);
  this.add(bulrush);
  bulrush = new Bulrush(this, group2Handler, 6, new THREE.Vector3(0.5, 0, 0.3), 0.11);
  this.creaturesArr.push(bulrush.mesh);
  this.add(bulrush);
  bulrush = new Bulrush(this, group2Handler, 7, new THREE.Vector3(0.3, 0, 0.1), 0.09);
  this.creaturesArr.push(bulrush.mesh);
  this.add(bulrush);
  bulrush = new Bulrush(this, group2Handler, 8, new THREE.Vector3(0.3, 0, 0.3), 0.10);
  this.creaturesArr.push(bulrush.mesh);
  this.add(bulrush);

}

Bulrushes.prototype = Object.create(Race.prototype);

module.exports = Bulrushes;
