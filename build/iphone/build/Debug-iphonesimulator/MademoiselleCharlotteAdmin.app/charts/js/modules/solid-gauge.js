(function(a) {
    var m, l = a.getOptions().plotOptions, o = a.pInt, p = a.pick, j = a.each;
    l.solidgauge = a.merge(l.gauge, {
        colorByPoint: !0
    });
    m = {
        initDataClasses: function(b) {
            var c, h = this, e = this.chart, k = 0, f = this.options;
            this.dataClasses = c = [];
            j(b.dataClasses, function(g, d) {
                var i, g = a.merge(g);
                c.push(g);
                g.color || ("category" === f.dataClassColor ? (i = e.options.colors, g.color = i[k++], 
                k === i.length && (k = 0)) : g.color = h.tweenColors(a.Color(f.minColor), a.Color(f.maxColor), d / (b.dataClasses.length - 1)));
            });
        },
        initStops: function(b) {
            this.stops = b.stops || [ [ 0, this.options.minColor ], [ 1, this.options.maxColor ] ];
            j(this.stops, function(b) {
                b.color = a.Color(b[1]);
            });
        },
        toColor: function(b, h) {
            var e, a, g, d, c = this.stops, f = this.dataClasses;
            if (f) {
                for (d = f.length; d--; ) if (g = f[d], a = g.from, c = g.to, (void 0 === a || b >= a) && (void 0 === c || c >= b)) {
                    e = g.color;
                    h && (h.dataClass = d);
                    break;
                }
            } else {
                this.isLog && (b = this.val2lin(b));
                e = 1 - (this.max - b) / (this.max - this.min);
                for (d = c.length; d--; ) if (e > c[d][0]) break;
                a = c[d] || c[d + 1];
                c = c[d + 1] || a;
                e = 1 - (c[0] - e) / (c[0] - a[0] || 1);
                e = this.tweenColors(a.color, c.color, e);
            }
            return e;
        },
        tweenColors: function(b, a, e) {
            var c = 1 !== a.rgba[3] || 1 !== b.rgba[3];
            return 0 === b.rgba.length || 0 === a.rgba.length ? "none" : (c ? "rgba(" : "rgb(") + Math.round(a.rgba[0] + (b.rgba[0] - a.rgba[0]) * (1 - e)) + "," + Math.round(a.rgba[1] + (b.rgba[1] - a.rgba[1]) * (1 - e)) + "," + Math.round(a.rgba[2] + (b.rgba[2] - a.rgba[2]) * (1 - e)) + (c ? "," + (a.rgba[3] + (b.rgba[3] - a.rgba[3]) * (1 - e)) : "") + ")";
        }
    };
    a.seriesTypes.solidgauge = a.extendClass(a.seriesTypes.gauge, {
        type: "solidgauge",
        bindAxes: function() {
            var b;
            a.seriesTypes.gauge.prototype.bindAxes.call(this);
            b = this.yAxis;
            a.extend(b, m);
            b.options.dataClasses && b.initDataClasses(b.options);
            b.initStops(b.options);
        },
        drawPoints: function() {
            var b = this, h = b.yAxis, e = h.center, c = b.options, k = b.chart.renderer;
            a.each(b.points, function(f) {
                var j, g = f.graphic, d = h.startAngleRad + h.translate(f.y, null, null, null, !0), i = o(p(c.radius, 100)) * e[2] / 200, l = o(p(c.innerRadius, 60)) * e[2] / 200, n = h.toColor(f.y, f);
                "none" !== n && (j = f.color, f.color = n);
                c.wrap === !1 && (d = Math.max(h.startAngleRad, Math.min(h.endAngleRad, d)));
                d = 180 * d / Math.PI;
                d = {
                    x: e[0],
                    y: e[1],
                    r: i,
                    innerR: l,
                    start: h.startAngleRad,
                    end: d / (180 / Math.PI)
                };
                g ? (i = d.d, g.attr({
                    fill: f.color
                }).animate(d, {
                    step: function(b, c) {
                        g.attr("fill", m.tweenColors(a.Color(j), a.Color(n), c.pos));
                    }
                }), d.d = i) : f.graphic = k.arc(d).attr({
                    stroke: c.borderColor || "none",
                    "stroke-width": c.borderWidth || 0,
                    fill: f.color
                }).add(b.group);
            });
        },
        animate: null
    });
})(Highcharts);