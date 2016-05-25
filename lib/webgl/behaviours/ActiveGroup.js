'use strict';

var Events = require('../../events/Events');
var State = require('../../state/State');
var THREE = require('three');

function ActiveGroup () {
  this.groupsArr = [];
  Events.on('updateScene', this.update.bind(this));
}

ActiveGroup.prototype.update = function () {
  this.getActiveGroup();
};

ActiveGroup.prototype.getActiveGroup = function () {
  for (var i = 0; i < this.groupsArr.length;i++) {
  }
};

module.exports = ActiveGroup;
