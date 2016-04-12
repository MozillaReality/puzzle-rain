'use strict';

const THREE = require('three');

function Ground () {
  THREE.Object3D.call(this);
  const objectLoader = new THREE.ObjectLoader();
  const scope = this;
  objectLoader.load('models/ground.json', function (obj) {
    scope.add(obj);
    // child = obj.children[ i ];
    // either do an instanceof() too look for a class
    // if ( child instanceof THREE.PerspectiveCamera ) {
    // or search by name
    // if ( child.name === 'shotCam' ) {

  // let childrenArr = [];
  // obj.children.forEach(value => {
  //   childrenArr.push(value);
  // });
  //
  // childrenArr.forEach(value => {
  //   scope.add(value);
  //   console.log(value);
  // });
  });

}

Ground.prototype = Object.create(THREE.Object3D.prototype);

module.exports = Ground;
