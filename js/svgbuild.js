const SVG = (function() {
"use strict";

const namespace = "http://www.w3.org/2000/svg";
const xlinkNS = "http://www.w3.org/1999/xlink";

let aspect;

let scaleX;
let scaleY;
let radiusX;
let radiusY;

let svgRoot;
let svgDefs;

const isLeapYear = year => ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);

const currYear = new Date().getFullYear();
const leapDay = isLeapYear(currYear) ? 1 : 0;
const monthsInYear = 12;
const daysInMonth = [31, 28 + leapDay, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const daysInYear = 365 + leapDay;

const testDate = new Date(currYear, 11, 31, 23, 59, 59, 0);

const yearStart = new Date(currYear, 0);
const yearEnd = new Date(currYear + 1, 0);
const yearRatio = (Date.now() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime());

const startTurn = -1/4 //- yearRatio;
const isClockwise = true;
const strokeWidth = 0.75;

console.log("date: " + new Date())
console.log("year: " + currYear)
console.log("percent: " + (yearRatio * 100).toFixed(2))
console.log("test: " + testDate)
console.log("millis: " + (yearEnd.getTime() - testDate.getTime()))

const monthColors = [
	"#fdfdfd", "#b3e6ff", "#66ccff",
	"#99ff99", "#66ff33", "#99ff33",
	"#ffbf00", "#e1942b", "#906611", // 8: #c38e22
	"#ff8000", "#4d6680", "#c83333", // 10: #ff9933   11: #a18aa8   12: #ff3333
];

//
// data
//

function createSVGElem(tag, attributes)
{
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

function createStyling()
{
	const style = createSVGElem("style", {});

	var css = `
		textPath {
			startOffset: "50%";
			method: "stretch";
			spacing: "auto";
		}
	`;

	style.type = "text/css";
	style.title = "SVG default styling";
	style.appendChild(document.createTextNode(css));

	addElement(style);
};

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

	return data.trim();
}

function createLoopData(offset, numSides)
{
	const data = createCurveData(0, (numSides - 1) / numSides, offset, numSides - 2);

	return 'M' + data + 'z';
}

function createSectorPath(turn1, turn2, offset1, offset2, subdivisions, attributes)
{
	const d1 = createCurveData(turn1, turn2, offset1, subdivisions);
	const d2 = createCurveData(turn2, turn1, offset2, subdivisions);

	return createSVGElem("path", { d: 'M' + d1 + ' ' + d2 + 'z', ...attributes });
}

/*
function createPathedText(innerHTML, pathId, attributes, flipped = false)
{
	const text = createSVGElem("text", {
		...attributes,
	});

	const textPath = createSVGElem("textPath", {
		startOffset: "50%",
		//method: "stretch",
		//spacing: "auto",
		side: flipped ? "right" : "left",
	});

	textPath.setAttributeNS(xlinkNS, "href", pathId);

	// const textNode = document.createTextNode(str);
	// textPath.appendChild(textNode);

	textPath.innerHTML = innerHTML;
	text.appendChild(textPath);

	return text;
}
*/

function createCurvedText(innerHTML, pathId, turnStart, turnEnd, offset, subdivisions, attributes)
{
	const turnMid = (turnStart + turnEnd) / 2;
	const isUpsideDown = Ellipse.offsetPoint(turnMid, offset).y > 0;
	const flipped = !(isUpsideDown ^ isClockwise);

	const d = 'M' + createCurveData(
		turnStart,
		turnEnd,
		offset + (isUpsideDown ? -1 : 1),
		subdivisions,
	);

	const pathForText = createSVGElem("path", { d, id: pathId });

	svgDefs.appendChild(pathForText);

	//

	const text = createSVGElem("text", attributes);

	const textPath = createSVGElem("textPath", {
		startOffset: "50%",
		// "text-anchor": "middle",
		// "dominant-baseline": "middle",
		// method: "stretch",
		// spacing: "auto",
		side: flipped ? "right" : "left",
	});

	textPath.setAttributeNS(xlinkNS, "href", '#' + pathId);

	textPath.innerHTML = innerHTML;
	text.appendChild(textPath);

	return text;
}

/*
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
	const weekSubdivs = 3;

	for (var i = 0; i < numWeeks-1; i++)
	{
		const turnMin = ((i + 0) / numWeeks) + gapSize;
		const turnMax = ((i + 1) / numWeeks) - gapSize;

		const sector = createSectorPath(turnMin, turnMax, distUpper, distLower, weekSubdivs);

		group.appendChild(sector);

		//
		// labels
		//

		const turnMid = (turnMin + turnMax) / 2;
		const isDownward = Ellipse.offsetPoint(turnMid, distMiddle).y > 0;
		const flipped = !(isDownward ^ isClockwise);

		const d = 'M' + createCurveData(
			flipped ? turnMax : turnMin,
			flipped ? turnMin : turnMax,
			// distMiddle + (flipped ? -1 : 1),
			distMiddle + ((isClockwise && isDownward) ? -1 : (!isClockwise && isDownward) ? 0 : 1), // why -_-
			weekSubdivs
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
*/

/*
function createWeekSectors(firstWeekOffset = -3)
{
	const group = createSVGElem("g", {
		id: "weeks",
		fill: "#bbb",
		stroke: "none", //"black",
		// stroke: "black",
		"stroke-width": strokeWidth,
	});

	const gapSize = 4;
	const distUpper = 0;
	const distLower = 24 - gapSize;
	const distMiddle = (distUpper + distLower) * 0.5;
	const radialGap = (gapSize / 2) / Ellipse.getCircumference();
	const weekSubdivs = 3;

	const numDays = 365;
	const numWeeks = numDays / 7;
	const daysLeftOver = (numWeeks - Math.floor(numWeeks)) * 7// numDays - numWeeks * 7;

	for (var i = 0; i < numWeeks-1; i++)
	{
		const turnMin = ((i + 0) / numWeeks) + radialGap;
		const turnMax = ((i + 1) / numWeeks) - radialGap;

		const sector = createSectorPath(turnMin, turnMax, distUpper, distLower, weekSubdivs);

		group.appendChild(sector);

		//
		// labels
		//

		const pathId = `week${i}`;
		const innerHTML = `WEEK <tspan dy="-1">${i + 1}</tspan>`; // TODO: Miksi täytyy olla hack

		const text = createCurvedText(innerHTML, pathId, turnMin, turnMax, distMiddle, weekSubdivs, { class: "tyyli1" });

		group.appendChild(text);
	}

	if (daysLeftOver > 0)
	{
		const turnMin = ((numDays - daysLeftOver) / numDays) + radialGap;
		const turnMax = ((numDays -            0) / numDays) - radialGap;

		const sector = createSectorPath(turnMin, turnMax, distUpper, distLower, weekSubdivs);

		group.appendChild(sector);
	}

	addElement(group);
}
*/

function createWeekSectors(firstWeekOffset = -3)
{
	const group = createSVGElem("g", {
		id: "weeks",
		fill: "#bbb",
		stroke: "none", //"black",
		// stroke: "black",
		"stroke-width": strokeWidth,
	});

	const gapSize = 4;
	const distUpper = 0;
	const distLower = 24 - gapSize;
	const distMiddle = (distUpper + distLower) * 0.5;
	const radialGap = (gapSize / 2) / Ellipse.getCircumference();
	const weekSubdivs = 3;

	const daysInYear = 365 + 1;
	const daysInWeek = 7;

	for (var i = firstWeekOffset, weekNum = 0; i < daysInYear; i += daysInWeek, weekNum++)
	{
		const dayNum1 = Math.max(i, 0);
		const dayNum2 = Math.min(i + daysInWeek, daysInYear);

		const turnMin = (dayNum1 / daysInYear) + radialGap;
		const turnMax = (dayNum2 / daysInYear) - radialGap;

		const sector = createSectorPath(turnMin, turnMax, distUpper, distLower, weekSubdivs, {});

		group.appendChild(sector);

		//
		// labels
		//

		// if there's no room for the text, just skip it
		if (dayNum2 - dayNum1 < 4)
			continue;

		const pathId = `week${weekNum}`;
		const innerHTML = `WEEK <tspan dy="-1">${weekNum + 1}</tspan>`; // TODO: Miksi täytyy olla hack

		const text = createCurvedText(innerHTML, pathId, turnMin, turnMax, distMiddle, weekSubdivs, { class: "tyyli1" });

		group.appendChild(text);
	}

	// tmp
	const upper = Ellipse.offsetPoint(MyMath.mod(yearRatio, 1), distUpper-5)
	const lower = Ellipse.offsetPoint(MyMath.mod(yearRatio, 1), distLower)
	const data = round(upper.x) + "," + round(upper.y) + " " + round(lower.x) + "," + round(lower.y);
	var polyline = createSVGElem("polyline", { points: data, stroke: "red", "stroke-width": strokeWidth*2 });

	group.appendChild(polyline);

	addElement(group);
}

/*
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

	const d1 = createLoopData(distUpper, 100);
	const d2 = createLoopData(310, 100);

	const pathForClipping = createSVGElem("path", { d: d1 + ' ' + d2 });
	// const pathForClipping1 = createSVGElem("path", { d: d1 });
	// const pathForClipping2 = createSVGElem("path", { d: d2 });

	clipPath.appendChild(pathForClipping);
	// clipPath.appendChild(pathForClipping1);
	// clipPath.appendChild(pathForClipping2);

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
*/

function createDaySectors()
{
	var group = createSVGElem("g", {
		// fill: "none",
		// stroke: "black",
		// "stroke-width": strokeWidth,
	});

	const distUpper = 24;
	const distLower = 35;

	var dayCount = 0;

	for (var i = 0; i < monthsInYear; i++)
	{
		const turnMin = dayCount / daysInYear;
		dayCount += daysInMonth[i];
		const turnMax = dayCount / daysInYear;

		const monthSubdivs = daysInMonth[i] - 1;

		const sector = createSectorPath(turnMin, turnMax, distUpper, distLower, monthSubdivs, { fill: monthColors[i] });

		group.appendChild(sector);
	}

	// outlines

	var outlineg = createSVGElem("g", {
		fill: "none",
		stroke: "black",
		"stroke-width": strokeWidth,
	});

	const dhi = createLoopData(distUpper, daysInYear);
	const dlo = createLoopData(distLower, daysInYear);

	const pathHi = createSVGElem("path", { d: dhi });
	const pathLo = createSVGElem("path", { d: dlo });

	outlineg.appendChild(pathHi);
	outlineg.appendChild(pathLo);

	const finalAngle = (daysInYear - 1) / daysInYear;

	const pointsHi = Ellipse.offsetCurveGen(0, finalAngle, distUpper, daysInYear);
	const pointsLo = Ellipse.offsetCurveGen(0, finalAngle, distLower, daysInYear);

	for (var i = 0; i < daysInYear; i++)
	{
		const upper = pointsHi.next().value;
		const lower = pointsLo.next().value;

		const data = round(upper.x) + "," + round(upper.y) + " " + round(lower.x) + "," + round(lower.y);

		var polyline = createSVGElem("polyline", { points: data });

		outlineg.appendChild(polyline);
	}

	addElement(group);
	addElement(outlineg);
}

function shitfuck()
{
	const d = createLoopData(630, 200);
	// const d = createCurveData(-1/8, 1/8, 200, 2);

	const path = createSVGElem("path", { d, stroke: "black", "stroke-width": 3, fill: "transparent" });

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

function init(width, height)
{
	aspect = width / height;

	scaleX = 1000 * aspect;
	scaleY = 1000;
	radiusX = scaleX / 2;
	radiusY = scaleY / 2;

	const viewBox = [-scaleX / 2, -scaleY / 2, scaleX, scaleY].map(x => x.toFixed(2)).join(" ");

	svgRoot = createSVGElem("svg", { id: "yearRound", width: "100%", height: "100%", viewBox });
	svgDefs = createSVGElem("defs", {});

	svgRoot.appendChild(svgDefs);

	// createStyling();

	Ellipse.computeLUT(radiusX, radiusY, startTurn, isClockwise);

	return svgRoot;
}

return {
	init,
	createSVGElem,
	makeRects,
	createWeekSectors,
	createDaySectors,
	shitfuck,
};

})();
