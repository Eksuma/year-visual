const Ellipse = (function() {
"use strict";

const lutPoints = 1000;

let lutPosX = new Float32Array(lutPoints);
let lutPosY = new Float32Array(lutPoints);

let radiusX = 0;
let radiusY = 0;
let circumference = 0;

let winding = +1;
let startTurn = -1/4;

function computeLUT(rx, ry)
{
	radiusX = rx;
	radiusY = ry;

	const numIntegrals = 100000;

	var circ = 0;

	// integrate over the ellipse to get the circumference
	for (var i = 0; i < numIntegrals; i++)
	{
		const turn = i / numIntegrals;
		circ += computeDp(turn, rx, ry);
	}

	circumference = circ * 2 * Math.PI / numIntegrals;

	var nextPoint = 0;
	var run = 0;

	for (var i = 0; i < numIntegrals; i++)
	{
		const turn = i / numIntegrals;
		const subIntegral = lutPoints * run / circ;

		if (subIntegral >= nextPoint)
		{
			const p = pointByAngle(turn, rx, ry);

			lutPosX[nextPoint] = p.x;
			lutPosY[nextPoint] = p.y;

			nextPoint++;
		}

		run += computeDp(turn, rx, ry);
	}
}

function turnToRadians(turn)
{
	// const winding = +1;
	// const startTurn = -1/3;

	return (startTurn + turn * winding) * 2 * Math.PI;
}

function pointByAngle(turn, rx, ry)
{
	const radians = turnToRadians(turn);
	// const radians = turn * 2 * Math.PI;

	return {
		x: Math.cos(radians) * rx,
		y: Math.sin(radians) * ry
	};
}

function computeDp(turn, rx, ry)
{
	const p = pointByAngle(turn, ry, rx); // swapped rx and ry

	return Math.sqrt(p.x**2 + p.y**2);
}

function pointByRatio(circRatio)
{
	//circRatio = circRatio * winding + startTurn;
	//circRatio = MyMath.mod(circRatio * winding + startTurn, 1);

	const indexReal = MyMath.mod(circRatio * lutPoints, lutPoints);
	const indexFloor = Math.floor(indexReal);
	const indexCeil = MyMath.mod(indexFloor + 1, lutPoints);

	const x1 = lutPosX[indexFloor];
	const y1 = lutPosY[indexFloor];
	const x2 = lutPosX[indexCeil];
	const y2 = lutPosY[indexCeil];

	const alpha = indexReal - indexFloor;

// debugger;

	return {
		x: MyMath.lerp(x1, x2, alpha),
		y: MyMath.lerp(y1, y2, alpha)
	};
}

function normalAt(point)
{
	const x = point.x / radiusX**2;
	const y = point.y / radiusY**2;

	const ilen = 1 / Math.sqrt(x**2 + y**2);

	return {
		x: x * ilen,
		y: y * ilen
	};
}

function offsetPoint(circRatio, offset)
{
	const p = pointByRatio(circRatio);

	const normal = normalAt(p);

	return {
		x: p.x - normal.x * offset,
		y: p.y - normal.y * offset
	};
}

function *offsetCurveGen(turn1, turn2, offset, numPoints)
{
	numPoints = Math.max(2, numPoints);

	for (var i = 0; i < numPoints; i++)
	{
		const subTurn = MyMath.lerp(turn1, turn2, i / (numPoints - 1));

		yield offsetPoint(subTurn, offset);
	}
}

function getCircumference()
{
	return circumference;
}

return { computeLUT, getCircumference, pointByRatio, offsetPoint, offsetCurveGen };
})();
