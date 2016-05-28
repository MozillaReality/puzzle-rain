'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Bulrush = require('../creatures/Bulrush');

var GroupHandler = require('../GroupHandler');

function Bulrushes () {
  Race.call(this, 'bulrushes');

  this.position.set(0.66, 0, 0.66);

  // var group1Handler = new GroupHandler(this, 0.02, settings[this.race + 'Color'], this.race + '_1', 0.8, 1.4);
  // group1Handler.position.set(-0.2, 0, 0.2);
  // this.groupHandlersArr.push(group1Handler);
  // this.add(group1Handler);
  //
  // var group2Handler = new GroupHandler(this, 0.03, settings[this.race + 'Color'], this.race + '_2', 0.8, 1.4);
  // group2Handler.position.set(0.4, 0, 0.2);
  // this.groupHandlersArr.push(group2Handler);
  // this.add(group2Handler);

  // Add 8 creatures
  // Add creatures of group 1
  var bulrush = new Bulrush(this, 1, new THREE.Vector3(-0.3, 0, 0.1), 0.11, 0.8, 1.4);
  this.creaturesArr.push(bulrush.mesh);
  this.add(bulrush);
  bulrush = new Bulrush(this, 2, new THREE.Vector3(-0.3, 0, 0.3), 0.08, 0.8, 1.4);
  this.creaturesArr.push(bulrush.mesh);
  this.add(bulrush);

}

Bulrushes.prototype = Object.create(Race.prototype);

module.exports = Bulrushes;
