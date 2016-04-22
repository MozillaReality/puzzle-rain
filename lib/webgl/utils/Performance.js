'use strict';

var Events = require('../../events/Events');
var THREE = require('three');

var myCanvas, renderer;

function Performance () {
}

Performance.prototype.init = function (myRenderer) {
  this.prevTime = Date.now();
  this.fps = 0;
  this.frames = 0;

  renderer = myRenderer;
  var material = new THREE.SpriteMaterial(
    {
      depthTest: false,
      side: THREE.DoubleSide,
      transparent: true
    }
  );
  myCanvas = document.createElement('canvas');
  myCanvas.width = 256;
  myCanvas.height = 256;
  this.sprite = new THREE.Sprite(material);
  Events.on('updateScene', update.bind(this));
};

function update () {
  var time = Date.now();
  this.frames++;
  if (time > this.prevTime + 1000) {
    this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
    // console.log(this.fps);
    this.prevTime = time;
    this.frames = 0;
  }

  var context = myCanvas.getContext('2d');
  context.clearRect(0, 0, myCanvas.width, myCanvas.height);
  context.font = '14px Helvetica';
  context.fillStyle = 'white';
  context.fillText('Drawcalls: ' + renderer.info.render.calls, 20, 20);
  context.fillText('FPS: ' + this.fps, 20, 40);
  var texturePerformance = new THREE.Texture(myCanvas);
  texturePerformance.minFilter = THREE.LinearFilter;
  texturePerformance.needsUpdate = true;
  this.sprite.material.map = texturePerformance;

// webGLRenderer.info.memory.programs;
// 	msTexts[i++].textContent = "Geom: "+webGLRenderer.info.memory.geometries;
// 	msTexts[i++].textContent = "Text: "	+ webGLRenderer.info.memory.textures;
// 	msTexts[i++].textContent = "Calls: "	+ webGLRenderer.info.render.calls;
// 	msTexts[i++].textContent = "Vert: "	+ webGLRenderer.info.render.vertices;
// 	msTexts[i++].textContent = "Fac: "	+ webGLRenderer.info.render.faces;
// 	msTexts[i++].textContent = "Pts: "	+ webGLRenderer.info.render.points;
}

module.exports = new Performance();
