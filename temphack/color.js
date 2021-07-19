"use strict";

//var g_tmpNumColors = 0;
//var g_tmpColMod = 1;

// designed to be used with color values between [0, 1]

class Color
{
	constructor(r, g, b, a)
	{
		this.r = r || 0;
		this.g = g || 0;
		this.b = b || 0;
		this.a = a || 0;

		//g_tmpNumColors++;
		//if (g_tmpNumColors % g_tmpColMod == 0) console.log("coloreita: " + g_tmpNumColors);
		//if (g_tmpNumColors > (g_tmpColMod * 10)) g_tmpColMod *= 10;
	};

	set(r, g, b, a)
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;

		return this;
	};

	multiply(scalar)
	{
		this.r *= scalar;
		this.g *= scalar;
		this.b *= scalar;
		this.a *= scalar;

		return this;
	};

	mix(rhs)
	{
		this.r *= rhs.r;
		this.g *= rhs.g;
		this.b *= rhs.b;
		this.a *= rhs.a;

		return this;
	};

	copy(other)
	{
		this.r = other.r;
		this.g = other.g;
		this.b = other.b;
		this.a = other.a;

		return this;
	};

	clone()
	{
		return new Color(this.r, this.g, this.b, this.a);
	};

	randomColor(alphaAlso)
	{
		this.r = Math.random();
		this.g = Math.random();
		this.b = Math.random();

		if (alphaAlso)
			this.a = Math.random();

		return this;
	};

	getCSS()
	{
		// scale and clamp from [0, 1] -> [0, 255]
		const rescale = x => Math.max(0, Math.min(255, Math.floor(x * 256))); // * 255.999999999 ?

		var r = rescale(this.r);
		var g = rescale(this.g);
		var b = rescale(this.b);

		return "rgba(" + r + "," + g + "," + b + "," + this.a + ")";
	};

	getString()
	{
		return "(" + this.r.toFixed(3) + ", " + this.g.toFixed(3) + ", " + this.b.toFixed(3) + ", " + this.a.toFixed(3) + ")";
	};

	lerpColors(c1, c2, t)
	{
		this.r = c1.r + (c2.r - c1.r) * t;
		this.g = c1.g + (c2.g - c1.g) * t;
		this.b = c1.b + (c2.b - c1.b) * t;
		this.a = c1.a + (c2.a - c1.a) * t;

		return this;
	};

	lerpColorArray(colors, x)
	{
		const len = colors.length;

		var xpos = x * (len - 1); // shift the colors so the "stops" are at the edges
		var index = xpos % len;

		if (index < 0)
			index = len + index;

		var prev = Math.floor(index);
		var next = (prev + 1) % len;
		var between = index - prev;

		return this.lerpColors(colors[prev], colors[next], between);
	};

	setSpectrum(x)
	{
		const extra = (Color.rainbow.length + 1) / Color.rainbow.length;

		return this.lerpColorArray(Color.rainbow, x * extra);
	};

	averageColors(colorArray)
	{
		this.set(0, 0, 0, 0);

		const numColors = colorArray.length;

		for (var i = 0; i < numColors; i++)
		{
			var sample = colorArray[i];

			this.r += sample.r * sample.a;
			this.g += sample.g * sample.a;
			this.b += sample.b * sample.a;
			this.a += sample.a;
		}

		if (this.a > 0)
		{
			this.r /= this.a;
			this.g /= this.a;
			this.b /= this.a;
			this.a /= numColors;
		}

		return this;
	};
}

Color.rainbow = [
	new Color(1, 0, 0, 1),
	new Color(1, 1, 0, 1),
	new Color(0, 1, 0, 1),
	new Color(0, 1, 1, 1),
	new Color(0, 0, 1, 1),
	new Color(1, 0, 1, 1),
	//new Color(1, 0, 0, 1)
];
