'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');
var glslify = require('glslify');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var Eyes = require('./creatures/Eyes.js');
var Mouth = require('./creatures/Mouth.js');

var AudioManager = require('../managers/AudioManager');

var MathUtils = require('../utils/MathUtils');

function Creature (race, index, myPos, myScale, minHeight, maxHeight) {
  this.index = index;
  this.race = race;
  this.pos = myPos;
  this.myScale = myScale;

  this.minHeight = minHeight;
  this.maxHeight = maxHeight;

  this.handGrabbed = '';
  this.isActive = false;
  // over / out
  this.overStatus = 'out';
  this.idAudio = this.race.name + '_' + index;

  THREE.Object3D.call(this);

  this.overTrack = new AudioManager('effects/over', this, false, false);

  this.wakeRand = Math.random() * 3000 - 1500;

  this.camera = State.get('camera');

  this.scale.set(this.myScale, this.myScale, this.myScale);
  this.position.set(this.pos.x, this.pos.y, this.pos.z);

  this.addBody();
  this.addGlow();
  this.addRing();
  this.addAudio();

}

Creature.prototype = Object.create(THREE.Object3D.prototype);

Creature.prototype.update = function (delta, time) {
  // this.body.scale.y = THREE.Math.mapLinear(this.race.track.averageAnalyser * this.race.awake.awakeLevel, 0, 100, 1, 1.2);

  if (this.track) {
    this.mouth.scale.y = THREE.Math.mapLinear(this.track.averageAnalyser * this.track.getVolume(), 0, 100, 1, 35);
  }
};

Creature.prototype.addBody = function () {
  this.body = new THREE.Group();
  this.add(this.body);
  this.upsetTrack = new AudioManager('effects/upset', this, false, false);

  this.eyes = new Eyes(0.1);
  this.body.add(this.eyes);

  this.mouth = new Mouth();
  this.body.add(this.mouth);
};

Creature.prototype.addGlow = function () {
  var glowGeometry = new THREE.SphereGeometry(this.radius, 32, 16);
  var glowMaterial = new THREE.ShaderMaterial(
    {
      uniforms: {
        'c': { type: 'f', value: 0.0 },
        'p': { type: 'f', value: 6.0 },
        'opacity': { type: 'f', value: 0.0 },
        glowColor: { type: 'c', value: new THREE.Color(MathUtils.blendColors(settings[this.race.name + 'Color'], 0xffffff, 0.25)) },
        viewVector: { type: 'v3', value: this.camera.position }
      },
      vertexShader: glslify('../shaders/glow.vert'),
      fragmentShader: glslify('../shaders/glow.frag'),
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

  this.glow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
  this.glow.scale.set(1.1, 1.1, 1.1);
  this.add(this.glow);
};

Creature.prototype.addRing = function () {
  var geometryCircleLine = new THREE.CircleGeometry(this.radius, 64);
  // Remove center vertex
  geometryCircleLine.vertices.shift();

  var materialCircleLine = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0});
  materialCircleLine.linewidth = 1;
  this.ring = new THREE.Line(geometryCircleLine, materialCircleLine);
  this.ring.doubleSided = true;
  this.ring.scale.set(1.5, 1.5, 1.5);
  this.add(this.ring);
};

Creature.prototype.addAudio = function () {
  Events.on('audioLoaded', this.audioLoaded.bind(this));
  this.track = new AudioManager(this.idAudio, this, true, true);
  this.track.setVolume(0);
};

Creature.prototype.audioLoaded = function (id) {
  if (id === this.idAudio) {
    Events.on('updateScene', this.update.bind(this));
    Events.on('activeHandlerDispatch', this.activeHandlerDispatch.bind(this));
    Events.on('grabbed', this.grabbed.bind(this));
    Events.on('dropped', this.dropped.bind(this));
    Events.on('magicDispatched', this.magicDispatched.bind(this));

    Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
  }
};

Creature.prototype.activeHandlerDispatch = function (side, obj) {
  if (this.handGrabbed) {
    return;
  }
  if (obj === this) {
    if (this.overStatus !== 'over') {
      this.rollOver();
      this.overTrack.play();
    }
  } else {
    this.rollOut();
  }
};

Creature.prototype.activate = function () {
  this.isActive = true;
  new TWEEN.Tween(this.ring.material).to({
    opacity: 0.8
  }, 3000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  new TWEEN.Tween(this.bodyMesh.material).to({
    opacity: 0.5
  }, 1500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  new TWEEN.Tween(this.glow.material.uniforms.opacity).to({
    value: 1.0
  }, 2500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  new TWEEN.Tween(this.position).to({
    y: this.minHeight + ((this.maxHeight - this.minHeight) / 2)
  }, 3000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

Creature.prototype.deactivate = function () {
  this.handGrabbed = '';
  this.isActive = false;
  new TWEEN.Tween(this.ring.material).to({
    opacity: 0
  }, 500)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
  new TWEEN.Tween(this.bodyMesh.material).to({
    opacity: 0
  }, 1000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
  new TWEEN.Tween(this.glow.material.uniforms.opacity).to({
    value: 0.0
  }, 1500)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
  new TWEEN.Tween(this.position).to({
    y: 0
  }, 1000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
};

Creature.prototype.rollOver = function () {
  if (this.overStatus !== 'over') {
    this.overStatus = 'over';
    this.ring.scale.set(1.7, 1.7, 1.7);
    this.glow.scale.set(1.3, 1.3, 1.3);
    this.bodyMesh.material.opacity = 0.9;
  }
};

Creature.prototype.rollOut = function () {
  if (this.overStatus !== 'out') {
    this.overStatus = 'out';
    this.ring.scale.set(1.5, 1.5, 1.5);
    this.glow.scale.set(1.1, 1.1, 1.1);
    this.bodyMesh.material.opacity = 0.5;
  }
};

Creature.prototype.grabbed = function (side, obj) {
  // console.log(side, obj);
  if (obj === this) {
    this.handGrabbed = side;
    this.ring.scale.set(2, 2, 2);
  }
};

Creature.prototype.dropped = function (obj) {
  if (obj === this) {
    this.handGrabbed = '';
    this.ring.scale.set(1.5, 1.5, 1.5);
  }
};

Creature.prototype.magicDispatched = function (side, race) {
  if (this.race === race) {
    var newPosition = this.position.y + 0.0004;
    this.clampPositionY(newPosition);
  }
};

Creature.prototype.clampPositionY = function (pos) {
  if (pos < this.minHeight) {
    this.position.y = this.minHeight;
  }else if (pos > this.maxHeight) {
    this.position.y = this.maxHeight;
  } else {
    this.position.y = pos;
  }
};

Creature.prototype.raceStatusChanged = function (race, raceStatus) {
  if (this.race === race) {
    // console.log(race, raceStatus);
    switch (raceStatus) {
      case 'awake':
        this.bodyMesh.material.opacity = 1;
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
