/* MetaBall */

module.exports =
`
#ifdef GL_ES
precision mediump float;
#endif
varying vec2 v_texCoord;
uniform vec2 size;
uniform vec2 ball1;
uniform vec2 ball2;
void main()
{
	float stepX = 1.0f / size.x;
	float stepY = 1.0f / size.y;
	float currX = v_texCoord.x / stepX;
	float currY = v_texCoord.y / stepY;
	float ball1X = ball1.x / stepX + size.x / 2;
	float ball1Y = size.y - (ball1.y / stepY) - size.y / 2;
	float ball2X = ball2.x / stepX;
	float ball2Y = size.y - (ball2.y / stepY);
	gl_FragColor = texture2D(CC_Texture0, v_texCoord).rgba;
	if ((ball1X - currX) * (ball1X - currX) + (ball1Y - currY) * (ball1Y - currY) < 10000.0f) {
		gl_FragColor = vec4(1.0f, 0.0f, 0.0f, 1.0f);
	}
	if ((ball2X - currX) * (ball2X - currX) + (ball2Y - currY) * (ball2Y - currY) < 10000.0f) {
		gl_FragColor = vec4(1.0f, 0.0f, 0.0f, 1.0f);
	}
}
`