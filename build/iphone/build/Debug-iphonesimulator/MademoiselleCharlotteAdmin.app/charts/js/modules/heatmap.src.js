(function(Highcharts) {
    var UNDEFINED, Axis = Highcharts.Axis, Chart = Highcharts.Chart, Color = Highcharts.Color, Legend = Highcharts.Legend, LegendSymbolMixin = Highcharts.LegendSymbolMixin, Series = Highcharts.Series, defaultOptions = Highcharts.getOptions(), each = Highcharts.each, extend = Highcharts.extend, extendClass = Highcharts.extendClass, merge = Highcharts.merge, pick = Highcharts.pick, numberFormat = Highcharts.numberFormat, seriesTypes = Highcharts.seriesTypes, wrap = Highcharts.wrap, noop = function() {};
    var ColorAxis = Highcharts.ColorAxis = function() {
        this.isColorAxis = true;
        this.init.apply(this, arguments);
    };
    extend(ColorAxis.prototype, Axis.prototype);
    extend(ColorAxis.prototype, {
        defaultColorAxisOptions: {
            lineWidth: 0,
            gridLineWidth: 1,
            tickPixelInterval: 72,
            startOnTick: true,
            endOnTick: true,
            offset: 0,
            marker: {
                animation: {
                    duration: 50
                },
                color: "gray",
                width: .01
            },
            labels: {
                overflow: "justify"
            },
            minColor: "#EFEFFF",
            maxColor: "#003875",
            tickLength: 5
        },
        init: function(chart, userOptions) {
            var options, horiz = "vertical" !== chart.options.legend.layout;
            options = merge(this.defaultColorAxisOptions, {
                side: horiz ? 2 : 1,
                reversed: !horiz
            }, userOptions, {
                isX: horiz,
                opposite: !horiz,
                showEmpty: false,
                title: null,
                isColor: true
            });
            Axis.prototype.init.call(this, chart, options);
            userOptions.dataClasses && this.initDataClasses(userOptions);
            this.initStops(userOptions);
            this.isXAxis = true;
            this.horiz = horiz;
            this.zoomEnabled = false;
        },
        tweenColors: function(from, to, pos) {
            var hasAlpha = 1 !== to.rgba[3] || 1 !== from.rgba[3];
            return (hasAlpha ? "rgba(" : "rgb(") + Math.round(to.rgba[0] + (from.rgba[0] - to.rgba[0]) * (1 - pos)) + "," + Math.round(to.rgba[1] + (from.rgba[1] - to.rgba[1]) * (1 - pos)) + "," + Math.round(to.rgba[2] + (from.rgba[2] - to.rgba[2]) * (1 - pos)) + (hasAlpha ? "," + (to.rgba[3] + (from.rgba[3] - to.rgba[3]) * (1 - pos)) : "") + ")";
        },
        initDataClasses: function(userOptions) {
            var dataClasses, axis = this, chart = this.chart, colorCounter = 0, options = this.options;
            this.dataClasses = dataClasses = [];
            each(userOptions.dataClasses, function(dataClass, i) {
                var colors;
                dataClass = merge(dataClass);
                dataClasses.push(dataClass);
                if (!dataClass.color) if ("category" === options.dataClassColor) {
                    colors = chart.options.colors;
                    dataClass.color = colors[colorCounter++];
                    colorCounter === colors.length && (colorCounter = 0);
                } else dataClass.color = axis.tweenColors(Color(options.minColor), Color(options.maxColor), i / (userOptions.dataClasses.length - 1));
            });
        },
        initStops: function(userOptions) {
            this.stops = userOptions.stops || [ [ 0, this.options.minColor ], [ 1, this.options.maxColor ] ];
            each(this.stops, function(stop) {
                stop.color = Color(stop[1]);
            });
        },
        setOptions: function(userOptions) {
            Axis.prototype.setOptions.call(this, userOptions);
            this.options.crosshair = this.options.marker;
            this.coll = "colorAxis";
        },
        setAxisSize: function() {
            var x, y, width, height, symbol = this.legendSymbol, chart = this.chart;
            if (symbol) {
                this.left = x = symbol.attr("x");
                this.top = y = symbol.attr("y");
                this.width = width = symbol.attr("width");
                this.height = height = symbol.attr("height");
                this.right = chart.chartWidth - x - width;
                this.bottom = chart.chartHeight - y - height;
                this.len = this.horiz ? width : height;
                this.pos = this.horiz ? x : y;
            }
        },
        toColor: function(value, point) {
            var pos, from, to, color, dataClass, i, stops = this.stops, dataClasses = this.dataClasses;
            if (dataClasses) {
                i = dataClasses.length;
                while (i--) {
                    dataClass = dataClasses[i];
                    from = dataClass.from;
                    to = dataClass.to;
                    if ((from === UNDEFINED || value >= from) && (to === UNDEFINED || to >= value)) {
                        color = dataClass.color;
                        point && (point.dataClass = i);
                        break;
                    }
                }
            } else {
                this.isLog && (value = this.val2lin(value));
                pos = 1 - (this.max - value) / (this.max - this.min);
                i = stops.length;
                while (i--) if (pos > stops[i][0]) break;
                from = stops[i] || stops[i + 1];
                to = stops[i + 1] || from;
                pos = 1 - (to[0] - pos) / (to[0] - from[0] || 1);
                color = this.tweenColors(from.color, to.color, pos);
            }
            return color;
        },
        getOffset: function() {
            var group = this.legendGroup;
            if (group) {
                Axis.prototype.getOffset.call(this);
                if (!this.axisGroup.parentGroup) {
                    this.axisGroup.add(group);
                    this.gridGroup.add(group);
                    this.labelGroup.add(group);
                    this.added = true;
                }
            }
        },
        setLegendColor: function() {
            var grad, horiz = this.horiz, options = this.options;
            grad = horiz ? [ 0, 0, 1, 0 ] : [ 0, 0, 0, 1 ];
            this.legendColor = {
                linearGradient: {
                    x1: grad[0],
                    y1: grad[1],
                    x2: grad[2],
                    y2: grad[3]
                },
                stops: options.stops || [ [ 0, options.minColor ], [ 1, options.maxColor ] ]
            };
        },
        drawLegendSymbol: function(legend, item) {
            var box, padding = legend.padding, legendOptions = legend.options, horiz = this.horiz, width = pick(legendOptions.symbolWidth, horiz ? 200 : 12), height = pick(legendOptions.symbolHeight, horiz ? 12 : 200), labelPadding = pick(legendOptions.labelPadding, horiz ? 10 : 30);
            this.setLegendColor();
            item.legendSymbol = this.chart.renderer.rect(0, legend.baseline - 11, width, height).attr({
                zIndex: 1
            }).add(item.legendGroup);
            box = item.legendSymbol.getBBox();
            this.legendItemWidth = width + padding + (horiz ? 0 : labelPadding);
            this.legendItemHeight = height + padding + (horiz ? labelPadding : 0);
        },
        setState: noop,
        visible: true,
        setVisible: noop,
        getSeriesExtremes: function() {
            var series;
            if (this.series.length) {
                series = this.series[0];
                this.dataMin = series.valueMin;
                this.dataMax = series.valueMax;
            }
        },
        drawCrosshair: function(e, point) {
            var crossPos, newCross = !this.cross, plotX = point && point.plotX, plotY = point && point.plotY, axisPos = this.pos, axisLen = this.len;
            if (point) {
                crossPos = this.toPixels(point.value);
                axisPos > crossPos ? crossPos = axisPos - 2 : crossPos > axisPos + axisLen && (crossPos = axisPos + axisLen + 2);
                point.plotX = crossPos;
                point.plotY = this.len - crossPos;
                Axis.prototype.drawCrosshair.call(this, e, point);
                point.plotX = plotX;
                point.plotY = plotY;
                !newCross && this.cross && this.cross.attr({
                    fill: this.crosshair.color
                }).add(this.labelGroup);
            }
        },
        getPlotLinePath: function(a, b, c, d, pos) {
            return pos ? this.horiz ? [ "M", pos - 4, this.top - 6, "L", pos + 4, this.top - 6, pos, this.top, "Z" ] : [ "M", this.left, pos, "L", this.left - 6, pos + 6, this.left - 6, pos - 6, "Z" ] : Axis.prototype.getPlotLinePath.call(this, a, b, c, d);
        },
        update: function(newOptions, redraw) {
            each(this.series, function(series) {
                series.isDirtyData = true;
            });
            Axis.prototype.update.call(this, newOptions, redraw);
            if (this.legendItem) {
                this.setLegendColor();
                this.chart.legend.colorizeItem(this, true);
            }
        },
        getDataClassLegendSymbols: function() {
            var name, axis = this, chart = this.chart, legendItems = [], legendOptions = chart.options.legend, valueDecimals = legendOptions.valueDecimals, valueSuffix = legendOptions.valueSuffix || "";
            each(this.dataClasses, function(dataClass, i) {
                var vis = true, from = dataClass.from, to = dataClass.to;
                name = "";
                from === UNDEFINED ? name = "< " : to === UNDEFINED && (name = "> ");
                from !== UNDEFINED && (name += numberFormat(from, valueDecimals) + valueSuffix);
                from !== UNDEFINED && to !== UNDEFINED && (name += " - ");
                to !== UNDEFINED && (name += numberFormat(to, valueDecimals) + valueSuffix);
                legendItems.push(extend({
                    chart: chart,
                    name: name,
                    options: {},
                    drawLegendSymbol: LegendSymbolMixin.drawRectangle,
                    visible: true,
                    setState: noop,
                    setVisible: function() {
                        vis = this.visible = !vis;
                        each(axis.series, function(series) {
                            each(series.points, function(point) {
                                point.dataClass === i && point.setVisible(vis);
                            });
                        });
                        chart.legend.colorizeItem(this, vis);
                    }
                }, dataClass));
            });
            return legendItems;
        },
        name: ""
    });
    wrap(Chart.prototype, "getAxes", function(proceed) {
        var options = this.options, colorAxisOptions = options.colorAxis;
        proceed.call(this);
        this.colorAxis = [];
        colorAxisOptions && (proceed = new ColorAxis(this, colorAxisOptions));
    });
    wrap(Legend.prototype, "getAllItems", function(proceed) {
        var allItems = [], colorAxis = this.chart.colorAxis[0];
        if (colorAxis) {
            colorAxis.options.dataClasses ? allItems = allItems.concat(colorAxis.getDataClassLegendSymbols()) : allItems.push(colorAxis);
            each(colorAxis.series, function(series) {
                series.options.showInLegend = false;
            });
        }
        return allItems.concat(proceed.call(this));
    });
    var colorSeriesMixin = {
        pointAttrToOptions: {
            stroke: "borderColor",
            "stroke-width": "borderWidth",
            fill: "color",
            dashstyle: "dashStyle"
        },
        pointArrayMap: [ "value" ],
        axisTypes: [ "xAxis", "yAxis", "colorAxis" ],
        optionalAxis: "colorAxis",
        trackerGroups: [ "group", "markerGroup", "dataLabelsGroup" ],
        getSymbol: noop,
        parallelArrays: [ "x", "y", "value" ],
        translateColors: function() {
            var series = this, nullColor = this.options.nullColor, colorAxis = this.colorAxis;
            each(this.data, function(point) {
                var color, value = point.value;
                color = null === value ? nullColor : colorAxis ? colorAxis.toColor(value, point) : point.color || series.color;
                color && (point.color = color);
            });
        }
    };
    defaultOptions.plotOptions.heatmap = merge(defaultOptions.plotOptions.scatter, {
        animation: false,
        borderWidth: 0,
        nullColor: "#F8F8F8",
        dataLabels: {
            format: "{point.value}",
            verticalAlign: "middle",
            crop: false,
            overflow: false,
            style: {
                color: "white",
                fontWeight: "bold",
                textShadow: "0 0 5px black"
            }
        },
        marker: null,
        tooltip: {
            pointFormat: "{point.x}, {point.y}: {point.value}<br/>"
        },
        states: {
            normal: {
                animation: true
            },
            hover: {
                brightness: .2
            }
        }
    });
    seriesTypes.heatmap = extendClass(seriesTypes.scatter, merge(colorSeriesMixin, {
        type: "heatmap",
        pointArrayMap: [ "y", "value" ],
        hasPointSpecificOptions: true,
        supportsDrilldown: true,
        getExtremesFromAll: true,
        init: function() {
            seriesTypes.scatter.prototype.init.apply(this, arguments);
            this.pointRange = this.options.colsize || 1;
            this.yAxis.axisPointRange = this.options.rowsize || 1;
        },
        translate: function() {
            var series = this, options = series.options, xAxis = series.xAxis, yAxis = series.yAxis;
            series.generatePoints();
            each(series.points, function(point) {
                var xPad = (options.colsize || 1) / 2, yPad = (options.rowsize || 1) / 2, x1 = Math.round(xAxis.len - xAxis.translate(point.x - xPad, 0, 1, 0, 1)), x2 = Math.round(xAxis.len - xAxis.translate(point.x + xPad, 0, 1, 0, 1)), y1 = Math.round(yAxis.translate(point.y - yPad, 0, 1, 0, 1)), y2 = Math.round(yAxis.translate(point.y + yPad, 0, 1, 0, 1));
                point.plotX = (x1 + x2) / 2;
                point.plotY = (y1 + y2) / 2;
                point.shapeType = "rect";
                point.shapeArgs = {
                    x: Math.min(x1, x2),
                    y: Math.min(y1, y2),
                    width: Math.abs(x2 - x1),
                    height: Math.abs(y2 - y1)
                };
            });
            series.translateColors();
        },
        drawPoints: seriesTypes.column.prototype.drawPoints,
        animate: noop,
        getBox: noop,
        drawLegendSymbol: LegendSymbolMixin.drawRectangle,
        getExtremes: function() {
            Series.prototype.getExtremes.call(this, this.valueData);
            this.valueMin = this.dataMin;
            this.valueMax = this.dataMax;
            Series.prototype.getExtremes.call(this);
        }
    }));
})(Highcharts);