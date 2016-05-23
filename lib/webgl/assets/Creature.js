// 'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');
var Eyes = require('./creatures/Eyes.js');
var Mouth = require('./creatures/Mouth.js');

var THREE = require('three');

var AudioManager = require('../managers/AudioManager');

function Creature (raceObj, index, myPos, myScale) {
  this.index = index;
  this.raceObj = raceObj;
  this.pos = myPos;
  this.myScale = myScale;
  this.lastStatusTime = global.clock.getElapsedTime();

  this.camera = State.get('camera');
  // normal
  // happy
  // upset
  // sleeping
  // sleeping-upset
  this.status = 'normal';

  THREE.Object3D.call(this);

  this.body = new THREE.Group();
  this.add(this.body);

  this.scale.set(this.myScale, this.myScale, this.myScale);
  this.position.set(this.pos.x, this.pos.y, this.pos.z);

  this.happyTrack = new AudioManager('happy', this, false, false);
  this.upsetTrack = new AudioManager('upset', this, false, false);

  this.eyes = new Eyes(0.1);
  this.body.add(this.eyes);

  this.mouth = new Mouth();
  this.body.add(this.mouth);

  // Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
  Events.on('happyDispatched', this.happyDispatched.bind(this));
  Events.on('collisionDispatched', this.collisionDispatched.bind(this));
  Events.on('updateScene', this.update.bind(this));
}

Creature.prototype = Object.create(THREE.Object3D.prototype);

Creature.prototype.update = function (delta, time) {};

// Creature.prototype.raceStatusChanged = function (race, status) {
//   if (this.raceObj.race === race) {
//     // console.log(race, status);
//     switch (status) {
//       case 'awake':
//         this.mesh.material.opacity = 1;
//         break;
//       case 'asleep':
//         this.mesh.material.opacity = 0.3;
//         break;
//     }
//
//   }
// };

Creature.prototype.setStatus = function (status) {
  this.status = status;
};

Creature.prototype.makeNormal = function () {
  this.setStatus('normal', global.clock.getElapsedTime());
  this.mesh.material.color = new THREE.Color(this.originalColor);
};

Creature.prototype.setStatus = function (status, time) {
  this.status = status;
  this.lastStatusTime = time;
};

Creature.prototype.happyDispatched = function (mesh) {
  if (mesh === this.mesh) {
    // console.log(this.mesh.name);
    if (this.status !== 'happy' && this.status !== 'upset') {
      this.setStatus('happy', global.clock.getElapsedTime());
      // console.log(this.status);
      this.happyTrack.play();
      this.mesh.material.color = new THREE.Color(0xffffff);
      // if (this.hiding) clearTimeout(this.hiding);
      // this.hiding = setTimeout(this.makeNormal.bind(this), 2000);
      Events.emit('creatureHappy', this);
    }
  }
};

Creature.prototype.collisionDispatched = function (mesh, side, point) {
  if (mesh === this.mesh) {
    if (this.status !== 'upset' && this.status !== 'normal') {
      this.setStatus('upset', global.clock.getElapsedTime());
      this.upsetTrack.play();
      Events.emit('collided', side, this.mesh.name);
      this.mesh.material.color = new THREE.Color(0xff0000);
      if (this.hiding) clearTimeout(this.hiding);
      this.hiding = setTimeout(this.makeNormal.bind(this), 2000);
      Events.emit('creatureCollided', this);
    }
  }
};

module.exports = Creature;
