'use strict';

var THREE = require('three');
var TWEEN = require('tween.js');

var Events = require('../../events/Events');
var State = require('../../state/State');
var settings = require('../../settings');

var AudioManager = require('../audio/AudioManager');

var Dot = require('./Dot');

function BigRing () {
  THREE.Object3D.call(this);

  this.linesArr = new THREE.Group();
  this.add(this.linesArr);
  this.lineTrack = new AudioManager('effects/line', false, this, false, false);
  this.trackAtEnd01 = new AudioManager('effects/atEnd01', false, this, false, false);
  this.allCreatures = State.get('allCreatures');

  this.addDots();

  Events.on('placed', this.placed.bind(this));
  Events.on('stageChanged', this.stageChanged.bind(this));
}

BigRing.prototype = Object.create(THREE.Object3D.prototype);

BigRing.prototype.addDots = function () {
  this.arrDots = [];
  for (var i = 0;i < this.allCreatures.length; i++) {
    var dot = new Dot(this.allCreatures[i]);
    dot.position.set(this.allCreatures[i].dotPos.x, this.allCreatures[i].dotPos.y, this.allCreatures[i].dotPos.z);
    this.arrDots.push(dot);
    this.add(dot);
  }

};

BigRing.prototype.placed = function (side, obj) {
  var indexPlaced = -1;
  for (var i = 0;i < this.arrDots.length; i++) {
    if (obj === this.arrDots[i].creature) {
      indexPlaced = i;
    }
  }
  if (indexPlaced !== -1) {
    var prevIsPlaced = false;
    var prevObj;
    if (indexPlaced > 0) {
      prevObj = this.arrDots[indexPlaced - 1];
      prevIsPlaced = this.arrDots[indexPlaced - 1].isPlaced;
    } else {
      prevObj = this.arrDots[this.arrDots.length - 1];
      prevIsPlaced = this.arrDots[this.arrDots.length - 1].isPlaced;
    }

    var nextIsPlaced = false;
    var nextObj;
    if (indexPlaced > this.arrDots.length - 2) {
      nextObj = this.arrDots[0];
      nextIsPlaced = this.arrDots[0].isPlaced;
    } else {
      nextObj = this.arrDots[indexPlaced + 1];
      nextIsPlaced = this.arrDots[indexPlaced + 1].isPlaced;
    }

    if (prevIsPlaced) {
      this.drawLine(obj.dotPos, prevObj.creature.dotPos);
    }
    if (nextIsPlaced) {
      this.drawLine(obj.dotPos, nextObj.creature.dotPos);
    }
  }
};

BigRing.prototype.drawLine = function (pos1, pos2) {
  var geometry = new THREE.Geometry();
  geometry.vertices.push(pos1);
  geometry.vertices.push(pos2);

  this.lineTrack.play();

  var material = new THREE.LineDashedMaterial({
    color: 0xffffff,
    dashSize: 0, gapSize: 0.01,
    transparent: true,
    opacity: 0
  });
  geometry.computeLineDistances();
  var line = new THREE.Line(geometry, material);
  // this.add(line);
  this.linesArr.add(line);

  var self = this;
  new TWEEN.Tween(line.material).to({
    dashSize: 0.01,
    gapSize: 0.05,
    opacity: 1
  }, 1500)
    .easing(TWEEN.Easing.Cubic.Out)
    .onComplete(function () {
      self.lineToHide = line;
      self.semiHideLine();
    })
    .start();

  if (this.linesArr.children.length === 12) {
    setTimeout(function () {
      self.prepareForHappyEnd();
    }, 5000);
    setTimeout(function () {
      self.trackAtEnd01.play();
    }, 3500);

  }
};

BigRing.prototype.prepareForHappyEnd = function () {
  Events.emit('preparingForHappyEnd');
  var self = this;
  for (var i = 0; i < this.linesArr.children.length; i++) {
    new TWEEN.Tween(this.linesArr.children[i].material).to({
      gapSize: 0,
      opacity: 0
    }, 2000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  }
  setTimeout(function () {
    self.dispatchEnd();
  }, 2000);
};

BigRing.prototype.dispatchEnd = function () {
  Events.emit('dispatchEnding', 1);
};

BigRing.prototype.semiHideLine = function () {
  new TWEEN.Tween(this.lineToHide.material).to({
    dashSize: 0.005,
    gapSize: 0.01,
    opacity: 0.1
  }, 2000)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
};
BigRing.prototype.stageChanged = function (newStage) {
  if (newStage === 'ending') {
    if (State.get('endMode') === 2) {
      this.hideAll();
    } else {
      var self = this;
      for (var i = 0; i < this.arrDots.length; i++) {
        new TWEEN.Tween(this.arrDots[i].scale).to({
          x: 0.01,
          y: 0.01,
          z: 0.01
        }, 1000)
          .easing(TWEEN.Easing.Cubic.In)
          .start();
      }
      new TWEEN.Tween(this.position).to({
        y: -1
      }, 3000)
        .delay(2000)
        .onComplete(function () {
          self.hideAll();
        })
        .start();
    }
  }
};

BigRing.prototype.hideAll = function () {
  for (var i = 0; i < this.linesArr.length; i++) {
    new TWEEN.Tween(this.linesArr[i].material).to({
      opacity: 0
    }, 1000)
      .easing(TWEEN.Easing.Cubic.In)
      .start();
  }
  var self = this;
  for (var i = 0; i < this.arrDots.length; i++) {
    new TWEEN.Tween(this.arrDots[i].ring.material).to({
      opacity: 0
    }, 1000)
      .easing(TWEEN.Easing.Cubic.In)
      .onComplete(function () {
        self.remove();
      })
      .start();
  }
};
BigRing.prototype.remove = function () {
  this.visible = false;
};

module.exports = BigRing;
