'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Terrestrial = require('../creatures/Terrestrial');
var TerrestrialsMesh = require('./TerrestrialsMesh');

function Terrestrials (pos) {
  Race.call(this, 'terrestrials', pos);

  this.raceMesh = new TerrestrialsMesh(this);
  this.raceMesh.position.set(0.1, 0.3, -0.1);
  this.add(this.raceMesh);

  var terrestrial = new Terrestrial(this, 1, new THREE.Vector3(0, 0, -0.4), 0.1, 0.4, 2.1);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);
  terrestrial = new Terrestrial(this, 2, new THREE.Vector3(0.3, 0, -0.3), 0.08, 0.3, 2);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);
  terrestrial = new Terrestrial(this, 3, new THREE.Vector3(-0.3, 0, -0.6), 0.06, 0.25, 1.9);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);

}

Terrestrials.prototype = Object.create(Race.prototype);

module.exports = Terrestrials;
