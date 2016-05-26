var THREE = require('three');

function Eye (size, eye, eyelidColor) {
  THREE.Group.call(this);
  this.eye = eye;

  this.eyeballMaterial = new THREE.MeshStandardMaterial({color: 0x39393c, roughness: 1, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0, shading: THREE.FlatShading});

  this.eyeball = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), this.eyeballMaterial);
  this.add(this.eyeball);
}

Eye.prototype = Object.create(THREE.Group.prototype);
Eye.prototype.constructor = Eye;
Eye.prototype.setEmotion = function (emotion) {};
Eye.prototype.update = function (delta) {};

module.exports = Eye;

//

function Eyes (size) {
  THREE.Group.call(this);

  var baseColor = 0xFFFFFF;
  this.left = new Eye(size, 'left', baseColor);
  this.right = new Eye(size, 'right', baseColor);
  this.setSeparation(0.3);

  this.add(this.left);
  this.add(this.right);

  this.eyeMovAmplitude = 0.5;
  this.eyeMovFreq = 20;
  this.eyeMovPhase = 0;

  this.phase = Math.random() * Math.PI * 2;
}

Eyes.prototype = Object.create(THREE.Group.prototype);
Eyes.prototype.constructor = Eyes;
Eyes.prototype.setSeparation = function (separation) {
  this.left.position.x = -separation;
  this.right.position.x = separation;
  this.separation = separation;
};

Eyes.prototype.setOpacity = function (opacity) {
  this.left.eyeballMaterial.opacity = opacity;
  this.right.eyeballMaterial.opacity = opacity;
};

Eyes.prototype.update = function (delta, time) {
  return;
  this.left.update(delta);
  this.right.update(delta);

  this.left.position.y += Math.sin(time * this.eyeMovFreq + this.eyeMovPhase) * this.eyeMovAmplitude;
  this.right.position.y += Math.sin(time * this.eyeMovFreq + this.eyeMovPhase) * this.eyeMovAmplitude;
};

Eyes.prototype.setEmotion = function (emotion) {
  //  this.left.setEmotion(emotion);
  //  this.right.setEmotion(emotion);
  this.emotion = emotion;
};

module.exports = Eyes;
