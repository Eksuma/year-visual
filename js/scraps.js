


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
