'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');
var Eyes = require('./creatures/Eyes.js');
var Mouth = require('./creatures/Mouth.js');

var Talking = require('../behaviours/Talking.js');

var AudioManager = require('../managers/AudioManager');

function Creature (raceObj, group, index, myPos, myScale) {
  this.group = group;
  this.index = index;
  this.raceObj = raceObj;
  this.pos = myPos;
  this.myScale = myScale + (Math.random() * 0.01);
  this.lastStatusTime = global.clock.getElapsedTime();

  this.maxRandScaleY = 1.2 + (Math.random() * 0.3 - 0.15);
  this.wakeRand = Math.random() * 3000 - 1500;

  this.camera = State.get('camera');
  // normal
  // upset
  this.status = 'normal';

  THREE.Object3D.call(this);

  this.talking = new Talking(this);

  this.body = new THREE.Group();
  this.add(this.body);

  this.scale.set(this.myScale, this.myScale, this.myScale);
  this.position.set(this.pos.x + (Math.random() * 0.05 - 0.025), this.pos.y, this.pos.z + (Math.random() * 0.05 - 0.025));

  this.upsetTrack = new AudioManager('effects/upset', this, false, false);

  this.eyes = new Eyes(0.1);
  this.body.add(this.eyes);

  this.mouth = new Mouth();
  this.body.add(this.mouth);

  Events.on('collisionDispatched', this.collisionDispatched.bind(this));
  Events.on('updateScene', this.update.bind(this));

  Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
}

Creature.prototype = Object.create(THREE.Object3D.prototype);

Creature.prototype.update = function (delta, time) {
  this.body.scale.y = THREE.Math.mapLinear(this.raceObj.track.averageAnalyser * this.raceObj.awake.awakeLevel, 0, 100, 1, this.maxRandScaleY);
};

Creature.prototype.raceStatusChanged = function (race, raceStatus) {
  if (this.raceObj.race === race) {
    // console.log(race, raceStatus);
    switch (raceStatus) {
      case 'awake':
        this.mesh.material.opacity = 1;
        tweenEmissive('mouth', this.mouth.mesh.material, 1, 3000 + this.wakeRand, 'in');
        tweenEmissive('leftEye', this.eyes.left.eyeball.material, 1, 2000 + this.wakeRand, 'in');
        tweenEmissive('rightEye', this.eyes.right.eyeball.material, 1, 2000 + this.wakeRand, 'in');
        break;
      case 'asleep':
        tweenEmissive('mouth', this.mouth.mesh.material, 0, 2000 + this.wakeRand, 'out');
        tweenEmissive('leftEye', this.eyes.left.eyeball.material, 0, 3000 + this.wakeRand, 'out');
        tweenEmissive('rightEye', this.eyes.right.eyeball.material, 0, 3000 + this.wakeRand, 'out');
        break;
    }

  }
};

Creature.prototype.setStatus = function (status) {
  this.status = status;
};

Creature.prototype.makeNormal = function () {
  this.setStatus('normal', global.clock.getElapsedTime());
  this.mesh.material.color = new THREE.Color(0x39393c);
};

Creature.prototype.setStatus = function (status, time) {
  this.status = status;
  this.lastStatusTime = time;
};

Creature.prototype.collisionDispatched = function (mesh, side, point) {
  if (mesh === this.mesh) {
    if (this.status !== 'upset') {
      this.setStatus('upset', global.clock.getElapsedTime());
      this.upsetTrack.play();
      Events.emit('collided', side, this.mesh.name);
      this.mesh.material.color = new THREE.Color(0x29292c);
      if (this.hiding) clearTimeout(this.hiding);
      this.hiding = setTimeout(this.makeNormal.bind(this), 2000);
      Events.emit('creatureCollided', this);
    }
  }
};

function tweenEmissive (id, obj, value, time, ease) {
  TWEEN.remove(id);

  if (ease === 'in') {
    ease = TWEEN.Easing.Circular.In;
  } else {
    ease = TWEEN.Easing.Circular.Out;
  }
  id = new TWEEN.Tween(obj).to({
    emissiveIntensity: value
  }, time)
    .easing(ease)
    .start();
  TWEEN.add(id);
}

module.exports = Creature;
