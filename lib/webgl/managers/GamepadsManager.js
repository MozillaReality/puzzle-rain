'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');

var THREE = require('three');

var Gamepad = require('../assets/Gamepad');

var standingMatrix = new THREE.Matrix4();
var animationActiveR = 'close',
  animationActiveL = 'close',
  button0Lpressed = false,
  button2Lpressed = false,
  button3Lpressed = false,
  button0Rpressed = false,
  button2Rpressed = false,
  button3Rpressed = false;

var vrDisplay, gamepadR, gamepadL;

var timeScale;

var movementOnPress = 0.01;

function GamepadsManager (scene) {
  vrDisplay = State.get('vrDisplay');
  gamepadR = new Gamepad(0);
  var self = this;
  Events.on('gamepadRLoaded', function () {
    gamepadR.castShadow = true;
    gamepadR.receiveShadow = true;
    gamepadR.material.shading = THREE.FlatShading;
    State.add('gamepadR', gamepadR);
    scene.add(gamepadR);
    gamepadL = new Gamepad(1);
  });
  Events.on('gamepadLLoaded', function () {
    gamepadL.castShadow = true;
    gamepadL.receiveShadow = true;
    gamepadL.material.shading = THREE.FlatShading;
    State.add('gamepadL', gamepadL);
    scene.add(gamepadL);
    Events.emit('gamepadsLoaded');
    Events.on('updateScene', update);
    if (!vrDisplay) {
      Events.on('move', move.bind(self));
      Events.on('trigger', trigger.bind(self));
    }
  });

}

function update (delta) {
  if (!vrDisplay) {
    return;
  }
  var gamepads = navigator.getGamepads();

  for ( var i = 0; i < gamepads.length; ++i) {
    var gamepad = gamepads[ i ];
    if (gamepad && gamepad.pose) {
      var hand;
      if (i === 0) {
        hand = gamepadR;

      } else if (i === 1) {
        hand = gamepadL;

      } else {
        // Extra controllers are not managed
        return;
      }
      updateGamepadPose(hand, gamepad.pose);
      for ( var j = 0; j < gamepad.buttons.length; ++j) {
        if (gamepad.buttons[ j ].pressed) {
          manageButtons(i, j, gamepad.buttons[ j ].value, gamepad.buttons[ j ].pressed);
        } else {
          manageButtons(i, j, gamepad.buttons[ j ].value, gamepad.buttons[ j ].pressed);
        }
      }
    }
  }
}

function updateGamepadPose (pad, pose) {
  pad.quaternion.fromArray(pose.orientation);
  pad.position.fromArray(pose.position);
  if (vrDisplay && vrDisplay.stageParameters) {
    pad.updateMatrix();
    standingMatrix.fromArray(vrDisplay.stageParameters.sittingToStandingTransform);
    pad.applyMatrix(standingMatrix);
    // pad.geometry.computeFaceNormals();
    pad.geometry.computeVertexNormals();
  }
}

function manageButtons (handId, buttonId, intensity, pressed) {
  if (buttonId !== 0 && buttonId !== 2 && buttonId !== 3) {
    return;

  }
  // console.log(handId, buttonId, intensity, pressed);

  // handId
  // 0 - right
  // 1 - left

  // buttonId
  // 0 - trackpad
  // 1 - system ( never dispatched on this layer )
  // 2 - trigger ( intensity value from 0.5 to 1 )
  // 3 - grip
  // 4 - menu ( dispatch but better for menu options )

  // animations for each buttonId
  // close - trigger
  // rock - grip
  // thumb - trackpad
  var button0pressed;
  var button2pressed;
  var button3pressed;
  if (handId === 0) {
    button0pressed = button0Rpressed;
    button2pressed = button2Rpressed;
    button3pressed = button3Rpressed;

  } else {
    button0pressed = button0Lpressed;
    button2pressed = button2Lpressed;
    button3pressed = button3Lpressed;

  }
  var animation;
  switch ( buttonId ) {
    case 0:
      if (button0pressed === pressed) {
        return;
      }
      if (handId === 0) {
        button0Rpressed = pressed;
      } else {
        button0Lpressed = pressed;
      }
      animation = 'thumb';
      break;
    case 2:
      if (button2pressed === pressed) {
        return;
      }
      if (handId === 0) {
        button2Rpressed = pressed;
      } else {
        button2Lpressed = pressed;
      }
      animation = 'close';
      break;
    case 3:
      if (button3pressed === pressed) {
        return;
      }
      if (handId === 0) {
        button3Rpressed = pressed;
      } else {
        button3Lpressed = pressed;
      }
      animation = 'rock';
      break;
  }

  timeScale = - 1;
  if (pressed) {
    timeScale = 1;
  }
  if (animation) {
    playOnce(handId, animation, timeScale);
  }

}

function move (dir, hand) {
  // TODO fix this awful code
  var activeHand = gamepadR;
  if (hand === 1) {
    activeHand = gamepadL;
  }
  switch (dir) {
    case 'left':
      activeHand.position.x -= movementOnPress;
      break;
    case 'right':
      activeHand.position.x += movementOnPress;
      break;
    case 'forward':
      activeHand.position.z -= movementOnPress;
      break;
    case 'backwards':
      activeHand.position.z += movementOnPress;
      break;
    case 'up':
      activeHand.position.y += movementOnPress;
      break;
    case 'down':
      activeHand.position.y -= movementOnPress;
      break;
    default:

  }

}

function trigger (hand, bool) {
  if (bool) {
    timeScale = 1;
  } else {
    timeScale = -1;
  }
  playOnce(hand, 'close', timeScale);
}

function playOnce (hand, animation, timeScale) {
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
  if (!vrDisplay) {
    return;
  }
  if (animation === 'close') {
    if (timeScale === 1) {
      if (hand === 0) {
        Events.emit('trigger', 'handL', true);
      } else {
        Events.emit('trigger', 'handR', true);
      }
    } else {
      if (hand === 0) {
        Events.emit('trigger', 'handL', false);
      } else {
        Events.emit('trigger', 'handR', false);
      }
    }

  }

}

module.exports = GamepadsManager;
