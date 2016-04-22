'use strict';

var Creature = require('../Creature');

function Bouncer (pos, scale) {
  Creature.call(this, 'bouncer', pos, scale);

}

Bouncer.prototype = Object.create(Creature.prototype);

module.exports = Bouncer;
