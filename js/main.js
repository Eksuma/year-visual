(function(){
"use strict";

const targetId = "svgmain";
const svgContainer = document.getElementById(targetId);
const contentBox = getContentSize(svgContainer);

const goldenRatio = 5. ** .5 * .5 + .5;

const maxScaleDiff = 1.5;
const width = Math.min(contentBox.height * maxScaleDiff, contentBox.width);
const height = contentBox.height;

const svgRoot = SVG.init(width, height);

svgContainer.appendChild(svgRoot);

SVG.build();

function getContentSize(element)
{
	const styles = getComputedStyle(element);

	return {
		width: element.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight),
		height: element.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom)
	};
}

function testSomething()
{
	for (var i = 0; i < 1000000; i++)
	{
		var f = MyMath.random(-10, 10);

		var scale = MyMath.randomInt(5, 10);
		var spacer = MyMath.randomInt(5, 10);

		var fn = MyMath.mod(f, 1);

		//var r1 = MyMath.mod(f * scale, spacer);
		//var r2 = MyMath.mod(fn, spacer);

		var r1 = fn * scale;
		var r2 = MyMath.mod(f * scale, scale);

		if (Math.abs(r1 - r2) > 1.0e-12)
		{
			console.log("f:      " + f)
			console.log("fn:     " + fn)
			console.log("scale:  " + scale)
			console.log("spacer: " + spacer)
			console.log("r1:     " + r1)
			console.log("r2:     " + r2)
			return;
		}
	}

	console.log("tests passed.");
}

// testSomething();

})();
