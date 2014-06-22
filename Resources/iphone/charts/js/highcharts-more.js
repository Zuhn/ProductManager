(function(m, C) {
    function K(a, b, c) {
        this.init.call(this, a, b, c);
    }
    var O = m.arrayMin, P = m.arrayMax, s = m.each, F = m.extend, o = m.merge, Q = m.map, q = m.pick, x = m.pInt, p = m.getOptions().plotOptions, h = m.seriesTypes, u = m.extendClass, L = m.splat, r = m.wrap, M = m.Axis, y = m.Tick, H = m.Point, R = m.Pointer, S = m.CenteredSeriesMixin, z = m.TrackerMixin, t = m.Series, v = Math, D = v.round, A = v.floor, T = v.max, U = m.Color, w = function() {};
    F(K.prototype, {
        init: function(a, b, c) {
            var d = this, e = d.defaultOptions;
            d.chart = b;
            b.angular && (e.background = {});
            d.options = a = o(e, a);
            (a = a.background) && s([].concat(L(a)).reverse(), function(a) {
                var g = a.backgroundColor, a = o(d.defaultBackgroundOptions, a);
                g && (a.backgroundColor = g);
                a.color = a.backgroundColor;
                c.options.plotBands.unshift(a);
            });
        },
        defaultOptions: {
            center: [ "50%", "50%" ],
            size: "85%",
            startAngle: 0
        },
        defaultBackgroundOptions: {
            shape: "circle",
            borderWidth: 1,
            borderColor: "silver",
            backgroundColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [ [ 0, "#FFF" ], [ 1, "#DDD" ] ]
            },
            from: Number.MIN_VALUE,
            innerRadius: 0,
            to: Number.MAX_VALUE,
            outerRadius: "105%"
        }
    });
    var G = M.prototype, y = y.prototype, V = {
        getOffset: w,
        redraw: function() {
            this.isDirty = !1;
        },
        render: function() {
            this.isDirty = !1;
        },
        setScale: w,
        setCategories: w,
        setTitle: w
    }, N = {
        isRadial: !0,
        defaultRadialGaugeOptions: {
            labels: {
                align: "center",
                x: 0,
                y: null
            },
            minorGridLineWidth: 0,
            minorTickInterval: "auto",
            minorTickLength: 10,
            minorTickPosition: "inside",
            minorTickWidth: 1,
            tickLength: 10,
            tickPosition: "inside",
            tickWidth: 2,
            title: {
                rotation: 0
            },
            zIndex: 2
        },
        defaultRadialXOptions: {
            gridLineWidth: 1,
            labels: {
                align: null,
                distance: 15,
                x: 0,
                y: null
            },
            maxPadding: 0,
            minPadding: 0,
            showLastLabel: !1,
            tickLength: 0
        },
        defaultRadialYOptions: {
            gridLineInterpolation: "circle",
            labels: {
                align: "right",
                x: -3,
                y: -2
            },
            showLastLabel: !1,
            title: {
                x: 4,
                text: null,
                rotation: 90
            }
        },
        setOptions: function(a) {
            a = this.options = o(this.defaultOptions, this.defaultRadialOptions, a);
            a.plotBands || (a.plotBands = []);
        },
        getOffset: function() {
            G.getOffset.call(this);
            this.chart.axisOffset[this.side] = 0;
            this.center = this.pane.center = S.getCenter.call(this.pane);
        },
        getLinePath: function(a, b) {
            var c = this.center, b = q(b, c[2] / 2 - this.offset);
            return this.chart.renderer.symbols.arc(this.left + c[0], this.top + c[1], b, b, {
                start: this.startAngleRad,
                end: this.endAngleRad,
                open: !0,
                innerR: 0
            });
        },
        setAxisTranslation: function() {
            G.setAxisTranslation.call(this);
            this.center && (this.transA = this.isCircular ? (this.endAngleRad - this.startAngleRad) / (this.max - this.min || 1) : this.center[2] / 2 / (this.max - this.min || 1), 
            this.minPixelPadding = this.isXAxis ? this.transA * this.minPointOffset : 0);
        },
        beforeSetTickPositions: function() {
            this.autoConnect && (this.max += this.categories && 1 || this.pointRange || this.closestPointRange || 0);
        },
        setAxisSize: function() {
            G.setAxisSize.call(this);
            if (this.isRadial) {
                this.center = this.pane.center = m.CenteredSeriesMixin.getCenter.call(this.pane);
                this.isCircular && (this.sector = this.endAngleRad - this.startAngleRad);
                this.len = this.width = this.height = this.center[2] * q(this.sector, 1) / 2;
            }
        },
        getPosition: function(a, b) {
            return this.postTranslate(this.isCircular ? this.translate(a) : 0, q(this.isCircular ? b : this.translate(a), this.center[2] / 2) - this.offset);
        },
        postTranslate: function(a, b) {
            var c = this.chart, d = this.center, a = this.startAngleRad + a;
            return {
                x: c.plotLeft + d[0] + Math.cos(a) * b,
                y: c.plotTop + d[1] + Math.sin(a) * b
            };
        },
        getPlotBandPath: function(a, b, c) {
            var l, d = this.center, e = this.startAngleRad, f = d[2] / 2, g = [ q(c.outerRadius, "100%"), c.innerRadius, q(c.thickness, 10) ], k = /%$/, n = this.isCircular;
            "polygon" === this.options.gridLineInterpolation ? d = this.getPlotLinePath(a).concat(this.getPlotLinePath(b, !0)) : (n || (g[0] = this.translate(a), 
            g[1] = this.translate(b)), g = Q(g, function(a) {
                k.test(a) && (a = x(a, 10) * f / 100);
                return a;
            }), "circle" !== c.shape && n ? (a = e + this.translate(a), b = e + this.translate(b)) : (a = -Math.PI / 2, 
            b = 1.5 * Math.PI, l = !0), d = this.chart.renderer.symbols.arc(this.left + d[0], this.top + d[1], g[0], g[0], {
                start: a,
                end: b,
                innerR: q(g[1], g[0] - g[2]),
                open: l
            }));
            return d;
        },
        getPlotLinePath: function(a, b) {
            var g, k, l, c = this, d = c.center, e = c.chart, f = c.getPosition(a);
            c.isCircular ? l = [ "M", d[0] + e.plotLeft, d[1] + e.plotTop, "L", f.x, f.y ] : "circle" === c.options.gridLineInterpolation ? (a = c.translate(a)) && (l = c.getLinePath(0, a)) : (s(e.xAxis, function(a) {
                a.pane === c.pane && (g = a);
            }), l = [], a = c.translate(a), d = g.tickPositions, g.autoConnect && (d = d.concat([ d[0] ])), 
            b && (d = [].concat(d).reverse()), s(d, function(f, c) {
                k = g.getPosition(f, a);
                l.push(c ? "L" : "M", k.x, k.y);
            }));
            return l;
        },
        getTitlePosition: function() {
            var a = this.center, b = this.chart, c = this.options.title;
            return {
                x: b.plotLeft + a[0] + (c.x || 0),
                y: b.plotTop + a[1] - {
                    high: .5,
                    middle: .25,
                    low: 0
                }[c.align] * a[2] + (c.y || 0)
            };
        }
    };
    r(G, "init", function(a, b, c) {
        var i;
        var k, l, d = b.angular, e = b.polar, f = c.isX, g = d && f;
        l = b.options;
        var n = c.pane || 0;
        d ? (F(this, g ? V : N), k = !f) && (this.defaultRadialOptions = this.defaultRadialGaugeOptions) : e && (F(this, N), 
        this.defaultRadialOptions = (k = f) ? this.defaultRadialXOptions : o(this.defaultYAxisOptions, this.defaultRadialYOptions));
        a.call(this, b, c);
        if (!g && (d || e)) {
            a = this.options;
            b.panes || (b.panes = []);
            this.pane = (i = b.panes[n] = b.panes[n] || new K(L(l.pane)[n], b, this), n = i);
            n = n.options;
            b.inverted = !1;
            l.chart.zoomType = null;
            this.startAngleRad = b = (n.startAngle - 90) * Math.PI / 180;
            this.endAngleRad = l = (q(n.endAngle, n.startAngle + 360) - 90) * Math.PI / 180;
            this.offset = a.offset || 0;
            (this.isCircular = k) && c.max === C && l - b === 2 * Math.PI && (this.autoConnect = !0);
        }
    });
    r(y, "getPosition", function(a, b, c, d, e) {
        var f = this.axis;
        return f.getPosition ? f.getPosition(c) : a.call(this, b, c, d, e);
    });
    r(y, "getLabelPosition", function(a, b, c, d, e, f, g, k, l) {
        var n = this.axis, j = f.y, i = f.align, h = 180 * ((n.translate(this.pos) + n.startAngleRad + Math.PI / 2) / Math.PI) % 360;
        n.isRadial ? (a = n.getPosition(this.pos, n.center[2] / 2 + q(f.distance, -25)), 
        "auto" === f.rotation ? d.attr({
            rotation: h
        }) : null === j && (j = n.chart.renderer.fontMetrics(d.styles.fontSize).b - d.getBBox().height / 2), 
        null === i && (i = n.isCircular ? h > 20 && 160 > h ? "left" : h > 200 && 340 > h ? "right" : "center" : "center", 
        d.attr({
            align: i
        })), a.x += f.x, a.y += j) : a = a.call(this, b, c, d, e, f, g, k, l);
        return a;
    });
    r(y, "getMarkPath", function(a, b, c, d, e, f, g) {
        var k = this.axis;
        k.isRadial ? (a = k.getPosition(this.pos, k.center[2] / 2 + d), b = [ "M", b, c, "L", a.x, a.y ]) : b = a.call(this, b, c, d, e, f, g);
        return b;
    });
    p.arearange = o(p.area, {
        lineWidth: 1,
        marker: null,
        threshold: null,
        tooltip: {
            pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>'
        },
        trackByArea: !0,
        dataLabels: {
            verticalAlign: null,
            xLow: 0,
            xHigh: 0,
            yLow: 0,
            yHigh: 0
        },
        states: {
            hover: {
                halo: !1
            }
        }
    });
    h.arearange = u(h.area, {
        type: "arearange",
        pointArrayMap: [ "low", "high" ],
        toYData: function(a) {
            return [ a.low, a.high ];
        },
        pointValKey: "low",
        getSegments: function() {
            var a = this;
            s(a.points, function(b) {
                a.options.connectNulls || null !== b.low && null !== b.high ? null === b.low && null !== b.high && (b.y = b.high) : b.y = null;
            });
            t.prototype.getSegments.call(this);
        },
        translate: function() {
            var a = this.yAxis;
            h.area.prototype.translate.apply(this);
            s(this.points, function(b) {
                var c = b.low, d = b.high, e = b.plotY;
                null === d && null === c ? b.y = null : null === c ? (b.plotLow = b.plotY = null, 
                b.plotHigh = a.translate(d, 0, 1, 0, 1)) : null === d ? (b.plotLow = e, b.plotHigh = null) : (b.plotLow = e, 
                b.plotHigh = a.translate(d, 0, 1, 0, 1));
            });
        },
        getSegmentPath: function(a) {
            var b, f, g, c = [], d = a.length, e = t.prototype.getSegmentPath;
            g = this.options;
            var k = g.step;
            for (b = HighchartsAdapter.grep(a, function(a) {
                return null !== a.plotLow;
            }); d--; ) f = a[d], null !== f.plotHigh && c.push({
                plotX: f.plotX,
                plotY: f.plotHigh
            });
            a = e.call(this, b);
            k && (k === !0 && (k = "left"), g.step = {
                left: "right",
                center: "center",
                right: "left"
            }[k]);
            c = e.call(this, c);
            g.step = k;
            g = [].concat(a, c);
            c[0] = "L";
            this.areaPath = this.areaPath.concat(a, c);
            return g;
        },
        drawDataLabels: function() {
            var c, g, a = this.data, b = a.length, d = [], e = t.prototype, f = this.options.dataLabels, k = this.chart.inverted;
            if (f.enabled || this._hasPointLabels) {
                for (c = b; c--; ) g = a[c], g.y = g.high, g._plotY = g.plotY, g.plotY = g.plotHigh, 
                d[c] = g.dataLabel, g.dataLabel = g.dataLabelUpper, g.below = !1, k ? (f.align = "left", 
                f.x = f.xHigh) : f.y = f.yHigh;
                e.drawDataLabels && e.drawDataLabels.apply(this, arguments);
                for (c = b; c--; ) g = a[c], g.dataLabelUpper = g.dataLabel, g.dataLabel = d[c], 
                g.y = g.low, g.plotY = g._plotY, g.below = !0, k ? (f.align = "right", f.x = f.xLow) : f.y = f.yLow;
                e.drawDataLabels && e.drawDataLabels.apply(this, arguments);
            }
        },
        alignDataLabel: function() {
            h.column.prototype.alignDataLabel.apply(this, arguments);
        },
        getSymbol: h.column.prototype.getSymbol,
        drawPoints: w
    });
    p.areasplinerange = o(p.arearange);
    h.areasplinerange = u(h.arearange, {
        type: "areasplinerange",
        getPointSpline: h.spline.prototype.getPointSpline
    });
    (function() {
        var a = h.column.prototype;
        p.columnrange = o(p.column, p.arearange, {
            lineWidth: 1,
            pointRange: null
        });
        h.columnrange = u(h.arearange, {
            type: "columnrange",
            translate: function() {
                var d, b = this, c = b.yAxis;
                a.translate.apply(b);
                s(b.points, function(a) {
                    var k, f = a.shapeArgs, g = b.options.minPointLength;
                    a.tooltipPos = null;
                    a.plotHigh = d = c.translate(a.high, 0, 1, 0, 1);
                    a.plotLow = a.plotY;
                    k = d;
                    a = a.plotY - d;
                    g > a && (g -= a, a += g, k -= g / 2);
                    f.height = a;
                    f.y = k;
                });
            },
            trackerGroups: [ "group", "dataLabels" ],
            drawGraph: w,
            pointAttrToOptions: a.pointAttrToOptions,
            drawPoints: a.drawPoints,
            drawTracker: a.drawTracker,
            animate: a.animate,
            getColumnMetrics: a.getColumnMetrics
        });
    })();
    p.gauge = o(p.line, {
        dataLabels: {
            enabled: !0,
            defer: !1,
            y: 15,
            borderWidth: 1,
            borderColor: "silver",
            borderRadius: 3,
            crop: !1,
            style: {
                fontWeight: "bold"
            },
            verticalAlign: "top",
            zIndex: 2
        },
        dial: {},
        pivot: {},
        tooltip: {
            headerFormat: ""
        },
        showInLegend: !1
    });
    z = {
        type: "gauge",
        pointClass: u(H, {
            setState: function(a) {
                this.state = a;
            }
        }),
        angular: !0,
        drawGraph: w,
        fixedBox: !0,
        forceDL: !0,
        trackerGroups: [ "group", "dataLabels" ],
        translate: function() {
            var a = this.yAxis, b = this.options, c = a.center;
            this.generatePoints();
            s(this.points, function(d) {
                var e = o(b.dial, d.dial), f = x(q(e.radius, 80)) * c[2] / 200, g = x(q(e.baseLength, 70)) * f / 100, k = x(q(e.rearLength, 10)) * f / 100, l = e.baseWidth || 3, n = e.topWidth || 1, j = b.overshoot, i = a.startAngleRad + a.translate(d.y, null, null, null, !0);
                j && "number" == typeof j ? (j = j / 180 * Math.PI, i = Math.max(a.startAngleRad - j, Math.min(a.endAngleRad + j, i))) : b.wrap === !1 && (i = Math.max(a.startAngleRad, Math.min(a.endAngleRad, i)));
                i = 180 * i / Math.PI;
                d.shapeType = "path";
                d.shapeArgs = {
                    d: e.path || [ "M", -k, -l / 2, "L", g, -l / 2, f, -n / 2, f, n / 2, g, l / 2, -k, l / 2, "z" ],
                    translateX: c[0],
                    translateY: c[1],
                    rotation: i
                };
                d.plotX = c[0];
                d.plotY = c[1];
            });
        },
        drawPoints: function() {
            var a = this, b = a.yAxis.center, c = a.pivot, d = a.options, e = d.pivot, f = a.chart.renderer;
            s(a.points, function(c) {
                var b = c.graphic, l = c.shapeArgs, e = l.d, j = o(d.dial, c.dial);
                b ? (b.animate(l), l.d = e) : c.graphic = f[c.shapeType](l).attr({
                    stroke: j.borderColor || "none",
                    "stroke-width": j.borderWidth || 0,
                    fill: j.backgroundColor || "black",
                    rotation: l.rotation
                }).add(a.group);
            });
            c ? c.animate({
                translateX: b[0],
                translateY: b[1]
            }) : a.pivot = f.circle(0, 0, q(e.radius, 5)).attr({
                "stroke-width": e.borderWidth || 0,
                stroke: e.borderColor || "silver",
                fill: e.backgroundColor || "black"
            }).translate(b[0], b[1]).add(a.group);
        },
        animate: function(a) {
            var b = this;
            a || (s(b.points, function(a) {
                var d = a.graphic;
                d && (d.attr({
                    rotation: 180 * b.yAxis.startAngleRad / Math.PI
                }), d.animate({
                    rotation: a.shapeArgs.rotation
                }, b.options.animation));
            }), b.animate = null);
        },
        render: function() {
            this.group = this.plotGroup("group", "series", this.visible ? "visible" : "hidden", this.options.zIndex, this.chart.seriesGroup);
            t.prototype.render.call(this);
            this.group.clip(this.chart.clipRect);
        },
        setData: function(a, b) {
            t.prototype.setData.call(this, a, !1);
            this.processData();
            this.generatePoints();
            q(b, !0) && this.chart.redraw();
        },
        drawTracker: z && z.drawTrackerPoint
    };
    h.gauge = u(h.line, z);
    p.boxplot = o(p.column, {
        fillColor: "#FFFFFF",
        lineWidth: 1,
        medianWidth: 2,
        states: {
            hover: {
                brightness: -.3
            }
        },
        threshold: null,
        tooltip: {
            pointFormat: '<span style="color:{series.color}">●</span> <b> {series.name}</b><br/>Maximum: {point.high}<br/>Upper quartile: {point.q3}<br/>Median: {point.median}<br/>Lower quartile: {point.q1}<br/>Minimum: {point.low}<br/>'
        },
        whiskerLength: "50%",
        whiskerWidth: 2
    });
    h.boxplot = u(h.column, {
        type: "boxplot",
        pointArrayMap: [ "low", "q1", "median", "q3", "high" ],
        toYData: function(a) {
            return [ a.low, a.q1, a.median, a.q3, a.high ];
        },
        pointValKey: "high",
        pointAttrToOptions: {
            fill: "fillColor",
            stroke: "color",
            "stroke-width": "lineWidth"
        },
        drawDataLabels: w,
        translate: function() {
            var a = this.yAxis, b = this.pointArrayMap;
            h.column.prototype.translate.apply(this);
            s(this.points, function(c) {
                s(b, function(b) {
                    null !== c[b] && (c[b + "Plot"] = a.translate(c[b], 0, 1, 0, 1));
                });
            });
        },
        drawPoints: function() {
            var e, f, g, k, l, n, j, i, h, m, p, I, r, o, J, u, w, t, v, x, z, y, a = this, b = a.points, c = a.options, d = a.chart.renderer, E = a.doQuartiles !== !1, B = parseInt(a.options.whiskerLength, 10) / 100;
            s(b, function(b) {
                h = b.graphic;
                z = b.shapeArgs;
                p = {};
                o = {};
                u = {};
                y = b.color || a.color;
                if (b.plotY !== C) if (e = b.pointAttr[b.selected ? "selected" : ""], w = z.width, 
                t = A(z.x), v = t + w, x = D(w / 2), f = A(E ? b.q1Plot : b.lowPlot), g = A(E ? b.q3Plot : b.lowPlot), 
                k = A(b.highPlot), l = A(b.lowPlot), p.stroke = b.stemColor || c.stemColor || y, 
                p["stroke-width"] = q(b.stemWidth, c.stemWidth, c.lineWidth), p.dashstyle = b.stemDashStyle || c.stemDashStyle, 
                o.stroke = b.whiskerColor || c.whiskerColor || y, o["stroke-width"] = q(b.whiskerWidth, c.whiskerWidth, c.lineWidth), 
                u.stroke = b.medianColor || c.medianColor || y, u["stroke-width"] = q(b.medianWidth, c.medianWidth, c.lineWidth), 
                u["stroke-linecap"] = "round", j = p["stroke-width"] % 2 / 2, i = t + x + j, m = [ "M", i, g, "L", i, k, "M", i, f, "L", i, l ], 
                E && (j = e["stroke-width"] % 2 / 2, i = A(i) + j, f = A(f) + j, g = A(g) + j, t += j, 
                v += j, I = [ "M", t, g, "L", t, f, "L", v, f, "L", v, g, "L", t, g, "z" ]), B && (j = o["stroke-width"] % 2 / 2, 
                k += j, l += j, r = [ "M", i - x * B, k, "L", i + x * B, k, "M", i - x * B, l, "L", i + x * B, l ]), 
                j = u["stroke-width"] % 2 / 2, n = D(b.medianPlot) + j, J = [ "M", t, n, "L", v, n ], 
                h) b.stem.animate({
                    d: m
                }), B && b.whiskers.animate({
                    d: r
                }), E && b.box.animate({
                    d: I
                }), b.medianShape.animate({
                    d: J
                }); else {
                    b.graphic = h = d.g().add(a.group);
                    b.stem = d.path(m).attr(p).add(h);
                    B && (b.whiskers = d.path(r).attr(o).add(h));
                    E && (b.box = d.path(I).attr(e).add(h));
                    b.medianShape = d.path(J).attr(u).add(h);
                }
            });
        }
    });
    p.errorbar = o(p.boxplot, {
        color: "#000000",
        grouping: !1,
        linkedTo: ":previous",
        tooltip: {
            pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>'
        },
        whiskerWidth: null
    });
    h.errorbar = u(h.boxplot, {
        type: "errorbar",
        pointArrayMap: [ "low", "high" ],
        toYData: function(a) {
            return [ a.low, a.high ];
        },
        pointValKey: "high",
        doQuartiles: !1,
        drawDataLabels: h.arearange ? h.arearange.prototype.drawDataLabels : w,
        getColumnMetrics: function() {
            return this.linkedParent && this.linkedParent.columnMetrics || h.column.prototype.getColumnMetrics.call(this);
        }
    });
    p.waterfall = o(p.column, {
        lineWidth: 1,
        lineColor: "#333",
        dashStyle: "dot",
        borderColor: "#333"
    });
    h.waterfall = u(h.column, {
        type: "waterfall",
        upColorProp: "fill",
        pointArrayMap: [ "low", "y" ],
        pointValKey: "y",
        init: function(a, b) {
            b.stacking = !0;
            h.column.prototype.init.call(this, a, b);
        },
        translate: function() {
            var b, c, d, e, f, g, k, l, n, a = this.yAxis;
            b = this.options.threshold;
            h.column.prototype.translate.apply(this);
            l = b;
            d = this.points;
            for (c = 0, b = d.length; b > c; c++) {
                e = d[c];
                f = e.shapeArgs;
                g = this.getStack(c);
                n = g.points[this.index + "," + c];
                isNaN(e.y) && (e.y = this.yData[c]);
                k = T(l, l + e.y) + n[0];
                f.y = a.translate(k, 0, 1);
                e.isSum || e.isIntermediateSum ? (f.y = a.translate(n[1], 0, 1), f.height = a.translate(n[0], 0, 1) - f.y) : l += g.total;
                0 > f.height && (f.y += f.height, f.height *= -1);
                e.plotY = f.y = D(f.y) - this.borderWidth % 2 / 2;
                f.height = D(f.height);
                e.yBottom = f.y + f.height;
            }
        },
        processData: function(a) {
            var d, g, k, l, n, j, i, b = this.yData, c = this.points, e = b.length, f = this.options.threshold || 0;
            k = g = l = n = f;
            for (i = 0; e > i; i++) j = b[i], d = c && c[i] ? c[i] : {}, "sum" === j || d.isSum ? b[i] = k : "intermediateSum" === j || d.isIntermediateSum ? (b[i] = g, 
            g = f) : (k += j, g += j), l = Math.min(k, l), n = Math.max(k, n);
            t.prototype.processData.call(this, a);
            this.dataMin = l;
            this.dataMax = n;
        },
        toYData: function(a) {
            if (a.isSum) return "sum";
            if (a.isIntermediateSum) return "intermediateSum";
            return a.y;
        },
        getAttribs: function() {
            h.column.prototype.getAttribs.apply(this, arguments);
            var a = this.options, b = a.states, c = a.upColor || this.color, a = m.Color(c).brighten(.1).get(), d = o(this.pointAttr), e = this.upColorProp;
            d[""][e] = c;
            d.hover[e] = b.hover.upColor || a;
            d.select[e] = b.select.upColor || c;
            s(this.points, function(a) {
                a.y > 0 && !a.color && (a.pointAttr = d, a.color = c);
            });
        },
        getGraphPath: function() {
            var e, f, g, a = this.data, b = a.length, c = D(this.options.lineWidth + this.borderWidth) % 2 / 2, d = [];
            for (g = 1; b > g; g++) f = a[g].shapeArgs, e = a[g - 1].shapeArgs, f = [ "M", e.x + e.width, e.y + c, "L", f.x, e.y + c ], 
            0 > a[g - 1].y && (f[2] += e.height, f[5] += e.height), d = d.concat(f);
            return d;
        },
        getExtremes: w,
        getStack: function(a) {
            var b = this.yAxis.stacks, c = this.stackKey;
            this.processedYData[a] < this.options.threshold && (c = "-" + c);
            return b[c][a];
        },
        drawGraph: t.prototype.drawGraph
    });
    p.bubble = o(p.scatter, {
        dataLabels: {
            format: "{point.z}",
            inside: !0,
            style: {
                color: "white",
                textShadow: "0px 0px 3px black"
            },
            verticalAlign: "middle"
        },
        marker: {
            lineColor: null,
            lineWidth: 1
        },
        minSize: 8,
        maxSize: "20%",
        states: {
            hover: {
                halo: {
                    size: 5
                }
            }
        },
        tooltip: {
            pointFormat: "({point.x}, {point.y}), Size: {point.z}"
        },
        turboThreshold: 0,
        zThreshold: 0
    });
    z = u(H, {
        haloPath: function() {
            return H.prototype.haloPath.call(this, this.shapeArgs.r + this.series.options.states.hover.halo.size);
        }
    });
    h.bubble = u(h.scatter, {
        type: "bubble",
        pointClass: z,
        pointArrayMap: [ "y", "z" ],
        parallelArrays: [ "x", "y", "z" ],
        trackerGroups: [ "group", "dataLabelsGroup" ],
        bubblePadding: !0,
        pointAttrToOptions: {
            stroke: "lineColor",
            "stroke-width": "lineWidth",
            fill: "fillColor"
        },
        applyOpacity: function(a) {
            var b = this.options.marker, c = q(b.fillOpacity, .5), a = a || b.fillColor || this.color;
            1 !== c && (a = U(a).setOpacity(c).get("rgba"));
            return a;
        },
        convertAttribs: function() {
            var a = t.prototype.convertAttribs.apply(this, arguments);
            a.fill = this.applyOpacity(a.fill);
            return a;
        },
        getRadii: function(a, b, c, d) {
            var e, f, g, k = this.zData, l = [], n = "width" !== this.options.sizeBy;
            for (f = 0, e = k.length; e > f; f++) g = b - a, g = g > 0 ? (k[f] - a) / (b - a) : .5, 
            n && g >= 0 && (g = Math.sqrt(g)), l.push(v.ceil(c + g * (d - c)) / 2);
            this.radii = l;
        },
        animate: function(a) {
            var b = this.options.animation;
            a || (s(this.points, function(a) {
                var d = a.graphic, a = a.shapeArgs;
                d && a && (d.attr("r", 1), d.animate({
                    r: a.r
                }, b));
            }), this.animate = null);
        },
        translate: function() {
            var a, c, d, b = this.data, e = this.radii;
            h.scatter.prototype.translate.call(this);
            for (a = b.length; a--; ) c = b[a], d = e ? e[a] : 0, c.negative = c.z < (this.options.zThreshold || 0), 
            d >= this.minPxSize / 2 ? (c.shapeType = "circle", c.shapeArgs = {
                x: c.plotX,
                y: c.plotY,
                r: d
            }, c.dlBox = {
                x: c.plotX - d,
                y: c.plotY - d,
                width: 2 * d,
                height: 2 * d
            }) : c.shapeArgs = c.plotY = c.dlBox = C;
        },
        drawLegendSymbol: function(a, b) {
            var c = x(a.itemStyle.fontSize) / 2;
            b.legendSymbol = this.chart.renderer.circle(c, a.baseline - c, c).attr({
                zIndex: 3
            }).add(b.legendGroup);
            b.legendSymbol.isMarker = !0;
        },
        drawPoints: h.column.prototype.drawPoints,
        alignDataLabel: h.column.prototype.alignDataLabel
    });
    M.prototype.beforePadding = function() {
        var a = this, b = this.len, c = this.chart, d = 0, e = b, f = this.isXAxis, g = f ? "xData" : "yData", k = this.min, l = {}, n = v.min(c.plotWidth, c.plotHeight), j = Number.MAX_VALUE, i = -Number.MAX_VALUE, h = this.max - k, m = b / h, p = [];
        this.tickPositions && (s(this.series, function(b) {
            var g = b.options;
            !b.bubblePadding || !b.visible && c.options.chart.ignoreHiddenSeries || (a.allowZoomOutside = !0, 
            p.push(b), f) && (s([ "minSize", "maxSize" ], function(a) {
                var b = g[a], f = /%$/.test(b), b = x(b);
                l[a] = f ? n * b / 100 : b;
            }), b.minPxSize = l.minSize, b = b.zData, b.length && (j = v.min(j, v.max(O(b), g.displayNegative === !1 ? g.zThreshold : -Number.MAX_VALUE)), 
            i = v.max(i, P(b))));
        }), s(p, function(a) {
            var n, b = a[g], c = b.length;
            f && a.getRadii(j, i, l.minSize, l.maxSize);
            if (h > 0) for (;c--; ) "number" == typeof b[c] && (n = a.radii[c], d = Math.min((b[c] - k) * m - n, d), 
            e = Math.max((b[c] - k) * m + n, e));
        }), p.length && h > 0 && q(this.options.min, this.userMin) === C && q(this.options.max, this.userMax) === C && (e -= b, 
        m *= (b + d - e) / b, this.min += d / m, this.max += e / m));
    };
    (function() {
        function a(a, b, c) {
            a.call(this, b, c);
            this.chart.polar && (this.closeSegment = function(a) {
                var b = this.xAxis.center;
                a.push("L", b[0], b[1]);
            }, this.closedStacks = !0);
        }
        function b(a, b) {
            var c = this.chart, d = this.options.animation, e = this.group, j = this.markerGroup, i = this.xAxis.center, h = c.plotLeft, m = c.plotTop;
            c.polar ? c.renderer.isSVG && (d === !0 && (d = {}), b ? (c = {
                translateX: i[0] + h,
                translateY: i[1] + m,
                scaleX: .001,
                scaleY: .001
            }, e.attr(c), j && j.attr(c)) : (c = {
                translateX: h,
                translateY: m,
                scaleX: 1,
                scaleY: 1
            }, e.animate(c, d), j && j.animate(c, d), this.animate = null)) : a.call(this, b);
        }
        var e, c = t.prototype, d = R.prototype;
        c.toXY = function(a) {
            var b, c = this.chart, d = a.plotX;
            b = a.plotY;
            a.rectPlotX = d;
            a.rectPlotY = b;
            d = (180 * (d / Math.PI) + this.xAxis.pane.options.startAngle) % 360;
            0 > d && (d += 360);
            a.clientX = d;
            b = this.xAxis.postTranslate(a.plotX, this.yAxis.len - b);
            a.plotX = a.polarPlotX = b.x - c.plotLeft;
            a.plotY = a.polarPlotY = b.y - c.plotTop;
        };
        c.orderTooltipPoints = function(a) {
            this.chart.polar && (a.sort(function(a, b) {
                return a.clientX - b.clientX;
            }), a[0]) && (a[0].wrappedClientX = a[0].clientX + 360, a.push(a[0]));
        };
        h.area && r(h.area.prototype, "init", a);
        h.areaspline && r(h.areaspline.prototype, "init", a);
        h.spline && r(h.spline.prototype, "getPointSpline", function(a, b, c, d) {
            var e, j, i, h, m, p, o;
            if (this.chart.polar) {
                e = c.plotX;
                j = c.plotY;
                a = b[d - 1];
                i = b[d + 1];
                this.connectEnds && (a || (a = b[b.length - 2]), i || (i = b[1]));
                a && i && (h = a.plotX, m = a.plotY, b = i.plotX, p = i.plotY, h = (1.5 * e + h) / 2.5, 
                m = (1.5 * j + m) / 2.5, i = (1.5 * e + b) / 2.5, o = (1.5 * j + p) / 2.5, b = Math.sqrt(Math.pow(h - e, 2) + Math.pow(m - j, 2)), 
                p = Math.sqrt(Math.pow(i - e, 2) + Math.pow(o - j, 2)), h = Math.atan2(m - j, h - e), 
                m = Math.atan2(o - j, i - e), o = Math.PI / 2 + (h + m) / 2, Math.abs(h - o) > Math.PI / 2 && (o -= Math.PI), 
                h = e + Math.cos(o) * b, m = j + Math.sin(o) * b, i = e + Math.cos(Math.PI + o) * p, 
                o = j + Math.sin(Math.PI + o) * p, c.rightContX = i, c.rightContY = o);
                d ? (c = [ "C", a.rightContX || a.plotX, a.rightContY || a.plotY, h || e, m || j, e, j ], 
                a.rightContX = a.rightContY = null) : c = [ "M", e, j ];
            } else c = a.call(this, b, c, d);
            return c;
        });
        r(c, "translate", function(a) {
            a.call(this);
            if (this.chart.polar && !this.preventPostTranslate) for (var a = this.points, b = a.length; b--; ) this.toXY(a[b]);
        });
        r(c, "getSegmentPath", function(a, b) {
            var c = this.points;
            this.chart.polar && this.options.connectEnds !== !1 && b[b.length - 1] === c[c.length - 1] && null !== c[0].y && (this.connectEnds = !0, 
            b = [].concat(b, [ c[0] ]));
            return a.call(this, b);
        });
        r(c, "animate", b);
        r(c, "setTooltipPoints", function(a, b) {
            this.chart.polar && F(this.xAxis, {
                tooltipLen: 360
            });
            return a.call(this, b);
        });
        h.column && (e = h.column.prototype, r(e, "animate", b), r(e, "translate", function(a) {
            var i, m, b = this.xAxis, c = this.yAxis.len, d = b.center, e = b.startAngleRad, h = this.chart.renderer;
            this.preventPostTranslate = !0;
            a.call(this);
            if (b.isRadial) {
                b = this.points;
                for (m = b.length; m--; ) i = b[m], a = i.barX + e, i.shapeType = "path", i.shapeArgs = {
                    d: h.symbols.arc(d[0], d[1], c - i.plotY, null, {
                        start: a,
                        end: a + i.pointWidth,
                        innerR: c - q(i.yBottom, c)
                    })
                }, this.toXY(i), i.tooltipPos = [ i.plotX, i.plotY ], i.ttBelow = i.plotY > d[1];
            }
        }), r(e, "alignDataLabel", function(a, b, d, e, h, j) {
            if (this.chart.polar) {
                a = 180 * (b.rectPlotX / Math.PI);
                null === e.align && (e.align = a > 20 && 160 > a ? "left" : a > 200 && 340 > a ? "right" : "center");
                null === e.verticalAlign && (e.verticalAlign = 45 > a || a > 315 ? "bottom" : a > 135 && 225 > a ? "top" : "middle");
                c.alignDataLabel.call(this, b, d, e, h, j);
            } else a.call(this, b, d, e, h, j);
        }));
        r(d, "getIndex", function(a, b) {
            var c, e, d = this.chart;
            d.polar ? (e = d.xAxis[0].center, c = b.chartX - e[0] - d.plotLeft, d = b.chartY - e[1] - d.plotTop, 
            c = 180 - Math.round(180 * (Math.atan2(c, d) / Math.PI))) : c = a.call(this, b);
            return c;
        });
        r(d, "getCoordinates", function(a, b) {
            var c = this.chart, d = {
                xAxis: [],
                yAxis: []
            };
            c.polar ? s(c.axes, function(a) {
                var e = a.isXAxis, f = a.center, h = b.chartX - f[0] - c.plotLeft, f = b.chartY - f[1] - c.plotTop;
                d[e ? "xAxis" : "yAxis"].push({
                    axis: a,
                    value: a.translate(e ? Math.PI - Math.atan2(h, f) : Math.sqrt(Math.pow(h, 2) + Math.pow(f, 2)), !0)
                });
            }) : d = a.call(this, b);
            return d;
        });
    })();
})(Highcharts);