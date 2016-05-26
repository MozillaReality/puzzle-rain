uniform vec3 glowColor;
uniform float opacity;
varying float intensity;
void main()
{
	vec3 glow = glowColor * intensity;
    gl_FragColor = vec4( glow, opacity );
}
