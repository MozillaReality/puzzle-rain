'use strict';

var Events = require('../../events/Events');
var THREE = require('three');

var myCanvas, renderer;

function RaceStats () {
  var material = new THREE.SpriteMaterial(
    {
      depthTest: false,
      side: THREE.DoubleSide,
      transparent: true
    }
  );

  this.status = 'asleep';
  this.awake = 0;
  this.happy = 0.5;
  this.upset = 0.5;

  myCanvas = document.createElement('canvas');
  myCanvas.width = 256;
  myCanvas.height = 256;
  this.sprite = new THREE.Sprite(material);
  Events.on('updateScene', update.bind(this));
}

function update () {
  var context = myCanvas.getContext('2d');
  context.clearRect(0, 0, myCanvas.width, myCanvas.height);
  context.font = '12px Helvetica';
  context.fillStyle = 'white';
  context.fillText('status: ' + this.status, 20, 10);
  context.fillText('awake: ' + this.awake, 20, 30);
  context.fillText('happy: ' + this.happy, 20, 50);
  context.fillText('upset: ' + this.upset, 20, 70);
  var textureRaceStats = new THREE.Texture(myCanvas);
  textureRaceStats.minFilter = THREE.LinearFilter;
  textureRaceStats.needsUpdate = true;
  this.sprite.material.map = textureRaceStats;

}

module.exports = RaceStats;
