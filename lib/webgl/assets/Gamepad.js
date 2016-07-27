'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var BlendCharacter = require('../animation/BlendCharacter');

var ControlVolume = require('../behaviours/ControlVolume');

// var ActiveCreature = require('../behaviours/ActiveCreature');
var CollideCreature = require('../behaviours/CollideCreature');

var CollideIntroBall = require('../behaviours/CollideIntroBall');

var AudioManager = require('../audio/AudioManager');

var vrDisplay;
var movementOnPress = 0.01;

function Gamepad (hand) {
  THREE.Object3D.call(this);

  vrDisplay = State.get('vrDisplay');

  this.gamepadVive;
  this.standingMatrix = new THREE.Matrix4();
  this.lastPressed = false;
  this.lastButton2Pressed = false;

  this.active = false;
  this.isOver = false;
  this.whoIsGrabbed = '';

  this.allowReload = false;

  // this.errorTrack = new AudioManager('effects/error', true, this, false, false);

  var controlVolume = new ControlVolume(this);

  this.mesh = new THREE.BlendCharacter();

  this.side = hand;
  this.myName = 'hand' + this.side;
  var self = this;
  this.mesh.load('models/hand' + this.side + '.json', function () {
    Events.emit('gamepad' + self.side + 'Added');
    Events.on('updateScene', self.update.bind(self));
    self.mesh.material = new THREE.MeshStandardMaterial({
      color: settings.offColor,
      roughness: 0.5,
      metalness: 0,
      emissive: settings.offColor,
      emissiveIntensity: 0,
      // shading: THREE.FlatShading,
      transparent: true,
      skinning: true
    });
    self.mesh.castShadow = true;
    self.mesh.receiveShadow = false;
    self.add(self.mesh);

    self.collideIntroBall = new CollideIntroBall(self);

    // self.activeCreature = new ActiveCreature(self);
    self.collideCreature = new CollideCreature(self);

    if (!vrDisplay) {
      Events.on('move', self.move.bind(self));
      Events.on('trigger', self.trigger.bind(self));
    }

    Events.on('grabbed', self.grabbed.bind(self));
    Events.on('placed', self.placed.bind(self));

    Events.on('activeRaceChanged', self.activeRaceChanged.bind(self));
    Events.on('introBallCollided', self.introBallCollided.bind(self));
    Events.on('introBallStarted', self.introBallStarted.bind(self));
    Events.on('introBallCatched', self.introBallCatched.bind(self));
    Events.on('stageChanged', self.stageChanged.bind(self));
    Events.on('readyToReload', self.readyToReload.bind(self));

    Events.on('creatureCollided', self.creatureCollided.bind(self));

    Events.on('gamepadOn', self.gamepadOn.bind(self));
    Events.on('gamepadOff', self.gamepadOff.bind(self));

    if (settings.debugMode) {
      self.introBallCatched();
    }
  });
}

Gamepad.prototype = Object.create(THREE.Object3D.prototype);

Gamepad.prototype.update = function (delta) {
  this.mesh.update(delta);
  if (vrDisplay) {
    this.manageViveGamepad();
  }
  if (State.get('stage') === 'experience') {
    if (this.whoIsGrabbed === '') {
      if (Math.abs(this.position.x) > 0.75 || Math.abs(this.position.z) > 0.75) {
        if (this.active) {
          // this.errorTrack.play();
          Events.emit('gamepadOff', this.side);
        }
      } else {
        if (!this.active) {
          Events.emit('gamepadOn', this.side);
        }
      }
    }
  }
};

Gamepad.prototype.introBallCollided = function (side) {
  if (this.gamepadVive && 'vibrate' in this.gamepadVive && this.side === side) {
    this.gamepadVive.vibrate(50);
  }
};

Gamepad.prototype.readyToReload = function () {
  this.allowReload = true;
};

Gamepad.prototype.introBallStarted = function (delta) {
  var self = this;
  new TWEEN.Tween(this.mesh.material).to({
    emissiveIntensity: 2
  }, 3200)
    .easing(TWEEN.Easing.Circular.In)
    .start();
};

Gamepad.prototype.introBallCatched = function () {
  this.mesh.material.color = new THREE.Color(0xffffff);
  this.mesh.material.emissive = new THREE.Color(0xffffff);
  if (this.gamepadVive && 'vibrate' in this.gamepadVive) {
    this.gamepadVive.vibrate(500);
  }
  this.gamepadOn(this.side);
};

Gamepad.prototype.gamepadOn = function (side) {
  if (this.side === side) {
    if (!this.active) {
      this.active = true;
      TWEEN.remove(this.tweenEmissiveOff);
      this.tweenEmissiveOn = new TWEEN.Tween(this.mesh.material).to({
        emissiveIntensity: 0.35,
      }, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
      this.mesh.material.color = new THREE.Color(0xffffff);
    }
  }
};

Gamepad.prototype.gamepadOff = function (side) {
  if (this.side === side) {
    if (this.active) {
      this.active = false;
      TWEEN.remove(this.tweenEmissiveOn);
      this.tweenEmissiveOff = new TWEEN.Tween(this.mesh.material).to({
        emissiveIntensity: 0,
      }, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
      this.mesh.material.color = new THREE.Color(settings.offColor);
    }
  }
};

Gamepad.prototype.stageChanged = function (newStage) {
  switch (newStage) {
    case 'ending':
      if (this.gamepadVive && 'vibrate' in this.gamepadVive) {
        this.gamepadVive.vibrate([10, 100, 15, 100, 20, 100, 25, 100, 30, 100]);
      }
      this.dropHandler();
      break;
  }
};

Gamepad.prototype.activeRaceChanged = function (side, race) {
  if (this.side === side) {
    this.influencedRace = race;
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
  if (settings.spectatorMode) {
    if (buttonId === 2) {
      if (isPressed && isPressed !== this.lastButton2Pressed) {
        Events.emit('nextCamera');
      }
      this.lastButton2Pressed = isPressed;
    }
  }

  if (this.allowReload && State.get('endMode') === 2 && isPressed) {
    this.allowReload = false;
    if (settings.spectatorMode) {
      location.replace('?mode=spectator');
    } else {
      location.replace('?mode=normal');
    }
  }
};

Gamepad.prototype.playAnimation = function (animation, isPressed) {
  var timeScale = -1;
  if (isPressed) {
    timeScale = 1;
  }
  this.mesh.stopAll();
  this.mesh.mixer.clipAction(animation).repetitions = 0;
  this.mesh.mixer.clipAction(animation).clampWhenFinished = true;
  this.mesh.mixer.clipAction(animation).timeScale = timeScale;
  this.mesh.play(animation, 1);
  if (animation === 'close') {
    if (this.whoIsGrabbed !== '') {
      // if (isPressed) {
      this.dropHandler();
    // }
    }
    Events.emit('gamepadAnimation', this.side, animation, isPressed);
  }
};

Gamepad.prototype.grabbed = function (side, obj) {
  if (side === this.side) {
    this.mesh.visible = false;
    this.whoIsGrabbed = obj;
    Events.emit('gamepadOff', this.side);
    if (vrDisplay) {
      if ('vibrate' in this.gamepadVive) {
        this.gamepadVive.vibrate(10);
      }
    }
  }
};

Gamepad.prototype.placed = function (side, obj) {
  if (side === this.side) {
    this.dropHandler();
  }
};

Gamepad.prototype.dropHandler = function () {
  if (this.whoIsGrabbed !== '') {
    Events.emit('dropped', this.whoIsGrabbed);
    this.whoIsGrabbed = '';
    var self = this;
    setTimeout(function () {
      self.afterDrop();
    }, 1000);
  }
  self.mesh.material.opacity = 0.4;
  this.mesh.visible = true;
};

Gamepad.prototype.afterDrop = function () {
  Events.emit('gamepadOn', this.side);
  this.mesh.material.opacity = 1;
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
        this.rotation.x += movementOnPress * 2;
        break;
      case 'rotateDown':
        this.rotation.x -= movementOnPress * 2;
        break;
      case 'rotateLeft':
        this.rotation.z -= movementOnPress * 2;
        break;
      case 'rotateRight':
        this.rotation.z += movementOnPress * 2;
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

Gamepad.prototype.creatureCollided = function (side, creature) {
  if (State.get('stage') !== 'experience') {
    return;
  }
  if (side === this.side) {
    // console.log(creature);
    if (creature === null) {
      this.mesh.material.opacity = 1;
      this.isOver = false;
    } else {
      this.mesh.material.opacity = 0.4;
      this.isOver = true;
    }
  }
};
module.exports = Gamepad;
