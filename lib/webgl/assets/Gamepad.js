'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var BlendCharacter = require('../animation/BlendCharacter');
var THREE = require('three');

var ActiveRace = require('../behaviours/ActiveRace');
var Collider = require('../behaviours/Collider');

var HandLight = require('./HandLight');

var vrDisplay;
var movementOnPress = 0.01;

function Gamepad (hand) {
  THREE.Object3D.call(this);

  vrDisplay = State.get('vrDisplay');

  this.gamepadVive;
  this.standingMatrix = new THREE.Matrix4();
  this.lastPressed = false;

  this.mesh = new THREE.BlendCharacter();
  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;

  this.side = hand;
  this.myName = 'hand' + this.side;
  var self = this;
  this.mesh.load('models/hand' + this.side + '.json', function () {
    State.add('gamepad' + self.side, self);
    Events.emit('gamepad' + self.side + 'Added');
    Events.on('updateScene', self.update.bind(self));
    self.mesh.material.shading = THREE.FlatShading;
    self.mesh.geometry.computeBoundingBox();
    var boxX = self.mesh.geometry.boundingBox.max.x - self.mesh.geometry.boundingBox.min.x;
    var boxY = self.mesh.geometry.boundingBox.max.y - self.mesh.geometry.boundingBox.min.y;
    var boxZ = self.mesh.geometry.boundingBox.max.z - self.mesh.geometry.boundingBox.min.z;
    self.myBoundingPlane = new THREE.Mesh(new THREE.PlaneGeometry(boxX * 0.7, boxZ * 0.7), new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true }));
    self.myBoundingPlane.geometry.rotateX(- Math.PI / 2);
    self.add(self.myBoundingPlane);
    self.add(self.mesh);

    self.activeRace = new ActiveRace(self);
    self.collider = new Collider(self);
    self.addLight();
    if (!vrDisplay) {
      Events.on('move', self.move.bind(self));
      Events.on('trigger', self.trigger.bind(self));
    }
  });
}

Gamepad.prototype = Object.create(THREE.Object3D.prototype);

Gamepad.prototype.update = function (delta) {
  this.mesh.update(delta);
  if (vrDisplay) {
    this.manageViveGamepad();
  }
};

Gamepad.prototype.manageViveGamepad = function () {
  var gamepads = navigator.getGamepads();
  // TODO improve the logic of this method
  if (gamepads.length > 0) {
    for ( var i = 0; i < gamepads.length; ++i) {
      if (this.side === 'R') {
        this.gamepadVive = gamepads[0];
      }
      if (this.side === 'L' && gamepads[1]) {
        this.gamepadVive = gamepads[1];
      }
    }
  }
  if (this.gamepadVive && this.gamepadVive.pose) {
    this.updateGamepadPose(this.gamepadVive.pose);
    for ( var j = 0; j < this.gamepadVive.buttons.length; ++j) {
      this.manageButtons(j, this.gamepadVive.buttons[ j ].value, this.gamepadVive.buttons[ j ].pressed);
    }
  }
};

Gamepad.prototype.updateGamepadPose = function (pose) {
  this.quaternion.fromArray(pose.orientation);
  this.position.fromArray(pose.position);
  if (vrDisplay && vrDisplay.stageParameters) {
    this.updateMatrix();
    this.standingMatrix.fromArray(vrDisplay.stageParameters.sittingToStandingTransform);
    this.applyMatrix(this.standingMatrix);
  }
};

Gamepad.prototype.manageButtons = function (buttonId, intensity, isPressed) {
  // console.log(buttonId, intensity, isPressed);

  // handId
  // 0 - right
  // 1 - left

  // buttonId
  // 0 - trackpad
  // 1 - trigger ( intensity value from 0.5 to 1 )
  // 2 - grip
  // 3 - menu ( dispatch but better for menu options )
  // 4 - system ( never dispatched on this layer )

  // animations for each buttonId (now the same for all buttons)
  // close - trigger, grip & trackpad

  // Only control trigger button
  if (buttonId === 1) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
    // Contimuous vibration
    if ('vibrate' in this.gamepadVive && isPressed) {
      this.gamepadVive.vibrate(10);
    }
    if (isPressed !== this.lastPressed) {
      // Vibrate once per click
      if ('vibrate' in this.gamepadVive && isPressed) {
        // this.gamepadVive.vibrate([10, 100, 15, 100, 20, 100, 25, 100, 30, 100]);
      }
      this.lastPressed = isPressed;
      this.playAnimation('close', isPressed);
    }
  }
};

Gamepad.prototype.playAnimation = function (animation, isPressed) {
  // console.log(animation, isPressed);
  var timeScale = -1;
  if (isPressed) {
    timeScale = 1;
  }

  this.mesh.mixer.clipAction(animation).loop = 2200;
  this.mesh.mixer.clipAction(animation).clampWhenFinished = true;
  this.mesh.mixer.clipAction(animation).timeScale = timeScale;
  this.mesh.play(animation, 1);
};
// START Only for control with Keys the NON VR controllers/hands
Gamepad.prototype.move = function (hand, dir) {
  if (hand === this.side) {
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
      case 'rotateUp':
        this.rotation.x += movementOnPress;
        break;
      case 'rotateDown':
        this.rotation.x -= movementOnPress;
        break;
      default:
    }
  }
};

Gamepad.prototype.trigger = function (hand, isPressed) {
  // console.log(hand, isPressed);
  if (hand === this.side) {
    this.playAnimation('close', isPressed);
  }
};
// END Only for control with Keys the NON VR controllers/hands

Gamepad.prototype.addLight = function () {
  this.light = new HandLight(this);
  this.add(this.light);
};

module.exports = Gamepad;
