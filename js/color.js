"use strict";

function hex2rgb(hex)
{
	return {
		// skip # at position 0
		r: parseInt(hex.slice(1, 3), 16) / 255,
		g: parseInt(hex.slice(3, 5), 16) / 255,
		b: parseInt(hex.slice(5, 7), 16) / 255
	}
}

function lerpColors(a, b, t)
{
	a = hex2rgb(a)
	b = hex2rgb(b)

	return rgb2hex({
		r: MyMath.lerp(a.r, b.r, t),
		g: MyMath.lerp(a.g, b.g, t),
		b: MyMath.lerp(a.b, b.b, t),
	})
}

function rgb2hex(rgb)
{
	return '#' + [rgb.r, rgb.g, rgb.b]
	.map(ch => Math.min(Math.floor(ch * 256), 255).toString(16).padStart(2, '0'))
	.join('')
}
