(function(){
"use strict";

const targetId = "svgmain";
const svgContainer = document.getElementById(targetId);
const svgRect = svgContainer.getBoundingClientRect();

const goldenRatio = 5. ** .5 * .5 + .5;

const width = Math.min(svgRect.height * goldenRatio, svgRect.width);
const height = svgRect.height;

const svgRoot = SVG.init(width, height);

svgContainer.appendChild(svgRoot);

SVG.makeRects(10);
SVG.createWeekSectors();
SVG.createDaySectors();
SVG.shitfuck();

for (var i = 0; i < 1000000; i++)
{
	var f = MyMath.random(-10, 10);

	var scale = MyMath.randomInt(1, 10);
	var spacer = MyMath.randomInt(1, 10*scale);

	var fn = MyMath.mod(f * scale, 1);

	var r1 = MyMath.mod(f * scale, spacer);
	var r2 = MyMath.mod(fn, spacer);

	if (Math.abs(r1 - r2) > 1.0e-12)
	{
		console.log("f:      " + f)
		console.log("fn:     " + fn)
		console.log("scale:  " + scale)
		console.log("spacer: " + spacer)
		console.log("r1:     " + r1)
		console.log("r2:     " + r2)
		break;
	}
}

})();
