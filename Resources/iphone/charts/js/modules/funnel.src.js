(function(Highcharts) {
    "use strict";
    var defaultOptions = Highcharts.getOptions(), defaultPlotOptions = defaultOptions.plotOptions, seriesTypes = Highcharts.seriesTypes, merge = Highcharts.merge, noop = function() {}, each = Highcharts.each;
    defaultPlotOptions.funnel = merge(defaultPlotOptions.pie, {
        animation: false,
        center: [ "50%", "50%" ],
        width: "90%",
        neckWidth: "30%",
        height: "100%",
        neckHeight: "25%",
        reversed: false,
        dataLabels: {
            connectorWidth: 1,
            connectorColor: "#606060"
        },
        size: true,
        states: {
            select: {
                color: "#C0C0C0",
                borderColor: "#000000",
                shadow: false
            }
        }
    });
    seriesTypes.funnel = Highcharts.extendClass(seriesTypes.pie, {
        type: "funnel",
        animate: noop,
        singularTooltips: true,
        translate: function() {
            var tempWidth, getWidthAt, path, fraction, x1, y1, x2, x3, y3, x4, y5, getLength = function(length, relativeTo) {
                return /%$/.test(length) ? relativeTo * parseInt(length, 10) / 100 : parseInt(length, 10);
            }, sum = 0, series = this, chart = series.chart, options = series.options, reversed = options.reversed, plotWidth = chart.plotWidth, plotHeight = chart.plotHeight, cumulative = 0, center = options.center, centerX = getLength(center[0], plotWidth), centerY = getLength(center[0], plotHeight), width = getLength(options.width, plotWidth), height = getLength(options.height, plotHeight), neckWidth = getLength(options.neckWidth, plotWidth), neckHeight = getLength(options.neckHeight, plotHeight), neckY = height - neckHeight, data = series.data, half = "left" === options.dataLabels.position ? 1 : 0;
            series.getWidthAt = getWidthAt = function(y) {
                return y > height - neckHeight || height === neckHeight ? neckWidth : neckWidth + (width - neckWidth) * ((height - neckHeight - y) / (height - neckHeight));
            };
            series.getX = function(y, half) {
                return centerX + (half ? -1 : 1) * (getWidthAt(reversed ? plotHeight - y : y) / 2 + options.dataLabels.distance);
            };
            series.center = [ centerX, centerY, height ];
            series.centerX = centerX;
            each(data, function(point) {
                sum += point.y;
            });
            each(data, function(point) {
                y5 = null;
                fraction = sum ? point.y / sum : 0;
                y1 = centerY - height / 2 + cumulative * height;
                y3 = y1 + fraction * height;
                tempWidth = getWidthAt(y1);
                x1 = centerX - tempWidth / 2;
                x2 = x1 + tempWidth;
                tempWidth = getWidthAt(y3);
                x3 = centerX - tempWidth / 2;
                x4 = x3 + tempWidth;
                if (y1 > neckY) {
                    x1 = x3 = centerX - neckWidth / 2;
                    x2 = x4 = centerX + neckWidth / 2;
                } else if (y3 > neckY) {
                    y5 = y3;
                    tempWidth = getWidthAt(neckY);
                    x3 = centerX - tempWidth / 2;
                    x4 = x3 + tempWidth;
                    y3 = neckY;
                }
                if (reversed) {
                    y1 = height - y1;
                    y3 = height - y3;
                    y5 = y5 ? height - y5 : null;
                }
                path = [ "M", x1, y1, "L", x2, y1, x4, y3 ];
                y5 && path.push(x4, y5, x3, y5);
                path.push(x3, y3, "Z");
                point.shapeType = "path";
                point.shapeArgs = {
                    d: path
                };
                point.percentage = 100 * fraction;
                point.plotX = centerX;
                point.plotY = (y1 + (y5 || y3)) / 2;
                point.tooltipPos = [ centerX, point.plotY ];
                point.slice = noop;
                point.half = half;
                cumulative += fraction;
            });
        },
        drawPoints: function() {
            var series = this, options = series.options, chart = series.chart, renderer = chart.renderer;
            each(series.data, function(point) {
                var graphic = point.graphic, shapeArgs = point.shapeArgs;
                graphic ? graphic.animate(shapeArgs) : point.graphic = renderer.path(shapeArgs).attr({
                    fill: point.color,
                    stroke: options.borderColor,
                    "stroke-width": options.borderWidth
                }).add(series.group);
            });
        },
        sortByAngle: function(points) {
            points.sort(function(a, b) {
                return a.plotY - b.plotY;
            });
        },
        drawDataLabels: function() {
            var leftSide, sign, point, x, y, data = this.data, labelDistance = this.options.dataLabels.distance, i = data.length;
            this.center[2] -= 2 * labelDistance;
            while (i--) {
                point = data[i];
                leftSide = point.half;
                sign = leftSide ? 1 : -1;
                y = point.plotY;
                x = this.getX(y, leftSide);
                point.labelPos = [ 0, y, x + (labelDistance - 5) * sign, y, x + labelDistance * sign, y, leftSide ? "right" : "left", 0 ];
            }
            seriesTypes.pie.prototype.drawDataLabels.call(this);
        }
    });
    defaultOptions.plotOptions.pyramid = Highcharts.merge(defaultOptions.plotOptions.funnel, {
        neckWidth: "0%",
        neckHeight: "0%",
        reversed: true
    });
    Highcharts.seriesTypes.pyramid = Highcharts.extendClass(Highcharts.seriesTypes.funnel, {
        type: "pyramid"
    });
})(Highcharts);