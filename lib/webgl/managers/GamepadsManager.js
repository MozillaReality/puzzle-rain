'use strict';

const Events = require('../../events/Events');
const State = require('../../state/State');
const THREE = require('three');

const GamepadR = require('../assets/GamepadR');
const GamepadL = require('../assets/GamepadL');

const standingMatrix = new THREE.Matrix4();
let animationActiveR = 'rock',
  animationActiveL = 'rock',
  button0Lpressed = false,
  button2Lpressed = false,
  button3Lpressed = false,
  button0Rpressed = false,
  button2Rpressed = false,
  button3Rpressed = false;

let vrDisplay, gamepadR, gamepadL;

function GamepadsManager (scene, world, display) {
  vrDisplay = display;

  gamepadR = new GamepadR();
  Events.on('gamepadRLoaded', function () {
    gamepadR.castShadow = true;
    gamepadR.receiveShadow = true;
    gamepadR.material.shading = THREE.FlatShading;
    State.add('controllerR', gamepadR);
    world.addBody(gamepadR.body);
    scene.add(gamepadR);
    gamepadL = new GamepadL();
  });
  Events.on('gamepadLLoaded', function () {
    gamepadL.castShadow = true;
    gamepadL.receiveShadow = true;
    gamepadL.material.shading = THREE.FlatShading;
    State.add('controllerL', gamepadL);
    world.addBody(gamepadL.body);
    scene.add(gamepadL);
    Events.on('updateScene', update);
  });

}

function update (delta) {
  var gamepads = navigator.getGamepads();

  for ( var i = 0; i < gamepads.length; ++i) {
    let gamepad = gamepads[ i ];
    if (gamepad && gamepad.pose) {
      var hand;
      if (i === 0) {
        hand = gamepadR;

      } else {
        hand = gamepadL;

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
  if (vrDisplay.stageParameters) {
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

  var timeScale = - 1;
  if (pressed) {
    timeScale = 1;
  }
  if (animation) {
    playOnce(handId, animation, timeScale);
  }

}
function playOnce (hand, animation, timeScale) {
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

  if (animation === 'close') {
    if (timeScale === 1) {
      if (hand === 0) {
        Events.emit('catching', 'handL', true);
        gamepadR.body.collisionFilterGroup = CannonManager.groupGround;
      } else {
        Events.emit('catching', 'handR', true);
        gamepadL.body.collisionFilterGroup = CannonManager.groupGround;
      }
    } else {
      if (hand === 0) {
        Events.emit('catching', 'handL', false);
        gamepadR.body.collisionFilterGroup = CannonManager.groupHands;
      } else {
        Events.emit('catching', 'handR', false);
        gamepadL.body.collisionFilterGroup = CannonManager.groupHands;
      }
    }

  }

}

module.exports = GamepadsManager;
