'use strict';

var THREE = require('three');

var settings = require('../../../settings');

var Race = require('../Race');
var Terrestrial = require('../creatures/Terrestrial');

var GroupHandler = require('../GroupHandler');

function Terrestrials (pos) {
  Race.call(this, 'terrestrials', pos);

  var terrestrial = new Terrestrial(this, 1, new THREE.Vector3(0, 0, 0), 0.1, 0.7, 1.3);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);
  terrestrial = new Terrestrial(this, 2, new THREE.Vector3(0.5, 0, 0.2), 0.08, 0.6, 1.2);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);
  terrestrial = new Terrestrial(this, 3, new THREE.Vector3(-0.5, 0, -0.2), 0.06, 0.5, 1.1);
  this.creaturesArr.push(terrestrial);
  this.add(terrestrial);

}

Terrestrials.prototype = Object.create(Race.prototype);

module.exports = Terrestrials;
