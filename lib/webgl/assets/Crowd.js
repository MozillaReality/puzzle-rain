'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var CreaturesManager = require('../managers/CreaturesManager');
var Terrestrial = require('./creatures/Terrestrial');
var Bouncer = require('./creatures/Bouncer');

var scene,
  terrestrialsArr = [],
  bouncersArr = [];
var N = 50;

function Crowd (myScene) {
  THREE.Object3D.call(this);
  CreaturesManager.init();

  scene = myScene;

  Events.on('creaturesLoaded', init);

}

function init () {
  for (var i = 0; i < N; i++) {
    var pos = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 + 1,
      Math.random() * 2 - 1
    );
    var randScale = THREE.Math.randFloat(0.03, 0.2);
    if (i % 2) {
      var bouncer = new Bouncer(pos, randScale);
      bouncersArr.push(bouncer);
      bouncer.name = 'bouncer_' + bouncersArr.length;
      scene.add(bouncer);
    } else {
      var terrestrial = new Terrestrial(pos, randScale);
      terrestrialsArr.push(terrestrial);
      terrestrial.name = 'terrestrial_' + terrestrialsArr.length;
      scene.add(terrestrial);
    }
  }
  State.add('terrestrials', terrestrialsArr);
  State.add('bouncers', bouncersArr);
  Events.emit('allCreaturesAdded');
// Events.on('updateScene', update.bind(this));
}

function update (delta) {
}

Crowd.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Crowd;
