"use strict";

//var g_tmpNumVector2s = 0;
//var g_tmpVecMod = 1;

class Vector2
{
	constructor(x, y)
	{
		this.x = x || 0;
		this.y = y || 0;

		//g_tmpNumVector2s++;
		//if (g_tmpNumVector2s % g_tmpVecMod == 0) console.log("vektoreita: " + g_tmpNumVector2s);
		//if (g_tmpNumVector2s > (g_tmpVecMod * 10)) g_tmpVecMod *= 10;
	};

	zero()
	{
		this.x = 0;
		this.y = 0;

		return this;
	};

	set(x, y)
	{
		this.x = x;
		this.y = y;

		return this;
	};

	fromArray(array)
	{
		[this.x, this.y] = array;

		return this;
	};

	toArray()
	{
		return [this.x, this.y];
	};

	add(rhs)
	{
		this.x += rhs.x;
		this.y += rhs.y;

		return this;
	};

	addVectors(a, b)
	{
		this.x = a.x + b.x;
		this.y = a.y + b.y;

		return this;
	};

	addScaledVector(vec, scalar)
	{
		this.x += vec.x * scalar;
		this.y += vec.y * scalar;

		return this;
	};

	substract(rhs)
	{
		this.x -= rhs.x;
		this.y -= rhs.y;

		return this;
	};

	substractVectors(a, b)
	{
		this.x = a.x - b.x;
		this.y = a.y - b.y;

		return this;
	};

	to(b)
	{
		this.x = b.x - this.x;
		this.y = b.y - this.y;

		return this;
	};

	perp()
	{
		// return this.set(-this.y, this.x); // works because values are copied

		var tmp = this.x;
		this.x = -this.y;
		this.y = tmp;

		return this;
	};

	dot(rhs)
	{
		return this.x * rhs.x + this.y * rhs.y;
	};

	// cross product, perpendicular dot product, exterior product, wedge product??
	perpDot(rhs)
	{
		return this.x * -rhs.y + this.y * rhs.x;
	};

	multiply(scalar)
	{
		this.x *= scalar;
		this.y *= scalar;

		return this;
	};

	multiplyVector(vector)
	{
		this.x *= vector.x;
		this.y *= vector.y;

		return this;
	};

	length()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	};

	lengthSquared()
	{
		return this.x * this.x + this.y * this.y;
	};

	distanceTo(v)
	{
		return Math.sqrt(this.distanceSquaredTo(v));
	};

	distanceSquaredTo(v)
	{
		var xd = this.x - v.x;
		var yd = this.y - v.y;

		return xd**2 + yd**2;
		//return xd*xd + yd*yd;
	};

	negate()
	{
		this.x = -this.x;
		this.y = -this.y;

		return this;
	};

	normalize()
	{
		var len = this.x * this.x + this.y * this.y; // this.lengthSquared();

		len = 1 / Math.sqrt(len);

		this.x *= len;
		this.y *= len;

		return this;
	};

	reflect(normal)
	{
		// r = d − 2(d.n)n

		var dotp = this.x * normal.x + this.y * normal.y; // this.dot(normal);

		this.x -= normal.x * (2 * dotp);
		this.y -= normal.y * (2 * dotp);

		return this;
	};

	lerpVectors(a, b, t)
	{
		this.x = a.x + (b.x - a.x) * t;
		this.y = a.y + (b.y - a.y) * t;

		return this;
	};

	fromAngle(theta)
	{
		this.x = Math.cos(theta);
		this.y = Math.sin(theta);

		return this;
	};

	randomDirection()
	{
		return this.fromAngle(Math.random() * Math.PI*2);
	};

	scalarProjection(b)
	{
		return this.dot(b) / b.dot(b);
	};

	vectorProjection(b)
	{
		return this.copy(b).multiply(this.scalarProjection(b));
	};

	vectorRejection(b)
	{
		return this.addScaledVector(b, -this.scalarProjection(b));
	};

	getVectorComponents(that, parallel, orthogonal)
	{
		const scalarProj = this.dot(that) / that.dot(that);

		parallel.copy(that).multiply(scalarProj);
		orthogonal.copy(this).substract(parallel);

		return scalarProj;
	};

	copy(other)
	{
		this.x = other.x;
		this.y = other.y;

		return this;
	};

	clone()
	{
		return new Vector2(this.x, this.y);
	};

	equals(other, tolerance)
	{
		if (Math.abs(this.x - other.x) > tolerance ||
			Math.abs(this.y - other.y) > tolerance)
			return false;

		return true;
	};

	getString()
	{
		return "<" + this.x.toFixed(3) + ", " + this.y.toFixed(3) + ">";
	};
}

/*
 class Vector2Count extends Vector2
 {
	 constructor(x, y)
	 {
		 super(x, y);

		 this.numVector2s++;

 		if (this.numVector2s % this.vector2Mod == 0)
			console.log("Vector2s: " + this.numVector2s);

 		if (this.numVector2s > (this.vector2Mod * 10))
			this.vector2Mod *= 10;
	 };
 }

Vector2Count.numVector2s = 0;
Vector2Count.vector2Mod = 1;

import Vector2Counter as Vector2...
*/
