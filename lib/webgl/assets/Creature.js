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

function Creature (race, index, myPos, myScale) {
  this.index = index;
  this.race = race;
  this.pos = myPos;
  this.myScale = myScale;
  this.radius = 1 * myScale;

  this.isActiveByHandR = false;
  this.isActiveByHandL = false;

  this.magicActive = false;

  this.magnetR = 1;
  this.magnetL = 1;

  this.particleSystem = new ParticleSystem();

  this.handGrabbed = '';
  this.isActive = false;
  // over / out
  this.overStatus = 'out';

  this.isPlaced = false;

  this.idAudio = this.race.name + '_' + index;

  this.maxRandEmissive = 1 + Math.random() * 0.2;
  this.originalColor = settings[this.race.name + 'Color'];

  this.prevVol = 0;

  this.randExcited = (4 + Math.random() * 8);
  this.scaryYpos = 0.5;
  this.happyYpos = 0.8;

  this.tweenToEndPosition = false;
  this.endYpos = 2.9;

  THREE.Object3D.call(this);

  this.overTrack = new AudioManager('effects/over', true, this, false, false);
  this.errorTrack = new AudioManager('effects/error', false, this, false, false);
  this.placedTrack = new AudioManager('effects/placed', true, this, false, false);

  this.wakeRand = Math.random() * 1000 - 500;

  this.camera = State.get('camera');
  this.cameraForGlow = State.get('camera');

  this.sun = State.get('keyLight');

  this.hasReactCreature = false;
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

Creature.prototype.updateSceneSpectator = function (delta, time) {
  this.cameraForGlow = State.get('cameraSpectator');
  this.updateCommon(delta, time);
};

Creature.prototype.update = function (delta, time) {
  this.cameraForGlow = this.camera;
  this.updateCommon(delta, time);
};

Creature.prototype.updateCommon = function (delta, time) {
  this.particleSystem.draw(this.cameraForGlow);

  if (!this.magicActive) {
    // if (this.magnetR > 0) {
    this.magnetR += 0.02;
    this.magnetR = THREE.Math.clamp(this.magnetR, 0, 1);
    // }
    // if (this.magnetL > 0) {
    this.magnetL += 0.02;
    this.magnetL = THREE.Math.clamp(this.magnetL, 0, 1);
  // }
  }

  if (State.get('stage') === 'experience') {
    if (this.trailTime > 0) {
      var paticlePos = new THREE.Vector3().setFromMatrixPosition(this.matrixWorld);
      this.trail.birthParticles(
        [paticlePos.x, paticlePos.y, paticlePos.z]);
    }
  }
  this.updateGlowOrientation();
  // if (this.isElevationStarted) {
  //   this.track.setVolume(0);
  //   return;
  // }
  if (this.hasReactCreature) {
    this.updateOnReact(delta, time);
    return;
  }
  if (State.get('stage') === 'ending') {
    this.fadeVolume();
    return;
  }
  if (this.track) {
    this.mouth.scale.y = THREE.Math.mapLinear(this.track.averageAnalyser * Math.min(1, this.track.getVolume()), 0, 100, 1, 25);
  }

  this.ring.quaternion.copy(this.cameraForGlow.quaternion);

  var scaleVolume = THREE.Math.mapLinear(this.track.averageAnalyser * Math.min(1, this.track.getVolume()), 0, 100, 1.5, 3);
  this.ring.scale.set(scaleVolume, scaleVolume, scaleVolume);
  // this.setVolumeRing();

  if (this.handGrabbed !== '') {
    var hand = State.get('gamepad' + this.handGrabbed);
    this.position.x = hand.position.x;
    this.position.y = hand.position.y;
    this.position.z = hand.position.z;
  } else {
    this.getPositionWithMagnet();
  }
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

Creature.prototype.getPositionWithMagnet = function () {
  if (State.get('gamepadR') && State.get('gamepadL')) {
    if (this.race.name === 'flyers') {
      // console.log(State.get('gamepadR').position);
    }

    var activeMagnet = this.magnetR;
    var posToGamepad = getPointInBetweenByPerc(State.get('gamepadR').position, this.pos, this.magnetR);
    if (this.magnetR > this.magnetL) {
      activeMagnet = this.magnetL;
      posToGamepad = getPointInBetweenByPerc(State.get('gamepadL').position, this.pos, this.magnetL);
    }
    if (activeMagnet < 1) {
      this.position.set(posToGamepad.x, posToGamepad.y, posToGamepad.z);
    }
  }
};

function getPointInBetweenByPerc (pointA, pointB, percentage) {
  var dir = pointB.clone().sub(pointA);
  var len = dir.length();
  dir = dir.normalize().multiplyScalar(len * percentage);
  return pointA.clone().add(dir);

}

Creature.prototype.fadeVolume = function () {
  var self = this;
  new TWEEN.Tween({
    volume: this.track.getVolume()
  })
    .to({ volume: 0 }, 2000)
    .onUpdate(function () {
      self.track.setVolume(this.volume);
    })
    .start();
};
Creature.prototype.updateOnReact = function (delta, time) {
  if (State.get('endMode') === 1) {
    this.position.y = this.happyYpos + (Math.sin((time * this.randExcited)) * 0.01);
  } else {
    this.position.y = this.scaryYpos + (Math.sin((time * this.randExcited)) * 0.02);
    var sunPos = new THREE.Vector3().setFromMatrixPosition(this.sun.matrixWorld).sub(this.parent.position);
    this.body.lookAt(sunPos);
  }
};

Creature.prototype.updateGlowOrientation = function () {
  var cameraRelPos = new THREE.Vector3().setFromMatrixPosition(this.cameraForGlow.matrixWorld);
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
        viewVector: { type: 'v3', value: this.cameraForGlow.position }
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
  Events.on('placed', this.placed.bind(this));
  Events.on('magicDispatched', this.magicDispatched.bind(this));
  Events.on('magicOff', this.magicOff.bind(this));
  Events.on('raceStatusChanged', this.raceStatusChanged.bind(this));
  Events.on('stageChanged', this.stageChanged.bind(this));
  Events.on('elevationStarted', this.elevationStarted.bind(this));
  Events.on('updateSceneSpectator', this.updateSceneSpectator.bind(this));
  Events.on('activeCreatureChanged', this.activeCreatureChanged.bind(this));
};

Creature.prototype.creatureCollided = function (side, obj) {
  if (State.get('stage') === 'ending' || this.isPlaced) {
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
    y: 1
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
  if (this.isPlaced) {
    return;
  }
  if (this.overStatus !== 'over' && this.isActive) {
    this.overStatus = 'over';
    // this.ring.scale.set(1.7, 1.7, 1.7);
    this.glow.scale.set(1.3, 1.3, 1.3);
    this.bodyMesh.material.opacity = 1;
    this.dispatchParticles();
  }
};

Creature.prototype.dispatchParticles = function () {
  var paticlePos = new THREE.Vector3().setFromMatrixPosition(this.matrixWorld);
  this.trail.birthParticles(
    [paticlePos.x, paticlePos.y, paticlePos.z]);
};
Creature.prototype.rollOut = function () {
  if (this.isPlaced) {
    return;
  }
  if (this.overStatus !== 'out' && this.isActive) {
    this.overStatus = 'out';
    // this.ring.scale.set(1.5, 1.5, 1.5);
    this.glow.scale.set(1, 1, 1);
    this.bodyMesh.material.opacity = 0.5;
  }
};

Creature.prototype.grabbed = function (side, obj) {
  if (State.get('stage') === 'ending' || this.isPlaced) {
    return;
  }
  // console.log(side, obj);
  if (obj === this) {
    this.handGrabbed = side;
    // this.ring.scale.set(2, 2, 2);
    this.track.setRefDistance(2);
  // this.track.setVolume(1);
  // new TWEEN.Tween(this.ring.material).to({
  //   opacity: 0.5
  // }, 1000)
  //   .easing(TWEEN.Easing.Cubic.Out)
  //   .start();
  }
};

Creature.prototype.dropped = function (obj) {
  if (obj === this) {
    this.handGrabbed = '';
    this.track.setRefDistance(0.5);
    // this.ring.scale.set(1.5, 1.5, 1.5);

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
    if (obj.isPlaced) {
      return;
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

  // new TWEEN.Tween(this.ring.material).to({
  //   opacity: 0
  // }, 1000)
  //   .easing(TWEEN.Easing.Cubic.Out)
  //   .start();
  }
};

Creature.prototype.placed = function (obj, pos) {
  if (obj === this) {
    this.dispatchParticles();
    this.isPlaced = true;
    this.dropped(this);
    this.placedTrack.play();
    new TWEEN.Tween(this.position).to({
      x: pos.x,
      y: pos.y,
      z: pos.z
    }, 1000)
      .delay(400)
      .easing(TWEEN.Easing.Circular.Out)
      .start();
  }

};

Creature.prototype.magicOff = function () {
  this.magicActive = false;
};

Creature.prototype.magicDispatched = function (side, race) {
  if (State.get('stage') === 'ending') {
    return;
  }
  this.magicActive = true;

  if (this.isActiveByHandR && side === 'R') {
    this.magnetR -= 0.01;
    this.magnetR = THREE.Math.clamp(this.magnetR, 0, 1);
  }
  if (this.isActiveByHandL && side === 'L') {
    this.magnetL -= 0.01;
    this.magnetL = THREE.Math.clamp(this.magnetL, 0, 1);
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
      if (State.get('endMode') === 1) {
        new TWEEN.Tween({
          volume: this.track.getVolume()
        })
          .to({ volume: 0 }, 2000)
          .onUpdate(function () {
            self.track.setVolume(this.volume);
          })
          .onComplete(function () {
            self.moveToHappyYPos();
          })
          .start();
      } else {
        tweenEmissive('bodyMesh', this.bodyMesh.material, 0, 3000 + this.wakeRand, 'in');
        var self = this;
        new TWEEN.Tween(this.position).to({
          x: this.pos.x,
          z: this.pos.z
        }, 5000)
          .easing(TWEEN.Easing.Circular.Out)
          .onComplete(function () {
            self.fadeToScary();
          })
          .start();
        new TWEEN.Tween(this.position).to({
          y: this.scaryYpos
        }, 3000)
          .start();
      }
  }
};

Creature.prototype.moveToHappyYPos = function () {
  this.mouth.scale.y = 8;
  this.mouth.scale.x = 1;
  var self = this;
  var sunPos = new THREE.Vector3().setFromMatrixPosition(this.sun.matrixWorld).sub(this.parent.position);
  new TWEEN.Tween(this.position).to({
    y: this.happyYpos
  }, 3000)
    .onComplete(function () {
      self.hasReactCreature = true;
      self.body.lookAt(sunPos);
    })
    .start();

};
Creature.prototype.elevationStarted = function () {
  this.isElevationStarted = true;
  tweenEmissive('bodyMesh', this.bodyMesh.material, 1, 8000 + this.wakeRand, 'in');
  var self = this;
  if (State.get('endMode') === 1) {
    this.endYpos = 4.9;
  }
  new TWEEN.Tween(this.position).to({
    y: this.endYpos
  }, 25000)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .onComplete(function () {
      self.tweenToEndPosition = true;
    })
    .start();
};

Creature.prototype.fadeToScary = function () {
  this.activateOnReaction();
  this.hasReactCreature = true;

};

Creature.prototype.activateOnReaction = function () {
  this.isActive = true;
  tweenEmissive('mouth', this.mouth.mesh.material, 1, 500 + this.wakeRand, 'in');
  tweenEmissive('leftEye', this.eyes.left.eyeball.material, 1, 500 + this.wakeRand, 'in');
  tweenEmissive('rightEye', this.eyes.right.eyeball.material, 1, 500 + this.wakeRand, 'in');
  var self = this;
  // new TWEEN.Tween(this.ring.material).to({
  //   opacity: 0
  // }, 1500)
  //   .onComplete(function () {
  //     self.ring.visible = false;
  //   })
  //   .easing(TWEEN.Easing.Cubic.Out)
  //   .start();
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

// Creature.prototype.setVolumeRing = function () {
//   var index = Math.floor(THREE.Math.mapLinear(Math.min(1, this.track.getVolume()), 0, 1, 0, this.ringSides));
//   if (index !== this.ringIndex) {
//     this.ringIndex = index;
//     var sides = index;
//     var thetaLength = Math.PI * 2 / this.ringSides * sides;
//     this.ring.geometry.dispose();
//     this.ring.geometry = new THREE.CircleGeometry(1, sides, Math.PI, thetaLength);
//     this.ring.geometry.vertices.shift();
//   }
// };

Creature.prototype.activeCreatureChanged = function (side, creature) {
  if (State.get('stage') !== 'experience' || this.status === 'asleep') {
    return;
  }
  if (creature === this) {
    if (!this.isActiveByHandR && !this.isActiveByHandL) {
      if (side === 'R') {
        this.isActiveByHandR = true;
      } else {
        this.isActiveByHandL = true;
      }
      new TWEEN.Tween(this.ring.material).to({
        opacity: 0.5
      }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    }
  } else {
    if (side === 'R') {
      this.isActiveByHandR = false;
    } else {
      this.isActiveByHandL = false;
    }
  }
  if (!this.isActiveByHandR && !this.isActiveByHandL) {
    new TWEEN.Tween(this.ring.material).to({
      opacity: 0
    }, 500)
      .easing(TWEEN.Easing.Cubic.In)
      .start();
  }
};

module.exports = Creature;
