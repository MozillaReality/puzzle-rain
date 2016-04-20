'use strict';

const Events = require('../../events/Events');
const State = require('../../state/State');

const BlendCharacter = require('../animation/BlendCharacter');
const THREE = require('three');
const CANNON = require('cannon');
const CannonManager = require('../managers/CannonManager');

const movementOnPress = 0.01;
let timeScale;

function GamepadDummy (world, scene) {
  THREE.BlendCharacter.call(this);

  this.name = 'handL';
  const scope = this;
  this.load('models/handL.json', function () {
    var box = new THREE.Box3().setFromObject(scope);
    const shape = new CANNON.Box(new CANNON.Vec3(box.size().x / 2, box.size().y / 2, box.size().z / 2));
    scope.body = new CANNON.Body({
      mass: 0,
      material: CannonManager.handMaterial,
      collisionFilterGroup: CannonManager.groupHands,
      collisionFilterMask: CannonManager.groupTerrestrials | CannonManager.groupBouncers
    });
    scope.body.name = 'handL';
    scope.body.addShape(shape);
    scope.body.allowSleep = true;
    world.addBody(scope.body);

    scope.castShadow = true;
    scope.receiveShadow = true;
    scope.material.shading = THREE.FlatShading;
    scope.position.set(0, 0.5, -0.2);
    scene.add(scope);

    State.add('controllerL', scope);
    Events.on('updateScene', scope.update.bind(scope));
    Events.on('updateScene', update.bind(scope));
    Events.on('move', move.bind(scope));
    Events.on('catching', catching.bind(scope));
  });

}

function update (delta) {
  // this.rotation.z += delta * 0.3;
  this.body.position.copy(this.position);
  this.body.quaternion.copy(this.quaternion);
}

function move (dir) {
  switch (dir) {
    case 'left':
      this.position.x -= movementOnPress;
      break;
    case 'right':
      this.position.x += movementOnPress;
      break;
    case 'forward':
      this.position.z -= movementOnPress;
      break;
    case 'backwards':
      this.position.z += movementOnPress;
      break;
    case 'up':
      this.position.y += movementOnPress;
      break;
    case 'down':
      this.position.y -= movementOnPress;
      break;
    default:

  }

}

function catching (hand, bool) {
  if (bool) {
    timeScale = 1;
    this.body.collisionFilterGroup = CannonManager.groupGround;
  } else {
    timeScale = -1;
    this.body.collisionFilterGroup = CannonManager.groupHands;
  }
  this.mixer.clipAction('close').loop = 2200;
  this.mixer.clipAction('close').clampWhenFinished = true;
  this.mixer.clipAction('close').timeScale = timeScale;
  this.play('close', 0);
  this.play('close', 1);
}

function playOnce (animation, timeScale) {
  // TODO fix aramtures on blend files
  // return;
  // console.log(hand, animation, timeScale);
  var activeHand;
  var animationActive;

  if (hand === 0) {
    activeHand = gamepadR;
    animationActive = animationActiveR;
  } else {
    activeHand = gamepadL;
    animationActive = animationActiveL;
  }

  if (animation === animationActive && activeHand.mixer.clipAction(animationActive).timeScale === timeScale) {
    return;
  }
  activeHand.mixer.clipAction(animation).loop = 2200;
  activeHand.mixer.clipAction(animation).clampWhenFinished = true;
  activeHand.mixer.clipAction(animation).timeScale = timeScale;
  activeHand.play(animationActive, 0);
  activeHand.play(animation, 1);

  if (hand === 0) {
    animationActiveR = animation;
  } else {
    animationActiveL = animation;
  }

}

GamepadDummy.prototype = Object.create(THREE.BlendCharacter.prototype);

module.exports = GamepadDummy;
