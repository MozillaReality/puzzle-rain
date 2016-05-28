'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var BlendCharacter = require('../animation/BlendCharacter');
var THREE = require('three');

var ControlVolume = require('../behaviours/ControlVolume');

var ActiveGroupHandler = require('../behaviours/ActiveGroupHandler');

var HandLight = require('./HandLight');
var Magic = require('./Magic');

var vrDisplay;
var movementOnPress = 0.01;

function Gamepad (hand) {
  THREE.Object3D.call(this);

  vrDisplay = State.get('vrDisplay');

  this.gamepadVive;
  this.standingMatrix = new THREE.Matrix4();
  this.lastPressed = false;

  this.handlerNear;

  var controlVolume = new ControlVolume(this);

  this.mesh = new THREE.BlendCharacter();

  this.side = hand;
  this.myName = 'hand' + this.side;
  var self = this;
  this.mesh.load('models/hand' + this.side + '.json', function () {
    State.add('gamepad' + self.side, self);
    Events.emit('gamepad' + self.side + 'Added');
    Events.on('updateScene', self.update.bind(self));
    self.mesh.castShadow = true;
    self.mesh.receiveShadow = true;
    self.mesh.material.shading = THREE.FlatShading;
    self.mesh.geometry.computeBoundingBox();
    var boxX = self.mesh.geometry.boundingBox.max.x - self.mesh.geometry.boundingBox.min.x;
    var boxY = self.mesh.geometry.boundingBox.max.y - self.mesh.geometry.boundingBox.min.y;
    var boxZ = self.mesh.geometry.boundingBox.max.z - self.mesh.geometry.boundingBox.min.z;
    self.myBoundingPlane = new THREE.Mesh(new THREE.PlaneGeometry(boxX * 0.7, boxZ * 0.7), new THREE.MeshBasicMaterial({ color: 0xffff00, depthTest: false, transparent: true, opacity: 0 }));
    self.myBoundingPlane.geometry.rotateX(- Math.PI / 2);
    self.add(self.myBoundingPlane);
    self.add(self.mesh);

    self.ActiveGroupHandler = new ActiveGroupHandler(self);
    self.addLight();
    self.addMagic();

    if (!vrDisplay) {
      Events.on('move', self.move.bind(self));
      Events.on('trigger', self.trigger.bind(self));
    }
    Events.on('activeRaceChanged', self.activeRaceChanged.bind(self));
    Events.on('collided', self.collided.bind(self));
    Events.on('activeHandlerDispatch', self.activeHandlerDispatch.bind(self));
  });
}

Gamepad.prototype = Object.create(THREE.Object3D.prototype);

Gamepad.prototype.update = function (delta) {
  this.mesh.update(delta);
  if (vrDisplay) {
    this.manageViveGamepad();
  }
};

Gamepad.prototype.activeRaceChanged = function (side, race) {
  if (this.side === side) {
    this.activeRace = race;
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
    if (isPressed !== this.lastPressed) {
      this.lastPressed = isPressed;
      this.playAnimation('close', isPressed);
    }
  }
};

Gamepad.prototype.collided = function (side, name) {
  if (side === this.side && this.gamepadVive && 'vibrate' in this.gamepadVive) {
    this.gamepadVive.vibrate(10);
    this.lastCollided = name;
  }
};

Gamepad.prototype.activeHandlerDispatch = function (side, obj) {
  if (side === this.side) {
    this.handlerNear = obj;
  }
};

Gamepad.prototype.playAnimation = function (animation, isPressed) {
  var timeScale = -1;
  if (isPressed) {
    timeScale = 1;
  }

  this.mesh.mixer.clipAction(animation).loop = 2200;
  this.mesh.mixer.clipAction(animation).clampWhenFinished = true;
  this.mesh.mixer.clipAction(animation).timeScale = timeScale;
  this.mesh.play(animation, 1);
  if (animation === 'close') {
    if (this.handlerNear) {
      if (isPressed) {
        this.grabHandler();
      } else {
        this.dropHandler();
      }
    } else {
      Events.emit('gamepadAnimation', this.side, animation, isPressed);
      this.dropHandler();
    }
  }
};

Gamepad.prototype.grabHandler = function () {
  this.mesh.visible = false;
  this.isGrabbed = true;
  this.whoIsGrabbed = this.handlerNear;
  Events.emit('grabbed', this.side, this.handlerNear);
  if (vrDisplay) {
    if ('vibrate' in this.gamepadVive) {
      this.gamepadVive.vibrate(10);
    }
  }
};

Gamepad.prototype.dropHandler = function () {
  this.mesh.visible = true;
  this.isGrabbed = false;
  Events.emit('dropped', this.whoIsGrabbed);
  Events.emit('activeHandlerDispatch', this.side, null);
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
  if (hand === this.side) {
    this.lastPressed = isPressed;
    this.playAnimation('close', isPressed);
  }
};
// END Only for control with Keys the NON VR controllers/hands

Gamepad.prototype.addLight = function () {
  var geometry = new THREE.SphereBufferGeometry(0.01, 2, 2);
  var material = new THREE.MeshBasicMaterial({color: 0xffff00});
  this.dummyLight = new THREE.Mesh(geometry, material);
  this.dummyLight.position.y = -100;
  this.add(this.dummyLight);

  this.light = new HandLight(this);
  this.add(this.light);
};

Gamepad.prototype.addMagic = function () {
  this.magic = new Magic(this);
  this.scene = State.get('scene');
  this.scene.add(this.magic);
};

module.exports = Gamepad;
