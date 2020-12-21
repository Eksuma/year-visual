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

// const testDate = new Date(2020, 0, 7, 23, 59, 59, 0);
const currDate = new Date();
// const currDate = testDate;
const currYear = currDate.getFullYear();
const leapDay = isLeapYear(currYear) ? 1 : 0;
const daysInWeek = 7;
const monthsInYear = 12;
const daysInMonth = [31, 28 + leapDay, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const daysInYear = 365 + leapDay;

const yearStart = new Date(currYear, 0);
const yearEnd = new Date(currYear + 1, 0);
const firstDayOfYear = yearStart.getDay();

const getDatePosition = date => (date.getTime() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime());

const yearRatio = getDatePosition(currDate);

//
// "Settings"
//

const weekStartingDay = 1; // 0 = sun, 1 = mon, 2 = tue, 3 = wed, 4 = thu, 5 = fri, 6 = sat
const firstWeekOffset = -MyMath.mod(firstDayOfYear - weekStartingDay, daysInWeek);

const currDayOnTop = false;
const startTurn = -1/4 - (currDayOnTop ? yearRatio : 0);
const isClockwise = true;
const strokeWidth = 0.75;

const weekGapSize = 4;
const weekDistUpper = 0;
const weekDistLower = 24 - weekGapSize;

const dayDistUpper = 24;
const dayDistLower = 35;

const monthDistUpper = 35;
const monthDistLower = 60;

const quarterDistUpper = 60;
const quarterDistLower = 120;

const seasonDistUpper = 180;
const seasonDistLower = 230;

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
].map(name => name.toUpperCase());

const monthColors = [
	"#fdfdfd", "#b3e6ff", "#66ccff",
	"#99ff99", "#66ff33", "#99ff33",
	"#ffbf00", "#e1942b", "#906611", // 8: #c38e22
	"#ff8000", "#4d6680", "#c83333", // 10: #ff9933   11: #a18aa8   12: #ff3333
];

const seasonNames = ["spring", "summer", "autumn", "winter"].map(name => name.toUpperCase());

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

function createCurvedText(innerHTML, pathId, turnStart, turnEnd, offset, subdivisions, attributes, h4xshift = 0)
{
	const turnMid = (turnStart + turnEnd) / 2;
	const isUpsideDown = Ellipse.offsetPoint(turnMid, offset).y > 0;
	const flipped = !(isUpsideDown ^ isClockwise);
	// const flipped = (isUpsideDown ? 1 : 0) ^ (isClockwise ? 0 : 1);

	const d = 'M' + createCurveData(
		turnStart,
		turnEnd,
		offset + (isUpsideDown ? -1 : 1) * h4xshift,
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

function createThiccLine(p1, p2, width)
{
	const halfW = width * 0.5;
	const point = new Vector2();
	const normal = new Vector2().substractVectors(p2, p1).normalize().perp();

	var data = "";

	const addP = p => data += round(p.x) + "," + round(p.y) + " ";

	point.copy(p1).addScaledVector(normal, halfW); addP(point);
	point.copy(p2).addScaledVector(normal, halfW); addP(point);
	point.copy(p2).addScaledVector(normal, -halfW); addP(point);
	point.copy(p1).addScaledVector(normal, -halfW); addP(point);

	return 'M' + data + 'z';
}

function createDashedLine(p1, p2, width, dash)
{
	const length = new Vector2().substractVectors(p2, p1).length();

	const point1 = new Vector2();
	const point2 = new Vector2();

	var data = "";

	for (var x = 0; x <= length - dash; x += dash * 2)
	{
		const alpha1 = (x + 0) / length;
		const alpha2 = (x + dash) / length;

		point1.lerpVectors(p1, p2, alpha1);
		point2.lerpVectors(p1, p2, alpha2);

		data += createThiccLine(point1, point2, width) + ' ';
	}

	return data.trim();
}

function createWeekSectors()
{
	const group = createSVGElem("g", {
		id: "weeks",
		fill: "#bbb",
		stroke: "none",
	});

	const distMiddle = (weekDistUpper + weekDistLower) / 2;
	const radialGap = (weekGapSize / Ellipse.getCircumference()) / 2;
	const weekSubdivs = 6;

	for (var i = firstWeekOffset, weekNum = 0; i < daysInYear; i += daysInWeek, weekNum++)
	{
		const dayNum1 = Math.max(i, 0);
		const dayNum2 = Math.min(i + daysInWeek, daysInYear);

		const turnMin = (dayNum1 / daysInYear) + radialGap;
		const turnMax = (dayNum2 / daysInYear) - radialGap;

		const sector = createSectorPath(turnMin, turnMax, weekDistUpper, weekDistLower, weekSubdivs, {});

		group.appendChild(sector);

		//
		// labels
		//

		const hasRoom = (dayNum2 - dayNum1) > 4;

		if (!hasRoom)
			continue;

		const pathId = `week${weekNum}`;
		const innerHTML = `WEEK <tspan dy="-1">${weekNum + 1}</tspan>`; // TODO: Miksi täytyy olla hack
		// const innerHTML = `${(hasRoom ? "WEEK" : "")} <tspan dy="-1">${weekNum + 1}</tspan>`;

		const text = createCurvedText(innerHTML, pathId, turnMin, turnMax, distMiddle, weekSubdivs, { class: "tyyli1" }, 1.0);

		group.appendChild(text);
	}

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

	var dayCount = 0;

	for (var i = 0; i < monthsInYear; i++)
	{
		const turnMin = dayCount / daysInYear;
		dayCount += daysInMonth[i];
		const turnMax = dayCount / daysInYear;

		const monthSubdivs = daysInMonth[i] - 1;

		const sector = createSectorPath(turnMin, turnMax, dayDistUpper, dayDistLower, monthSubdivs, { fill: monthColors[i] });

		group.appendChild(sector);
	}

	addElement(group);
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
	});

	const distMiddle = (monthDistUpper + monthDistLower) / 2;

	const monthSubdivs = 10;

	var dayCount = 0;

	for (var i = 0; i < monthsInYear; i++)
	{
		const turnMin = dayCount / daysInYear;
		dayCount += daysInMonth[i];
		const turnMax = dayCount / daysInYear;

		const monthSubdivs = daysInMonth[i] - 1;

		const sector = createSectorPath(turnMin, turnMax, monthDistUpper, monthDistLower, monthSubdivs, {});

		// labels

		const pathId = `month${i}`;
		const innerHTML = monthNames[i];

		const text = createCurvedText(innerHTML, pathId, turnMin, turnMax, distMiddle, monthSubdivs, { fill: monthColors[i], class: "months" }, 1.5);

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
		fill: "white",
		stroke: "black",
		"stroke-width": strokeWidth / 2,
	});

	const distMiddle = (quarterDistUpper + quarterDistLower) / 2;
	const subSectors = 3;

	var monthIndex = 0;
	var dayCounter = 0;

	for (var i = 0; i < daysInYear; i++)
	{
/*
		const turnMin = (i + 0) / daysInYear;
		const turnMax = (i + 1) / daysInYear;

		const alpha = dayCounter / daysInMonth[monthIndex];

		// const sector = createSectorPath(turnMin, turnMax, quarterDistUpper, quarterDistLower, 0, { fill: lerpColors(monthColors[monthIndex], monthColors[(monthIndex + 1) % monthsInYear], alpha) });
		const sector = createSectorPath(turnMin, turnMax, quarterDistUpper, quarterDistLower, 0, {
			fill: lerpColors(
				monthColors[MyMath.mod(monthIndex + 0 - ((alpha < 0.5) ? 1 : 0), monthsInYear)],
				monthColors[MyMath.mod(monthIndex + 1 - ((alpha < 0.5) ? 1 : 0), monthsInYear)],
				((alpha < 0.5) ? alpha + 0.5 : alpha - 0.5)),
		});
*/

		for (var j = 0; j < subSectors; j++)
		{
			const turnMin = (i + (j + 0) / subSectors) / daysInYear;
			const turnMax = (i + (j + 1) / subSectors) / daysInYear;

			const alpha = (dayCounter + j / subSectors) / daysInMonth[monthIndex];

			// const sector = createSectorPath(turnMin, turnMax, quarterDistUpper, quarterDistLower, 0, { fill: lerpColors(monthColors[monthIndex], monthColors[(monthIndex + 1) % monthsInYear], alpha) });
			const sector = createSectorPath(turnMin, turnMax, quarterDistUpper, quarterDistLower, 0, {
				fill: lerpColors(
					monthColors[MyMath.mod(monthIndex + 0 - ((alpha < 0.5) ? 1 : 0), monthsInYear)],
					monthColors[MyMath.mod(monthIndex + 1 - ((alpha < 0.5) ? 1 : 0), monthsInYear)],
					((alpha < 0.5) ? alpha + 0.5 : alpha - 0.5)),
			});

			group.appendChild(sector);
		}

		if (++dayCounter >= daysInMonth[monthIndex])
		{
			monthIndex++;
			dayCounter = 0;
		}

		//group.appendChild(sector);
	}

	//
	// labels
	//

	var dayCount = 0;

	for (var i = 0; i < 4; i++)
	{
		const daysInQuarter = daysInMonth[i * 3 + 0] + daysInMonth[i * 3 + 1] + daysInMonth[i * 3 + 2];

		const turnMin = dayCount / daysInYear;
		dayCount += daysInQuarter;
		const turnMax = dayCount / daysInYear;

		const pathId = `quarter${i}`;
		const innerHTML = `QUARTER ${i + 1}`;
		//const innerHTML = `<===+===|===+===QUARTER ${i + 1}===+===|===+===>`;

		const text = createCurvedText(innerHTML, pathId, turnMin, turnMax, distMiddle, daysInQuarter, { class: "quarters" }, 1.5);

		labels.appendChild(text);
	}

	group.appendChild(labels);
	addElement(group);
}

function createSeasonSectors()
{
	const group = createSVGElem("g", {
		id: "seasons",
		fill: "#aaa",
		//stroke: "transparent",
		//stroke: "black",
		//"stroke-width": 5,
		"fill-rule": "evenodd",
	});

	const labels = createSVGElem("g", {
		fill: "white",
		stroke: "none",
		"stroke-width": strokeWidth / 2,
	});

	const seasonsInYear = seasonNames.length;
	const distMiddle = (seasonDistUpper + seasonDistLower) / 2;

	const du = createLoopData(seasonDistUpper, daysInYear);
	const dl = createLoopData(seasonDistLower, daysInYear);

	//

	const dash = 15;
	const lineW = 3.5;

	const linePoint1 = new Vector2().copy(Ellipse.offsetPoint(1/8, quarterDistLower + 5));
	const linePoint2 = new Vector2().copy(Ellipse.offsetPoint(3/8, quarterDistLower + 5));
	const lineLength1 = linePoint1.length();
	const lineLength2 = linePoint2.length();

	const dir1 = linePoint1.clone().normalize();
	const dir2 = linePoint2.clone().normalize();

	const p1 = dir1.clone().multiply(1.5 * dash);
	const p2 = dir1.clone().multiply(Math.floor(lineLength1 / dash) * dash);
	const p3 = dir2.clone().multiply(1.5 * dash);
	const p4 = dir2.clone().multiply(Math.floor(lineLength2 / dash) * dash);

	const line1 = createDashedLine({x:-p1.x,y:-p1.y}, {x:-p2.x,y:-p2.y}, lineW, dash);
	const line2 = createDashedLine({x: p1.x,y: p1.y}, {x: p2.x,y: p2.y}, lineW, dash);
	const line3 = createDashedLine({x:-p3.x,y:-p3.y}, {x:-p4.x,y:-p4.y}, lineW, dash);
	const line4 = createDashedLine({x: p3.x,y: p3.y}, {x: p4.x,y: p4.y}, lineW, dash);

	const path = createSVGElem("path", { d: du + ' ' + dl + ' ' + line1 + ' ' + line2 + ' ' + line3 + ' ' + line4 });
	group.appendChild(path);

	const p5 = dir1.clone().multiply(0.5 * dash);
	const p6 = dir2.clone().multiply(0.5 * dash);

	const cd1 = createThiccLine({x: p5.x,y: p5.y}, {x:-p5.x,y:-p5.y}, lineW);
	const cd2 = createThiccLine({x: p6.x,y: p6.y}, {x:-p6.x,y:-p6.y}, lineW);
	const center = createSVGElem("path", { d: cd1 + ' ' + cd2, "fill-rule": "nonzero" });
	group.appendChild(center);

	//
	// labels
	//

	const turnStart = 1/8;

	for (var i = 0; i < seasonsInYear; i++)
	{
		const turnMin = turnStart + (i + 0) / seasonsInYear;
		const turnMax = turnStart + (i + 1) / seasonsInYear;

		const pathId = `season${i}`;
		const innerHTML = seasonNames[i];

		const text = createCurvedText(innerHTML, pathId, turnMin, turnMax, distMiddle, daysInYear / 4, { class: "seasons" }, 1.25);

		labels.appendChild(text);
	}

	group.appendChild(labels);
	addElement(group);
}

function createOutlines()
{
	var group = createSVGElem("g", {
		fill: "none",
		stroke: "black",
		"stroke-width": strokeWidth,
	});

	//
	// days
	//

	{
		const dhi = createLoopData(dayDistUpper, daysInYear);
		const dlo = createLoopData(dayDistLower, daysInYear);

		const pathHi = createSVGElem("path", { d: dhi });
		const pathLo = createSVGElem("path", { d: dlo });

		group.appendChild(pathHi);
		group.appendChild(pathLo);

		const finalAngle = (daysInYear - 1) / daysInYear;

		const pointsHi = Ellipse.offsetCurveGen(0, finalAngle, dayDistUpper, daysInYear);
		const pointsLo = Ellipse.offsetCurveGen(0, finalAngle, dayDistLower, daysInYear);

		for (var i = 0; i < daysInYear; i++)
		{
			const upper = pointsHi.next().value;
			const lower = pointsLo.next().value;

			const data = round(upper.x) + "," + round(upper.y) + " " + round(lower.x) + "," + round(lower.y);

			var polyline = createSVGElem("polyline", { points: data });

			group.appendChild(polyline);
		}
	}

	//
	// months
	//

	{
		//const dhi = createLoopData(monthDistUpper, daysInYear);
		const dlo = createLoopData(monthDistLower, daysInYear);

		//const pathHi = createSVGElem("path", { d: dhi });
		const pathLo = createSVGElem("path", { d: dlo });

		//outlines.appendChild(pathHi);
		group.appendChild(pathLo);

		const finalAngle = (monthsInYear - 1) / monthsInYear;

		const pointsHi = Ellipse.offsetCurveGen(0, finalAngle, monthDistUpper, monthsInYear);
		const pointsLo = Ellipse.offsetCurveGen(0, finalAngle, monthDistLower, monthsInYear);

		var dayCount = 0;

		for (var i = 0; i < monthsInYear; i++)
		{
			const alpha = dayCount / daysInYear;

			dayCount += daysInMonth[i];

			const upper = Ellipse.offsetPoint(alpha, monthDistUpper);
			const lower = Ellipse.offsetPoint(alpha, monthDistLower);

			const data = round(upper.x) + "," + round(upper.y) + " " + round(lower.x) + "," + round(lower.y);

			var polyline = createSVGElem("polyline", { points: data });

			group.appendChild(polyline);
		}
	}

	// quarters

	{
		const d = createLoopData(quarterDistLower, daysInYear);
		group.appendChild(createSVGElem("path", { d }));

		var dayCount = 0;

		for (var i = 0; i < 4; i++)
		{
			const daysInQuarter = daysInMonth[i * 3 + 0] + daysInMonth[i * 3 + 1] + daysInMonth[i * 3 + 2];

			const alpha = dayCount / daysInYear;
			dayCount += daysInQuarter;

			const upper = Ellipse.offsetPoint(alpha, quarterDistUpper);
			const lower = Ellipse.offsetPoint(alpha, quarterDistLower);

			const data = round(upper.x) + "," + round(upper.y) + " " + round(lower.x) + "," + round(lower.y);

			var polyline = createSVGElem("polyline", { points: data });

			group.appendChild(polyline);
		}
	}

	addElement(group);
}

function createCelestialPhases()
{

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

	svgRoot = createSVGElem("svg", { id: "yearRound", width, height, viewBox });
	svgDefs = createSVGElem("defs", {});

	svgRoot.appendChild(svgDefs);

	// createStyling();

	Ellipse.computeLUT(radiusX, radiusY, startTurn, isClockwise);

	return svgRoot;
}

function createDateDial()
{
	// const upper = Ellipse.offsetPoint(MyMath.mod(yearRatio, 1), weekDistUpper-5)
	// const lower = Ellipse.offsetPoint(MyMath.mod(yearRatio, 1), weekDistLower)
	const upper = Ellipse.offsetPoint(yearRatio, weekDistUpper-5)
	const lower = Ellipse.offsetPoint(yearRatio, quarterDistLower+5)

	const data = round(upper.x) + "," + round(upper.y) + " " + round(lower.x) + "," + round(lower.y);
	var polyline = createSVGElem("polyline", { points: data, stroke: "red", "stroke-width": strokeWidth*3, fill: "black" });

	svgRoot.appendChild(polyline);
}

function build()
{
	makeRects(10);
	createWeekSectors();
	createDaySectors();
	createMonthSectors();
	createQuarterSectors();
	createSeasonSectors();
	createOutlines();
	createDateDial();
	shitfuck();
}

return {
	init,
	createSVGElem,
	build
};

})();
