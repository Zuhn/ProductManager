(function(H) {
    "use strict";
    function tweenColors(startColor, endColor, pos) {
        var rgba = [ Math.round(startColor[0] + (endColor[0] - startColor[0]) * pos), Math.round(startColor[1] + (endColor[1] - startColor[1]) * pos), Math.round(startColor[2] + (endColor[2] - startColor[2]) * pos), startColor[3] + (endColor[3] - startColor[3]) * pos ];
        return "rgba(" + rgba.join(",") + ")";
    }
    var noop = function() {}, defaultOptions = H.getOptions(), each = H.each, extend = H.extend, format = H.format, wrap = H.wrap, Chart = H.Chart, seriesTypes = H.seriesTypes, PieSeries = seriesTypes.pie, ColumnSeries = seriesTypes.column, fireEvent = HighchartsAdapter.fireEvent, inArray = HighchartsAdapter.inArray;
    extend(defaultOptions.lang, {
        drillUpText: "◁ Back to {series.name}"
    });
    defaultOptions.drilldown = {
        activeAxisLabelStyle: {
            cursor: "pointer",
            color: "#0d233a",
            fontWeight: "bold",
            textDecoration: "underline"
        },
        activeDataLabelStyle: {
            cursor: "pointer",
            color: "#0d233a",
            fontWeight: "bold",
            textDecoration: "underline"
        },
        animation: {
            duration: 500
        },
        drillUpButton: {
            position: {
                align: "right",
                x: -10,
                y: 10
            }
        }
    };
    H.SVGRenderer.prototype.Element.prototype.fadeIn = function(animation) {
        this.attr({
            opacity: .1,
            visibility: "inherit"
        }).animate({
            opacity: 1
        }, animation || {
            duration: 250
        });
    };
    Chart.prototype.addSeriesAsDrilldown = function(point, ddOptions) {
        this.addSingleSeriesAsDrilldown(point, ddOptions);
        this.applyDrilldown();
    };
    Chart.prototype.addSingleSeriesAsDrilldown = function(point, ddOptions) {
        var newSeries, pointIndex, level, levelNumber, oldSeries = point.series, xAxis = oldSeries.xAxis, yAxis = oldSeries.yAxis, color = point.color || oldSeries.color, levelSeries = [], levelSeriesOptions = [];
        levelNumber = oldSeries.levelNumber || 0;
        ddOptions = extend({
            color: color
        }, ddOptions);
        pointIndex = inArray(point, oldSeries.points);
        each(oldSeries.chart.series, function(series) {
            if (series.xAxis === xAxis) {
                levelSeries.push(series);
                levelSeriesOptions.push(series.userOptions);
                series.levelNumber = series.levelNumber || 0;
            }
        });
        level = {
            levelNumber: levelNumber,
            seriesOptions: oldSeries.userOptions,
            levelSeriesOptions: levelSeriesOptions,
            levelSeries: levelSeries,
            shapeArgs: point.shapeArgs,
            bBox: point.graphic.getBBox(),
            color: color,
            lowerSeriesOptions: ddOptions,
            pointOptions: oldSeries.options.data[pointIndex],
            pointIndex: pointIndex,
            oldExtremes: {
                xMin: xAxis && xAxis.userMin,
                xMax: xAxis && xAxis.userMax,
                yMin: yAxis && yAxis.userMin,
                yMax: yAxis && yAxis.userMax
            }
        };
        this.drilldownLevels || (this.drilldownLevels = []);
        this.drilldownLevels.push(level);
        newSeries = level.lowerSeries = this.addSeries(ddOptions, false);
        newSeries.levelNumber = levelNumber + 1;
        if (xAxis) {
            xAxis.oldPos = xAxis.pos;
            xAxis.userMin = xAxis.userMax = null;
            yAxis.userMin = yAxis.userMax = null;
        }
        if (oldSeries.type === newSeries.type) {
            newSeries.animate = newSeries.animateDrilldown || noop;
            newSeries.options.animation = true;
        }
    };
    Chart.prototype.applyDrilldown = function() {
        var drilldownLevels = this.drilldownLevels, levelToRemove = drilldownLevels[drilldownLevels.length - 1].levelNumber;
        each(this.drilldownLevels, function(level) {
            level.levelNumber === levelToRemove && each(level.levelSeries, function(series) {
                series.levelNumber === levelToRemove && series.remove(false);
            });
        });
        this.redraw();
        this.showDrillUpButton();
    };
    Chart.prototype.getDrilldownBackText = function() {
        var lastLevel = this.drilldownLevels[this.drilldownLevels.length - 1];
        lastLevel.series = lastLevel.seriesOptions;
        return format(this.options.lang.drillUpText, lastLevel);
    };
    Chart.prototype.showDrillUpButton = function() {
        var attr, states, chart = this, backText = this.getDrilldownBackText(), buttonOptions = chart.options.drilldown.drillUpButton;
        if (this.drillUpButton) this.drillUpButton.attr({
            text: backText
        }).align(); else {
            attr = buttonOptions.theme;
            states = attr && attr.states;
            this.drillUpButton = this.renderer.button(backText, null, null, function() {
                chart.drillUp();
            }, attr, states && states.hover, states && states.select).attr({
                align: buttonOptions.position.align,
                zIndex: 9
            }).add().align(buttonOptions.position, false, buttonOptions.relativeTo || "plotBox");
        }
    };
    Chart.prototype.drillUp = function() {
        var level, oldSeries, newSeries, oldExtremes, chart = this, drilldownLevels = chart.drilldownLevels, levelNumber = drilldownLevels[drilldownLevels.length - 1].levelNumber, i = drilldownLevels.length, chartSeries = chart.series, seriesI = chartSeries.length, addSeries = function(seriesOptions) {
            var addedSeries;
            each(chartSeries, function(series) {
                series.userOptions === seriesOptions && (addedSeries = series);
            });
            addedSeries = addedSeries || chart.addSeries(seriesOptions, false);
            addedSeries.type === oldSeries.type && addedSeries.animateDrillupTo && (addedSeries.animate = addedSeries.animateDrillupTo);
            seriesOptions === level.seriesOptions && (newSeries = addedSeries);
        };
        while (i--) {
            level = drilldownLevels[i];
            if (level.levelNumber === levelNumber) {
                drilldownLevels.pop();
                oldSeries = level.lowerSeries;
                if (!oldSeries.chart) while (seriesI--) if (chartSeries[seriesI].options.id === level.lowerSeriesOptions.id) {
                    oldSeries = chartSeries[seriesI];
                    break;
                }
                oldSeries.xData = [];
                each(level.levelSeriesOptions, addSeries);
                fireEvent(chart, "drillup", {
                    seriesOptions: level.seriesOptions
                });
                if (newSeries.type === oldSeries.type) {
                    newSeries.drilldownLevel = level;
                    newSeries.options.animation = chart.options.drilldown.animation;
                    oldSeries.animateDrillupFrom && oldSeries.animateDrillupFrom(level);
                }
                newSeries.levelNumber = levelNumber;
                oldSeries.remove(false);
                if (newSeries.xAxis) {
                    oldExtremes = level.oldExtremes;
                    newSeries.xAxis.setExtremes(oldExtremes.xMin, oldExtremes.xMax, false);
                    newSeries.yAxis.setExtremes(oldExtremes.yMin, oldExtremes.yMax, false);
                }
            }
        }
        this.redraw();
        0 === this.drilldownLevels.length ? this.drillUpButton = this.drillUpButton.destroy() : this.drillUpButton.attr({
            text: this.getDrilldownBackText()
        }).align();
    };
    ColumnSeries.prototype.supportsDrilldown = true;
    ColumnSeries.prototype.animateDrillupTo = function(init) {
        if (!init) {
            var newSeries = this, level = newSeries.drilldownLevel;
            each(this.points, function(point) {
                point.graphic.hide();
                point.dataLabel && point.dataLabel.hide();
                point.connector && point.connector.hide();
            });
            setTimeout(function() {
                each(newSeries.points, function(point, i) {
                    var verb = i === (level && level.pointIndex) ? "show" : "fadeIn", inherit = "show" === verb ? true : void 0;
                    point.graphic[verb](inherit);
                    point.dataLabel && point.dataLabel[verb](inherit);
                    point.connector && point.connector[verb](inherit);
                });
            }, Math.max(this.chart.options.drilldown.animation.duration - 50, 0));
            this.animate = noop;
        }
    };
    ColumnSeries.prototype.animateDrilldown = function(init) {
        var series = this, drilldownLevels = this.chart.drilldownLevels, animateFrom = this.chart.drilldownLevels[this.chart.drilldownLevels.length - 1].shapeArgs, animationOptions = this.chart.options.drilldown.animation;
        if (!init) {
            each(drilldownLevels, function(level) {
                series.userOptions === level.lowerSeriesOptions && (animateFrom = level.shapeArgs);
            });
            animateFrom.x += this.xAxis.oldPos - this.xAxis.pos;
            each(this.points, function(point) {
                point.graphic && point.graphic.attr(animateFrom).animate(point.shapeArgs, animationOptions);
                point.dataLabel && point.dataLabel.fadeIn(animationOptions);
            });
            this.animate = null;
        }
    };
    ColumnSeries.prototype.animateDrillupFrom = function(level) {
        var animationOptions = this.chart.options.drilldown.animation, group = this.group, series = this;
        each(series.trackerGroups, function(key) {
            series[key] && series[key].on("mouseover");
        });
        delete this.group;
        each(this.points, function(point) {
            var graphic = point.graphic, startColor = H.Color(point.color).rgba, endColor = H.Color(level.color).rgba, complete = function() {
                graphic.destroy();
                group && (group = group.destroy());
            };
            if (graphic) {
                delete point.graphic;
                if (animationOptions) graphic.animate(level.shapeArgs, H.merge(animationOptions, {
                    step: function(val, fx) {
                        "start" === fx.prop && 4 === startColor.length && 4 === endColor.length && this.attr({
                            fill: tweenColors(startColor, endColor, fx.pos)
                        });
                    },
                    complete: complete
                })); else {
                    graphic.attr(level.shapeArgs);
                    complete();
                }
            }
        });
    };
    PieSeries && extend(PieSeries.prototype, {
        supportsDrilldown: true,
        animateDrillupTo: ColumnSeries.prototype.animateDrillupTo,
        animateDrillupFrom: ColumnSeries.prototype.animateDrillupFrom,
        animateDrilldown: function(init) {
            var level = this.chart.drilldownLevels[this.chart.drilldownLevels.length - 1], animationOptions = this.chart.options.drilldown.animation, animateFrom = level.shapeArgs, start = animateFrom.start, angle = animateFrom.end - start, startAngle = angle / this.points.length, startColor = H.Color(level.color).rgba;
            if (!init) {
                each(this.points, function(point, i) {
                    var endColor = H.Color(point.color).rgba;
                    point.graphic.attr(H.merge(animateFrom, {
                        start: start + i * startAngle,
                        end: start + (i + 1) * startAngle
                    }))[animationOptions ? "animate" : "attr"](point.shapeArgs, H.merge(animationOptions, {
                        step: function(val, fx) {
                            "start" === fx.prop && 4 === startColor.length && 4 === endColor.length && this.attr({
                                fill: tweenColors(startColor, endColor, fx.pos)
                            });
                        }
                    }));
                });
                this.animate = null;
            }
        }
    });
    H.Point.prototype.doDrilldown = function(_holdRedraw) {
        var seriesOptions, series = this.series, chart = series.chart, drilldown = chart.options.drilldown, i = (drilldown.series || []).length;
        while (i-- && !seriesOptions) drilldown.series[i].id === this.drilldown && (seriesOptions = drilldown.series[i]);
        fireEvent(chart, "drilldown", {
            point: this,
            seriesOptions: seriesOptions
        });
        seriesOptions && (_holdRedraw ? chart.addSingleSeriesAsDrilldown(this, seriesOptions) : chart.addSeriesAsDrilldown(this, seriesOptions));
    };
    wrap(H.Point.prototype, "init", function(proceed, series, options, x) {
        var point = proceed.call(this, series, options, x), chart = series.chart, tick = series.xAxis && series.xAxis.ticks[x], tickLabel = tick && tick.label;
        if (point.drilldown) {
            H.addEvent(point, "click", function() {
                point.doDrilldown();
            });
            if (tickLabel) {
                tickLabel._basicStyle || (tickLabel._basicStyle = tickLabel.element.getAttribute("style"));
                tickLabel.addClass("highcharts-drilldown-axis-label").css(chart.options.drilldown.activeAxisLabelStyle).on("click", function() {
                    each(tickLabel.ddPoints, function(point) {
                        point.doDrilldown && point.doDrilldown(true);
                    });
                    chart.applyDrilldown();
                });
                tickLabel.ddPoints || (tickLabel.ddPoints = []);
                tickLabel.ddPoints.push(point);
            }
        } else tickLabel && tickLabel._basicStyle && tickLabel.element.setAttribute("style", tickLabel._basicStyle);
        return point;
    });
    wrap(H.Series.prototype, "drawDataLabels", function(proceed) {
        var css = this.chart.options.drilldown.activeDataLabelStyle;
        proceed.call(this);
        each(this.points, function(point) {
            point.drilldown && point.dataLabel && point.dataLabel.attr({
                "class": "highcharts-drilldown-data-label"
            }).css(css).on("click", function() {
                point.doDrilldown();
            });
        });
    });
    var type, drawTrackerWrapper = function(proceed) {
        proceed.call(this);
        each(this.points, function(point) {
            point.drilldown && point.graphic && point.graphic.attr({
                "class": "highcharts-drilldown-point"
            }).css({
                cursor: "pointer"
            });
        });
    };
    for (type in seriesTypes) seriesTypes[type].prototype.supportsDrilldown && wrap(seriesTypes[type].prototype, "drawTracker", drawTrackerWrapper);
})(Highcharts);