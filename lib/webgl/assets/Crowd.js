'use strict';

const Events = require('../../events/Events');
const State = require('../../state/State');
const THREE = require('three');
const CANNON = require('cannon');

const CreaturesManager = require('../managers/CreaturesManager');
const Terrestrial = require('./creatures/Terrestrial');
const Bouncer = require('./creatures/Bouncer');

let scene,world,
  terrestrialsArr = [],
  bouncersArr = [];
const N = 50;

function Crowd (myScene, myWorld) {
  THREE.Object3D.call(this);
  CreaturesManager.init();

  scene = myScene;
  world = myWorld;

  Events.on('creaturesLoaded', init);

}

function init () {
  for (var i = 0; i < N; i++) {
    const pos = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 + 1,
      Math.random() * 2 - 1
    );
    const randScale = THREE.Math.randFloat(0.03, 0.2);
    if (i % 2) {
      const bouncer = new Bouncer(pos, randScale);
      bouncersArr.push(bouncer);
      bouncer.name = bouncer.body.name = 'bouncer_' + bouncersArr.length;
      scene.add(bouncer);
    } else {
      const terrestrial = new Terrestrial(pos, randScale);
      terrestrialsArr.push(terrestrial);
      terrestrial.name = terrestrial.body.name = 'terrestrial_' + terrestrialsArr.length;
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
