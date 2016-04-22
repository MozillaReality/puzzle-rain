var THREE = require('three');

/**
 * @author Michael Guerrero / http://realitymeltdown.com
 */

THREE.BlendCharacter = function () {
  this.weightSchedule = [];
  this.warpSchedule = [];

  this.load = function (url, onLoad) {
    var self = this;

    var loader = new THREE.ObjectLoader();
    loader.load(url, function (loadedObject) {
      // The exporter does not currently allow exporting a skinned mesh by itself
      // so we must fish it out of the hierarchy it is embedded in (scene)
      loadedObject.traverse(function (object) {
        if (object instanceof THREE.SkinnedMesh) {
          self.skinnedMesh = object;

        }

      });

      THREE.SkinnedMesh.call(self, self.skinnedMesh.geometry, self.skinnedMesh.material);

      // If we didn't successfully find the mesh, bail out
      if (self.skinnedMesh == undefined) {
        console.log('unable to find skinned mesh in ' + url);
        return;

      }

      self.material.skinning = true;

      self.mixer = new THREE.AnimationMixer(self);
      self.mixer = self.mixer;

      // Create the animations
      for ( var i = 0; i < self.geometry.animations.length; ++i) {
        self.mixer.clipAction(self.geometry.animations[ i ]);

      }

      // Loading is complete, fire the callback
      if (onLoad !== undefined) onLoad();

    });

  };

  this.update = function (dt) {
    this.mixer.update(dt);

  };

  this.play = function (animName, weight) {
    // console.log( "play('%s', %f)", animName, weight );
    return this.mixer.clipAction(animName).setEffectiveWeight(weight).play();

  };

  this.crossfade = function (fromAnimName, toAnimName, duration) {
    this.mixer.stopAllAction();

    var fromAction = this.play(fromAnimName, 1);
    var toAction = this.play(toAnimName, 1);

    fromAction.crossFadeTo(toAction, duration, false);

  };

  this.warp = function (fromAnimName, toAnimName, duration) {
    this.mixer.stopAllAction();

    var fromAction = this.play(fromAnimName, 1);
    var toAction = this.play(toAnimName, 1);

    fromAction.crossFadeTo(toAction, duration, true);

  };

  this.applyWeight = function (animName, weight) {
    this.mixer.clipAction(animName).setEffectiveWeight(weight);

  };

  this.getWeight = function (animName) {
    return this.mixer.clipAction(animName).getEffectiveWeight();

  };

  this.pauseAll = function () {
    this.mixer.timeScale = 0;

  };

  this.unPauseAll = function () {
    this.mixer.timeScale = 1;

  };

  this.stopAll = function () {
    this.mixer.stopAllAction();

  };

  this.showModel = function (boolean) {
    this.visible = boolean;

  };

};

THREE.BlendCharacter.prototype = Object.create(THREE.SkinnedMesh.prototype);
THREE.BlendCharacter.prototype.varructor = THREE.BlendCharacter;

THREE.BlendCharacter.prototype.getForward = function () {
  var forward = new THREE.Vector3();

  return function () {
    // pull the character's forward basis vector out of the matrix
    forward.set(
      - this.matrix.elements[ 8 ],
      - this.matrix.elements[ 9 ],
      - this.matrix.elements[ 10 ]
    );

    return forward;

  };

};
