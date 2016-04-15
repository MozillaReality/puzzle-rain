'use strict';

const Creature = require('../Creature');

function Terrestrial (world, pos, scale) {
  Creature.call(this, 'terrestrial', world, pos, scale);

}

Terrestrial.prototype = Object.create(Creature.prototype);

Terrestrial.prototype.init = function (obj) {
  Creature.prototype.init.call(this, obj);
};

module.exports = Terrestrial;
