'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var BlendCharacter = require('../animation/BlendCharacter');
var THREE = require('three');

var ActiveRaceArea = require('../behaviours/ActiveRaceArea');
var Collider = require('../behaviours/Collider');
var ControlVolume = require('../behaviours/ControlVolume');

var HandLight = require('./HandLight');
var Magic = require('./Magic');

var vrDisplay;
var movementOnPress = 0.01;

function Gamepad (hand) {
  THREE.Object3D.call(this);

  vrDisplay = State.get('vrDisplay');

  this.scene = State.get('scene');

  this.gamepadVive;
  this.standingMatrix = new THREE.Matrix4();
  this.trackpadPressed = false;
  this.triggerPressed = false;
  this.animationActive = 'close';

  var activeRaceArea = new ActiveRaceArea(this);

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
    self.myBoundingPlane = new THREE.Mesh(new THREE.PlaneGeometry(boxX * 0.7, boxZ * 0.7), new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
    self.myBoundingPlane.geometry.rotateX(- Math.PI / 2);
    self.add(self.myBoundingPlane);
    if (settings.debugHelpers) {
      self.myBoundingPlane.material.opacity = 1;
    }
    self.add(self.mesh);

    self.collider = new Collider(self);
    self.addHandLight();
    self.addMagic();

    if (!vrDisplay) {
      Events.on('move', self.move.bind(self));
      Events.on('triggerKeyPressed', self.triggerKeyPressed.bind(self));
      Events.on('trackpadKeyPressed', self.trackpadKeyPressed.bind(self));
    }
    Events.on('activeRaceChanged', self.activeRaceChanged.bind(self));
    Events.on('collided', self.collided.bind(self));
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
  if (buttonId === 0) {
    if (isPressed !== this.trackpadPressed) {
      // Vibrate once per click
      if ('vibrate' in this.gamepadVive && isPressed) {
        // this.gamepadVive.vibrate([10, 100, 15, 100, 20, 100, 25, 100, 30, 100]);
      }
      this.trackpadPressed = isPressed;
      this.playAnimation('close', isPressed);
    }
  }
  if (buttonId === 1) {
    if (isPressed !== this.triggerPressed) {
      this.triggerPressed = isPressed;
      this.playAnimation('pointing', isPressed);
    }
  }
};

Gamepad.prototype.collided = function (side, name) {
  // if (side === this.side && name !== this.lastCollided && this.gamepadVive && 'vibrate' in this.gamepadVive) {
  if (side === this.side && this.gamepadVive && 'vibrate' in this.gamepadVive) {
    this.gamepadVive.vibrate(10);
    this.lastCollided = name;
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
  this.mesh.play(this.animationActive, 0);
  this.mesh.play(animation, 1);
  Events.emit('gamepadAnimation', this.side, animation, isPressed);
  this.animationActive = animation;
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

Gamepad.prototype.triggerKeyPressed = function (hand, isPressed) {
  // console.log(hand, isPressed);
  if (hand === this.side) {
    this.playAnimation('pointing', isPressed);
  }
};

Gamepad.prototype.trackpadKeyPressed = function (hand, isPressed) {
  if (hand === this.side) {
    this.playAnimation('close', isPressed);
  }
};
// END Only for control with Keys the NON VR controllers/hands

Gamepad.prototype.addHandLight = function () {
  var geometry = new THREE.SphereBufferGeometry(0.01, 2, 2);
  var material = new THREE.MeshBasicMaterial({color: 0xffff00});
  // To be target of HandLight Spotlight
  this.dummyLight = new THREE.Mesh(geometry, material);
  this.dummyLight.position.y = -100;
  this.add(this.dummyLight);

  this.handLight = new HandLight(this);
  this.add(this.handLight);
};

Gamepad.prototype.addMagic = function () {
  this.magic = new Magic(this);
  this.scene.add(this.magic);
};

module.exports = Gamepad;
