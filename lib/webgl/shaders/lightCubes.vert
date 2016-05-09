precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;
attribute vec4 orientation;

varying vec2 vUv;

void main() {

	vec3 vPosition = position;
	vec3 vcV = cross(orientation.xyz, vPosition);
	vPosition = vcV * (2.0 * orientation.w) + (cross(orientation.xyz, vcV) * 2.0 + vPosition);

	vUv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + vPosition, 1.0 );

}
