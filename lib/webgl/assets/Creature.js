'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');
var glslify = require('glslify');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var Eyes = require('./creatures/Eyes.js');
var Mouth = require('./creatures/Mouth.js');

var AudioManager = require('../audio/AudioManager');

var MathUtils = require('../utils/MathUtils');

var ParticleSystem = require('./particles/ParticleSystem');

var MAX_POOFS = 3;

function Creature (race, index, myPos, myScale, minHeight, maxHeight) {
  this.index = index;
  this.race = race;
  this.pos = myPos;
  this.myScale = myScale;
  this.radius = 1 * myScale;

  this.minHeight = minHeight;
  this.maxHeight = maxHeight;

  this.particleSystem = new ParticleSystem();

  this.handGrabbed = '';
  this.isActive = false;
  // over / out
  this.overStatus = 'out';
  this.idAudio = this.race.name + '_' + index;

  this.maxRandEmissive = 1 + Math.random() * 0.2;
  this.originalColor = settings[this.race.name + 'Color'];

  this.prevVol = 0;

  this.randExcited = (4 + Math.random() * 8);
  this.scaryYpos = 0.5;

  this.tweenToEndPosition = false;
  this.endYpos = 2.9;

  THREE.Object3D.call(this);

  this.overTrack = new AudioManager('effects/over', true, this, false, false);
  this.errorTrack = new AudioManager('effects/error', true, this, false, false);

  this.wakeRand = Math.random() * 1000 - 500;

  this.camera = State.get('camera');

  this.sun = State.get('keyLight');

  this.isScaryCreature = false;
  this.isElevationStarted = false;

  this.scale.set(this.myScale, this.myScale, this.myScale);
  this.position.set(this.pos.x, this.pos.y, this.pos.z);

  this.addBody();
  this.addGlow();
  this.addRing();
  this.addAudio();

  this.addTrail();
  this.trailTime = 0;

}

Creature.prototype = Object.create(THREE.Object3D.prototype);

Creature.prototype.update = function (delta, time) {
  this.particleSystem.draw();
  if (State.get('stage') === 'experience') {
    if (this.trailTime > 0) {
      var paticlePos = new THREE.Vector3().setFromMatrixPosition(this.matrixWorld);
      this.trail.birthParticles(
        [paticlePos.x, paticlePos.y, paticlePos.z]);
    }
  }
  if (this.isElevationStarted) {
    this.updateOnEating(delta, time);
    this.track.setVolume(0);
    return;
  }
  if (this.isScaryCreature) {
    this.updateOnScary(delta, time);
    return;
  }
  if (this.track) {
    this.mouth.scale.y = THREE.Math.mapLinear(this.track.averageAnalyser * Math.min(1, this.track.getVolume()), 0, 100, 1, 25);
  }

  this.updateGlowOrientation();

  this.ring.quaternion.copy(this.camera.quaternion);

  var scaleVolume = THREE.Math.mapLinear(this.track.averageAnalyser * Math.min(1, this.track.getVolume()), 0, 100, 1.5, 3);
  this.ring.scale.set(scaleVolume, scaleVolume, scaleVolume);
  // this.ring.material.opacity = Math.min(1, this.track.getVolume());
  this.setVolumeRing();

  if (this.handGrabbed !== '') {
    var hand = State.get('gamepad' + this.handGrabbed);
    this.clampPositionY(hand.position.y);
    var handRelPos = hand.position.clone().sub(this.race.position);
    this.position.x = handRelPos.x;
    this.position.z = handRelPos.z;
  }
  // var mappedVolume = THREE.Math.mapLinear(this.position.y, this.minHeight, this.maxHeight, 0, 1);
  var mappedVolume = THREE.Math.mapLinear(this.position.y, 1, 1.7, 0, 1);
  var clampedVolume = THREE.Math.clamp(mappedVolume, 0, 1);
  this.track.setVolume(clampedVolume);

  if (this.race.status === 'awake') {
    var valTmp = THREE.Math.mapLinear(this.track.averageAnalyser * this.track.getVolume(), 0, 100, 0, this.maxRandEmissive);
    this.bodyMesh.material.emissiveIntensity = valTmp;
    this.glow.material.uniforms.opacity.value = valTmp;
  }

  var userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(this.position).sub(this.parent.position);
  if (this.handGrabbed !== '') {
    var hand = State.get('gamepad' + this.handGrabbed);
    userPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld).sub(hand.position);
  }

  if (this.race.status === 'awake') {
    this.body.lookAt(new THREE.Vector3(userPos.x, 0, userPos.z));
  }

// TODO add a method to sync current time of all audios (of creatures & races)
// console.log(this.track.id, this.track.getCurrentTime());
};

Creature.prototype.updateOnScary = function (delta, time) {
  this.mouth.scale.y = 8;
  this.mouth.scale.x = 1;
  this.updateGlowOrientation();
  var sunPos = new THREE.Vector3().setFromMatrixPosition(this.sun.matrixWorld).sub(this.parent.position);
  this.body.lookAt(sunPos);
  this.position.y = this.scaryYpos + (Math.sin((time * this.randExcited)) * 0.02);
};

Creature.prototype.updateOnEating = function (delta, time) {
  this.updateGlowOrientation();
};

Creature.prototype.updateGlowOrientation = function () {
  var cameraRelPos = new THREE.Vector3().setFromMatrixPosition(this.camera.matrixWorld);
  var glowPos = new THREE.Vector3().setFromMatrixPosition(this.glow.matrixWorld);
  this.glow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(cameraRelPos, glowPos);
};
Creature.prototype.addBody = function () {
  this.body = new THREE.Group();
  this.add(this.body);

  this.eyes = new Eyes(0.1);
  this.eyes.right.eyeball.material.opacity = 0;
  this.eyes.left.eyeball.material.opacity = 0;
  this.body.add(this.eyes);

  this.mouth = new Mouth();
  this.mouth.mesh.material.opacity = 0;
  this.body.add(this.mouth);
};

Creature.prototype.addGlow = function () {
  var glowGeometry = new THREE.SphereGeometry(1, 16, 16);
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
      depthWrite: false,
      transparent: true
    });

  this.glow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
  this.add(this.glow);
};

Creature.prototype.addRing = function () {
  this.ringSides = 32;
  this.ringIndex = 32;
  var geometryCircleLine = new THREE.CircleGeometry(1, this.ringSides, Math.PI, Math.PI * 2);
  // Remove center vertex
  geometryCircleLine.vertices.shift();

  var materialCircleLine = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false});
  materialCircleLine.linewidth = 2;

  this.ring = new THREE.Line(geometryCircleLine, materialCircleLine);
  // var geometry = new THREE.PlaneBufferGeometry(2, 2);
  // var texture = new THREE.TextureLoader().load('textures/volumeRing.png');
  // texture.wrapS = THREE.RepeatWrapping;
  // texture.wrapT = THREE.RepeatWrapping;
  // texture.repeat.set(1 / 8, 1);
  // var material = new THREE.MeshBasicMaterial({map: texture,transparent: true,opacity: 0, blending: THREE.AdditiveBlending});
  // this.ring = new THREE.Mesh(geometry, material);

  this.ring.doubleSided = true;
  this.ring.scale.set(1.5, 1.5, 1.5);
  this.add(this.ring);
};

Creature.prototype.addAudio = function () {
  // Events.on('audioLoaded', this.audioLoaded.bind(this));
  this.track = new AudioManager(this.idAudio, true, this, true, true);
  this.track.setVolume(0);
};

Creature.prototype.addTrail = function () {
  var g_trailParameters = {
    numParticles: 20,
    lifeTime: 2,
    startSize: 0.01,
    endSize: 0.05,
    velocityRange: [0.3, 0.3, 0.3],
    accelerationRange: [0.1, 0.1, 0.1],
    billboard: true
  };
  this.trail = this.particleSystem.createTrail(
    200   ,
    g_trailParameters,
    new THREE.TextureLoader().load('textures/magicOver-' + this.race.name + '.png'));
  this.trail.setState(THREE.AdditiveBlending);
  this.trail.setColorRamp(
    [1, 1, 1, 1,
      1, 1, 1, 0.5,
      1, 1, 1, 0]);
};

// Creature.prototype.audioLoaded = function (id) {
//   if (id === this.idAudio) {
//   }
// };

Creature.prototype.init = function () {
  Events.on('updateScene', this.update.bind(this));
  Events.on('creatureCollided', this.creatureCollided.bind(this));
  Events.on('grabbed', this.grabbed.bind(this));
  Events.on('dropped', this.dropped.bind(this));
  Events.on('magicDispatched', this.magicDispatched.bind(this));
  Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
  Events.on('stageChanged', this.stageChanged.bind(this));
  Events.on('elevationStarted', this.elevationStarted.bind(this));
};

Creature.prototype.creatureCollided = function (side, obj) {
  if (State.get('stage') === 'ending') {
    return;
  }
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
  // new TWEEN.Tween(this.ring.material).to({
  //   opacity: 0.5
  // }, 3000)
  //   .easing(TWEEN.Easing.Cubic.Out)
  //   .start();
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

  new TWEEN.Tween(this.eyes.right.eyeball.material).to({
    opacity: 1
  }, 100)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();

  new TWEEN.Tween(this.eyes.left.eyeball.material).to({
    opacity: 1
  }, 100)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();

  new TWEEN.Tween(this.mouth.mesh.material).to({
    opacity: 1
  }, 100)
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
    opacity: 1
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

  new TWEEN.Tween(this.eyes.right.eyeball.material).to({
    opacity: 0
  }, 1000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();

  new TWEEN.Tween(this.eyes.left.eyeball.material).to({
    opacity: 0
  }, 1000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
  new TWEEN.Tween(this.mouth.mesh.material).to({
    opacity: 0
  }, 1000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
  new TWEEN.Tween(this.bodyMesh.material).to({
    emissiveIntensity: 0
  }, 1000)
    .easing(TWEEN.Easing.Cubic.In)
    .start();
};

Creature.prototype.rollOver = function () {
  if (this.overStatus !== 'over' && this.isActive) {
    this.overStatus = 'over';
    this.ring.scale.set(1.7, 1.7, 1.7);
    this.glow.scale.set(1.3, 1.3, 1.3);
    this.bodyMesh.material.opacity = 1;
    var paticlePos = new THREE.Vector3().setFromMatrixPosition(this.matrixWorld);
    this.trail.birthParticles(
      [paticlePos.x, paticlePos.y, paticlePos.z]);
  }
};

Creature.prototype.rollOut = function () {
  if (this.overStatus !== 'out' && this.isActive) {
    this.overStatus = 'out';
    this.ring.scale.set(1.5, 1.5, 1.5);
    this.glow.scale.set(1, 1, 1);
    this.bodyMesh.material.opacity = 0.5;
  }
};

Creature.prototype.grabbed = function (side, obj) {
  if (State.get('stage') === 'ending') {
    return;
  }
  // console.log(side, obj);
  if (obj === this) {
    this.handGrabbed = side;
    this.ring.scale.set(2, 2, 2);
    this.track.setRefDistance(2);
    // this.track.setVolume(1);
    new TWEEN.Tween(this.ring.material).to({
      opacity: 0.5
    }, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  }
};

Creature.prototype.dropped = function (obj) {
  if (obj === this) {
    this.handGrabbed = '';
    this.track.setRefDistance(0.5);
    this.ring.scale.set(1.5, 1.5, 1.5);

    var allCreatures = State.get('allCreatures');
    var isCollidedWithOther = false;
    for (var i = 0; i < allCreatures.length;i++) {
      if (allCreatures[i] !== this) {
        var myPos = new THREE.Vector3().setFromMatrixPosition(this.matrixWorld);
        var otherPos = new THREE.Vector3().setFromMatrixPosition(allCreatures[i].matrixWorld);
        var dist = myPos.distanceTo(otherPos);
        if (dist < allCreatures[i].radius * 2) {
          isCollidedWithOther = true;
        }
      }
    }
    // Return to original position
    if (isCollidedWithOther) {
      new TWEEN.Tween(this.position).to({
        x: this.pos.x,
        z: this.pos.z
      }, 2000)
        .easing(TWEEN.Easing.Circular.Out)
        .start();
      this.errorTrack.play();
    }
    this.rotation.set(0, 0, 0);

    new TWEEN.Tween(this.ring.material).to({
      opacity: 0
    }, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  }
};

Creature.prototype.magicDispatched = function (side, race) {
  if (State.get('stage') === 'ending') {
    return;
  }
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
  if (State.get('stage') === 'ending') {
    return;
  }
  if (this.race === race) {
    // console.log(race, raceStatus);
    switch (raceStatus) {
      case 'awake':
        this.bodyMesh.material.opacity = 1;
        tweenEmissive('mouth', this.mouth.mesh.material, 1, 500 + this.wakeRand, 'in');
        tweenEmissive('leftEye', this.eyes.left.eyeball.material, 1, 500 + this.wakeRand, 'in');
        tweenEmissive('rightEye', this.eyes.right.eyeball.material, 1, 500 + this.wakeRand, 'in');
        break;
      case 'asleep':
        tweenEmissive('mouth', this.mouth.mesh.material, 0, 1000 + this.wakeRand, 'out');
        tweenEmissive('leftEye', this.eyes.left.eyeball.material, 0, 1000 + this.wakeRand, 'out');
        tweenEmissive('rightEye', this.eyes.right.eyeball.material, 0, 1000 + this.wakeRand, 'out');
        break;
    }

  }
};

Creature.prototype.stageChanged = function (newStage) {
  var self = this;
  switch (newStage) {
    case 'ending':
      new TWEEN.Tween(this.position).to({
        y: this.pos.y
      }, 5000)
        .easing(TWEEN.Easing.Circular.Out)
        .onComplete(function () {
          if (State.get('endMode') === 2) {
            self.scaryCreatures();
          }
        })
        .start();
  }
};

Creature.prototype.elevationStarted = function () {
  this.isElevationStarted = true;
  if (State.get('endMode') === 1) {
    tweenEmissive('mouth', this.mouth.mesh.material, 1, 500 + this.wakeRand, 'in');
    tweenEmissive('leftEye', this.eyes.left.eyeball.material, 1, 500 + this.wakeRand, 'in');
    tweenEmissive('rightEye', this.eyes.right.eyeball.material, 1, 500 + this.wakeRand, 'in');
  }
  tweenEmissive('bodyMesh', this.bodyMesh.material, 1, 8000 + this.wakeRand, 'in');
  var self = this;
  new TWEEN.Tween(this.position).to({
    y: this.endYpos
  }, 25000)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .onComplete(function () {
      self.tweenToEndPosition = true;
    })
    .start();
};

Creature.prototype.scaryCreatures = function () {
  this.activateOnScary();
  this.isScaryCreature = true;

  var self = this;
  new TWEEN.Tween(this.position).to({
    x: this.pos.x,
    z: this.pos.z
  }, 5000)
    .easing(TWEEN.Easing.Circular.Out)
    .start();
  new TWEEN.Tween(this.position).to({
    y: this.scaryYpos
  }, 8000)
    .start();
};

Creature.prototype.activateOnScary = function () {
  this.isActive = true;
  tweenEmissive('mouth', this.mouth.mesh.material, 1, 500 + this.wakeRand, 'in');
  tweenEmissive('leftEye', this.eyes.left.eyeball.material, 1, 500 + this.wakeRand, 'in');
  tweenEmissive('rightEye', this.eyes.right.eyeball.material, 1, 500 + this.wakeRand, 'in');
  var self = this;
  new TWEEN.Tween(this.ring.material).to({
    opacity: 0
  }, 1500)
    .onComplete(function () {
      self.ring.visible = false;
    })
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  new TWEEN.Tween(this.bodyMesh.material).to({
    opacity: 0.5
  }, 1500)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  new TWEEN.Tween(this.glow.material.uniforms.opacity).to({
    value: 0
  }, 1000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
  new TWEEN.Tween(this.eyes.right.eyeball.material).to({
    opacity: 1
  }, 3000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();

  new TWEEN.Tween(this.eyes.left.eyeball.material).to({
    opacity: 1
  }, 3000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();

  new TWEEN.Tween(this.mouth.mesh.material).to({
    opacity: 1
  }, 3000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};

function tweenEmissive (id, obj, value, time, ease) {
  TWEEN.remove(id);

  if (ease === 'in') {
    ease = TWEEN.Easing.Quadratic.In;
  } else {
    ease = TWEEN.Easing.Quadratic.Out;
  }
  id = new TWEEN.Tween(obj).to({
    emissiveIntensity: value
  }, time)
    .easing(ease)
    .start();
  TWEEN.add(id);
}

Creature.prototype.setVolumeRing = function () {
  var index = Math.floor(THREE.Math.mapLinear(Math.min(1, this.track.getVolume()), 0, 0.9, 0, this.ringSides));
  if (index !== this.ringIndex) {
    this.ringIndex = index;
    var sides = index;
    var thetaLength = Math.PI * 2 / this.ringSides * sides;
    this.ring.geometry.dispose();
    this.ring.geometry = new THREE.CircleGeometry(1, sides, Math.PI, thetaLength);
    this.ring.geometry.vertices.shift();
  }
};

module.exports = Creature;
