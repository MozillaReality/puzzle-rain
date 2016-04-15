'use strict';

const Events = require('../../events/Events');
const THREE = require('three');
const CANNON = require('cannon');
const MaterialsManager = require('../managers/MaterialsManager');

function Creature (s, myWorld, myPos, myScale) {
  THREE.Object3D.call(this);

  this.world = myWorld;
  this.pos = myPos;
  this.myScale = myScale;
  const objectLoader = new THREE.ObjectLoader();
  const scope = this;
  objectLoader.load('models/' + s + '.json', function (obj) {
    obj.scale.set(scope.myScale, scope.myScale, scope.myScale);
    obj.children.forEach(value => {
      if (value instanceof THREE.Mesh) {
        value.receiveShadow = true;
        value.castShadow = true;
        value.material.shading = THREE.FlatShading;
      }
    });

    scope.init(obj);

    Events.on('updateScene', update.bind(scope));
  });

}

function update (delta) {
  this.position.copy(this.body.position);
  this.quaternion.copy(this.body.quaternion);
}

Creature.prototype = Object.create(THREE.Object3D.prototype);

Creature.prototype.init = function (obj) {
  this.add(obj);

  var box = new THREE.Box3().setFromObject(obj.children[0]);
  // console.log(box.size());
  const shape = new CANNON.Box(new CANNON.Vec3(box.size().x / 2 * this.myScale, box.size().y / 2 * this.myScale, box.size().z / 2 * this.myScale));
  // shape.convexPolyhedronRepresentation;
  this.body = new CANNON.Body({
    mass: 1,
    material: MaterialsManager.groundMaterial
  });
  this.body.addShape(shape);
  this.body.fixedRotation = true;
  this.body.updateMassProperties();
  // this.body.allowSleep = true;
  // this.body.sleepSpeedLimit = 1;
  // this.body.sleepTimeLimit = 5;
  this.body.position.set(this.pos.x, this.pos.y, this.pos.z);
  this.world.addBody(this.body);

};

module.exports = Creature;
