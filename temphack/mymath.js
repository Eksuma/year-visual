"use strict";

class MyMath
{
	static degToRad(degrees) { return degrees * this.DEG2RAD; };

	static radToDeg(radians) { return radians * this.RAD2DEG; };

	static clamp(x, min, max) { return Math.max(min, Math.min(max, x)); };

	static mod(dividend, divisor) { return dividend - Math.floor(dividend / divisor) * divisor; };

	static modRange(n, min, max) { return min + this.mod(n - min, max - min); };

	static lerp(min, max, alpha) { return min * (1 - alpha) + max * alpha; }; // min + (max - min) * alpha;

	static lerpRange(v1, v2, aMin, aMax, alpha) { return this.lerp(v1, v2, (alpha - aMin) / (aMax - aMin)); };

	//static xerp(a, m, b, tm, t) { return a + (b - a) * Math.pow(t, Math.log((m - a) / (b - a)) / Math.log(tm)); };
	//static xerp(min, mid, max, tm, t) { return this.lerp(min, max, Math.pow(t, Math.log((mid - min) / (max - min)) / Math.log(tm))); };
	static xerp(min, mid, max, tm, t)
	{
		const ratio = (mid - min) / (max - min);
		const exp = Math.log(ratio) / Math.log(tm);

		return this.lerp(min, max, Math.pow(t, exp));
	};

	static random(min, max) { return this.lerp(min, max, Math.random()); };

	static randomInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };

	// Box–Muller transform
	static randomGaussian(mean = 0, deviation = 1)
	{
		const epsilon = Number.EPSILON;

		let u1, u2;

		do
		{
			u1 = Math.random();
			u2 = Math.random();
		}
		while (u1 <= epsilon);

		const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(MyMath.TAU * u2);
		// const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(MyMath.TAU * u2); // not used here!

		return z0 * deviation + mean;
	};

	static solveQuadratic(a, b, c, roots)
	{
		const discriminant = b*b - 4*a*c;

		if (discriminant < 0)
			return false;

		const numer = Math.sqrt(discriminant);

		roots[0] = (-b - numer) / (2 * a);
		roots[1] = (-b + numer) / (2 * a);

		return true;
	};
}

Object.defineProperty(MyMath, 'TAU', { value: 2 * Math.PI, writable: false });
Object.defineProperty(MyMath, 'DEG2RAD', { value: MyMath.TAU / 360, writable: false });
Object.defineProperty(MyMath, 'RAD2DEG', { value: 360 / MyMath.TAU, writable: false });

/*
xerp (exponential interpolation):

	regular: a + (b - a) * t

	set value m between [a, b] at time tm between [0, 1]

	f(0)  = a
	f(tm) = m
	f(1)  = b

	a + (b - a) * tm^x = m

    tm^x * (b - a) = m - a
	tm^x = (m - a) / (b - a)

	x = log((m - a) / (b - a)) / log(tm)


	if m = a :
	x = log(0) / log(tm) = inf
	a + (b - a) * tm^(inf) = a


	if m = b :
	x = log(1) / log(tm) = 0
	a + (b - a) * tm^0 = b


	if (m - a) / (b - a) = tm :
	x = log(tm) / log(tm) = 1
	a + (b - a) * tm^1 = lerp
*/
