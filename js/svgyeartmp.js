(function(){
"use strict";

function drawGraph()
{
	const cw = 1000;
	const ch = 1000;

	var canvas = document.createElement('canvas');
	canvas.width = cw;
	canvas.height = ch;
	var ctx = canvas.getContext("2d");

	var grapher = new Grapher(6, 1000, "polar angle", "ellipse sin");

	const measure = (x, y) => { var rads = Math.atan2(y, x); /*if (rads < 0) rads = MyMath.TAU + rads;*/ return MyMath.mod(MyMath.radToDeg(rads), 360); };

	// [{x:1,y:1}, {x:1456,y:600}, {x:2.5,y:1} /*, {x:1,y:1/32}*/].forEach((size, plot) => {
	//[{x:1.15,y:1}, {x:3,y:1}, {x:4,y:1}, {x:5,y:1}].forEach((size, plot) => {
	[{x:1,y:4}, {x:1,y:2}, {x:1,y:1.00}, {x:1,y:0.5}, {x:1,y:0.0025}].forEach((size, plot) => {

		Ellipse.computeLUT(size.x, size.y);

		for (var i = 0; i < 1000; i++)
		{
			const turn = i / 1000 + 0.25;
			const rads = turn * MyMath.TAU;

			const p = Ellipse.pointByRatio(turn);

//if (plot === 2)
			//grapher.insert(plot, { x: i, y: measure(p.x, p.y)-(i/1000)*360 });
			grapher.insert(plot, { x: i, y: measure(p.x, p.y) });
			//grapher.insert(plot, { x: rads, y: p.y });
		}
	});

	for (var i = 0; i < 1000; i++)
	{
		const turn = i / 1000;
		const rads = turn * MyMath.TAU;

		// const cos = Math.cos(angle);
		// const sin = Math.sin(angle);

		const pt = powTry(turn, 1, .2);

/*
		var ellipAngle = Math.atan((2/1) * Math.tan(angle));

		if (angle > MyMath.TAU*(1/4) && angle <= MyMath.TAU*(2/4))
			ellipAngle += Math.PI;

		if (angle > MyMath.TAU*(2/4) && angle <= MyMath.TAU*(3/4))
			ellipAngle -= Math.PI;
*/

		var ellipAngle = circleToEllipse(i/1000, 1456*0.686813186813186, 600);

		//grapher.insert(3, { x: i, y: MyMath.radToDeg(Math.atan((1/32)*Math.tan(angle))) });
		//grapher.insert(3, { x: i, y: MyMath.radToDeg(ellipAngle) });
		//grapher.insert(3, { x: i, y: MyMath.modRange(i/10-50, 1, -2) });

		//grapher.insert(3, { x: i/4, y: Math.pow(i/999, 7)*90 });
		grapher.insert(5, { x: i, y: pt*360 });
	}

	document.body.appendChild(canvas);

	grapher.draw(ctx, 0, 0, cw, ch, true, true);
}

function powTry(turn, rx, ry)
{
	const xovery = rx / ry;
	const yoverx = ry / rx;

	const qt = MyMath.mod(turn * 4, 4);
	const ft = Math.floor(qt);
	const at = qt - ft;

	let ma;

	//const pow = (exp => Math.pow(at, exp);
	const s = 0.195;

	switch (ft)
	{
		case 0: ma = Math.pow(at, xovery*s); break;
		case 1: ma = 1-Math.pow(1-at, yoverx*s); break;
		case 2: ma = Math.pow(at, xovery*s); break;
		case 3: ma = 1-Math.pow(1-at, xovery*s); break;
		default: console.log("!?");
	}

	return (ft + ma) / 4;
}

function circleToEllipse(turn, rx, ry)
{
	turn -= Math.floor(turn);

	if (turn < 0)
		turn += 1;

	const circleRadians = turn * MyMath.TAU;
	const ellipseRadians = Math.atan((ry / rx) * Math.tan(circleRadians));

	if (turn > 0.25 && turn <= 0.50)
		return ellipseRadians + Math.PI;

	if (turn > 0.50 && turn <= 0.75)
		return ellipseRadians - Math.PI;

	return ellipseRadians;
}

drawGraph();



/*

function addEllipse(rx, ry)
{
	var group = createSVGElem("g", {
		fill: "none",
		stroke: "black",
		"stroke-width": strokeWidth,
	});

	var ellipse = createSVGElem("ellipse", { cx: 0, cy: 0, rx, ry });

	group.appendChild(ellipse);

	addElement(group);
}

function addEllipsePoint(cx, cy, r)
{
	var circle = createSVGElem("circle", { cx, cy, r, fill: "red" });

	addElement(circle);
}



const numPoints = 1000/8;
const ellipsePoints = ellipsePointGen(400, 150, numPoints);

addEllipse(400, 150);

for (var i = 0; i < numPoints; i++)
{
	// const p = ellipsePoints.next().value;
	const p = pointOnEllipseByRatio(i / numPoints);

	addEllipsePoint(p.x, p.y, 2);
}

// */

})();
