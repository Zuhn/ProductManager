(function(Highcharts) {
    function perspective(points, angle2, angle1, origin) {
        angle1 *= deg2rad;
        angle2 *= deg2rad;
        var xe, ye, ze, result = [];
        angle1 *= -1;
        xe = origin.x;
        ye = origin.y;
        ze = (0 === origin.z ? 1e-4 : origin.z) * (origin.vd || 25);
        var s1 = sin(angle1), c1 = cos(angle1), s2 = sin(angle2), c2 = cos(angle2);
        var x, y, z, p;
        Highcharts.each(points, function(point) {
            x = point.x - xe;
            y = point.y - ye;
            z = point.z || 0;
            p = {
                x: c1 * x - s1 * z,
                y: -s1 * s2 * x - c1 * s2 * z + c2 * y,
                z: s1 * c2 * x + c1 * c2 * z + s2 * y
            };
            p.x = p.x * ((ze - p.z) / ze) + xe;
            p.y = p.y * ((ze - p.z) / ze) + ye;
            result.push({
                x: round(p.x),
                y: round(p.y),
                z: round(p.z)
            });
        });
        return result;
    }
    function curveTo(cx, cy, rx, ry, start, end, dx, dy) {
        var result = [];
        if (end > start && end - start > PI / 2 + 1e-4) {
            result = result.concat(curveTo(cx, cy, rx, ry, start, start + PI / 2, dx, dy));
            result = result.concat(curveTo(cx, cy, rx, ry, start + PI / 2, end, dx, dy));
            return result;
        }
        if (start > end && start - end > PI / 2 + 1e-4) {
            result = result.concat(curveTo(cx, cy, rx, ry, start, start - PI / 2, dx, dy));
            result = result.concat(curveTo(cx, cy, rx, ry, start - PI / 2, end, dx, dy));
            return result;
        }
        var arcAngle = end - start;
        return [ "C", cx + rx * cos(start) - rx * dFactor * arcAngle * sin(start) + dx, cy + ry * sin(start) + ry * dFactor * arcAngle * cos(start) + dy, cx + rx * cos(end) + rx * dFactor * arcAngle * sin(end) + dx, cy + ry * sin(end) - ry * dFactor * arcAngle * cos(end) + dy, cx + rx * cos(end) + dx, cy + ry * sin(end) + dy ];
    }
    function draw3DPoints(proceed) {
        if (this.chart.is3d()) {
            var grouping = this.chart.options.plotOptions.column.grouping;
            void 0 === grouping || grouping || void 0 === this.group.zIndex || this.group.attr({
                zIndex: 10 * this.group.zIndex
            });
            void 0 === this.userOptions.borderColor && (this.options.borderColor = this.color);
            Highcharts.each(this.data, function(point) {
                var c = point.options.borderColor || point.color || point.series.userOptions.borderColor;
                point.options.borderColor = c;
                point.borderColor = c;
                point.pointAttr[""].stroke = c;
                point.pointAttr.hover.stroke = c;
                point.pointAttr.select.stroke = c;
            });
        }
        proceed.apply(this, [].slice.call(arguments, 1));
    }
    var PI = Math.PI, deg2rad = PI / 180, sin = Math.sin, cos = Math.cos, round = Math.round;
    var dFactor = 4 * (Math.sqrt(2) - 1) / 3 / (PI / 2);
    Highcharts.SVGRenderer.prototype.toLinePath = function(points, closed) {
        var result = [];
        Highcharts.each(points, function(point) {
            result.push("L", point.x, point.y);
        });
        result[0] = "M";
        closed && result.push("Z");
        return result;
    };
    Highcharts.SVGRenderer.prototype.cuboid = function(shapeArgs) {
        var result = this.g(), paths = this.cuboidPath(shapeArgs);
        result.front = this.path(paths[0]).attr({
            zIndex: paths[3],
            "stroke-linejoin": "round"
        }).add(result);
        result.top = this.path(paths[1]).attr({
            zIndex: paths[4],
            "stroke-linejoin": "round"
        }).add(result);
        result.side = this.path(paths[2]).attr({
            zIndex: paths[5],
            "stroke-linejoin": "round"
        }).add(result);
        result.fillSetter = function(color) {
            var c0 = color, c1 = Highcharts.Color(color).brighten(.1).get(), c2 = Highcharts.Color(color).brighten(-.1).get();
            this.front.attr({
                fill: c0
            });
            this.top.attr({
                fill: c1
            });
            this.side.attr({
                fill: c2
            });
            this.color = color;
            return this;
        };
        result.opacitySetter = function(opacity) {
            this.front.attr({
                opacity: opacity
            });
            this.top.attr({
                opacity: opacity
            });
            this.side.attr({
                opacity: opacity
            });
            return this;
        };
        result.attr = function(args) {
            if (args.shapeArgs || args.x) {
                var shapeArgs = args.shapeArgs || args;
                var paths = this.renderer.cuboidPath(shapeArgs);
                this.front.attr({
                    d: paths[0],
                    zIndex: paths[3]
                });
                this.top.attr({
                    d: paths[1],
                    zIndex: paths[4]
                });
                this.side.attr({
                    d: paths[2],
                    zIndex: paths[5]
                });
            } else Highcharts.SVGElement.prototype.attr.call(this, args);
            return this;
        };
        result.animate = function(args, duration, complete) {
            if (args.x && args.y) {
                var paths = this.renderer.cuboidPath(args);
                this.front.attr({
                    zIndex: paths[3]
                }).animate({
                    d: paths[0]
                }, duration, complete);
                this.top.attr({
                    zIndex: paths[4]
                }).animate({
                    d: paths[1]
                }, duration, complete);
                this.side.attr({
                    zIndex: paths[5]
                }).animate({
                    d: paths[2]
                }, duration, complete);
            } else if (args.opacity) {
                this.front.animate(args, duration, complete);
                this.top.animate(args, duration, complete);
                this.side.animate(args, duration, complete);
            } else Highcharts.SVGElement.prototype.animate.call(this, args, duration, complete);
            return this;
        };
        result.destroy = function() {
            this.front.destroy();
            this.top.destroy();
            this.side.destroy();
            return null;
        };
        result.attr({
            zIndex: -paths[3]
        });
        return result;
    };
    Highcharts.SVGRenderer.prototype.cuboidPath = function(shapeArgs) {
        var x = shapeArgs.x, y = shapeArgs.y, z = shapeArgs.z, h = shapeArgs.height, w = shapeArgs.width, d = shapeArgs.depth, alpha = shapeArgs.alpha, beta = shapeArgs.beta, origin = shapeArgs.origin;
        var pArr = [ {
            x: x,
            y: y,
            z: z
        }, {
            x: x + w,
            y: y,
            z: z
        }, {
            x: x + w,
            y: y + h,
            z: z
        }, {
            x: x,
            y: y + h,
            z: z
        }, {
            x: x,
            y: y + h,
            z: z + d
        }, {
            x: x + w,
            y: y + h,
            z: z + d
        }, {
            x: x + w,
            y: y,
            z: z + d
        }, {
            x: x,
            y: y,
            z: z + d
        } ];
        pArr = perspective(pArr, alpha, beta, origin);
        var path1, path2, path3;
        path1 = [ "M", pArr[0].x, pArr[0].y, "L", pArr[1].x, pArr[1].y, "L", pArr[2].x, pArr[2].y, "L", pArr[3].x, pArr[3].y, "Z" ];
        var z1 = (pArr[0].z + pArr[1].z + pArr[2].z + pArr[3].z) / 4;
        var top = [ "M", pArr[0].x, pArr[0].y, "L", pArr[7].x, pArr[7].y, "L", pArr[6].x, pArr[6].y, "L", pArr[1].x, pArr[1].y, "Z" ];
        var bottom = [ "M", pArr[3].x, pArr[3].y, "L", pArr[2].x, pArr[2].y, "L", pArr[5].x, pArr[5].y, "L", pArr[4].x, pArr[4].y, "Z" ];
        path2 = pArr[7].y < pArr[1].y ? top : pArr[4].y > pArr[2].y ? bottom : [];
        var z2 = beta > 0 ? (pArr[0].z + pArr[7].z + pArr[6].z + pArr[1].z) / 4 : (pArr[3].z + pArr[2].z + pArr[5].z + pArr[4].z) / 4;
        var right = [ "M", pArr[1].x, pArr[1].y, "L", pArr[2].x, pArr[2].y, "L", pArr[5].x, pArr[5].y, "L", pArr[6].x, pArr[6].y, "Z" ];
        var left = [ "M", pArr[0].x, pArr[0].y, "L", pArr[7].x, pArr[7].y, "L", pArr[4].x, pArr[4].y, "L", pArr[3].x, pArr[3].y, "Z" ];
        path3 = pArr[6].x > pArr[1].x ? right : pArr[7].x < pArr[0].x ? left : [];
        var z3 = alpha > 0 ? (pArr[1].z + pArr[2].z + pArr[5].z + pArr[6].z) / 4 : (pArr[0].z + pArr[7].z + pArr[4].z + pArr[3].z) / 4;
        return [ path1, path2, path3, z1, z2, z3 ];
    };
    Highcharts.SVGRenderer.prototype.arc3d = function(shapeArgs) {
        shapeArgs.alpha *= deg2rad;
        shapeArgs.beta *= deg2rad;
        var result = this.g(), paths = this.arc3dPath(shapeArgs), renderer = result.renderer;
        var zIndex = 100 * paths.zAll;
        result.shapeArgs = shapeArgs;
        result.side1 = renderer.path(paths.side2).attr({
            zIndex: paths.zSide2
        }).add(result);
        result.side2 = renderer.path(paths.side1).attr({
            zIndex: paths.zSide1
        }).add(result);
        result.inn = renderer.path(paths.inn).attr({
            zIndex: paths.zInn
        }).add(result);
        result.out = renderer.path(paths.out).attr({
            zIndex: paths.zOut
        }).add(result);
        result.top = renderer.path(paths.top).attr({
            zIndex: paths.zTop
        }).add(result);
        result.fillSetter = function(color) {
            this.color = color;
            var c0 = color, c2 = Highcharts.Color(color).brighten(-.1).get();
            this.side1.attr({
                fill: c2
            });
            this.side2.attr({
                fill: c2
            });
            this.inn.attr({
                fill: c2
            });
            this.out.attr({
                fill: c2
            });
            this.top.attr({
                fill: c0
            });
            return this;
        };
        result.animate = function(args, duration, complete) {
            Highcharts.SVGElement.prototype.animate.call(this, args, duration, complete);
            if (args.x && args.y) {
                var result = this, renderer = this.renderer, shapeArgs = Highcharts.splat(args)[0];
                shapeArgs.alpha *= deg2rad;
                shapeArgs.beta *= deg2rad;
                var paths = renderer.arc3dPath(shapeArgs);
                result.shapeArgs = shapeArgs;
                result.inn.attr({
                    d: paths.inn,
                    zIndex: paths.zInn
                });
                result.out.attr({
                    d: paths.out,
                    zIndex: paths.zOut
                });
                result.side1.attr({
                    d: paths.side1,
                    zIndex: paths.zSide2
                });
                result.side2.attr({
                    d: paths.side2,
                    zIndex: paths.zSide1
                });
                result.top.attr({
                    d: paths.top,
                    zIndex: paths.zTop
                });
                result.attr({
                    fill: result.color
                });
                result.attr({
                    zIndex: 100 * paths.zAll
                });
            }
            return this;
        };
        result.zIndex = zIndex;
        result.attr({
            zIndex: zIndex
        });
        return result;
    };
    Highcharts.SVGRenderer.prototype.arc3dPath = function(shapeArgs) {
        var cx = shapeArgs.x, cy = shapeArgs.y, start = shapeArgs.start, end = shapeArgs.end - 1e-5, r = shapeArgs.r, ir = shapeArgs.innerR, d = shapeArgs.depth, alpha = shapeArgs.alpha, beta = shapeArgs.beta;
        var cs = cos(start), ss = sin(start), ce = cos(end), se = sin(end), rx = r * cos(beta), ry = r * cos(alpha), irx = ir * cos(beta), iry = ir * cos(alpha), dx = d * sin(beta), dy = d * sin(alpha);
        var top = [ "M", cx + rx * cs, cy + ry * ss ];
        top = top.concat(curveTo(cx, cy, rx, ry, start, end, 0, 0));
        top = top.concat([ "L", cx + irx * ce, cy + iry * se ]);
        top = top.concat(curveTo(cx, cy, irx, iry, end, start, 0, 0));
        top = top.concat([ "Z" ]);
        var midAngle = (shapeArgs.start + shapeArgs.end) / 2;
        var zIndex = sin(beta) * cos(midAngle) + sin(-alpha) * sin(-midAngle);
        var b = beta > 0 ? PI / 2 : 0, a = alpha > 0 ? 0 : PI / 2;
        var start2 = start > -b ? start : end > -b ? -b : start, end2 = PI - a > end ? end : PI - a > start ? PI - a : end;
        var out = [ "M", cx + rx * cos(start2), cy + ry * sin(start2) ];
        out = out.concat(curveTo(cx, cy, rx, ry, start2, end2, 0, 0));
        out = out.concat([ "L", cx + rx * cos(end2) + dx, cy + ry * sin(end2) + dy ]);
        out = out.concat(curveTo(cx, cy, rx, ry, end2, start2, dx, dy));
        out = out.concat([ "Z" ]);
        var inn = [ "M", cx + irx * cs, cy + iry * ss ];
        inn = inn.concat(curveTo(cx, cy, irx, iry, start, end, 0, 0));
        inn = inn.concat([ "L", cx + irx * cos(end) + dx, cy + iry * sin(end) + dy ]);
        inn = inn.concat(curveTo(cx, cy, irx, iry, end, start, dx, dy));
        inn = inn.concat([ "Z" ]);
        var side1 = [ "M", cx + rx * cs, cy + ry * ss, "L", cx + rx * cs + dx, cy + ry * ss + dy, "L", cx + irx * cs + dx, cy + iry * ss + dy, "L", cx + irx * cs, cy + iry * ss, "Z" ];
        var side2 = [ "M", cx + rx * ce, cy + ry * se, "L", cx + rx * ce + dx, cy + ry * se + dy, "L", cx + irx * ce + dx, cy + iry * se + dy, "L", cx + irx * ce, cy + iry * se, "Z" ];
        var mr = ir + (r - ir) / 2;
        var zTop = Math.abs(2 * zIndex * mr), zOut = zIndex * r, zInn = zIndex * ir, zSide1 = (sin(beta) * cos(start) + sin(-alpha) * sin(-start)) * mr, zSide2 = (sin(beta) * cos(end) + sin(-alpha) * sin(-end)) * mr;
        return {
            top: top,
            zTop: 100 * zTop,
            out: out,
            zOut: 100 * zOut,
            inn: inn,
            zInn: 100 * zInn,
            side1: side1,
            zSide1: 100 * zSide1,
            side2: side2,
            zSide2: 100 * zSide2,
            zAll: zIndex
        };
    };
    Highcharts.Chart.prototype.is3d = function() {
        return this.options.chart.options3d && this.options.chart.options3d.enabled;
    };
    Highcharts.wrap(Highcharts.Chart.prototype, "isInsidePlot", function(proceed) {
        return this.is3d() ? true : proceed.apply(this, [].slice.call(arguments, 1));
    });
    Highcharts.wrap(Highcharts.Chart.prototype, "init", function(proceed) {
        var args = arguments;
        args[1] = Highcharts.merge({
            chart: {
                options3d: {
                    enabled: false,
                    alpha: 0,
                    beta: 0,
                    depth: 100,
                    viewDistance: 25,
                    frame: {
                        bottom: {
                            size: 1,
                            color: "rgba(255,255,255,0)"
                        },
                        side: {
                            size: 1,
                            color: "rgba(255,255,255,0)"
                        },
                        back: {
                            size: 1,
                            color: "rgba(255,255,255,0)"
                        }
                    }
                }
            }
        }, args[1]);
        proceed.apply(this, [].slice.call(args, 1));
    });
    Highcharts.wrap(Highcharts.Chart.prototype, "setChartSize", function(proceed) {
        proceed.apply(this, [].slice.call(arguments, 1));
        if (this.is3d()) {
            var inverted = this.inverted, clipBox = this.clipBox, margin = this.margin, x = inverted ? "y" : "x", y = inverted ? "x" : "y", w = inverted ? "height" : "width", h = inverted ? "width" : "height";
            clipBox[x] = -(margin[3] || 0);
            clipBox[y] = -(margin[0] || 0);
            clipBox[w] = this.chartWidth + (margin[3] || 0) + (margin[1] || 0);
            clipBox[h] = this.chartHeight + (margin[0] || 0) + (margin[2] || 0);
        }
    });
    Highcharts.wrap(Highcharts.Chart.prototype, "redraw", function(proceed) {
        this.is3d() && (this.isDirtyBox = true);
        proceed.apply(this, [].slice.call(arguments, 1));
    });
    Highcharts.Chart.prototype.retrieveStacks = function() {
        var stacks = {}, type = this.options.chart.type, typeOptions = this.options.plotOptions[type], stacking = typeOptions.stacking, grouping = typeOptions.grouping, i = 1;
        if (grouping || !stacking) return this.series;
        Highcharts.each(this.series, function(S) {
            if (stacks[S.options.stack || 0]) stacks[S.options.stack || 0].series.push(S); else {
                stacks[S.options.stack || 0] = {
                    series: [ S ],
                    position: i
                };
                i++;
            }
        });
        stacks.totalStacks = i + 1;
        return stacks;
    };
    Highcharts.wrap(Highcharts.Axis.prototype, "init", function(proceed) {
        var args = arguments;
        if (args[1].is3d()) {
            args[2].tickWidth = Highcharts.pick(args[2].tickWidth, 0);
            args[2].gridLineWidth = Highcharts.pick(args[2].gridLineWidth, 1);
        }
        proceed.apply(this, [].slice.call(arguments, 1));
    });
    Highcharts.wrap(Highcharts.Axis.prototype, "render", function(proceed) {
        proceed.apply(this, [].slice.call(arguments, 1));
        if (!this.chart.is3d()) return;
        var chart = this.chart, renderer = chart.renderer, options3d = chart.options.chart.options3d, alpha = options3d.alpha, beta = options3d.beta * (chart.yAxis[0].opposite ? -1 : 1), frame = options3d.frame, fbottom = frame.bottom, fback = frame.back, fside = frame.side, depth = options3d.depth, height = this.height, width = this.width, left = this.left, top = this.top;
        var origin = {
            x: chart.plotLeft + chart.plotWidth / 2,
            y: chart.plotTop + chart.plotHeight / 2,
            z: depth,
            vd: options3d.viewDistance
        };
        if (this.horiz) {
            this.axisLine && this.axisLine.hide();
            var bottomShape = {
                x: left,
                y: top + (chart.yAxis[0].reversed ? -fbottom.size : height),
                z: 0,
                width: width,
                height: fbottom.size,
                depth: depth,
                alpha: alpha,
                beta: beta,
                origin: origin
            };
            this.bottomFrame ? this.bottomFrame.animate(bottomShape) : this.bottomFrame = renderer.cuboid(bottomShape).attr({
                fill: fbottom.color,
                zIndex: chart.yAxis[0].reversed && alpha > 0 ? 4 : -1
            }).css({
                stroke: fbottom.color
            }).add();
        } else {
            var backShape = {
                x: left,
                y: top,
                z: depth + 1,
                width: width,
                height: height + fbottom.size,
                depth: fback.size,
                alpha: alpha,
                beta: beta,
                origin: origin
            };
            this.backFrame ? this.backFrame.animate(backShape) : this.backFrame = renderer.cuboid(backShape).attr({
                fill: fback.color,
                zIndex: -3
            }).css({
                stroke: fback.color
            }).add();
            this.axisLine && this.axisLine.hide();
            var sideShape = {
                x: (chart.yAxis[0].opposite ? width : 0) + left - fside.size,
                y: top,
                z: 0,
                width: fside.size,
                height: height + fbottom.size,
                depth: depth + fback.size,
                alpha: alpha,
                beta: beta,
                origin: origin
            };
            this.sideFrame ? this.sideFrame.animate(sideShape) : this.sideFrame = renderer.cuboid(sideShape).attr({
                fill: fside.color,
                zIndex: -2
            }).css({
                stroke: fside.color
            }).add();
        }
    });
    Highcharts.wrap(Highcharts.Axis.prototype, "getPlotLinePath", function(proceed) {
        var path = proceed.apply(this, [].slice.call(arguments, 1));
        if (!this.chart.is3d()) return path;
        if (null === path) return path;
        var chart = this.chart, options3d = chart.options.chart.options3d;
        var d = options3d.depth;
        options3d.origin = {
            x: chart.plotLeft + chart.plotWidth / 2,
            y: chart.plotTop + chart.plotHeight / 2,
            z: d,
            vd: options3d.viewDistance
        };
        var pArr = [ {
            x: path[1],
            y: path[2],
            z: this.horiz || this.opposite ? d : 0
        }, {
            x: path[1],
            y: path[2],
            z: d
        }, {
            x: path[4],
            y: path[5],
            z: d
        }, {
            x: path[4],
            y: path[5],
            z: this.horiz || this.opposite ? 0 : d
        } ];
        var alpha = chart.options.inverted ? options3d.beta : options3d.alpha, beta = chart.options.inverted ? options3d.alpha : options3d.beta;
        beta *= chart.yAxis[0].opposite ? -1 : 1;
        pArr = perspective(pArr, alpha, beta, options3d.origin);
        path = this.chart.renderer.toLinePath(pArr, false);
        return path;
    });
    Highcharts.wrap(Highcharts.Tick.prototype, "getMarkPath", function(proceed) {
        var path = proceed.apply(this, [].slice.call(arguments, 1));
        if (!this.axis.chart.is3d()) return path;
        var chart = this.axis.chart, options3d = chart.options.chart.options3d;
        var origin = {
            x: chart.plotLeft + chart.plotWidth / 2,
            y: chart.plotTop + chart.plotHeight / 2,
            z: options3d.depth,
            vd: options3d.viewDistance
        };
        var pArr = [ {
            x: path[1],
            y: path[2],
            z: 0
        }, {
            x: path[4],
            y: path[5],
            z: 0
        } ];
        var alpha = chart.inverted ? options3d.beta : options3d.alpha, beta = chart.inverted ? options3d.alpha : options3d.beta;
        beta *= chart.yAxis[0].opposite ? -1 : 1;
        pArr = perspective(pArr, alpha, beta, origin);
        path = [ "M", pArr[0].x, pArr[0].y, "L", pArr[1].x, pArr[1].y ];
        return path;
    });
    Highcharts.wrap(Highcharts.Tick.prototype, "getLabelPosition", function(proceed) {
        var pos = proceed.apply(this, [].slice.call(arguments, 1));
        if (!this.axis.chart.is3d()) return pos;
        var chart = this.axis.chart, options3d = chart.options.chart.options3d;
        var origin = {
            x: chart.plotLeft + chart.plotWidth / 2,
            y: chart.plotTop + chart.plotHeight / 2,
            z: options3d.depth,
            vd: options3d.viewDistance
        };
        var alpha = chart.inverted ? options3d.beta : options3d.alpha, beta = chart.inverted ? options3d.alpha : options3d.beta;
        beta *= chart.yAxis[0].opposite ? -1 : 1;
        pos = perspective([ {
            x: pos.x,
            y: pos.y,
            z: 0
        } ], alpha, beta, origin)[0];
        return pos;
    });
    Highcharts.wrap(Highcharts.Axis.prototype, "drawCrosshair", function(proceed) {
        var args = arguments;
        this.chart.is3d() && args[2] && (args[2] = {
            plotX: args[2].plotXold || args[2].plotX,
            plotY: args[2].plotYold || args[2].plotY
        });
        proceed.apply(this, [].slice.call(args, 1));
    });
    Highcharts.wrap(Highcharts.seriesTypes.column.prototype, "translate", function(proceed) {
        proceed.apply(this, [].slice.call(arguments, 1));
        if (!this.chart.is3d()) return;
        var type = this.chart.options.chart.type, series = this, chart = series.chart, options = chart.options, typeOptions = options.plotOptions[type], options3d = options.chart.options3d, depth = typeOptions.depth || 25, origin = {
            x: chart.plotWidth / 2,
            y: chart.plotHeight / 2,
            z: options3d.depth,
            vd: options3d.viewDistance
        }, alpha = options3d.alpha, beta = options3d.beta * (chart.yAxis[0].opposite ? -1 : 1);
        var stack = typeOptions.stacking ? this.options.stack || 0 : series._i;
        var z = stack * (depth + (typeOptions.groupZPadding || 1));
        false !== typeOptions.grouping && (z = 0);
        z += typeOptions.groupZPadding || 1;
        Highcharts.each(series.data, function(point) {
            var shapeArgs = point.shapeArgs, tooltipPos = point.tooltipPos;
            point.shapeType = "cuboid";
            shapeArgs.alpha = alpha;
            shapeArgs.beta = beta;
            shapeArgs.z = z;
            shapeArgs.origin = origin;
            shapeArgs.depth = depth;
            tooltipPos = perspective([ {
                x: tooltipPos[0],
                y: tooltipPos[1],
                z: z
            } ], alpha, beta, origin)[0];
            point.tooltipPos = [ tooltipPos.x, tooltipPos.y ];
        });
    });
    Highcharts.wrap(Highcharts.seriesTypes.column.prototype, "animate", function(proceed) {
        if (this.chart.is3d()) {
            var args = arguments, init = args[1], yAxis = this.yAxis, series = this, reversed = this.yAxis.reversed;
            if (Highcharts.svg) if (init) Highcharts.each(series.data, function(point) {
                point.height = point.shapeArgs.height;
                point.shapeArgs.height = 1;
                reversed || (point.shapeArgs.y = point.stackY ? point.plotY + yAxis.translate(point.stackY) : point.plotY + (point.negative ? -point.height : point.height));
            }); else {
                Highcharts.each(series.data, function(point) {
                    point.shapeArgs.height = point.height;
                    reversed || (point.shapeArgs.y = point.plotY - (point.negative ? point.height : 0));
                    point.graphic && point.graphic.animate(point.shapeArgs, series.options.animation);
                });
                series.animate = null;
            }
        } else proceed.apply(this, [].slice.call(arguments, 1));
    });
    Highcharts.wrap(Highcharts.seriesTypes.column.prototype, "init", function(proceed) {
        proceed.apply(this, [].slice.call(arguments, 1));
        if (this.chart.is3d()) {
            var grouping = this.chart.options.plotOptions.column.grouping, stacking = this.chart.options.plotOptions.column.stacking, z = this.options.zIndex;
            if (!z && !(void 0 !== grouping && !grouping) && stacking) {
                var i, stacks = this.chart.retrieveStacks(), stack = this.options.stack || 0;
                for (i = 0; stacks[stack].series.length > i; i++) if (stacks[stack].series[i] === this) break;
                z = 10 * stacks.totalStacks - 10 * (stacks.totalStacks - stacks[stack].position) - i;
                this.options.zIndex = z;
            }
        }
    });
    Highcharts.seriesTypes.columnrange && Highcharts.wrap(Highcharts.seriesTypes.columnrange.prototype, "drawPoints", draw3DPoints);
    Highcharts.wrap(Highcharts.seriesTypes.column.prototype, "drawPoints", draw3DPoints);
    var defaultOptions = Highcharts.getOptions();
    defaultOptions.plotOptions.cylinder = Highcharts.merge(defaultOptions.plotOptions.column);
    var CylinderSeries = Highcharts.extendClass(Highcharts.seriesTypes.column, {
        type: "cylinder"
    });
    Highcharts.seriesTypes.cylinder = CylinderSeries;
    Highcharts.wrap(Highcharts.seriesTypes.cylinder.prototype, "translate", function(proceed) {
        proceed.apply(this, [].slice.call(arguments, 1));
        if (!this.chart.is3d()) return;
        var series = this, chart = series.chart, options = chart.options, cylOptions = options.plotOptions.cylinder, options3d = options.chart.options3d, depth = cylOptions.depth || 0, origin = {
            x: chart.inverted ? chart.plotHeight / 2 : chart.plotWidth / 2,
            y: chart.inverted ? chart.plotWidth / 2 : chart.plotHeight / 2,
            z: options3d.depth,
            vd: options3d.viewDistance
        }, alpha = options3d.alpha;
        var z = cylOptions.stacking ? (this.options.stack || 0) * depth : series._i * depth;
        z += depth / 2;
        false !== cylOptions.grouping && (z = 0);
        Highcharts.each(series.data, function(point) {
            var shapeArgs = point.shapeArgs;
            point.shapeType = "arc3d";
            shapeArgs.x += depth / 2;
            shapeArgs.z = z;
            shapeArgs.start = 0;
            shapeArgs.end = 2 * PI;
            shapeArgs.r = .95 * depth;
            shapeArgs.innerR = 0;
            shapeArgs.depth = shapeArgs.height * (1 / sin((90 - alpha) * deg2rad)) - z;
            shapeArgs.alpha = 90 - alpha;
            shapeArgs.beta = 0;
            shapeArgs.origin = origin;
        });
    });
    Highcharts.wrap(Highcharts.seriesTypes.pie.prototype, "translate", function(proceed) {
        proceed.apply(this, [].slice.call(arguments, 1));
        if (!this.chart.is3d()) return;
        var series = this, chart = series.chart, options = chart.options, pieOptions = options.plotOptions.pie, depth = pieOptions.depth || 0, options3d = options.chart.options3d, origin = {
            x: chart.plotWidth / 2,
            y: chart.plotHeight / 2,
            z: options3d.depth
        }, alpha = options3d.alpha, beta = options3d.beta;
        var z = pieOptions.stacking ? (this.options.stack || 0) * depth : series._i * depth;
        z += depth / 2;
        false !== pieOptions.grouping && (z = 0);
        Highcharts.each(series.data, function(point) {
            point.shapeType = "arc3d";
            var shapeArgs = point.shapeArgs;
            shapeArgs.z = z;
            shapeArgs.depth = .75 * depth;
            shapeArgs.origin = origin;
            shapeArgs.alpha = alpha;
            shapeArgs.beta = beta;
            var angle = (shapeArgs.end + shapeArgs.start) / 2;
            point.slicedTranslation = {
                translateX: round(cos(angle) * series.options.slicedOffset * cos(alpha * deg2rad)),
                translateY: round(sin(angle) * series.options.slicedOffset * cos(alpha * deg2rad))
            };
        });
    });
    Highcharts.wrap(Highcharts.seriesTypes.pie.prototype.pointClass.prototype, "haloPath", function(proceed) {
        return this.series.chart.is3d() ? [] : proceed.call(this);
    });
    Highcharts.wrap(Highcharts.seriesTypes.pie.prototype, "drawPoints", function(proceed) {
        this.chart.is3d() && Highcharts.each(this.data, function(point) {
            var c = point.options.borderColor || point.color || point.series.userOptions.borderColor || point.series.color;
            point.options.borderColor = c;
            point.borderColor = c;
            point.pointAttr[""].stroke = c;
            point.pointAttr.hover.stroke = c;
            point.pointAttr.select.stroke = c;
        });
        proceed.apply(this, [].slice.call(arguments, 1));
    });
    Highcharts.wrap(Highcharts.seriesTypes.pie.prototype, "drawDataLabels", function(proceed) {
        proceed.apply(this, [].slice.call(arguments, 1));
        if (!this.chart.is3d()) return;
        var series = this;
        Highcharts.each(series.data, function(point) {
            var shapeArgs = point.shapeArgs;
            var r = shapeArgs.r, d = shapeArgs.depth, a1 = shapeArgs.alpha * deg2rad, b1 = shapeArgs.beta * deg2rad, a2 = (shapeArgs.start + shapeArgs.end) / 2;
            point.connector && point.connector.translate(-r * (1 - cos(b1)) * cos(a2) + (cos(a2) > 0 ? sin(b1) * d : 0), -r * (1 - cos(a1)) * sin(a2) + (sin(a2) > 0 ? sin(a1) * d : 0));
            point.dataLabel && point.dataLabel.attr({
                x: point.dataLabel.connX + -r * (1 - cos(b1)) * cos(a2) + (cos(a2) > 0 ? cos(b1) * d : 0) - point.dataLabel.width / 2,
                y: point.dataLabel.connY + -r * (1 - cos(a1)) * sin(a2) + (sin(a2) > 0 ? sin(a1) * d : 0) - point.dataLabel.height / 2
            });
        });
    });
    Highcharts.wrap(Highcharts.seriesTypes.pie.prototype, "addPoint", function(proceed) {
        proceed.apply(this, [].slice.call(arguments, 1));
        this.chart.is3d() && this.update();
    });
    Highcharts.wrap(Highcharts.seriesTypes.pie.prototype, "animate", function(proceed) {
        if (this.chart.is3d()) {
            var attribs, args = arguments, init = args[1], animation = this.options.animation, center = this.center, group = this.group, markerGroup = this.markerGroup;
            if (Highcharts.svg) {
                true === animation && (animation = {});
                if (init) {
                    this.oldtranslateX = group.translateX;
                    this.oldtranslateY = group.translateY;
                    attribs = {
                        translateX: center[0],
                        translateY: center[1],
                        scaleX: .001,
                        scaleY: .001
                    };
                    group.attr(attribs);
                    if (markerGroup) {
                        markerGroup.attrSetters = group.attrSetters;
                        markerGroup.attr(attribs);
                    }
                } else {
                    attribs = {
                        translateX: this.oldtranslateX,
                        translateY: this.oldtranslateY,
                        scaleX: 1,
                        scaleY: 1
                    };
                    group.animate(attribs, animation);
                    markerGroup && markerGroup.animate(attribs, animation);
                    this.animate = null;
                }
            }
        } else proceed.apply(this, [].slice.call(arguments, 1));
    });
    Highcharts.wrap(Highcharts.seriesTypes.scatter.prototype, "translate", function(proceed) {
        proceed.apply(this, [].slice.call(arguments, 1));
        if (!this.chart.is3d()) return;
        var series = this, chart = series.chart, options3d = series.chart.options.chart.options3d, alpha = options3d.alpha, beta = options3d.beta, origin = {
            x: chart.inverted ? chart.plotHeight / 2 : chart.plotWidth / 2,
            y: chart.inverted ? chart.plotWidth / 2 : chart.plotHeight / 2,
            z: options3d.depth,
            vd: options3d.viewDistance
        }, depth = options3d.depth, zAxis = chart.options.zAxis || {
            min: 0,
            max: depth
        };
        var rangeModifier = depth / (zAxis.max - zAxis.min);
        Highcharts.each(series.data, function(point) {
            var pCo = {
                x: point.plotX,
                y: point.plotY,
                z: (point.z - zAxis.min) * rangeModifier
            };
            pCo = perspective([ pCo ], alpha, beta, origin)[0];
            point.plotXold = point.plotX;
            point.plotYold = point.plotY;
            point.plotX = pCo.x;
            point.plotY = pCo.y;
            point.plotZ = pCo.z;
        });
    });
    Highcharts.wrap(Highcharts.seriesTypes.scatter.prototype, "init", function(proceed) {
        var result = proceed.apply(this, [].slice.call(arguments, 1));
        if (this.chart.is3d()) {
            this.pointArrayMap = [ "x", "y", "z" ];
            var default3dScatterTooltip = "x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>z: <b>{point.z}</b><br/>";
            this.tooltipOptions.pointFormat = this.userOptions.tooltip ? this.userOptions.tooltip.pointFormat || default3dScatterTooltip : default3dScatterTooltip;
        }
        return result;
    });
    if (Highcharts.VMLRenderer) {
        Highcharts.setOptions({
            animate: false
        });
        Highcharts.VMLRenderer.prototype.cuboid = Highcharts.SVGRenderer.prototype.cuboid;
        Highcharts.VMLRenderer.prototype.cuboidPath = Highcharts.SVGRenderer.prototype.cuboidPath;
        Highcharts.VMLRenderer.prototype.toLinePath = Highcharts.SVGRenderer.prototype.toLinePath;
        Highcharts.VMLRenderer.prototype.createElement3D = Highcharts.SVGRenderer.prototype.createElement3D;
        Highcharts.VMLRenderer.prototype.arc3d = function(shapeArgs) {
            var result = Highcharts.SVGRenderer.prototype.arc3d.call(this, shapeArgs);
            result.css({
                zIndex: result.zIndex
            });
            return result;
        };
        Highcharts.VMLRenderer.prototype.arc3dPath = Highcharts.SVGRenderer.prototype.arc3dPath;
        Highcharts.Chart.prototype.renderSeries = function() {
            var serie, i = this.series.length;
            while (i--) {
                serie = this.series[i];
                serie.translate();
                serie.setTooltipPoints && serie.setTooltipPoints();
                serie.render();
            }
        };
        Highcharts.wrap(Highcharts.Axis.prototype, "render", function(proceed) {
            proceed.apply(this, [].slice.call(arguments, 1));
            if (this.sideFrame) {
                this.sideFrame.css({
                    zIndex: 0
                });
                this.sideFrame.front.attr({
                    fill: this.sideFrame.color
                });
            }
            if (this.bottomFrame) {
                this.bottomFrame.css({
                    zIndex: 1
                });
                this.bottomFrame.front.attr({
                    fill: this.bottomFrame.color
                });
            }
            if (this.backFrame) {
                this.backFrame.css({
                    zIndex: 0
                });
                this.backFrame.front.attr({
                    fill: this.backFrame.color
                });
            }
        });
    }
})(Highcharts);