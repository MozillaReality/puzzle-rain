'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Bouncer = require('../creatures/Bouncer');

function Bouncers (pos) {
  Race.call(this, 'bouncers', pos);

  this.raceMesh.position.set(0, 0, -0.4);

  bouncer = new Bouncer(this, 1, new THREE.Vector3(-0.4, 0.25, -0.1), 0.05, 0.3, 2.1);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);
  var bouncer = new Bouncer(this, 3, new THREE.Vector3(-0.1, 0.2, -0.15), 0.1, 0.4, 2.2);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);
  bouncer = new Bouncer(this, 2, new THREE.Vector3(0.2, 0.25, -0.2), 0.08, 0.3, 2);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);
  bouncer = new Bouncer(this, 4, new THREE.Vector3(0.4, 0.15, -0.1), 0.065, 0.4, 2.2);
  this.creaturesArr.push(bouncer);
  this.add(bouncer);

}

Bouncers.prototype = Object.create(Race.prototype);

module.exports = Bouncers;
