'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Bouncer = require('../creatures/Bouncer');

var GroupHandler = require('../GroupHandler');

function Bouncers () {
  Race.call(this, 'bouncers');

  this.position.set(0.66, 0, 0);

  var group1Handler = new GroupHandler(this, 0.02, settings[this.race + 'Color'], this.race + '_1', 0, 1);
  group1Handler.position.set(0, 0, 0);
  this.groupHandlersArr.push(group1Handler);
  this.add(group1Handler);

  var group2Handler = new GroupHandler(this, 0.01, settings[this.race + 'Color'], this.race + '_2', 0.8, 1.8);
  group2Handler.position.set(0.2, 0.8, 0.2);
  this.groupHandlersArr.push(group2Handler);
  this.add(group2Handler);

  var group3Handler = new GroupHandler(this, 0.015, settings[this.race + 'Color'], this.race + '_3', 1, 2);
  group3Handler.position.set(-0.2, 1, 0.1);
  this.groupHandlersArr.push(group3Handler);
  this.add(group3Handler);

  var group4Handler = new GroupHandler(this, 0.03, settings[this.race + 'Color'], this.race + '_4', 0.5, 1.5);
  group4Handler.position.set(0.3, 0.5, -0.3);
  this.groupHandlersArr.push(group4Handler);
  this.add(group4Handler);

  // Add 4 creatures
  var bouncer = new Bouncer(this, group1Handler, 1, new THREE.Vector3(0, 0, 0), 0.2);
  this.creaturesArr.push(bouncer.mesh);
  this.add(bouncer);
  var bouncer = new Bouncer(this, group2Handler, 2, new THREE.Vector3(0.2, 0.8, 0.2), 0.1);
  this.creaturesArr.push(bouncer.mesh);
  this.add(bouncer);
  var bouncer = new Bouncer(this, group3Handler, 3, new THREE.Vector3(-0.2, 1, 0.1), 0.15);
  this.creaturesArr.push(bouncer.mesh);
  this.add(bouncer);
  var bouncer = new Bouncer(this, group4Handler, 4, new THREE.Vector3(0.3, 0.5, -0.3), 0.3);
  this.creaturesArr.push(bouncer.mesh);
  this.add(bouncer);
}

Bouncers.prototype = Object.create(Race.prototype);

module.exports = Bouncers;
