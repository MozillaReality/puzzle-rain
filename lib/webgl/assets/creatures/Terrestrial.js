'use strict';

var Creature = require('../Creature');

function Terrestrial (pos, scale) {
  Creature.call(this, 'terrestrial', pos, scale);

}

Terrestrial.prototype = Object.create(Creature.prototype);

module.exports = Terrestrial;
