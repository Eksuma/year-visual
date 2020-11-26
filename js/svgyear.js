(function(){
"use strict";

//
// settings
//

/*
const settings = {
	startTurn: -0.25,
	winding: +1,
};
*/

const namespace = "http://www.w3.org/2000/svg";
const xlinkNS = "http://www.w3.org/1999/xlink";

const targetId = "svgmain";

const svgContainer = document.getElementById(targetId);
const svgRect = svgContainer.getBoundingClientRect();

const goldenRatio = 5. ** .5 * .5 + .5;

const width = Math.min(svgRect.height * goldenRatio, svgRect.width);
const height = svgRect.height;

// const width = 1456;
// const height = 900;
// const width = 0.95 * Math.min(window.innerHeight * goldenRatio, window.innerWidth);
// const height = 0.95 * window.innerHeight;

const aspect = width / height;

const scaleX = 1000 * aspect;
const scaleY = 1000;
const radiusX = scaleX / 2;
const radiusY = scaleY / 2;

// const viewBox = [-width / 2, -height / 2, width, height].join(" ");
const viewBox = [-scaleX / 2, -scaleY / 2, scaleX, scaleY].map(x => x.toFixed(2)).join(" ");

const strokeWidth = 0.75;

//

/*
const numDays = 365;
const numWeeks = numDays / 7;
const firstWeekLength = ...
const lastWeekLength = ...
const numFullWeeks = ...
*/

//
// data
//

const dasharray = "5,3";

//const svgRoot = createSVGElem("svg", { id: "yearRound", width, height, viewBox });
const svgRoot = createSVGElem("svg", { id: "yearRound", width: "100%", height: "100%", viewBox });

document.getElementById(targetId).appendChild(svgRoot);

function createSVGElem(tag, attributes)
{
	// const namespace = "http://www.w3.org/2000/svg";

	const element = document.createElementNS(namespace, tag);

	for (const key in attributes)
		element.setAttributeNS(null, key, attributes[key]);

	return element;
}

function addElement(element)
{
	svgRoot.appendChild(element);
}

function createAndAddSVGElem(tag, attributes)
{
	addElement(createSVGElem(tag, attributes));
}

function round(num)
{
	return num.toFixed(3);
}

function makeRects(amount)
{
	var color = new Color(0,0,0,1);
	const white = new Color(1,1,1,1);

	for (var i = 0; i < amount; i++)
	{
		var rectWidth = Math.random() * scaleX;
		var rectHeight = Math.random() * scaleY;
		var x = (-scaleX / 2) + Math.random() * (scaleX - rectWidth);
		var y = (-scaleY / 2) + Math.random() * (scaleY - rectHeight);

		color.randomColor(true);

		white.a = color.a;
		color.lerpColors(color, white, 0.7);

		createAndAddSVGElem("rect", { x, y, width: rectWidth, height: rectHeight, fill: color.getCSS() });
	}
}

function createCurveData(turnStart, turnEnd, offset, subdivisions)
{
	var data = "";

	const curveGen = Ellipse.offsetCurveGen(turnStart, turnEnd, offset, subdivisions + 2);

	for (const point of curveGen)
		data += round(point.x) + "," + round(point.y) + " ";

	return data;
}

function createLoopData(offset, numSides)
{
	const data = createCurveData(0, (numSides - 1) / numSides, offset, numSides - 2);

	return 'M' + data + 'z';
}

function createSectorPath(turn1, turn2, offset1, offset2, subdivisions)
{
	const d1 = createCurveData(turn1, turn2, offset1, subdivisions);
	const d2 = createCurveData(turn2, turn1, offset2, subdivisions);

	return createSVGElem("path", { d: 'M' + d1 + d2 + 'z' });
}

function createPathedText(innerHTML, pathId, attributes)
{
	const text = createSVGElem("text", {
		...attributes,
	});

	const textPath = createSVGElem("textPath", {
		startOffset: "50%",
		method: "stretch",
		spacing: "auto",
	});

	textPath.setAttributeNS(xlinkNS, "href", pathId);

	// const textNode = document.createTextNode(str);
	// textPath.appendChild(textNode);

	textPath.innerHTML = innerHTML;
	text.appendChild(textPath);

	return text;
}

function createWeekSectors(firstWeekDay)
{
	const group = createSVGElem("g", {
		id: "weeks",
		fill: "#bbb",
		stroke: "none", //"black",
		// stroke: "black",
		"stroke-width": strokeWidth,
	});

	const defs = createSVGElem("defs", {});

	const distUpper = 0;
	const distLower = 20;
	const distMiddle = (distUpper + distLower) * 0.5;

	const numDays = 365;
	const numWeeks = numDays / 7;
	const daysLeftOver = numDays % numWeeks;

	const gapSize = 2 / Ellipse.getCircumference();
	const weekSubDivs = 3;

	for (var i = 0; i < numWeeks-1; i++)
	{
		const turnMin = ((i + 0) / numWeeks) + gapSize;
		const turnMax = ((i + 1) / numWeeks) - gapSize;

		const sector = createSectorPath(turnMin, turnMax, distUpper, distLower, weekSubDivs);

		group.appendChild(sector);

		//
		// labels
		//

		const turnMid = (turnMin + turnMax) / 2;
		const flipped = Ellipse.offsetPoint(turnMid, distMiddle).y > 0;

		const d = 'M' + createCurveData(
			flipped ? turnMax : turnMin,
			flipped ? turnMin : turnMax,
			distMiddle + (flipped ? -1 : 1),
			weekSubDivs
		);

		const pathId = `week${i}`;
		const innerHTML = `WEEK <tspan dy="-1">${i + 1}</tspan>`; // TODO: Miksi täytyy olla hack

		const pathForText = createSVGElem("path", { d, id: pathId });
		const text = createPathedText(innerHTML, '#' + pathId, { class: "tyyli1" });

		defs.appendChild(pathForText);
		group.appendChild(text);
	}

	if (daysLeftOver > 0)
	{
		const turnMin = ((i + 0) / numWeeks) + gapSize;
		const turnMax = ((i + 1) / numWeeks) - gapSize;
		// ...
	}

	addElement(defs);
	addElement(group);
}

function createDaySectors()
{
	var group = createSVGElem("g", {
		fill: "none", // "transparent"
		stroke: "black",
		"stroke-width": strokeWidth,
	});

	const numPoints = 365;

	const distUpper = 24;
	const distLower = 35;

	var upperPoints = "";
	var lowerPoints = "";

	for (var i = 0; i < numPoints; i++)
	{
		const fraction = i / numPoints;

		var upper = Ellipse.offsetPoint(fraction, distUpper);
		var lower = Ellipse.offsetPoint(fraction, distLower);

		var upperStr = round(upper.x) + "," + round(upper.y) + " ";
		var lowerStr = round(lower.x) + "," + round(lower.y) + " ";

		var polyline = createSVGElem("polyline", { points: upperStr + lowerStr });

		group.appendChild(polyline);

		//

		upperPoints = upperPoints + upperStr;
		lowerPoints = lowerStr + lowerPoints;
	}

	var outerPolygon = createSVGElem("polygon", { points: upperPoints });
	var innerPolygon = createSVGElem("polygon", { points: lowerPoints });

	group.appendChild(outerPolygon);
	group.appendChild(innerPolygon);

	//
	//
	//

	var clipPath = createSVGElem("clipPath", { id: "clip", "clip-rule": "evenodd" });

/*
	var op = outerPolygon.cloneNode();
	var ip = innerPolygon.cloneNode();

	op["clip-rule"] = "evenodd";
	ip["clip-rule"] = "evenodd";

	clipPath.appendChild(op);
	clipPath.appendChild(ip);
*/

	const d1 = createLoopData(distUpper, 100);
	const d2 = createLoopData(310, 100);

	const pathForClipping = createSVGElem("path", { d: d1 + ' ' + d2 });

	clipPath.appendChild(pathForClipping);

	addElement(clipPath);

	var forObj = createSVGElem("foreignObject", {
		x: -scaleX / 2,
		y: -scaleY / 2,
		width: scaleX,
		height: scaleY,
		"clip-path": "url(#clip)",
	});

	var div = document.createElement('div');
	div.xmlns = "http://www.w3.org/1999/xhtml";
	div.id = "conic";

	forObj.appendChild(div);

	addElement(forObj);

	//
	//
	//

	addElement(group);
}

function shitfuck()
{
	const d = createLoopData(310, 200);
	// const d = createCurveData(-1/8, 1/8, 200, 2);

	const path = createSVGElem("path", { d, stroke: "black", "stroke-width": strokeWidth, fill: "transparent" });

	addElement(path);


	var date = new Date();
	var weekday = new Array(7);
	weekday[0] = "Sunday";
	weekday[1] = "Monday";
	weekday[2] = "Tuesday";
	weekday[3] = "Wednesday";
	weekday[4] = "Thursday";
	weekday[5] = "Friday";
	weekday[6] = "Saturday";

	var n = weekday[date.getDay()];
	console.log("it's " + n + " hopefully")
}

makeRects(10);

Ellipse.computeLUT(radiusX, radiusY);

createWeekSectors();
createDaySectors();
shitfuck();

})();
