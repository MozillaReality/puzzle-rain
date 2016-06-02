'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Terrestrial = require('../creatures/Terrestrial');

function Terrestrials (pos) {
  Race.call(this, 'terrestrials', pos);

  this.raceMesh.position.set(0.1, 0.3, -0.1);

  var terrestrial = new Terrestrial(this, 1, new THREE.Vector3(0, 0, -0.4), 0.1, 0.4, 2.3);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);
  terrestrial = new Terrestrial(this, 2, new THREE.Vector3(0.3, 0, -0.1), 0.08, 0.3, 2.2);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);
  terrestrial = new Terrestrial(this, 3, new THREE.Vector3(-0.3, 0, -0.6), 0.06, 0.5, 2.4);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);

}

Terrestrials.prototype = Object.create(Race.prototype);

module.exports = Terrestrials;
