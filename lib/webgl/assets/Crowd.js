'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

var Terrestrial = require('./creatures/Terrestrial');
var Bouncer = require('./creatures/Bouncer');
var Mineral = require('./creatures/Mineral');
var Bulrush = require('./creatures/Bulrush');
var Flyer = require('./creatures/Flyer');

var scene,
  terrestrialsArr = [],
  bouncersArr = [],
  mineralsArr = [],
  bulrushesArr = [],
  flyersArr = [];

var totalCreatures = 40;
var totalRaces = 5;

function Crowd (myScene) {
  THREE.Object3D.call(this);
  scene = myScene;

  init();

}

function init () {
  for (var i = 0; i < totalCreatures; i++) {
    var pos = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 + 1,
      Math.random() * 2 - 1
    );
    var randScale = THREE.Math.randFloat(0.02, 0.15);
    switch (i % totalRaces) {
      case 0:
        var terrestrial = new Terrestrial(pos, randScale);
        terrestrialsArr.push(terrestrial);
        terrestrial.name = 'terrestrial_' + terrestrialsArr.length;
        scene.add(terrestrial);
        break;
      case 1:
        var bouncer = new Bouncer(pos, randScale);
        bouncersArr.push(bouncer);
        bouncer.name = 'bouncer_' + bouncersArr.length;
        scene.add(bouncer);
        break;
      case 2:
        var mineral = new Mineral(pos, randScale);
        mineralsArr.push(mineral);
        mineral.name = 'mineral_' + mineralsArr.length;
        scene.add(mineral);
        break;
      case 3:
        var bulrush = new Bulrush(pos, randScale);
        bulrushesArr.push(bulrush);
        bulrush.name = 'bulrush_' + bulrushesArr.length;
        scene.add(bulrush);
        break;
      case 4:
        var flyer = new Flyer(pos, randScale);
        flyersArr.push(flyer);
        flyer.name = 'flyer_' + flyersArr.length;
        scene.add(flyer);
        break;
    }
  }

  State.add('terrestrials', terrestrialsArr);
  State.add('bouncers', bouncersArr);
  State.add('minerals', mineralsArr);
  State.add('bulrushs', bulrushesArr);
  State.add('flyers', flyersArr);
  Events.emit('allCreaturesAdded');
// Events.on('updateScene', update.bind(this));
}

function update (delta) {
}

Crowd.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Crowd;
