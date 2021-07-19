"use strict";

class Grapher
{
	constructor(maxPlots, maxDataPoints, xLabel, yLabel)
	{
		this.maxPlots = maxPlots;
		this.maxDataPoints = maxDataPoints;

		this.min = new Vector2();
		this.max = new Vector2();

		// this.plotColors = ["darkred", "darkcyan", "darkgreen", "darkorange", "darkmagenta"];
		this.plotColors = ["red", "blue", "green", "orange", "magenta"];

		this.numDataPoints = [];
		this.dataOffset = [];
		this.dataPoints = [];

		for (var plot = 0; plot < this.maxPlots; plot++)
		{
			this.numDataPoints[plot] = 0;
			this.dataOffset[plot] = 0;
			this.dataPoints[plot] = [];

			for (var j = 0; j < this.maxDataPoints; j++)
			{
				this.dataPoints[plot].push(new Vector2(0, 0));
			}
		}

		this.xAxisLabel = xLabel;
		this.yAxisLabel = yLabel;
	};

	draw(ctx, x, y, width, height, showXZero, showYZero)
	{
		const labelSpaceTop = 10;
		const labelSpaceBottom = 50;
		const labelSpaceLeft = 50;
		const labelSpaceRight = 5;

		const textMargin = 5;

		const dataX = x + labelSpaceLeft;
		const dataY = y + labelSpaceTop;
		const dataW = width - (labelSpaceLeft + labelSpaceRight);
		const dataH = height - (labelSpaceTop + labelSpaceBottom);

		this.findBounds();

		ctx.save();

		ctx.globalAlpha = 0.75;

/*
		if (showOrigin)
		{
			if (this.min.x > 0) this.min.x = 0;
			if (this.min.y > 0) this.min.y = 0;
			if (this.max.x < 0) this.max.x = 0;
			if (this.max.y < 0) this.max.y = 0;
		}
*/

		if (showXZero)
		{
			this.min.x = Math.min(0, this.min.x);
			this.max.x = Math.max(0, this.max.x);
		}

		if (showYZero)
		{
			if (this.min.y > 0) this.min.y = 0;
			if (this.max.y < 0) this.max.y = 0;
		}

		// draw a line at x-zero if visible
		if (this.min.x < 0 && this.max.x > 0)
		{
			ctx.beginPath();
			ctx.strokeStyle = "lightgray";

			var x = MyMath.lerpRange(dataX, dataX + dataW, this.min.x, this.max.x, 0);

			ctx.moveTo(x, dataY);
			ctx.lineTo(x, dataY + dataH);
			ctx.stroke();
		}

		// draw a line at y-zero if visible
		if (this.min.y < 0 && this.max.y > 0)
		{
			ctx.beginPath();
			ctx.strokeStyle = "lightgray";

			var y = MyMath.lerpRange(dataY + dataH, dataY, this.min.y, this.max.y, 0);

			ctx.moveTo(dataX, y);
			ctx.lineTo(dataX + dataW, y);
			ctx.stroke();
		}

		// plot the data itself
		this.drawData(ctx, dataX, dataY, dataW, dataH);

		// draw some axis, values and labels
		this.drawArrow(ctx, {x: dataX, y: dataY + dataH}, {x: dataX, y: dataY}, "black", 3, 5, false);
		this.drawArrow(ctx, {x: dataX, y: dataY + dataH}, {x: dataX + dataW, y: dataY + dataH}, "black", 3, 5, false);

		ctx.fillStyle = "blue";
		ctx.font = "10px Open Sans";
		ctx.textAlign = "end";
		ctx.fillText(this.min.y.toFixed(3), dataX - textMargin, dataY + dataH);
		ctx.textBaseline = "top";
		ctx.fillText(this.max.y.toFixed(3), dataX - textMargin, dataY);

		ctx.fillStyle = "orange";
		ctx.fillText(this.max.x.toFixed(3), dataX + dataW, dataY + dataH + textMargin);
		ctx.textAlign = "start";
		ctx.fillText(this.min.x.toFixed(3), dataX, dataY + dataH + textMargin);

		ctx.font = "italic bold 16px Open Sans";
		ctx.fillStyle = "darkgray";
		ctx.textAlign = "center";
		ctx.fillText(this.xAxisLabel, dataX + dataW / 2, dataY + dataH + textMargin);

		ctx.textBaseline = "alphabetic";
		ctx.translate(dataX - textMargin, dataY + dataH / 2);
		ctx.rotate(-Math.PI/2);
		ctx.fillText(this.yAxisLabel, 0, 0);

		ctx.restore();
	};

	insert(plotNum, data)
	{
		var offset = this.dataOffset[plotNum];

		this.dataPoints[plotNum][offset].copy(data);

		this.numDataPoints[plotNum]++;

		if (this.numDataPoints[plotNum] > this.maxDataPoints)
			this.numDataPoints[plotNum] = this.maxDataPoints;

		this.dataOffset[plotNum]++;

		if (this.dataOffset[plotNum] >= this.maxDataPoints)
			this.dataOffset[plotNum] = 0;
	};

	clear()
	{
		for (var plot = 0; plot < this.maxPlots; plot++)
		{
			this.numDataPoints[plot] = 0;
			this.dataOffset[plot] = 0;
		}
	};

	findBounds()
	{
		this.min.x = Number.POSITIVE_INFINITY;
		this.max.x = Number.NEGATIVE_INFINITY;
		this.min.y = Number.POSITIVE_INFINITY;
		this.max.y = Number.NEGATIVE_INFINITY;

		for (var plot = 0; plot < this.maxPlots; plot++)
		{
			for (var j = 0, len = this.numDataPoints[plot]; j < len; j++)
			{
				var data = this.dataPoints[plot][j];

				if (data.x < this.min.x) this.min.x = data.x;
				if (data.x > this.max.x) this.max.x = data.x;

				if (data.y < this.min.y) this.min.y = data.y;
				if (data.y > this.max.y) this.max.y = data.y;
			}
		}
	};

	drawData(ctx, x, y, width, height)
	{
		ctx.lineWidth = 2;

		for (var plot = 0; plot < this.maxPlots; plot++)
		{
			ctx.beginPath();
			//ctx.strokeStyle = this.plotColors[plot];
			ctx.strokeStyle = `hsl(${plot/this.maxPlots*360}, 100%, 50%)`;

			for (var i = 0, len = this.numDataPoints[plot]; i < len; i++)
			{
				var index = this.dataOffset[plot] - i - 1;

				if (index < 0)
					index += this.maxDataPoints;

				var data = this.dataPoints[plot][index];

				var screenx = MyMath.lerpRange(x, x + width, this.min.x, this.max.x, data.x);
				var screeny = MyMath.lerpRange(y + height, y, this.min.y, this.max.y, data.y);

				if (i == 0)
				{
					ctx.moveTo(screenx, screeny);
				}
				else
				{
					ctx.lineTo(screenx, screeny);
				}
			}

			ctx.stroke();
		}
	};

	drawArrow(ctx, p1, p2, style, headWidth, headHeight, headFilled)
	{
		ctx.beginPath();
		ctx.strokeStyle = style;

		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);

		var vx = p1.x - p2.x;
		var vy = p1.y - p2.y;

		var ilen = 1 / Math.sqrt(vx*vx + vy*vy);

		vx *= ilen;
		vy *= ilen;

		var corner1x = p2.x + vx * headHeight - vy * headWidth / 2;
		var corner1y = p2.y + vy * headHeight + vx * headWidth / 2;

		var corner2x = p2.x + vx * headHeight + vy * headWidth / 2;
		var corner2y = p2.y + vy * headHeight - vx * headWidth / 2;

		if (headFilled)
		{
			ctx.stroke();

			ctx.beginPath();
			ctx.fillStyle = style;

			ctx.moveTo(p2.x, p2.y);
			ctx.lineTo(corner1x, corner1y);
			ctx.lineTo(corner2x, corner2y);
			ctx.closePath();

			ctx.fill();
		}
		else
		{
			ctx.lineTo(corner1x, corner1y);
			ctx.moveTo(p2.x, p2.y);
			ctx.lineTo(corner2x, corner2y);

			ctx.stroke();
		}
	};
}
