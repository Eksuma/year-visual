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

})();
