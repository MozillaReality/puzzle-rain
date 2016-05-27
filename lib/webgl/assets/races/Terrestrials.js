'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Terrestrial = require('../creatures/Terrestrial');

var GroupHandler = require('../GroupHandler');

function Terrestrials (initCuadrant) {
  Race.call(this, 'terrestrials', initCuadrant);

  var group1Handler = new GroupHandler(this, 0.04, settings[this.race + 'Color'], this.race + '_1', 0.7, 1.3);
  group1Handler.position.set(0, 0, 0);
  this.groupHandlersArr.push(group1Handler);
  this.add(group1Handler);

  var group2Handler = new GroupHandler(this, 0.03, settings[this.race + 'Color'], this.race + '_2', 0.6, 1.2);
  group2Handler.position.set(0.5, 0, 0.2);
  this.groupHandlersArr.push(group2Handler);
  this.add(group2Handler);

  var group3Handler = new GroupHandler(this, 0.02, settings[this.race + 'Color'], this.race + '_3', 0.5, 1.1);
  group3Handler.position.set(-0.5, 0, -0.2);
  this.groupHandlersArr.push(group3Handler);
  this.add(group3Handler);
  // Add 3 creatures
  var terrestrial = new Terrestrial(this, group1Handler, 1, new THREE.Vector3(0, 0, 0), 0.4);
  this.creaturesArr.push(terrestrial.mesh);
  this.add(terrestrial);
  var terrestrial = new Terrestrial(this, group1Handler, 2, new THREE.Vector3(0.5, 0, 0.2), 0.3);
  this.creaturesArr.push(terrestrial.mesh);
  this.add(terrestrial);
  var terrestrial = new Terrestrial(this, group1Handler, 3, new THREE.Vector3(-0.5, 0, -0.2), 0.2);
  this.creaturesArr.push(terrestrial.mesh);
  this.add(terrestrial);

}

Terrestrials.prototype = Object.create(Race.prototype);

module.exports = Terrestrials;
