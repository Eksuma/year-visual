const SVG = (function() {
"use strict";

//
// Variables
//

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

const currDate = new Date();
const currYear = currDate.getFullYear();
const leapDay = isLeapYear(currYear) ? 1 : 0;
const daysInWeek = 7;
const monthsInYear = 12;
const daysInMonth = [31, 28 + leapDay, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const daysInYear = 365 + leapDay;

const testDate = new Date(currYear, 11, 31, 23, 59, 59, 0);

const yearStart = new Date(currYear, 0);
const yearEnd = new Date(currYear + 1, 0);
const yearRatio = (currDate.getTime() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime());
// const yearRatio = (testDate - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime());
const firstDayOfYear = yearStart.getDay();

//
// "Settings"
//

const weekStartingDay = 1; // 0 = sun, 1 = mon, 2 = tue, 3 = wed, 4 = thu, 5 = fri, 6 = sat
const firstWeekOffset = -MyMath.mod(firstDayOfYear - weekStartingDay, daysInWeek);

const currDayOnTop = false;
const startTurn = -1/4 - (currDayOnTop ? yearRatio : 0);
const isClockwise = true;
const strokeWidth = 0.75;

console.log("percent: " + (yearRatio * 100).toFixed(2))
// console.log("test: " + testDate)
// console.log("millis: " + (yearEnd.getTime() - testDate.getTime()))

/*
const monthNames = [
	"tammi", "helmi", "maalis",
	"huhti", "touko", "kesä",
	"heinä", "elo", "syys",
	"loka", "marras", "joulu"
];
*/

const monthNames = [
	"january", "february", "march",
	"april", "may", "june",
	"july", "august", "september",
	"october", "november", "december"
];

const monthColors = [
	"#fdfdfd", "#b3e6ff", "#66ccff",
	"#99ff99", "#66ff33", "#99ff33",
	"#ffbf00", "#e1942b", "#906611", // 8: #c38e22
	"#ff8000", "#4d6680", "#c83333", // 10: #ff9933   11: #a18aa8   12: #ff3333
];

//
// Functions
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

function createCurvedText(innerHTML, pathId, turnStart, turnEnd, offset, subdivisions, attributes)
{
	const turnMid = (turnStart + turnEnd) / 2;
	const isUpsideDown = Ellipse.offsetPoint(turnMid, offset).y > 0;
	// const flipped = !(isUpsideDown ^ isClockwise);
	const flipped = (isUpsideDown ? 1 : 0) ^ (isClockwise ? 0 : 1);

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
		side: (flipped ? "right" : "left"),
	});

	textPath.setAttributeNS(xlinkNS, "href", '#' + pathId);

	textPath.innerHTML = innerHTML;
	text.appendChild(textPath);

	return text;
}

function createWeekSectors()
{
	const group = createSVGElem("g", {
		id: "weeks",
		fill: "#bbb",
		stroke: "none",
	});

	const gapSize = 4;
	const distUpper = 0;
	const distLower = 24 - gapSize;
	const distMiddle = (distUpper + distLower) / 2;
	const radialGap = (gapSize / 2) / Ellipse.getCircumference();
	const weekSubdivs = 3;

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
		if (dayNum2 - dayNum1 < 5)
			continue;

		const pathId = `week${weekNum}`;
		const innerHTML = `WEEK <tspan dy="-1">${weekNum + 1}</tspan>`; // TODO: Miksi täytyy olla hack

		const text = createCurvedText(innerHTML, pathId, turnMin, turnMax, distMiddle, weekSubdivs, { class: "tyyli1" });

		group.appendChild(text);
	}

	// tmp year dial
	const upper = Ellipse.offsetPoint(MyMath.mod(yearRatio, 1), distUpper-5)
	const lower = Ellipse.offsetPoint(MyMath.mod(yearRatio, 1), distLower)
	const data = round(upper.x) + "," + round(upper.y) + " " + round(lower.x) + "," + round(lower.y);
	var polyline = createSVGElem("polyline", { points: data, stroke: "red", "stroke-width": strokeWidth/2 });

	group.appendChild(polyline);

	addElement(group);
}

function createDaySectors()
{
	var group = createSVGElem("g", {
		id: "days",
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

function createMonthSectors()
{
	const group = createSVGElem("g", {
		id: "months",
		fill: "#fff",
		stroke: "none",
	});

	const labels = createSVGElem("g", {
		fill: "black",
		stroke: "black",
		"stroke-width": strokeWidth / 2,
		style: "font-size: 20px;",
	});

	const distUpper = 35+1;
	const distLower = 55+5;
	const distMiddle = (distUpper + distLower) / 2;

	const monthSubdivs = 10;

	var dayCount = 0;

	for (var i = 0; i < monthsInYear; i++)
	{
		const turnMin = dayCount / daysInYear;
		dayCount += daysInMonth[i];
		const turnMax = dayCount / daysInYear;

		const monthSubdivs = daysInMonth[i] - 1;

		const sector = createSectorPath(turnMin, turnMax, distUpper, distLower, monthSubdivs, {});

		// labels

		const pathId = `month${i}`;
		const innerHTML = monthNames[i].toUpperCase();

		const text = createCurvedText(innerHTML, pathId, turnMin, turnMax, distMiddle, monthSubdivs, { fill: monthColors[i] });

		labels.appendChild(text);

		group.appendChild(sector);
	}

	group.appendChild(labels);
	addElement(group);
}

function createQuarterSectors()
{
	const group = createSVGElem("g", {
		id: "quarters",
		fill: "#f0f",
		stroke: "none",
		"shape-rendering": "crispEdges",
	});

	const labels = createSVGElem("g", {
		fill: "black",
		stroke: "black",
		"stroke-width": strokeWidth / 2,
		style: "font-size: 30px;",
	});

	const distUpper = 61;
	const distLower = 120;
	const distMiddle = (distUpper + distLower) / 2;

	var monthIndex = 0;
	var dayCounter = 0;

	for (var i = 0; i < daysInYear; i++)
	{
		const turnMin = (i + 0) / daysInYear;
		const turnMax = (i + 1) / daysInYear;

		const alpha = dayCounter / daysInMonth[monthIndex];

		// const sector = createSectorPath(turnMin, turnMax, distUpper, distLower, 0, { fill: lerpColors(monthColors[monthIndex], monthColors[(monthIndex + 1) % monthsInYear], alpha) });
		const sector = createSectorPath(turnMin, turnMax, distUpper, distLower, 0, {
			fill: lerpColors(
				monthColors[MyMath.mod(monthIndex + 0 - ((alpha < 0.5) ? 1 : 0), monthsInYear)],
				monthColors[MyMath.mod(monthIndex + 1 - ((alpha < 0.5) ? 1 : 0), monthsInYear)],
				((alpha < 0.5) ? alpha + 0.5 : alpha - 0.5)),
		});

		if (++dayCounter >= daysInMonth[monthIndex])
		{
			monthIndex++;
			dayCounter = 0;
		}

		group.appendChild(sector);
	}

	group.appendChild(labels);
	addElement(group);
}

function shitfuck()
{
	const d = createLoopData(630, 200);
	// const d = createCurveData(-1/8, 1/8, 200, 2);

	const path = createSVGElem("path", { d, stroke: "black", "stroke-width": 3, fill: "transparent" });

	addElement(path);
}

function init(width, height)
{
	aspect = width / height;

	scaleX = 1000 * aspect;
	scaleY = 1000;
	radiusX = scaleX / 2;
	radiusY = scaleY / 2;

	const viewBox = [-scaleX / 2, -scaleY / 2, scaleX, scaleY].map(x => x.toFixed(2)).join(" ");
	// const viewBox = [-scaleX / 8 - 100, -scaleY / 2, scaleX / 4, scaleY / 4].map(x => x.toFixed(2)).join(" ");

	svgRoot = createSVGElem("svg", { id: "yearRound", width: "100%", height: "100%", viewBox });
	svgDefs = createSVGElem("defs", {});

	svgRoot.appendChild(svgDefs);

	// createStyling();

	Ellipse.computeLUT(radiusX, radiusY, startTurn, isClockwise);

	return svgRoot;
}

function build()
{
	makeRects(10);
	createWeekSectors();
	createDaySectors();
	createMonthSectors();
	createQuarterSectors();
	shitfuck();
}

return {
	init,
	createSVGElem,
	build
};

})();
