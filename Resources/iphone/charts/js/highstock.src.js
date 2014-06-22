(function() {
    function extend(a, b) {
        var n;
        a || (a = {});
        for (n in b) a[n] = b[n];
        return a;
    }
    function merge() {
        var i, len, args = arguments, ret = {}, doCopy = function(copy, original) {
            var value, key;
            "object" != typeof copy && (copy = {});
            for (key in original) if (original.hasOwnProperty(key)) {
                value = original[key];
                copy[key] = value && "object" == typeof value && "[object Array]" !== Object.prototype.toString.call(value) && "renderTo" !== key && "number" != typeof value.nodeType ? doCopy(copy[key] || {}, value) : original[key];
            }
            return copy;
        };
        if (true === args[0]) {
            ret = args[1];
            args = Array.prototype.slice.call(args, 2);
        }
        len = args.length;
        for (i = 0; len > i; i++) ret = doCopy(ret, args[i]);
        return ret;
    }
    function hash() {
        var i = 0, args = arguments, length = args.length, obj = {};
        for (;length > i; i++) obj[args[i++]] = args[i];
        return obj;
    }
    function pInt(s, mag) {
        return parseInt(s, mag || 10);
    }
    function isString(s) {
        return "string" == typeof s;
    }
    function isObject(obj) {
        return "object" == typeof obj;
    }
    function isArray(obj) {
        return "[object Array]" === Object.prototype.toString.call(obj);
    }
    function isNumber(n) {
        return "number" == typeof n;
    }
    function log2lin(num) {
        return math.log(num) / math.LN10;
    }
    function lin2log(num) {
        return math.pow(10, num);
    }
    function erase(arr, item) {
        var i = arr.length;
        while (i--) if (arr[i] === item) {
            arr.splice(i, 1);
            break;
        }
    }
    function defined(obj) {
        return obj !== UNDEFINED && null !== obj;
    }
    function attr(elem, prop, value) {
        var key, ret;
        if (isString(prop)) defined(value) ? elem.setAttribute(prop, value) : elem && elem.getAttribute && (ret = elem.getAttribute(prop)); else if (defined(prop) && isObject(prop)) for (key in prop) elem.setAttribute(key, prop[key]);
        return ret;
    }
    function splat(obj) {
        return isArray(obj) ? obj : [ obj ];
    }
    function pick() {
        var i, arg, args = arguments, length = args.length;
        for (i = 0; length > i; i++) {
            arg = args[i];
            if ("undefined" != typeof arg && null !== arg) return arg;
        }
    }
    function css(el, styles) {
        isIE && !hasSVG && styles && styles.opacity !== UNDEFINED && (styles.filter = "alpha(opacity=" + 100 * styles.opacity + ")");
        extend(el.style, styles);
    }
    function createElement(tag, attribs, styles, parent, nopad) {
        var el = doc.createElement(tag);
        attribs && extend(el, attribs);
        nopad && css(el, {
            padding: 0,
            border: NONE,
            margin: 0
        });
        styles && css(el, styles);
        parent && parent.appendChild(el);
        return el;
    }
    function extendClass(parent, members) {
        var object = function() {};
        object.prototype = new parent();
        extend(object.prototype, members);
        return object;
    }
    function numberFormat(number, decimals, decPoint, thousandsSep) {
        var lang = defaultOptions.lang, n = +number || 0, c = -1 === decimals ? (n.toString().split(".")[1] || "").length : isNaN(decimals = mathAbs(decimals)) ? 2 : decimals, d = void 0 === decPoint ? lang.decimalPoint : decPoint, t = void 0 === thousandsSep ? lang.thousandsSep : thousandsSep, s = 0 > n ? "-" : "", i = String(pInt(n = mathAbs(n).toFixed(c))), j = i.length > 3 ? i.length % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + mathAbs(n - i).toFixed(c).slice(2) : "");
    }
    function pad(number, length) {
        return new Array((length || 2) + 1 - String(number).length).join(0) + number;
    }
    function wrap(obj, method, func) {
        var proceed = obj[method];
        obj[method] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(proceed);
            return func.apply(this, args);
        };
    }
    function formatSingle(format, val) {
        var decimals, floatRegex = /f$/, decRegex = /\.([0-9])/, lang = defaultOptions.lang;
        if (floatRegex.test(format)) {
            decimals = format.match(decRegex);
            decimals = decimals ? decimals[1] : -1;
            null !== val && (val = numberFormat(val, decimals, lang.decimalPoint, format.indexOf(",") > -1 ? lang.thousandsSep : ""));
        } else val = dateFormat(format, val);
        return val;
    }
    function format(str, ctx) {
        var segment, valueAndFormat, path, i, len, val, index, splitter = "{", isInside = false, ret = [];
        while (-1 !== (index = str.indexOf(splitter))) {
            segment = str.slice(0, index);
            if (isInside) {
                valueAndFormat = segment.split(":");
                path = valueAndFormat.shift().split(".");
                len = path.length;
                val = ctx;
                for (i = 0; len > i; i++) val = val[path[i]];
                valueAndFormat.length && (val = formatSingle(valueAndFormat.join(":"), val));
                ret.push(val);
            } else ret.push(segment);
            str = str.slice(index + 1);
            isInside = !isInside;
            splitter = isInside ? "}" : "{";
        }
        ret.push(str);
        return ret.join("");
    }
    function getMagnitude(num) {
        return math.pow(10, mathFloor(math.log(num) / math.LN10));
    }
    function normalizeTickInterval(interval, multiples, magnitude, options) {
        var normalized, i;
        magnitude = pick(magnitude, 1);
        normalized = interval / magnitude;
        if (!multiples) {
            multiples = [ 1, 2, 2.5, 5, 10 ];
            options && false === options.allowDecimals && (1 === magnitude ? multiples = [ 1, 2, 5, 10 ] : .1 >= magnitude && (multiples = [ 1 / magnitude ]));
        }
        for (i = 0; multiples.length > i; i++) {
            interval = multiples[i];
            if ((multiples[i] + (multiples[i + 1] || multiples[i])) / 2 >= normalized) break;
        }
        interval *= magnitude;
        return interval;
    }
    function ChartCounters() {
        this.color = 0;
        this.symbol = 0;
    }
    function stableSort(arr, sortFunction) {
        var sortValue, i, length = arr.length;
        for (i = 0; length > i; i++) arr[i].ss_i = i;
        arr.sort(function(a, b) {
            sortValue = sortFunction(a, b);
            return 0 === sortValue ? a.ss_i - b.ss_i : sortValue;
        });
        for (i = 0; length > i; i++) delete arr[i].ss_i;
    }
    function arrayMin(data) {
        var i = data.length, min = data[0];
        while (i--) min > data[i] && (min = data[i]);
        return min;
    }
    function arrayMax(data) {
        var i = data.length, max = data[0];
        while (i--) data[i] > max && (max = data[i]);
        return max;
    }
    function destroyObjectProperties(obj, except) {
        var n;
        for (n in obj) {
            obj[n] && obj[n] !== except && obj[n].destroy && obj[n].destroy();
            delete obj[n];
        }
    }
    function discardElement(element) {
        garbageBin || (garbageBin = createElement(DIV));
        element && garbageBin.appendChild(element);
        garbageBin.innerHTML = "";
    }
    function error(code, stop) {
        var msg = "Highcharts error #" + code + ": www.highcharts.com/errors/" + code;
        if (stop) throw msg;
        win.console && console.log(msg);
    }
    function correctFloat(num) {
        return parseFloat(num.toPrecision(14));
    }
    function setAnimation(animation, chart) {
        globalAnimation = pick(animation, chart.animation);
    }
    function setTimeMethods() {
        var useUTC = defaultOptions.global.useUTC, GET = useUTC ? "getUTC" : "get", SET = useUTC ? "setUTC" : "set";
        timezoneOffset = 6e4 * (useUTC && defaultOptions.global.timezoneOffset || 0);
        makeTime = useUTC ? Date.UTC : function(year, month, date, hours, minutes, seconds) {
            return new Date(year, month, pick(date, 1), pick(hours, 0), pick(minutes, 0), pick(seconds, 0)).getTime();
        };
        getMinutes = GET + "Minutes";
        getHours = GET + "Hours";
        getDay = GET + "Day";
        getDate = GET + "Date";
        getMonth = GET + "Month";
        getFullYear = GET + "FullYear";
        setMinutes = SET + "Minutes";
        setHours = SET + "Hours";
        setDate = SET + "Date";
        setMonth = SET + "Month";
        setFullYear = SET + "FullYear";
    }
    function setOptions(options) {
        defaultOptions = merge(true, defaultOptions, options);
        setTimeMethods();
        return defaultOptions;
    }
    function getOptions() {
        return defaultOptions;
    }
    function SVGElement() {}
    function Tick(axis, pos, type, noLabel) {
        this.axis = axis;
        this.pos = pos;
        this.type = type || "";
        this.isNew = true;
        type || noLabel || this.addLabel();
    }
    function Axis() {
        this.init.apply(this, arguments);
    }
    function Chart() {
        this.init.apply(this, arguments);
    }
    function StackItem(axis, options, isNegative, x, stackOption) {
        var inverted = axis.chart.inverted;
        this.axis = axis;
        this.isNegative = isNegative;
        this.options = options;
        this.x = x;
        this.total = null;
        this.points = {};
        this.stack = stackOption;
        this.alignOptions = {
            align: options.align || (inverted ? isNegative ? "left" : "right" : "center"),
            verticalAlign: options.verticalAlign || (inverted ? "middle" : isNegative ? "bottom" : "top"),
            y: pick(options.y, inverted ? 4 : isNegative ? 14 : -6),
            x: pick(options.x, inverted ? isNegative ? -6 : 6 : 0)
        };
        this.textAlign = options.textAlign || (inverted ? isNegative ? "right" : "left" : "center");
    }
    function Scroller(chart) {
        var chartOptions = chart.options, navigatorOptions = chartOptions.navigator, navigatorEnabled = navigatorOptions.enabled, scrollbarOptions = chartOptions.scrollbar, scrollbarEnabled = scrollbarOptions.enabled, height = navigatorEnabled ? navigatorOptions.height : 0, scrollbarHeight = scrollbarEnabled ? scrollbarOptions.height : 0;
        this.handles = [];
        this.scrollbarButtons = [];
        this.elementsToDestroy = [];
        this.chart = chart;
        this.setBaseSeries();
        this.height = height;
        this.scrollbarHeight = scrollbarHeight;
        this.scrollbarEnabled = scrollbarEnabled;
        this.navigatorEnabled = navigatorEnabled;
        this.navigatorOptions = navigatorOptions;
        this.scrollbarOptions = scrollbarOptions;
        this.outlineHeight = height + scrollbarHeight;
        this.init();
    }
    function RangeSelector(chart) {
        this.init(chart);
    }
    var UNDEFINED, Renderer, hasTouch, garbageBin, defaultOptions, dateFormat, globalAnimation, pathAnim, timeUnits, AxisPlotLineOrBandExtension, makeTime, timezoneOffset, getMinutes, getHours, getDay, getDate, getMonth, getFullYear, setMinutes, setHours, setDate, setMonth, setFullYear, doc = document, win = window, math = Math, mathRound = math.round, mathFloor = math.floor, mathCeil = math.ceil, mathMax = math.max, mathMin = math.min, mathAbs = math.abs, mathCos = math.cos, mathSin = math.sin, mathPI = math.PI, deg2rad = 2 * mathPI / 360, userAgent = navigator.userAgent, isOpera = win.opera, isIE = /msie/i.test(userAgent) && !isOpera, docMode8 = 8 === doc.documentMode, isWebKit = /AppleWebKit/.test(userAgent), isFirefox = /Firefox/.test(userAgent), isTouchDevice = /(Mobile|Android|Windows Phone)/.test(userAgent), SVG_NS = "http://www.w3.org/2000/svg", hasSVG = !!doc.createElementNS && !!doc.createElementNS(SVG_NS, "svg").createSVGRect, hasBidiBug = isFirefox && 4 > parseInt(userAgent.split("Firefox/")[1], 10), useCanVG = !hasSVG && !isIE && !!doc.createElement("canvas").getContext, symbolSizes = {}, idCounter = 0, noop = function() {}, charts = [], chartCount = 0, PRODUCT = "Highstock", VERSION = "2.0.1", DIV = "div", ABSOLUTE = "absolute", RELATIVE = "relative", HIDDEN = "hidden", PREFIX = "highcharts-", VISIBLE = "visible", PX = "px", NONE = "none", M = "M", L = "L", numRegex = /^[0-9]+$/, NORMAL_STATE = "", HOVER_STATE = "hover", SELECT_STATE = "select", MILLISECOND = "millisecond", SECOND = "second", MINUTE = "minute", HOUR = "hour", DAY = "day", WEEK = "week", MONTH = "month", YEAR = "year", STROKE_WIDTH = "stroke-width", seriesTypes = {};
    var Highcharts = win.Highcharts = win.Highcharts ? error(16, true) : {};
    dateFormat = function(format, timestamp, capitalize) {
        if (!defined(timestamp) || isNaN(timestamp)) return "Invalid date";
        format = pick(format, "%Y-%m-%d %H:%M:%S");
        var key, date = new Date(timestamp - timezoneOffset), hours = date[getHours](), day = date[getDay](), dayOfMonth = date[getDate](), month = date[getMonth](), fullYear = date[getFullYear](), lang = defaultOptions.lang, langWeekdays = lang.weekdays, replacements = extend({
            a: langWeekdays[day].substr(0, 3),
            A: langWeekdays[day],
            d: pad(dayOfMonth),
            e: dayOfMonth,
            b: lang.shortMonths[month],
            B: lang.months[month],
            m: pad(month + 1),
            y: fullYear.toString().substr(2, 2),
            Y: fullYear,
            H: pad(hours),
            I: pad(hours % 12 || 12),
            l: hours % 12 || 12,
            M: pad(date[getMinutes]()),
            p: 12 > hours ? "AM" : "PM",
            P: 12 > hours ? "am" : "pm",
            S: pad(date.getSeconds()),
            L: pad(mathRound(timestamp % 1e3), 3)
        }, Highcharts.dateFormats);
        for (key in replacements) while (-1 !== format.indexOf("%" + key)) format = format.replace("%" + key, "function" == typeof replacements[key] ? replacements[key](timestamp) : replacements[key]);
        return capitalize ? format.substr(0, 1).toUpperCase() + format.substr(1) : format;
    };
    ChartCounters.prototype = {
        wrapColor: function(length) {
            this.color >= length && (this.color = 0);
        },
        wrapSymbol: function(length) {
            this.symbol >= length && (this.symbol = 0);
        }
    };
    timeUnits = hash(MILLISECOND, 1, SECOND, 1e3, MINUTE, 6e4, HOUR, 36e5, DAY, 864e5, WEEK, 6048e5, MONTH, 26784e5, YEAR, 31556952e3);
    pathAnim = {
        init: function(elem, fromD, toD) {
            fromD = fromD || "";
            var endLength, slice, i, startBaseLine, endBaseLine, shift = elem.shift, bezier = fromD.indexOf("C") > -1, numParams = bezier ? 7 : 3, start = fromD.split(" "), end = [].concat(toD), sixify = function(arr) {
                i = arr.length;
                while (i--) arr[i] === M && arr.splice(i + 1, 0, arr[i + 1], arr[i + 2], arr[i + 1], arr[i + 2]);
            };
            if (bezier) {
                sixify(start);
                sixify(end);
            }
            if (elem.isArea) {
                startBaseLine = start.splice(start.length - 6, 6);
                endBaseLine = end.splice(end.length - 6, 6);
            }
            if (end.length / numParams >= shift && start.length === end.length) while (shift--) end = [].concat(end).splice(0, numParams).concat(end);
            elem.shift = 0;
            if (start.length) {
                endLength = end.length;
                while (endLength > start.length) {
                    slice = [].concat(start).splice(start.length - numParams, numParams);
                    if (bezier) {
                        slice[numParams - 6] = slice[numParams - 2];
                        slice[numParams - 5] = slice[numParams - 1];
                    }
                    start = start.concat(slice);
                }
            }
            if (startBaseLine) {
                start = start.concat(startBaseLine);
                end = end.concat(endBaseLine);
            }
            return [ start, end ];
        },
        step: function(start, end, pos, complete) {
            var startVal, ret = [], i = start.length;
            if (1 === pos) ret = complete; else if (i === end.length && 1 > pos) while (i--) {
                startVal = parseFloat(start[i]);
                ret[i] = isNaN(startVal) ? start[i] : pos * parseFloat(end[i] - startVal) + startVal;
            } else ret = end;
            return ret;
        }
    };
    (function($) {
        win.HighchartsAdapter = win.HighchartsAdapter || $ && {
            init: function(pathAnim) {
                var dSetter, Fx = $.fx, Step = Fx.step, Tween = $.Tween, propHooks = Tween && Tween.propHooks, opacityHook = $.cssHooks.opacity;
                $.extend($.easing, {
                    easeOutQuad: function(x, t, b, c, d) {
                        return -c * (t /= d) * (t - 2) + b;
                    }
                });
                $.each([ "cur", "_default", "width", "height", "opacity" ], function(i, fn) {
                    var base, obj = Step;
                    if ("cur" === fn) obj = Fx.prototype; else if ("_default" === fn && Tween) {
                        obj = propHooks[fn];
                        fn = "set";
                    }
                    base = obj[fn];
                    base && (obj[fn] = function(fx) {
                        var elem;
                        fx = i ? fx : this;
                        if ("align" === fx.prop) return;
                        elem = fx.elem;
                        return elem.attr ? elem.attr(fx.prop, "cur" === fn ? UNDEFINED : fx.now) : base.apply(this, arguments);
                    });
                });
                wrap(opacityHook, "get", function(proceed, elem, computed) {
                    return elem.attr ? elem.opacity || 0 : proceed.call(this, elem, computed);
                });
                dSetter = function(fx) {
                    var ends, elem = fx.elem;
                    if (!fx.started) {
                        ends = pathAnim.init(elem, elem.d, elem.toD);
                        fx.start = ends[0];
                        fx.end = ends[1];
                        fx.started = true;
                    }
                    elem.attr("d", pathAnim.step(fx.start, fx.end, fx.pos, elem.toD));
                };
                Tween ? propHooks.d = {
                    set: dSetter
                } : Step.d = dSetter;
                this.each = Array.prototype.forEach ? function(arr, fn) {
                    return Array.prototype.forEach.call(arr, fn);
                } : function(arr, fn) {
                    var i = 0, len = arr.length;
                    for (;len > i; i++) if (false === fn.call(arr[i], arr[i], i, arr)) return i;
                };
                $.fn.highcharts = function() {
                    var options, ret, chart, constr = "Chart", args = arguments;
                    if (this[0]) {
                        if (isString(args[0])) {
                            constr = args[0];
                            args = Array.prototype.slice.call(args, 1);
                        }
                        options = args[0];
                        if (options !== UNDEFINED) {
                            options.chart = options.chart || {};
                            options.chart.renderTo = this[0];
                            chart = new Highcharts[constr](options, args[1]);
                            ret = this;
                        }
                        options === UNDEFINED && (ret = charts[attr(this[0], "data-highcharts-chart")]);
                    }
                    return ret;
                };
            },
            getScript: $.getScript,
            inArray: $.inArray,
            adapterRun: function(elem, method) {
                return $(elem)[method]();
            },
            grep: $.grep,
            map: function(arr, fn) {
                var results = [], i = 0, len = arr.length;
                for (;len > i; i++) results[i] = fn.call(arr[i], arr[i], i, arr);
                return results;
            },
            offset: function(el) {
                return $(el).offset();
            },
            addEvent: function(el, event, fn) {
                $(el).bind(event, fn);
            },
            removeEvent: function(el, eventType, handler) {
                var func = doc.removeEventListener ? "removeEventListener" : "detachEvent";
                doc[func] && el && !el[func] && (el[func] = function() {});
                $(el).unbind(eventType, handler);
            },
            fireEvent: function(el, type, eventArguments, defaultFunction) {
                var defaultPrevented, event = $.Event(type), detachedType = "detached" + type;
                if (!isIE && eventArguments) {
                    delete eventArguments.layerX;
                    delete eventArguments.layerY;
                    delete eventArguments.returnValue;
                }
                extend(event, eventArguments);
                if (el[type]) {
                    el[detachedType] = el[type];
                    el[type] = null;
                }
                $.each([ "preventDefault", "stopPropagation" ], function(i, fn) {
                    var base = event[fn];
                    event[fn] = function() {
                        try {
                            base.call(event);
                        } catch (e) {
                            "preventDefault" === fn && (defaultPrevented = true);
                        }
                    };
                });
                $(el).trigger(event);
                if (el[detachedType]) {
                    el[type] = el[detachedType];
                    el[detachedType] = null;
                }
                !defaultFunction || event.isDefaultPrevented() || defaultPrevented || defaultFunction(event);
            },
            washMouseEvent: function(e) {
                var ret = e.originalEvent || e;
                if (ret.pageX === UNDEFINED) {
                    ret.pageX = e.pageX;
                    ret.pageY = e.pageY;
                }
                return ret;
            },
            animate: function(el, params, options) {
                var $el = $(el);
                el.style || (el.style = {});
                if (params.d) {
                    el.toD = params.d;
                    params.d = 1;
                }
                $el.stop();
                params.opacity !== UNDEFINED && el.attr && (params.opacity += "px");
                $el.animate(params, options);
            },
            stop: function(el) {
                $(el).stop();
            }
        };
    })(win.jQuery);
    var globalAdapter = win.HighchartsAdapter, adapter = globalAdapter || {};
    globalAdapter && globalAdapter.init.call(globalAdapter, pathAnim);
    var adapterRun = adapter.adapterRun, getScript = adapter.getScript, inArray = adapter.inArray, each = adapter.each, grep = adapter.grep, offset = adapter.offset, map = adapter.map, addEvent = adapter.addEvent, removeEvent = adapter.removeEvent, fireEvent = adapter.fireEvent, washMouseEvent = adapter.washMouseEvent, animate = adapter.animate, stop = adapter.stop;
    var defaultLabelOptions = {
        enabled: true,
        x: 0,
        y: 15,
        style: {
            color: "#606060",
            cursor: "default",
            fontSize: "11px"
        }
    };
    defaultOptions = {
        colors: [ "#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#8085e8", "#8d4653", "#91e8e1" ],
        symbols: [ "circle", "diamond", "square", "triangle", "triangle-down" ],
        lang: {
            loading: "Loading...",
            months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
            weekdays: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
            decimalPoint: ".",
            numericSymbols: [ "k", "M", "G", "T", "P", "E" ],
            resetZoom: "Reset zoom",
            resetZoomTitle: "Reset zoom level 1:1",
            thousandsSep: ","
        },
        global: {
            useUTC: true,
            canvasToolsURL: "http://code.highcharts.com/stock/2.0.1/modules/canvas-tools.js",
            VMLRadialGradientURL: "http://code.highcharts.com/stock/2.0.1/gfx/vml-radial-gradient.png"
        },
        chart: {
            borderColor: "#4572A7",
            borderRadius: 0,
            defaultSeriesType: "line",
            ignoreHiddenSeries: true,
            spacing: [ 10, 10, 15, 10 ],
            backgroundColor: "#FFFFFF",
            plotBorderColor: "#C0C0C0",
            resetZoomButton: {
                theme: {
                    zIndex: 20
                },
                position: {
                    align: "right",
                    x: -10,
                    y: 10
                }
            }
        },
        title: {
            text: "Chart title",
            align: "center",
            margin: 15,
            style: {
                color: "#333333",
                fontSize: "18px"
            }
        },
        subtitle: {
            text: "",
            align: "center",
            style: {
                color: "#555555"
            }
        },
        plotOptions: {
            line: {
                allowPointSelect: false,
                showCheckbox: false,
                animation: {
                    duration: 1e3
                },
                events: {},
                lineWidth: 2,
                marker: {
                    lineWidth: 0,
                    radius: 4,
                    lineColor: "#FFFFFF",
                    states: {
                        hover: {
                            enabled: true
                        },
                        select: {
                            fillColor: "#FFFFFF",
                            lineColor: "#000000",
                            lineWidth: 2
                        }
                    }
                },
                point: {
                    events: {}
                },
                dataLabels: merge(defaultLabelOptions, {
                    align: "center",
                    enabled: false,
                    formatter: function() {
                        return null === this.y ? "" : numberFormat(this.y, -1);
                    },
                    verticalAlign: "bottom",
                    y: 0
                }),
                cropThreshold: 300,
                pointRange: 0,
                states: {
                    hover: {
                        marker: {},
                        halo: {
                            size: 10,
                            opacity: .25
                        }
                    },
                    select: {
                        marker: {}
                    }
                },
                stickyTracking: true,
                turboThreshold: 1e3
            }
        },
        labels: {
            style: {
                position: ABSOLUTE,
                color: "#3E576F"
            }
        },
        legend: {
            enabled: true,
            align: "center",
            layout: "horizontal",
            labelFormatter: function() {
                return this.name;
            },
            borderColor: "#909090",
            borderRadius: 0,
            navigation: {
                activeColor: "#274b6d",
                inactiveColor: "#CCC"
            },
            shadow: false,
            itemStyle: {
                color: "#333333",
                fontSize: "12px",
                fontWeight: "bold"
            },
            itemHoverStyle: {
                color: "#000"
            },
            itemHiddenStyle: {
                color: "#CCC"
            },
            itemCheckboxStyle: {
                position: ABSOLUTE,
                width: "13px",
                height: "13px"
            },
            symbolPadding: 5,
            verticalAlign: "bottom",
            x: 0,
            y: 0,
            title: {
                style: {
                    fontWeight: "bold"
                }
            }
        },
        loading: {
            labelStyle: {
                fontWeight: "bold",
                position: RELATIVE,
                top: "1em"
            },
            style: {
                position: ABSOLUTE,
                backgroundColor: "white",
                opacity: .5,
                textAlign: "center"
            }
        },
        tooltip: {
            enabled: true,
            animation: hasSVG,
            backgroundColor: "rgba(249, 249, 249, .85)",
            borderWidth: 1,
            borderRadius: 3,
            dateTimeLabelFormats: {
                millisecond: "%A, %b %e, %H:%M:%S.%L",
                second: "%A, %b %e, %H:%M:%S",
                minute: "%A, %b %e, %H:%M",
                hour: "%A, %b %e, %H:%M",
                day: "%A, %b %e, %Y",
                week: "Week from %A, %b %e, %Y",
                month: "%B %Y",
                year: "%Y"
            },
            headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
            pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>{point.y}</b><br/>',
            shadow: true,
            snap: isTouchDevice ? 25 : 10,
            style: {
                color: "#333333",
                cursor: "default",
                fontSize: "12px",
                padding: "8px",
                whiteSpace: "nowrap"
            }
        },
        credits: {
            enabled: true,
            text: "Highcharts.com",
            href: "http://www.highcharts.com",
            position: {
                align: "right",
                x: -10,
                verticalAlign: "bottom",
                y: -5
            },
            style: {
                cursor: "pointer",
                color: "#909090",
                fontSize: "9px"
            }
        }
    };
    var defaultPlotOptions = defaultOptions.plotOptions, defaultSeriesOptions = defaultPlotOptions.line;
    setTimeMethods();
    var rgbaRegEx = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/, hexRegEx = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/, rgbRegEx = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/;
    var Color = function(input) {
        function init(input) {
            if (input && input.stops) stops = map(input.stops, function(stop) {
                return Color(stop[1]);
            }); else {
                result = rgbaRegEx.exec(input);
                if (result) rgba = [ pInt(result[1]), pInt(result[2]), pInt(result[3]), parseFloat(result[4], 10) ]; else {
                    result = hexRegEx.exec(input);
                    if (result) rgba = [ pInt(result[1], 16), pInt(result[2], 16), pInt(result[3], 16), 1 ]; else {
                        result = rgbRegEx.exec(input);
                        result && (rgba = [ pInt(result[1]), pInt(result[2]), pInt(result[3]), 1 ]);
                    }
                }
            }
        }
        function get(format) {
            var ret;
            if (stops) {
                ret = merge(input);
                ret.stops = [].concat(ret.stops);
                each(stops, function(stop, i) {
                    ret.stops[i] = [ ret.stops[i][0], stop.get(format) ];
                });
            } else ret = rgba && !isNaN(rgba[0]) ? "rgb" === format ? "rgb(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + ")" : "a" === format ? rgba[3] : "rgba(" + rgba.join(",") + ")" : input;
            return ret;
        }
        function brighten(alpha) {
            if (stops) each(stops, function(stop) {
                stop.brighten(alpha);
            }); else if (isNumber(alpha) && 0 !== alpha) {
                var i;
                for (i = 0; 3 > i; i++) {
                    rgba[i] += pInt(255 * alpha);
                    0 > rgba[i] && (rgba[i] = 0);
                    rgba[i] > 255 && (rgba[i] = 255);
                }
            }
            return this;
        }
        function setOpacity(alpha) {
            rgba[3] = alpha;
            return this;
        }
        var result, stops, rgba = [];
        init(input);
        return {
            get: get,
            brighten: brighten,
            rgba: rgba,
            setOpacity: setOpacity
        };
    };
    SVGElement.prototype = {
        init: function(renderer, nodeName) {
            var wrapper = this;
            wrapper.element = "span" === nodeName ? createElement(nodeName) : doc.createElementNS(SVG_NS, nodeName);
            wrapper.renderer = renderer;
        },
        opacity: 1,
        animate: function(params, options, complete) {
            var animOptions = pick(options, globalAnimation, true);
            stop(this);
            if (animOptions) {
                animOptions = merge(animOptions, {});
                complete && (animOptions.complete = complete);
                animate(this, params, animOptions);
            } else {
                this.attr(params);
                complete && complete();
            }
        },
        colorGradient: function(color, prop, elem) {
            var colorObject, gradName, gradAttr, gradients, gradientObject, stops, stopColor, stopOpacity, radialReference, n, id, renderer = this.renderer, key = [];
            color.linearGradient ? gradName = "linearGradient" : color.radialGradient && (gradName = "radialGradient");
            if (gradName) {
                gradAttr = color[gradName];
                gradients = renderer.gradients;
                stops = color.stops;
                radialReference = elem.radialReference;
                isArray(gradAttr) && (color[gradName] = gradAttr = {
                    x1: gradAttr[0],
                    y1: gradAttr[1],
                    x2: gradAttr[2],
                    y2: gradAttr[3],
                    gradientUnits: "userSpaceOnUse"
                });
                "radialGradient" === gradName && radialReference && !defined(gradAttr.gradientUnits) && (gradAttr = merge(gradAttr, {
                    cx: radialReference[0] - radialReference[2] / 2 + gradAttr.cx * radialReference[2],
                    cy: radialReference[1] - radialReference[2] / 2 + gradAttr.cy * radialReference[2],
                    r: gradAttr.r * radialReference[2],
                    gradientUnits: "userSpaceOnUse"
                }));
                for (n in gradAttr) "id" !== n && key.push(n, gradAttr[n]);
                for (n in stops) key.push(stops[n]);
                key = key.join(",");
                if (gradients[key]) id = gradients[key].attr("id"); else {
                    gradAttr.id = id = PREFIX + idCounter++;
                    gradients[key] = gradientObject = renderer.createElement(gradName).attr(gradAttr).add(renderer.defs);
                    gradientObject.stops = [];
                    each(stops, function(stop) {
                        var stopObject;
                        if (0 === stop[1].indexOf("rgba")) {
                            colorObject = Color(stop[1]);
                            stopColor = colorObject.get("rgb");
                            stopOpacity = colorObject.get("a");
                        } else {
                            stopColor = stop[1];
                            stopOpacity = 1;
                        }
                        stopObject = renderer.createElement("stop").attr({
                            offset: stop[0],
                            "stop-color": stopColor,
                            "stop-opacity": stopOpacity
                        }).add(gradientObject);
                        gradientObject.stops.push(stopObject);
                    });
                }
                elem.setAttribute(prop, "url(" + renderer.url + "#" + id + ")");
            }
        },
        attr: function(hash, val) {
            var key, value, hasSetSymbolSize, skipAttr, element = this.element, ret = this;
            if ("string" == typeof hash && val !== UNDEFINED) {
                key = hash;
                hash = {};
                hash[key] = val;
            }
            if ("string" == typeof hash) ret = (this[hash + "Getter"] || this._defaultGetter).call(this, hash, element); else {
                for (key in hash) {
                    value = hash[key];
                    skipAttr = false;
                    if (this.symbolName && /^(x|y|width|height|r|start|end|innerR|anchorX|anchorY)/.test(key)) {
                        if (!hasSetSymbolSize) {
                            this.symbolAttr(hash);
                            hasSetSymbolSize = true;
                        }
                        skipAttr = true;
                    }
                    !this.rotation || "x" !== key && "y" !== key || (this.doTransform = true);
                    skipAttr || (this[key + "Setter"] || this._defaultSetter).call(this, value, key, element);
                    this.shadows && /^(width|height|visibility|x|y|d|transform|cx|cy|r)$/.test(key) && this.updateShadows(key, value);
                }
                if (this.doTransform) {
                    this.updateTransform();
                    this.doTransform = false;
                }
            }
            return ret;
        },
        updateShadows: function(key, value) {
            var shadows = this.shadows, i = shadows.length;
            while (i--) shadows[i].setAttribute(key, "height" === key ? mathMax(value - (shadows[i].cutHeight || 0), 0) : "d" === key ? this.d : value);
        },
        addClass: function(className) {
            var element = this.element, currentClassName = attr(element, "class") || "";
            -1 === currentClassName.indexOf(className) && attr(element, "class", currentClassName + " " + className);
            return this;
        },
        symbolAttr: function(hash) {
            var wrapper = this;
            each([ "x", "y", "r", "start", "end", "width", "height", "innerR", "anchorX", "anchorY" ], function(key) {
                wrapper[key] = pick(hash[key], wrapper[key]);
            });
            wrapper.attr({
                d: wrapper.renderer.symbols[wrapper.symbolName](wrapper.x, wrapper.y, wrapper.width, wrapper.height, wrapper)
            });
        },
        clip: function(clipRect) {
            return this.attr("clip-path", clipRect ? "url(" + this.renderer.url + "#" + clipRect.id + ")" : NONE);
        },
        crisp: function(rect) {
            var key, normalizer, wrapper = this, attribs = {}, strokeWidth = rect.strokeWidth || wrapper.strokeWidth || wrapper.attr && wrapper.attr("stroke-width") || 0;
            normalizer = mathRound(strokeWidth) % 2 / 2;
            rect.x = mathFloor(rect.x || wrapper.x || 0) + normalizer;
            rect.y = mathFloor(rect.y || wrapper.y || 0) + normalizer;
            rect.width = mathFloor((rect.width || wrapper.width || 0) - 2 * normalizer);
            rect.height = mathFloor((rect.height || wrapper.height || 0) - 2 * normalizer);
            rect.strokeWidth = strokeWidth;
            for (key in rect) wrapper[key] !== rect[key] && (wrapper[key] = attribs[key] = rect[key]);
            return attribs;
        },
        css: function(styles) {
            var textWidth, n, hyphenate, elemWrapper = this, oldStyles = elemWrapper.styles, newStyles = {}, elem = elemWrapper.element, serializedCss = "", hasNew = !oldStyles;
            styles && styles.color && (styles.fill = styles.color);
            if (oldStyles) for (n in styles) if (styles[n] !== oldStyles[n]) {
                newStyles[n] = styles[n];
                hasNew = true;
            }
            if (hasNew) {
                textWidth = elemWrapper.textWidth = styles && styles.width && "text" === elem.nodeName.toLowerCase() && pInt(styles.width);
                oldStyles && (styles = extend(oldStyles, newStyles));
                elemWrapper.styles = styles;
                textWidth && (useCanVG || !hasSVG && elemWrapper.renderer.forExport) && delete styles.width;
                if (isIE && !hasSVG) css(elemWrapper.element, styles); else {
                    hyphenate = function(a, b) {
                        return "-" + b.toLowerCase();
                    };
                    for (n in styles) serializedCss += n.replace(/([A-Z])/g, hyphenate) + ":" + styles[n] + ";";
                    attr(elem, "style", serializedCss);
                }
                textWidth && elemWrapper.added && elemWrapper.renderer.buildText(elemWrapper);
            }
            return elemWrapper;
        },
        on: function(eventType, handler) {
            var svgElement = this, element = svgElement.element;
            if (hasTouch && "click" === eventType) {
                element.ontouchstart = function(e) {
                    svgElement.touchEventFired = Date.now();
                    e.preventDefault();
                    handler.call(element, e);
                };
                element.onclick = function(e) {
                    (-1 === userAgent.indexOf("Android") || Date.now() - (svgElement.touchEventFired || 0) > 1100) && handler.call(element, e);
                };
            } else element["on" + eventType] = handler;
            return this;
        },
        setRadialReference: function(coordinates) {
            this.element.radialReference = coordinates;
            return this;
        },
        translate: function(x, y) {
            return this.attr({
                translateX: x,
                translateY: y
            });
        },
        invert: function() {
            var wrapper = this;
            wrapper.inverted = true;
            wrapper.updateTransform();
            return wrapper;
        },
        updateTransform: function() {
            var transform, wrapper = this, translateX = wrapper.translateX || 0, translateY = wrapper.translateY || 0, scaleX = wrapper.scaleX, scaleY = wrapper.scaleY, inverted = wrapper.inverted, rotation = wrapper.rotation, element = wrapper.element;
            if (inverted) {
                translateX += wrapper.attr("width");
                translateY += wrapper.attr("height");
            }
            transform = [ "translate(" + translateX + "," + translateY + ")" ];
            inverted ? transform.push("rotate(90) scale(-1,1)") : rotation && transform.push("rotate(" + rotation + " " + (element.getAttribute("x") || 0) + " " + (element.getAttribute("y") || 0) + ")");
            (defined(scaleX) || defined(scaleY)) && transform.push("scale(" + pick(scaleX, 1) + " " + pick(scaleY, 1) + ")");
            transform.length && element.setAttribute("transform", transform.join(" "));
        },
        toFront: function() {
            var element = this.element;
            element.parentNode.appendChild(element);
            return this;
        },
        align: function(alignOptions, alignByTranslate, box) {
            var align, vAlign, x, y, alignTo, attribs = {}, renderer = this.renderer, alignedObjects = renderer.alignedObjects;
            if (alignOptions) {
                this.alignOptions = alignOptions;
                this.alignByTranslate = alignByTranslate;
                if (!box || isString(box)) {
                    this.alignTo = alignTo = box || "renderer";
                    erase(alignedObjects, this);
                    alignedObjects.push(this);
                    box = null;
                }
            } else {
                alignOptions = this.alignOptions;
                alignByTranslate = this.alignByTranslate;
                alignTo = this.alignTo;
            }
            box = pick(box, renderer[alignTo], renderer);
            align = alignOptions.align;
            vAlign = alignOptions.verticalAlign;
            x = (box.x || 0) + (alignOptions.x || 0);
            y = (box.y || 0) + (alignOptions.y || 0);
            ("right" === align || "center" === align) && (x += (box.width - (alignOptions.width || 0)) / {
                right: 1,
                center: 2
            }[align]);
            attribs[alignByTranslate ? "translateX" : "x"] = mathRound(x);
            ("bottom" === vAlign || "middle" === vAlign) && (y += (box.height - (alignOptions.height || 0)) / ({
                bottom: 1,
                middle: 2
            }[vAlign] || 1));
            attribs[alignByTranslate ? "translateY" : "y"] = mathRound(y);
            this[this.placed ? "animate" : "attr"](attribs);
            this.placed = true;
            this.alignAttr = attribs;
            return this;
        },
        getBBox: function() {
            var width, height, cacheKey, wrapper = this, bBox = wrapper.bBox, renderer = wrapper.renderer, rotation = wrapper.rotation, element = wrapper.element, styles = wrapper.styles, rad = rotation * deg2rad, textStr = wrapper.textStr;
            ("" === textStr || numRegex.test(textStr)) && (cacheKey = "num." + textStr.toString().length + (styles ? "|" + styles.fontSize + "|" + styles.fontFamily : ""));
            cacheKey && (bBox = renderer.cache[cacheKey]);
            if (!bBox) {
                if (element.namespaceURI === SVG_NS || renderer.forExport) {
                    try {
                        bBox = element.getBBox ? extend({}, element.getBBox()) : {
                            width: element.offsetWidth,
                            height: element.offsetHeight
                        };
                    } catch (e) {}
                    (!bBox || 0 > bBox.width) && (bBox = {
                        width: 0,
                        height: 0
                    });
                } else bBox = wrapper.htmlGetBBox();
                if (renderer.isSVG) {
                    width = bBox.width;
                    height = bBox.height;
                    isIE && styles && "11px" === styles.fontSize && "16.9" === height.toPrecision(3) && (bBox.height = height = 14);
                    if (rotation) {
                        bBox.width = mathAbs(height * mathSin(rad)) + mathAbs(width * mathCos(rad));
                        bBox.height = mathAbs(height * mathCos(rad)) + mathAbs(width * mathSin(rad));
                    }
                }
                wrapper.bBox = bBox;
                cacheKey && (renderer.cache[cacheKey] = bBox);
            }
            return bBox;
        },
        show: function(inherit) {
            if (inherit && this.element.namespaceURI === SVG_NS) {
                this.element.removeAttribute("visibility");
                return this;
            }
            return this.attr({
                visibility: inherit ? "inherit" : VISIBLE
            });
        },
        hide: function() {
            return this.attr({
                visibility: HIDDEN
            });
        },
        fadeOut: function(duration) {
            var elemWrapper = this;
            elemWrapper.animate({
                opacity: 0
            }, {
                duration: duration || 150,
                complete: function() {
                    elemWrapper.hide();
                }
            });
        },
        add: function(parent) {
            var childNodes, otherElement, otherZIndex, i, inserted, renderer = this.renderer, parentWrapper = parent || renderer, parentNode = parentWrapper.element || renderer.box, element = this.element, zIndex = this.zIndex;
            parent && (this.parentGroup = parent);
            this.parentInverted = parent && parent.inverted;
            void 0 !== this.textStr && renderer.buildText(this);
            if (zIndex) {
                parentWrapper.handleZ = true;
                zIndex = pInt(zIndex);
            }
            if (parentWrapper.handleZ) {
                childNodes = parentNode.childNodes;
                for (i = 0; childNodes.length > i; i++) {
                    otherElement = childNodes[i];
                    otherZIndex = attr(otherElement, "zIndex");
                    if (otherElement !== element && (pInt(otherZIndex) > zIndex || !defined(zIndex) && defined(otherZIndex))) {
                        parentNode.insertBefore(element, otherElement);
                        inserted = true;
                        break;
                    }
                }
            }
            inserted || parentNode.appendChild(element);
            this.added = true;
            this.onAdd && this.onAdd();
            return this;
        },
        safeRemoveChild: function(element) {
            var parentNode = element.parentNode;
            parentNode && parentNode.removeChild(element);
        },
        destroy: function() {
            var grandParent, key, i, wrapper = this, element = wrapper.element || {}, shadows = wrapper.shadows, parentToClean = wrapper.renderer.isSVG && "SPAN" === element.nodeName && wrapper.parentGroup;
            element.onclick = element.onmouseout = element.onmouseover = element.onmousemove = element.point = null;
            stop(wrapper);
            wrapper.clipPath && (wrapper.clipPath = wrapper.clipPath.destroy());
            if (wrapper.stops) {
                for (i = 0; wrapper.stops.length > i; i++) wrapper.stops[i] = wrapper.stops[i].destroy();
                wrapper.stops = null;
            }
            wrapper.safeRemoveChild(element);
            shadows && each(shadows, function(shadow) {
                wrapper.safeRemoveChild(shadow);
            });
            while (parentToClean && 0 === parentToClean.div.childNodes.length) {
                grandParent = parentToClean.parentGroup;
                wrapper.safeRemoveChild(parentToClean.div);
                delete parentToClean.div;
                parentToClean = grandParent;
            }
            wrapper.alignTo && erase(wrapper.renderer.alignedObjects, wrapper);
            for (key in wrapper) delete wrapper[key];
            return null;
        },
        shadow: function(shadowOptions, group, cutOff) {
            var i, shadow, strokeWidth, shadowWidth, shadowElementOpacity, transform, shadows = [], element = this.element;
            if (shadowOptions) {
                shadowWidth = pick(shadowOptions.width, 3);
                shadowElementOpacity = (shadowOptions.opacity || .15) / shadowWidth;
                transform = this.parentInverted ? "(-1,-1)" : "(" + pick(shadowOptions.offsetX, 1) + ", " + pick(shadowOptions.offsetY, 1) + ")";
                for (i = 1; shadowWidth >= i; i++) {
                    shadow = element.cloneNode(0);
                    strokeWidth = 2 * shadowWidth + 1 - 2 * i;
                    attr(shadow, {
                        isShadow: "true",
                        stroke: shadowOptions.color || "black",
                        "stroke-opacity": shadowElementOpacity * i,
                        "stroke-width": strokeWidth,
                        transform: "translate" + transform,
                        fill: NONE
                    });
                    if (cutOff) {
                        attr(shadow, "height", mathMax(attr(shadow, "height") - strokeWidth, 0));
                        shadow.cutHeight = strokeWidth;
                    }
                    group ? group.element.appendChild(shadow) : element.parentNode.insertBefore(shadow, element);
                    shadows.push(shadow);
                }
                this.shadows = shadows;
            }
            return this;
        },
        xGetter: function(key) {
            "circle" === this.element.nodeName && (key = {
                x: "cx",
                y: "cy"
            }[key] || key);
            return this._defaultGetter(key);
        },
        _defaultGetter: function(key) {
            var ret = pick(this[key], this.element ? this.element.getAttribute(key) : null, 0);
            /^[0-9\.]+$/.test(ret) && (ret = parseFloat(ret));
            return ret;
        },
        dSetter: function(value, key, element) {
            value && value.join && (value = value.join(" "));
            /(NaN| {2}|^$)/.test(value) && (value = "M 0 0");
            element.setAttribute(key, value);
            this[key] = value;
        },
        dashstyleSetter: function(value) {
            var i;
            value = value && value.toLowerCase();
            if (value) {
                value = value.replace("shortdashdotdot", "3,1,1,1,1,1,").replace("shortdashdot", "3,1,1,1").replace("shortdot", "1,1,").replace("shortdash", "3,1,").replace("longdash", "8,3,").replace(/dot/g, "1,3,").replace("dash", "4,3,").replace(/,$/, "").split(",");
                i = value.length;
                while (i--) value[i] = pInt(value[i]) * this.element.getAttribute("stroke-width");
                value = value.join(",");
                this.element.setAttribute("stroke-dasharray", value);
            }
        },
        alignSetter: function(value) {
            this.element.setAttribute("text-anchor", {
                left: "start",
                center: "middle",
                right: "end"
            }[value]);
        },
        opacitySetter: function(value, key, element) {
            this[key] = value;
            element.setAttribute(key, value);
        },
        "stroke-widthSetter": function(value, key, element) {
            0 === value && (value = 1e-5);
            this.strokeWidth = value;
            element.setAttribute(key, value);
        },
        titleSetter: function(value) {
            var titleNode = this.element.getElementsByTagName("title")[0];
            if (!titleNode) {
                titleNode = doc.createElementNS(SVG_NS, "title");
                this.element.appendChild(titleNode);
            }
            titleNode.textContent = value;
        },
        textSetter: function(value) {
            if (value !== this.textStr) {
                delete this.bBox;
                this.textStr = value;
                this.added && this.renderer.buildText(this);
            }
        },
        fillSetter: function(value, key, element) {
            "string" == typeof value ? element.setAttribute(key, value) : value && this.colorGradient(value, key, element);
        },
        zIndexSetter: function(value, key, element) {
            element.setAttribute(key, value);
            this[key] = value;
        },
        _defaultSetter: function(value, key, element) {
            element.setAttribute(key, value);
        }
    };
    SVGElement.prototype.yGetter = SVGElement.prototype.xGetter;
    SVGElement.prototype.translateXSetter = SVGElement.prototype.translateYSetter = SVGElement.prototype.rotationSetter = SVGElement.prototype.verticalAlignSetter = SVGElement.prototype.scaleXSetter = SVGElement.prototype.scaleYSetter = function(value, key) {
        this[key] = value;
        this.doTransform = true;
    };
    SVGElement.prototype.strokeSetter = SVGElement.prototype.fillSetter;
    var SVGRenderer = function() {
        this.init.apply(this, arguments);
    };
    SVGRenderer.prototype = {
        Element: SVGElement,
        init: function(container, width, height, style, forExport) {
            var boxWrapper, element, desc, renderer = this, loc = location;
            boxWrapper = renderer.createElement("svg").attr({
                version: "1.1"
            }).css(this.getStyle(style));
            element = boxWrapper.element;
            container.appendChild(element);
            -1 === container.innerHTML.indexOf("xmlns") && attr(element, "xmlns", SVG_NS);
            renderer.isSVG = true;
            renderer.box = element;
            renderer.boxWrapper = boxWrapper;
            renderer.alignedObjects = [];
            renderer.url = (isFirefox || isWebKit) && doc.getElementsByTagName("base").length ? loc.href.replace(/#.*?$/, "").replace(/([\('\)])/g, "\\$1").replace(/ /g, "%20") : "";
            desc = this.createElement("desc").add();
            desc.element.appendChild(doc.createTextNode("Created with " + PRODUCT + " " + VERSION));
            renderer.defs = this.createElement("defs").add();
            renderer.forExport = forExport;
            renderer.gradients = {};
            renderer.cache = {};
            renderer.setSize(width, height, false);
            var subPixelFix, rect;
            if (isFirefox && container.getBoundingClientRect) {
                renderer.subPixelFix = subPixelFix = function() {
                    css(container, {
                        left: 0,
                        top: 0
                    });
                    rect = container.getBoundingClientRect();
                    css(container, {
                        left: mathCeil(rect.left) - rect.left + PX,
                        top: mathCeil(rect.top) - rect.top + PX
                    });
                };
                subPixelFix();
                addEvent(win, "resize", subPixelFix);
            }
        },
        getStyle: function(style) {
            return this.style = extend({
                fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
                fontSize: "12px"
            }, style);
        },
        isHidden: function() {
            return !this.boxWrapper.getBBox().width;
        },
        destroy: function() {
            var renderer = this, rendererDefs = renderer.defs;
            renderer.box = null;
            renderer.boxWrapper = renderer.boxWrapper.destroy();
            destroyObjectProperties(renderer.gradients || {});
            renderer.gradients = null;
            rendererDefs && (renderer.defs = rendererDefs.destroy());
            renderer.subPixelFix && removeEvent(win, "resize", renderer.subPixelFix);
            renderer.alignedObjects = null;
            return null;
        },
        createElement: function(nodeName) {
            var wrapper = new this.Element();
            wrapper.init(this, nodeName);
            return wrapper;
        },
        draw: function() {},
        buildText: function(wrapper) {
            var lines, styleRegex, hrefRegex, textNode = wrapper.element, renderer = this, forExport = renderer.forExport, textStr = pick(wrapper.textStr, "").toString(), hasMarkup = -1 !== textStr.indexOf("<"), childNodes = textNode.childNodes, parentX = attr(textNode, "x"), textStyles = wrapper.styles, width = wrapper.textWidth, textLineHeight = textStyles && textStyles.lineHeight, i = childNodes.length, getLineHeight = function(tspan) {
                return textLineHeight ? pInt(textLineHeight) : renderer.fontMetrics(/(px|em)$/.test(tspan && tspan.style.fontSize) ? tspan.style.fontSize : textStyles && textStyles.fontSize || renderer.style.fontSize || 12).h;
            };
            while (i--) textNode.removeChild(childNodes[i]);
            if (!hasMarkup && -1 === textStr.indexOf(" ")) {
                textNode.appendChild(doc.createTextNode(textStr));
                return;
            }
            styleRegex = /<.*style="([^"]+)".*>/;
            hrefRegex = /<.*href="(http[^"]+)".*>/;
            width && !wrapper.added && this.box.appendChild(textNode);
            lines = hasMarkup ? textStr.replace(/<(b|strong)>/g, '<span style="font-weight:bold">').replace(/<(i|em)>/g, '<span style="font-style:italic">').replace(/<a/g, "<span").replace(/<\/(b|strong|i|em|a)>/g, "</span>").split(/<br.*?>/g) : [ textStr ];
            "" === lines[lines.length - 1] && lines.pop();
            each(lines, function(line, lineNo) {
                var spans, spanNo = 0;
                line = line.replace(/<span/g, "|||<span").replace(/<\/span>/g, "</span>|||");
                spans = line.split("|||");
                each(spans, function(span) {
                    if ("" !== span || 1 === spans.length) {
                        var spanStyle, attributes = {}, tspan = doc.createElementNS(SVG_NS, "tspan");
                        if (styleRegex.test(span)) {
                            spanStyle = span.match(styleRegex)[1].replace(/(;| |^)color([ :])/, "$1fill$2");
                            attr(tspan, "style", spanStyle);
                        }
                        if (hrefRegex.test(span) && !forExport) {
                            attr(tspan, "onclick", 'location.href="' + span.match(hrefRegex)[1] + '"');
                            css(tspan, {
                                cursor: "pointer"
                            });
                        }
                        span = (span.replace(/<(.|\n)*?>/g, "") || " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                        if (" " !== span) {
                            tspan.appendChild(doc.createTextNode(span));
                            spanNo ? attributes.dx = 0 : lineNo && null !== parentX && (attributes.x = parentX);
                            attr(tspan, attributes);
                            if (!spanNo && lineNo) {
                                !hasSVG && forExport && css(tspan, {
                                    display: "block"
                                });
                                attr(tspan, "dy", getLineHeight(tspan), isWebKit && tspan.offsetHeight);
                            }
                            textNode.appendChild(tspan);
                            spanNo++;
                            if (width) {
                                var tooLong, actualWidth, bBox, words = span.replace(/([^\^])-/g, "$1- ").split(" "), hasWhiteSpace = words.length > 1 && "nowrap" !== textStyles.whiteSpace, clipHeight = wrapper._clipHeight, rest = [], dy = getLineHeight(), softLineNo = 1;
                                while (hasWhiteSpace && (words.length || rest.length)) {
                                    delete wrapper.bBox;
                                    bBox = wrapper.getBBox();
                                    actualWidth = bBox.width;
                                    !hasSVG && renderer.forExport && (actualWidth = renderer.measureSpanWidth(tspan.firstChild.data, wrapper.styles));
                                    tooLong = actualWidth > width;
                                    if (tooLong && 1 !== words.length) {
                                        tspan.removeChild(tspan.firstChild);
                                        rest.unshift(words.pop());
                                    } else {
                                        words = rest;
                                        rest = [];
                                        if (words.length) {
                                            softLineNo++;
                                            if (clipHeight && softLineNo * dy > clipHeight) {
                                                words = [ "..." ];
                                                wrapper.attr("title", wrapper.textStr);
                                            } else {
                                                tspan = doc.createElementNS(SVG_NS, "tspan");
                                                attr(tspan, {
                                                    dy: dy,
                                                    x: parentX
                                                });
                                                spanStyle && attr(tspan, "style", spanStyle);
                                                textNode.appendChild(tspan);
                                                actualWidth > width && (width = actualWidth);
                                            }
                                        }
                                    }
                                    words.length && tspan.appendChild(doc.createTextNode(words.join(" ").replace(/- /g, "-")));
                                }
                            }
                        }
                    }
                });
            });
        },
        button: function(text, x, y, callback, normalState, hoverState, pressedState, disabledState, shape) {
            var stateOptions, stateStyle, normalStyle, hoverStyle, pressedStyle, disabledStyle, label = this.label(text, x, y, shape, null, null, null, null, "button"), curState = 0, verticalGradient = {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
            };
            normalState = merge({
                "stroke-width": 1,
                stroke: "#CCCCCC",
                fill: {
                    linearGradient: verticalGradient,
                    stops: [ [ 0, "#FEFEFE" ], [ 1, "#F6F6F6" ] ]
                },
                r: 2,
                padding: 5,
                style: {
                    color: "black"
                }
            }, normalState);
            normalStyle = normalState.style;
            delete normalState.style;
            hoverState = merge(normalState, {
                stroke: "#68A",
                fill: {
                    linearGradient: verticalGradient,
                    stops: [ [ 0, "#FFF" ], [ 1, "#ACF" ] ]
                }
            }, hoverState);
            hoverStyle = hoverState.style;
            delete hoverState.style;
            pressedState = merge(normalState, {
                stroke: "#68A",
                fill: {
                    linearGradient: verticalGradient,
                    stops: [ [ 0, "#9BD" ], [ 1, "#CDF" ] ]
                }
            }, pressedState);
            pressedStyle = pressedState.style;
            delete pressedState.style;
            disabledState = merge(normalState, {
                style: {
                    color: "#CCC"
                }
            }, disabledState);
            disabledStyle = disabledState.style;
            delete disabledState.style;
            addEvent(label.element, isIE ? "mouseover" : "mouseenter", function() {
                3 !== curState && label.attr(hoverState).css(hoverStyle);
            });
            addEvent(label.element, isIE ? "mouseout" : "mouseleave", function() {
                if (3 !== curState) {
                    stateOptions = [ normalState, hoverState, pressedState ][curState];
                    stateStyle = [ normalStyle, hoverStyle, pressedStyle ][curState];
                    label.attr(stateOptions).css(stateStyle);
                }
            });
            label.setState = function(state) {
                label.state = curState = state;
                state ? 2 === state ? label.attr(pressedState).css(pressedStyle) : 3 === state && label.attr(disabledState).css(disabledStyle) : label.attr(normalState).css(normalStyle);
            };
            return label.on("click", function() {
                3 !== curState && callback.call(label);
            }).attr(normalState).css(extend({
                cursor: "default"
            }, normalStyle));
        },
        crispLine: function(points, width) {
            points[1] === points[4] && (points[1] = points[4] = mathRound(points[1]) - width % 2 / 2);
            points[2] === points[5] && (points[2] = points[5] = mathRound(points[2]) + width % 2 / 2);
            return points;
        },
        path: function(path) {
            var attr = {
                fill: NONE
            };
            isArray(path) ? attr.d = path : isObject(path) && extend(attr, path);
            return this.createElement("path").attr(attr);
        },
        circle: function(x, y, r) {
            var attr = isObject(x) ? x : {
                x: x,
                y: y,
                r: r
            }, wrapper = this.createElement("circle");
            wrapper.xSetter = function(value) {
                this.element.setAttribute("cx", value);
            };
            wrapper.ySetter = function(value) {
                this.element.setAttribute("cy", value);
            };
            return wrapper.attr(attr);
        },
        arc: function(x, y, r, innerR, start, end) {
            var arc;
            if (isObject(x)) {
                y = x.y;
                r = x.r;
                innerR = x.innerR;
                start = x.start;
                end = x.end;
                x = x.x;
            }
            arc = this.symbol("arc", x || 0, y || 0, r || 0, r || 0, {
                innerR: innerR || 0,
                start: start || 0,
                end: end || 0
            });
            arc.r = r;
            return arc;
        },
        rect: function(x, y, width, height, r, strokeWidth) {
            r = isObject(x) ? x.r : r;
            var wrapper = this.createElement("rect"), attribs = isObject(x) ? x : x === UNDEFINED ? {} : {
                x: x,
                y: y,
                width: mathMax(width, 0),
                height: mathMax(height, 0)
            };
            if (strokeWidth !== UNDEFINED) {
                attribs.strokeWidth = strokeWidth;
                attribs = wrapper.crisp(attribs);
            }
            r && (attribs.r = r);
            wrapper.rSetter = function(value) {
                attr(this.element, {
                    rx: value,
                    ry: value
                });
            };
            return wrapper.attr(attribs);
        },
        setSize: function(width, height, animate) {
            var renderer = this, alignedObjects = renderer.alignedObjects, i = alignedObjects.length;
            renderer.width = width;
            renderer.height = height;
            renderer.boxWrapper[pick(animate, true) ? "animate" : "attr"]({
                width: width,
                height: height
            });
            while (i--) alignedObjects[i].align();
        },
        g: function(name) {
            var elem = this.createElement("g");
            return defined(name) ? elem.attr({
                "class": PREFIX + name
            }) : elem;
        },
        image: function(src, x, y, width, height) {
            var elemWrapper, attribs = {
                preserveAspectRatio: NONE
            };
            arguments.length > 1 && extend(attribs, {
                x: x,
                y: y,
                width: width,
                height: height
            });
            elemWrapper = this.createElement("image").attr(attribs);
            elemWrapper.element.setAttributeNS ? elemWrapper.element.setAttributeNS("http://www.w3.org/1999/xlink", "href", src) : elemWrapper.element.setAttribute("hc-svg-href", src);
            return elemWrapper;
        },
        symbol: function(symbol, x, y, width, height, options) {
            var obj, imageElement, imageSrc, imageSize, centerImage, symbolFn = this.symbols[symbol], path = symbolFn && symbolFn(mathRound(x), mathRound(y), width, height, options), imageRegex = /^url\((.*?)\)$/;
            if (path) {
                obj = this.path(path);
                extend(obj, {
                    symbolName: symbol,
                    x: x,
                    y: y,
                    width: width,
                    height: height
                });
                options && extend(obj, options);
            } else if (imageRegex.test(symbol)) {
                centerImage = function(img, size) {
                    if (img.element) {
                        img.attr({
                            width: size[0],
                            height: size[1]
                        });
                        img.alignByTranslate || img.translate(mathRound((width - size[0]) / 2), mathRound((height - size[1]) / 2));
                    }
                };
                imageSrc = symbol.match(imageRegex)[1];
                imageSize = symbolSizes[imageSrc];
                obj = this.image(imageSrc).attr({
                    x: x,
                    y: y
                });
                obj.isImg = true;
                if (imageSize) centerImage(obj, imageSize); else {
                    obj.attr({
                        width: 0,
                        height: 0
                    });
                    imageElement = createElement("img", {
                        onload: function() {
                            centerImage(obj, symbolSizes[imageSrc] = [ this.width, this.height ]);
                        },
                        src: imageSrc
                    });
                }
            }
            return obj;
        },
        symbols: {
            circle: function(x, y, w, h) {
                var cpw = .166 * w;
                return [ M, x + w / 2, y, "C", x + w + cpw, y, x + w + cpw, y + h, x + w / 2, y + h, "C", x - cpw, y + h, x - cpw, y, x + w / 2, y, "Z" ];
            },
            square: function(x, y, w, h) {
                return [ M, x, y, L, x + w, y, x + w, y + h, x, y + h, "Z" ];
            },
            triangle: function(x, y, w, h) {
                return [ M, x + w / 2, y, L, x + w, y + h, x, y + h, "Z" ];
            },
            "triangle-down": function(x, y, w, h) {
                return [ M, x, y, L, x + w, y, x + w / 2, y + h, "Z" ];
            },
            diamond: function(x, y, w, h) {
                return [ M, x + w / 2, y, L, x + w, y + h / 2, x + w / 2, y + h, x, y + h / 2, "Z" ];
            },
            arc: function(x, y, w, h, options) {
                var start = options.start, radius = options.r || w || h, end = options.end - .001, innerRadius = options.innerR, open = options.open, cosStart = mathCos(start), sinStart = mathSin(start), cosEnd = mathCos(end), sinEnd = mathSin(end), longArc = mathPI > options.end - start ? 0 : 1;
                return [ M, x + radius * cosStart, y + radius * sinStart, "A", radius, radius, 0, longArc, 1, x + radius * cosEnd, y + radius * sinEnd, open ? M : L, x + innerRadius * cosEnd, y + innerRadius * sinEnd, "A", innerRadius, innerRadius, 0, longArc, 0, x + innerRadius * cosStart, y + innerRadius * sinStart, open ? "" : "Z" ];
            },
            callout: function(x, y, w, h, options) {
                var path, arrowLength = 6, halfDistance = 6, r = mathMin(options && options.r || 0, w, h), safeDistance = r + halfDistance, anchorX = options && options.anchorX, anchorY = options && options.anchorY, normalizer = mathRound(options.strokeWidth || 0) % 2 / 2;
                x += normalizer;
                y += normalizer;
                path = [ "M", x + r, y, "L", x + w - r, y, "C", x + w, y, x + w, y, x + w, y + r, "L", x + w, y + h - r, "C", x + w, y + h, x + w, y + h, x + w - r, y + h, "L", x + r, y + h, "C", x, y + h, x, y + h, x, y + h - r, "L", x, y + r, "C", x, y, x, y, x + r, y ];
                anchorX && anchorX > w && anchorY > y + safeDistance && y + h - safeDistance > anchorY ? path.splice(13, 3, "L", x + w, anchorY - halfDistance, x + w + arrowLength, anchorY, x + w, anchorY + halfDistance, x + w, y + h - r) : anchorX && 0 > anchorX && anchorY > y + safeDistance && y + h - safeDistance > anchorY ? path.splice(33, 3, "L", x, anchorY + halfDistance, x - arrowLength, anchorY, x, anchorY - halfDistance, x, y + r) : anchorY && anchorY > h && anchorX > x + safeDistance && x + w - safeDistance > anchorX ? path.splice(23, 3, "L", anchorX + halfDistance, y + h, anchorX, y + h + arrowLength, anchorX - halfDistance, y + h, x + r, y + h) : anchorY && 0 > anchorY && anchorX > x + safeDistance && x + w - safeDistance > anchorX && path.splice(3, 3, "L", anchorX - halfDistance, y, anchorX, y - arrowLength, anchorX + halfDistance, y, w - r, y);
                return path;
            }
        },
        clipRect: function(x, y, width, height) {
            var wrapper, id = PREFIX + idCounter++, clipPath = this.createElement("clipPath").attr({
                id: id
            }).add(this.defs);
            wrapper = this.rect(x, y, width, height, 0).add(clipPath);
            wrapper.id = id;
            wrapper.clipPath = clipPath;
            return wrapper;
        },
        text: function(str, x, y, useHTML) {
            var wrapper, renderer = this, fakeSVG = useCanVG || !hasSVG && renderer.forExport, attr = {};
            if (useHTML && !renderer.forExport) return renderer.html(str, x, y);
            attr.x = Math.round(x || 0);
            y && (attr.y = Math.round(y));
            (str || 0 === str) && (attr.text = str);
            wrapper = renderer.createElement("text").attr(attr);
            fakeSVG && wrapper.css({
                position: ABSOLUTE
            });
            useHTML || (wrapper.xSetter = function(value, key, element) {
                var child, i, childNodes = element.childNodes;
                for (i = 1; childNodes.length > i; i++) {
                    child = childNodes[i];
                    child.getAttribute("x") === element.getAttribute("x") && child.setAttribute("x", value);
                }
                element.setAttribute(key, value);
            });
            return wrapper;
        },
        fontMetrics: function(fontSize) {
            fontSize = fontSize || this.style.fontSize;
            fontSize = /px/.test(fontSize) ? pInt(fontSize) : /em/.test(fontSize) ? 12 * parseFloat(fontSize) : 12;
            var lineHeight = 24 > fontSize ? fontSize + 4 : mathRound(1.2 * fontSize), baseline = mathRound(.8 * lineHeight);
            return {
                h: lineHeight,
                b: baseline
            };
        },
        label: function(str, x, y, shape, anchorX, anchorY, useHTML, baseline, className) {
            function updateBoxSize() {
                var boxX, boxY, style = text.element.style;
                bBox = (void 0 === width || void 0 === height || wrapper.styles.textAlign) && text.textStr && text.getBBox();
                wrapper.width = (width || bBox.width || 0) + 2 * padding + paddingLeft;
                wrapper.height = (height || bBox.height || 0) + 2 * padding;
                baselineOffset = padding + renderer.fontMetrics(style && style.fontSize).b;
                if (needsBox) {
                    if (!box) {
                        boxX = mathRound(-alignFactor * padding);
                        boxY = baseline ? -baselineOffset : 0;
                        wrapper.box = box = shape ? renderer.symbol(shape, boxX, boxY, wrapper.width, wrapper.height, deferredAttr) : renderer.rect(boxX, boxY, wrapper.width, wrapper.height, 0, deferredAttr[STROKE_WIDTH]);
                        box.attr("fill", NONE).add(wrapper);
                    }
                    box.isImg || box.attr(extend({
                        width: mathRound(wrapper.width),
                        height: mathRound(wrapper.height)
                    }, deferredAttr));
                    deferredAttr = null;
                }
            }
            function updateTextPadding() {
                var y, styles = wrapper.styles, textAlign = styles && styles.textAlign, x = paddingLeft + padding * (1 - alignFactor);
                y = baseline ? 0 : baselineOffset;
                defined(width) && bBox && ("center" === textAlign || "right" === textAlign) && (x += {
                    center: .5,
                    right: 1
                }[textAlign] * (width - bBox.width));
                if (x !== text.x || y !== text.y) {
                    text.attr("x", x);
                    y !== UNDEFINED && text.attr("y", y);
                }
                text.x = x;
                text.y = y;
            }
            function boxAttr(key, value) {
                box ? box.attr(key, value) : deferredAttr[key] = value;
            }
            var box, bBox, width, height, wrapperX, wrapperY, baselineOffset, needsBox, renderer = this, wrapper = renderer.g(className), text = renderer.text("", 0, 0, useHTML).attr({
                zIndex: 1
            }), alignFactor = 0, padding = 3, paddingLeft = 0, crispAdjust = 0, deferredAttr = {};
            wrapper.onAdd = function() {
                text.add(wrapper);
                wrapper.attr({
                    text: str || "",
                    x: x,
                    y: y
                });
                box && defined(anchorX) && wrapper.attr({
                    anchorX: anchorX,
                    anchorY: anchorY
                });
            };
            wrapper.widthSetter = function(value) {
                width = value;
            };
            wrapper.heightSetter = function(value) {
                height = value;
            };
            wrapper.paddingSetter = function(value) {
                if (defined(value) && value !== padding) {
                    padding = value;
                    updateTextPadding();
                }
            };
            wrapper.paddingLeftSetter = function(value) {
                if (defined(value) && value !== paddingLeft) {
                    paddingLeft = value;
                    updateTextPadding();
                }
            };
            wrapper.alignSetter = function(value) {
                alignFactor = {
                    left: 0,
                    center: .5,
                    right: 1
                }[value];
            };
            wrapper.textSetter = function(value) {
                value !== UNDEFINED && text.textSetter(value);
                updateBoxSize();
                updateTextPadding();
            };
            wrapper["stroke-widthSetter"] = function(value, key) {
                value && (needsBox = true);
                crispAdjust = value % 2 / 2;
                boxAttr(key, value);
            };
            wrapper.strokeSetter = wrapper.fillSetter = wrapper.rSetter = function(value, key) {
                "fill" === key && value && (needsBox = true);
                boxAttr(key, value);
            };
            wrapper.anchorXSetter = function(value, key) {
                anchorX = value;
                boxAttr(key, value + crispAdjust - wrapperX);
            };
            wrapper.anchorYSetter = function(value, key) {
                anchorY = value;
                boxAttr(key, value - wrapperY);
            };
            wrapper.xSetter = function(value) {
                wrapper.x = value;
                alignFactor && (value -= alignFactor * ((width || bBox.width) + padding));
                wrapperX = mathRound(value);
                wrapper.attr("translateX", wrapperX);
            };
            wrapper.ySetter = function(value) {
                wrapperY = wrapper.y = mathRound(value);
                wrapper.attr("translateY", wrapperY);
            };
            var baseCss = wrapper.css;
            return extend(wrapper, {
                css: function(styles) {
                    if (styles) {
                        var textStyles = {};
                        styles = merge(styles);
                        each([ "fontSize", "fontWeight", "fontFamily", "color", "lineHeight", "width", "textDecoration", "textShadow" ], function(prop) {
                            if (styles[prop] !== UNDEFINED) {
                                textStyles[prop] = styles[prop];
                                delete styles[prop];
                            }
                        });
                        text.css(textStyles);
                    }
                    return baseCss.call(wrapper, styles);
                },
                getBBox: function() {
                    return {
                        width: bBox.width + 2 * padding,
                        height: bBox.height + 2 * padding,
                        x: bBox.x - padding,
                        y: bBox.y - padding
                    };
                },
                shadow: function(b) {
                    box && box.shadow(b);
                    return wrapper;
                },
                destroy: function() {
                    removeEvent(wrapper.element, "mouseenter");
                    removeEvent(wrapper.element, "mouseleave");
                    text && (text = text.destroy());
                    box && (box = box.destroy());
                    SVGElement.prototype.destroy.call(wrapper);
                    wrapper = renderer = updateBoxSize = updateTextPadding = boxAttr = null;
                }
            });
        }
    };
    Renderer = SVGRenderer;
    extend(SVGElement.prototype, {
        htmlCss: function(styles) {
            var wrapper = this, element = wrapper.element, textWidth = styles && "SPAN" === element.tagName && styles.width;
            if (textWidth) {
                delete styles.width;
                wrapper.textWidth = textWidth;
                wrapper.updateTransform();
            }
            wrapper.styles = extend(wrapper.styles, styles);
            css(wrapper.element, styles);
            return wrapper;
        },
        htmlGetBBox: function() {
            var wrapper = this, element = wrapper.element, bBox = wrapper.bBox;
            if (!bBox) {
                "text" === element.nodeName && (element.style.position = ABSOLUTE);
                bBox = wrapper.bBox = {
                    x: element.offsetLeft,
                    y: element.offsetTop,
                    width: element.offsetWidth,
                    height: element.offsetHeight
                };
            }
            return bBox;
        },
        htmlUpdateTransform: function() {
            if (!this.added) {
                this.alignOnAdd = true;
                return;
            }
            var wrapper = this, renderer = wrapper.renderer, elem = wrapper.element, translateX = wrapper.translateX || 0, translateY = wrapper.translateY || 0, x = wrapper.x || 0, y = wrapper.y || 0, align = wrapper.textAlign || "left", alignCorrection = {
                left: 0,
                center: .5,
                right: 1
            }[align], shadows = wrapper.shadows;
            css(elem, {
                marginLeft: translateX,
                marginTop: translateY
            });
            shadows && each(shadows, function(shadow) {
                css(shadow, {
                    marginLeft: translateX + 1,
                    marginTop: translateY + 1
                });
            });
            wrapper.inverted && each(elem.childNodes, function(child) {
                renderer.invertChild(child, elem);
            });
            if ("SPAN" === elem.tagName) {
                var width, baseline, rotation = wrapper.rotation, textWidth = pInt(wrapper.textWidth), currentTextTransform = [ rotation, align, elem.innerHTML, wrapper.textWidth ].join(",");
                if (currentTextTransform !== wrapper.cTT) {
                    baseline = renderer.fontMetrics(elem.style.fontSize).b;
                    defined(rotation) && wrapper.setSpanRotation(rotation, alignCorrection, baseline);
                    width = pick(wrapper.elemWidth, elem.offsetWidth);
                    if (width > textWidth && /[ \-]/.test(elem.textContent || elem.innerText)) {
                        css(elem, {
                            width: textWidth + PX,
                            display: "block",
                            whiteSpace: "normal"
                        });
                        width = textWidth;
                    }
                    wrapper.getSpanCorrection(width, baseline, alignCorrection, rotation, align);
                }
                css(elem, {
                    left: x + (wrapper.xCorr || 0) + PX,
                    top: y + (wrapper.yCorr || 0) + PX
                });
                isWebKit && (baseline = elem.offsetHeight);
                wrapper.cTT = currentTextTransform;
            }
        },
        setSpanRotation: function(rotation, alignCorrection, baseline) {
            var rotationStyle = {}, cssTransformKey = isIE ? "-ms-transform" : isWebKit ? "-webkit-transform" : isFirefox ? "MozTransform" : isOpera ? "-o-transform" : "";
            rotationStyle[cssTransformKey] = rotationStyle.transform = "rotate(" + rotation + "deg)";
            rotationStyle[cssTransformKey + (isFirefox ? "Origin" : "-origin")] = rotationStyle.transformOrigin = 100 * alignCorrection + "% " + baseline + "px";
            css(this.element, rotationStyle);
        },
        getSpanCorrection: function(width, baseline, alignCorrection) {
            this.xCorr = -width * alignCorrection;
            this.yCorr = -baseline;
        }
    });
    extend(SVGRenderer.prototype, {
        html: function(str, x, y) {
            var wrapper = this.createElement("span"), element = wrapper.element, renderer = wrapper.renderer;
            wrapper.textSetter = function(value) {
                value !== element.innerHTML && delete this.bBox;
                element.innerHTML = this.textStr = value;
            };
            wrapper.xSetter = wrapper.ySetter = wrapper.alignSetter = wrapper.rotationSetter = function(value, key) {
                "align" === key && (key = "textAlign");
                wrapper[key] = value;
                wrapper.htmlUpdateTransform();
            };
            wrapper.attr({
                text: str,
                x: mathRound(x),
                y: mathRound(y)
            }).css({
                position: ABSOLUTE,
                whiteSpace: "nowrap",
                fontFamily: this.style.fontFamily,
                fontSize: this.style.fontSize
            });
            wrapper.css = wrapper.htmlCss;
            renderer.isSVG && (wrapper.add = function(svgGroupWrapper) {
                var htmlGroup, parentGroup, container = renderer.box.parentNode, parents = [];
                this.parentGroup = svgGroupWrapper;
                if (svgGroupWrapper) {
                    htmlGroup = svgGroupWrapper.div;
                    if (!htmlGroup) {
                        parentGroup = svgGroupWrapper;
                        while (parentGroup) {
                            parents.push(parentGroup);
                            parentGroup = parentGroup.parentGroup;
                        }
                        each(parents.reverse(), function(parentGroup) {
                            var htmlGroupStyle;
                            htmlGroup = parentGroup.div = parentGroup.div || createElement(DIV, {
                                className: attr(parentGroup.element, "class")
                            }, {
                                position: ABSOLUTE,
                                left: (parentGroup.translateX || 0) + PX,
                                top: (parentGroup.translateY || 0) + PX
                            }, htmlGroup || container);
                            htmlGroupStyle = htmlGroup.style;
                            extend(parentGroup, {
                                translateXSetter: function(value, key) {
                                    htmlGroupStyle.left = value + PX;
                                    parentGroup[key] = value;
                                    parentGroup.doTransform = true;
                                },
                                translateYSetter: function(value, key) {
                                    htmlGroupStyle.top = value + PX;
                                    parentGroup[key] = value;
                                    parentGroup.doTransform = true;
                                },
                                visibilitySetter: function(value, key) {
                                    htmlGroupStyle[key] = value;
                                }
                            });
                        });
                    }
                } else htmlGroup = container;
                htmlGroup.appendChild(element);
                wrapper.added = true;
                wrapper.alignOnAdd && wrapper.htmlUpdateTransform();
                return wrapper;
            });
            return wrapper;
        }
    });
    var VMLRenderer, VMLElement;
    if (!hasSVG && !useCanVG) {
        Highcharts.VMLElement = VMLElement = {
            init: function(renderer, nodeName) {
                var wrapper = this, markup = [ "<", nodeName, ' filled="f" stroked="f"' ], style = [ "position: ", ABSOLUTE, ";" ], isDiv = nodeName === DIV;
                ("shape" === nodeName || isDiv) && style.push("left:0;top:0;width:1px;height:1px;");
                style.push("visibility: ", isDiv ? HIDDEN : VISIBLE);
                markup.push(' style="', style.join(""), '"/>');
                if (nodeName) {
                    markup = isDiv || "span" === nodeName || "img" === nodeName ? markup.join("") : renderer.prepVML(markup);
                    wrapper.element = createElement(markup);
                }
                wrapper.renderer = renderer;
            },
            add: function(parent) {
                var wrapper = this, renderer = wrapper.renderer, element = wrapper.element, box = renderer.box, inverted = parent && parent.inverted, parentNode = parent ? parent.element || parent : box;
                inverted && renderer.invertChild(element, parentNode);
                parentNode.appendChild(element);
                wrapper.added = true;
                wrapper.alignOnAdd && !wrapper.deferUpdateTransform && wrapper.updateTransform();
                wrapper.onAdd && wrapper.onAdd();
                return wrapper;
            },
            updateTransform: SVGElement.prototype.htmlUpdateTransform,
            setSpanRotation: function() {
                var rotation = this.rotation, costheta = mathCos(rotation * deg2rad), sintheta = mathSin(rotation * deg2rad);
                css(this.element, {
                    filter: rotation ? [ "progid:DXImageTransform.Microsoft.Matrix(M11=", costheta, ", M12=", -sintheta, ", M21=", sintheta, ", M22=", costheta, ", sizingMethod='auto expand')" ].join("") : NONE
                });
            },
            getSpanCorrection: function(width, baseline, alignCorrection, rotation, align) {
                var quad, costheta = rotation ? mathCos(rotation * deg2rad) : 1, sintheta = rotation ? mathSin(rotation * deg2rad) : 0, height = pick(this.elemHeight, this.element.offsetHeight), nonLeft = align && "left" !== align;
                this.xCorr = 0 > costheta && -width;
                this.yCorr = 0 > sintheta && -height;
                quad = 0 > costheta * sintheta;
                this.xCorr += sintheta * baseline * (quad ? 1 - alignCorrection : alignCorrection);
                this.yCorr -= costheta * baseline * (rotation ? quad ? alignCorrection : 1 - alignCorrection : 1);
                if (nonLeft) {
                    this.xCorr -= width * alignCorrection * (0 > costheta ? -1 : 1);
                    rotation && (this.yCorr -= height * alignCorrection * (0 > sintheta ? -1 : 1));
                    css(this.element, {
                        textAlign: align
                    });
                }
            },
            pathToVML: function(value) {
                var i = value.length, path = [];
                while (i--) if (isNumber(value[i])) path[i] = mathRound(10 * value[i]) - 5; else if ("Z" === value[i]) path[i] = "x"; else {
                    path[i] = value[i];
                    if (value.isArc && ("wa" === value[i] || "at" === value[i])) {
                        path[i + 5] === path[i + 7] && (path[i + 7] += value[i + 7] > value[i + 5] ? 1 : -1);
                        path[i + 6] === path[i + 8] && (path[i + 8] += value[i + 8] > value[i + 6] ? 1 : -1);
                    }
                }
                return path.join(" ") || "x";
            },
            clip: function(clipRect) {
                var clipMembers, cssRet, wrapper = this;
                if (clipRect) {
                    clipMembers = clipRect.members;
                    erase(clipMembers, wrapper);
                    clipMembers.push(wrapper);
                    wrapper.destroyClip = function() {
                        erase(clipMembers, wrapper);
                    };
                    cssRet = clipRect.getCSS(wrapper);
                } else {
                    wrapper.destroyClip && wrapper.destroyClip();
                    cssRet = {
                        clip: docMode8 ? "inherit" : "rect(auto)"
                    };
                }
                return wrapper.css(cssRet);
            },
            css: SVGElement.prototype.htmlCss,
            safeRemoveChild: function(element) {
                element.parentNode && discardElement(element);
            },
            destroy: function() {
                this.destroyClip && this.destroyClip();
                return SVGElement.prototype.destroy.apply(this);
            },
            on: function(eventType, handler) {
                this.element["on" + eventType] = function() {
                    var evt = win.event;
                    evt.target = evt.srcElement;
                    handler(evt);
                };
                return this;
            },
            cutOffPath: function(path, length) {
                var len;
                path = path.split(/[ ,]/);
                len = path.length;
                (9 === len || 11 === len) && (path[len - 4] = path[len - 2] = pInt(path[len - 2]) - 10 * length);
                return path.join(" ");
            },
            shadow: function(shadowOptions, group, cutOff) {
                var i, shadow, markup, strokeWidth, modifiedPath, shadowWidth, shadowElementOpacity, shadows = [], element = this.element, renderer = this.renderer, elemStyle = element.style, path = element.path;
                path && "string" != typeof path.value && (path = "x");
                modifiedPath = path;
                if (shadowOptions) {
                    shadowWidth = pick(shadowOptions.width, 3);
                    shadowElementOpacity = (shadowOptions.opacity || .15) / shadowWidth;
                    for (i = 1; 3 >= i; i++) {
                        strokeWidth = 2 * shadowWidth + 1 - 2 * i;
                        cutOff && (modifiedPath = this.cutOffPath(path.value, strokeWidth + .5));
                        markup = [ '<shape isShadow="true" strokeweight="', strokeWidth, '" filled="false" path="', modifiedPath, '" coordsize="10 10" style="', element.style.cssText, '" />' ];
                        shadow = createElement(renderer.prepVML(markup), null, {
                            left: pInt(elemStyle.left) + pick(shadowOptions.offsetX, 1),
                            top: pInt(elemStyle.top) + pick(shadowOptions.offsetY, 1)
                        });
                        cutOff && (shadow.cutOff = strokeWidth + 1);
                        markup = [ '<stroke color="', shadowOptions.color || "black", '" opacity="', shadowElementOpacity * i, '"/>' ];
                        createElement(renderer.prepVML(markup), null, null, shadow);
                        group ? group.element.appendChild(shadow) : element.parentNode.insertBefore(shadow, element);
                        shadows.push(shadow);
                    }
                    this.shadows = shadows;
                }
                return this;
            },
            updateShadows: noop,
            setAttr: function(key, value) {
                docMode8 ? this.element[key] = value : this.element.setAttribute(key, value);
            },
            classSetter: function(value) {
                this.element.className = value;
            },
            dashstyleSetter: function(value, key, element) {
                var strokeElem = element.getElementsByTagName("stroke")[0] || createElement(this.renderer.prepVML([ "<stroke/>" ]), null, null, element);
                strokeElem[key] = value || "solid";
                this[key] = value;
            },
            dSetter: function(value, key, element) {
                var i, shadows = this.shadows;
                value = value || [];
                this.d = value.join(" ");
                element.path = value = this.pathToVML(value);
                if (shadows) {
                    i = shadows.length;
                    while (i--) shadows[i].path = shadows[i].cutOff ? this.cutOffPath(value, shadows[i].cutOff) : value;
                }
                this.setAttr(key, value);
            },
            fillSetter: function(value, key, element) {
                var nodeName = element.nodeName;
                if ("SPAN" === nodeName) element.style.color = value; else if ("IMG" !== nodeName) {
                    element.filled = value !== NONE;
                    this.setAttr("fillcolor", this.renderer.color(value, element, key, this));
                }
            },
            opacitySetter: noop,
            rotationSetter: function(value, key, element) {
                var style = element.style;
                this[key] = style[key] = value;
                style.left = -mathRound(mathSin(value * deg2rad) + 1) + PX;
                style.top = mathRound(mathCos(value * deg2rad)) + PX;
            },
            strokeSetter: function(value, key, element) {
                this.setAttr("strokecolor", this.renderer.color(value, element, key));
            },
            "stroke-widthSetter": function(value, key, element) {
                element.stroked = !!value;
                this[key] = value;
                isNumber(value) && (value += PX);
                this.setAttr("strokeweight", value);
            },
            titleSetter: function(value, key) {
                this.setAttr(key, value);
            },
            visibilitySetter: function(value, key, element) {
                "inherit" === value && (value = VISIBLE);
                this.shadows && each(this.shadows, function(shadow) {
                    shadow.style[key] = value;
                });
                if ("DIV" === element.nodeName) {
                    value = value === HIDDEN ? "-999em" : 0;
                    docMode8 || (element.style[key] = value ? VISIBLE : HIDDEN);
                    key = "top";
                }
                element.style[key] = value;
            },
            xSetter: function(value, key, element) {
                this[key] = value;
                "x" === key ? key = "left" : "y" === key && (key = "top");
                if (this.updateClipping) {
                    this[key] = value;
                    this.updateClipping();
                } else element.style[key] = value;
            },
            zIndexSetter: function(value, key, element) {
                element.style[key] = value;
            }
        };
        VMLElement = extendClass(SVGElement, VMLElement);
        VMLElement.prototype.ySetter = VMLElement.prototype.widthSetter = VMLElement.prototype.heightSetter = VMLElement.prototype.xSetter;
        var VMLRendererExtension = {
            Element: VMLElement,
            isIE8: userAgent.indexOf("MSIE 8.0") > -1,
            init: function(container, width, height, style) {
                var boxWrapper, box, css, renderer = this;
                renderer.alignedObjects = [];
                boxWrapper = renderer.createElement(DIV).css(extend(this.getStyle(style), {
                    position: RELATIVE
                }));
                box = boxWrapper.element;
                container.appendChild(boxWrapper.element);
                renderer.isVML = true;
                renderer.box = box;
                renderer.boxWrapper = boxWrapper;
                renderer.cache = {};
                renderer.setSize(width, height, false);
                if (!doc.namespaces.hcv) {
                    doc.namespaces.add("hcv", "urn:schemas-microsoft-com:vml");
                    css = "hcv\\:fill, hcv\\:path, hcv\\:shape, hcv\\:stroke{ behavior:url(#default#VML); display: inline-block; } ";
                    try {
                        doc.createStyleSheet().cssText = css;
                    } catch (e) {
                        doc.styleSheets[0].cssText += css;
                    }
                }
            },
            isHidden: function() {
                return !this.box.offsetWidth;
            },
            clipRect: function(x, y, width, height) {
                var clipRect = this.createElement(), isObj = isObject(x);
                return extend(clipRect, {
                    members: [],
                    left: (isObj ? x.x : x) + 1,
                    top: (isObj ? x.y : y) + 1,
                    width: (isObj ? x.width : width) - 1,
                    height: (isObj ? x.height : height) - 1,
                    getCSS: function(wrapper) {
                        var element = wrapper.element, nodeName = element.nodeName, isShape = "shape" === nodeName, inverted = wrapper.inverted, rect = this, top = rect.top - (isShape ? element.offsetTop : 0), left = rect.left, right = left + rect.width, bottom = top + rect.height, ret = {
                            clip: "rect(" + mathRound(inverted ? left : top) + "px," + mathRound(inverted ? bottom : right) + "px," + mathRound(inverted ? right : bottom) + "px," + mathRound(inverted ? top : left) + "px)"
                        };
                        !inverted && docMode8 && "DIV" === nodeName && extend(ret, {
                            width: right + PX,
                            height: bottom + PX
                        });
                        return ret;
                    },
                    updateClipping: function() {
                        each(clipRect.members, function(member) {
                            member.element && member.css(clipRect.getCSS(member));
                        });
                    }
                });
            },
            color: function(color, elem, prop, wrapper) {
                var colorObject, markup, fillType, renderer = this, regexRgba = /^rgba/, ret = NONE;
                color && color.linearGradient ? fillType = "gradient" : color && color.radialGradient && (fillType = "pattern");
                if (fillType) {
                    var stopColor, stopOpacity, x1, y1, x2, y2, opacity1, opacity2, color1, color2, firstStop, lastStop, gradient = color.linearGradient || color.radialGradient, fillAttr = "", stops = color.stops, colors = [], addFillNode = function() {
                        markup = [ '<fill colors="' + colors.join(",") + '" opacity="', opacity2, '" o:opacity2="', opacity1, '" type="', fillType, '" ', fillAttr, 'focus="100%" method="any" />' ];
                        createElement(renderer.prepVML(markup), null, null, elem);
                    };
                    firstStop = stops[0];
                    lastStop = stops[stops.length - 1];
                    firstStop[0] > 0 && stops.unshift([ 0, firstStop[1] ]);
                    1 > lastStop[0] && stops.push([ 1, lastStop[1] ]);
                    each(stops, function(stop, i) {
                        if (regexRgba.test(stop[1])) {
                            colorObject = Color(stop[1]);
                            stopColor = colorObject.get("rgb");
                            stopOpacity = colorObject.get("a");
                        } else {
                            stopColor = stop[1];
                            stopOpacity = 1;
                        }
                        colors.push(100 * stop[0] + "% " + stopColor);
                        if (i) {
                            opacity2 = stopOpacity;
                            color1 = stopColor;
                        } else {
                            opacity1 = stopOpacity;
                            color2 = stopColor;
                        }
                    });
                    if ("fill" === prop) if ("gradient" === fillType) {
                        x1 = gradient.x1 || gradient[0] || 0;
                        y1 = gradient.y1 || gradient[1] || 0;
                        x2 = gradient.x2 || gradient[2] || 0;
                        y2 = gradient.y2 || gradient[3] || 0;
                        fillAttr = 'angle="' + (90 - 180 * math.atan((y2 - y1) / (x2 - x1)) / mathPI) + '"';
                        addFillNode();
                    } else {
                        var bBox, r = gradient.r, sizex = 2 * r, sizey = 2 * r, cx = gradient.cx, cy = gradient.cy, radialReference = elem.radialReference, applyRadialGradient = function() {
                            if (radialReference) {
                                bBox = wrapper.getBBox();
                                cx += (radialReference[0] - bBox.x) / bBox.width - .5;
                                cy += (radialReference[1] - bBox.y) / bBox.height - .5;
                                sizex *= radialReference[2] / bBox.width;
                                sizey *= radialReference[2] / bBox.height;
                            }
                            fillAttr = 'src="' + defaultOptions.global.VMLRadialGradientURL + '" ' + 'size="' + sizex + "," + sizey + '" ' + 'origin="0.5,0.5" ' + 'position="' + cx + "," + cy + '" ' + 'color2="' + color2 + '" ';
                            addFillNode();
                        };
                        wrapper.added ? applyRadialGradient() : wrapper.onAdd = applyRadialGradient;
                        ret = color1;
                    } else ret = stopColor;
                } else if (regexRgba.test(color) && "IMG" !== elem.tagName) {
                    colorObject = Color(color);
                    markup = [ "<", prop, ' opacity="', colorObject.get("a"), '"/>' ];
                    createElement(this.prepVML(markup), null, null, elem);
                    ret = colorObject.get("rgb");
                } else {
                    var propNodes = elem.getElementsByTagName(prop);
                    if (propNodes.length) {
                        propNodes[0].opacity = 1;
                        propNodes[0].type = "solid";
                    }
                    ret = color;
                }
                return ret;
            },
            prepVML: function(markup) {
                var vmlStyle = "display:inline-block;behavior:url(#default#VML);", isIE8 = this.isIE8;
                markup = markup.join("");
                if (isIE8) {
                    markup = markup.replace("/>", ' xmlns="urn:schemas-microsoft-com:vml" />');
                    markup = -1 === markup.indexOf('style="') ? markup.replace("/>", ' style="' + vmlStyle + '" />') : markup.replace('style="', 'style="' + vmlStyle);
                } else markup = markup.replace("<", "<hcv:");
                return markup;
            },
            text: SVGRenderer.prototype.html,
            path: function(path) {
                var attr = {
                    coordsize: "10 10"
                };
                isArray(path) ? attr.d = path : isObject(path) && extend(attr, path);
                return this.createElement("shape").attr(attr);
            },
            circle: function(x, y, r) {
                var circle = this.symbol("circle");
                if (isObject(x)) {
                    r = x.r;
                    y = x.y;
                    x = x.x;
                }
                circle.isCircle = true;
                circle.r = r;
                return circle.attr({
                    x: x,
                    y: y
                });
            },
            g: function(name) {
                var wrapper, attribs;
                name && (attribs = {
                    className: PREFIX + name,
                    "class": PREFIX + name
                });
                wrapper = this.createElement(DIV).attr(attribs);
                return wrapper;
            },
            image: function(src, x, y, width, height) {
                var obj = this.createElement("img").attr({
                    src: src
                });
                arguments.length > 1 && obj.attr({
                    x: x,
                    y: y,
                    width: width,
                    height: height
                });
                return obj;
            },
            createElement: function(nodeName) {
                return "rect" === nodeName ? this.symbol(nodeName) : SVGRenderer.prototype.createElement.call(this, nodeName);
            },
            invertChild: function(element, parentNode) {
                var ren = this, parentStyle = parentNode.style, imgStyle = "IMG" === element.tagName && element.style;
                css(element, {
                    flip: "x",
                    left: pInt(parentStyle.width) - (imgStyle ? pInt(imgStyle.top) : 1),
                    top: pInt(parentStyle.height) - (imgStyle ? pInt(imgStyle.left) : 1),
                    rotation: -90
                });
                each(element.childNodes, function(child) {
                    ren.invertChild(child, element);
                });
            },
            symbols: {
                arc: function(x, y, w, h, options) {
                    var ret, start = options.start, end = options.end, radius = options.r || w || h, innerRadius = options.innerR, cosStart = mathCos(start), sinStart = mathSin(start), cosEnd = mathCos(end), sinEnd = mathSin(end);
                    if (0 === end - start) return [ "x" ];
                    ret = [ "wa", x - radius, y - radius, x + radius, y + radius, x + radius * cosStart, y + radius * sinStart, x + radius * cosEnd, y + radius * sinEnd ];
                    options.open && !innerRadius && ret.push("e", M, x, y);
                    ret.push("at", x - innerRadius, y - innerRadius, x + innerRadius, y + innerRadius, x + innerRadius * cosEnd, y + innerRadius * sinEnd, x + innerRadius * cosStart, y + innerRadius * sinStart, "x", "e");
                    ret.isArc = true;
                    return ret;
                },
                circle: function(x, y, w, h, wrapper) {
                    wrapper && (w = h = 2 * wrapper.r);
                    if (wrapper && wrapper.isCircle) {
                        x -= w / 2;
                        y -= h / 2;
                    }
                    return [ "wa", x, y, x + w, y + h, x + w, y + h / 2, x + w, y + h / 2, "e" ];
                },
                rect: function(x, y, w, h, options) {
                    return SVGRenderer.prototype.symbols[defined(options) && options.r ? "callout" : "square"].call(0, x, y, w, h, options);
                }
            }
        };
        Highcharts.VMLRenderer = VMLRenderer = function() {
            this.init.apply(this, arguments);
        };
        VMLRenderer.prototype = merge(SVGRenderer.prototype, VMLRendererExtension);
        Renderer = VMLRenderer;
    }
    SVGRenderer.prototype.measureSpanWidth = function(text, styles) {
        var offsetWidth, measuringSpan = doc.createElement("span"), textNode = doc.createTextNode(text);
        measuringSpan.appendChild(textNode);
        css(measuringSpan, styles);
        this.box.appendChild(measuringSpan);
        offsetWidth = measuringSpan.offsetWidth;
        discardElement(measuringSpan);
        return offsetWidth;
    };
    var CanVGRenderer, CanVGController;
    if (useCanVG) {
        Highcharts.CanVGRenderer = CanVGRenderer = function() {
            SVG_NS = "http://www.w3.org/1999/xhtml";
        };
        CanVGRenderer.prototype.symbols = {};
        CanVGController = function() {
            function drawDeferred() {
                var callIndex, callLength = deferredRenderCalls.length;
                for (callIndex = 0; callLength > callIndex; callIndex++) deferredRenderCalls[callIndex]();
                deferredRenderCalls = [];
            }
            var deferredRenderCalls = [];
            return {
                push: function(func, scriptLocation) {
                    0 === deferredRenderCalls.length && getScript(scriptLocation, drawDeferred);
                    deferredRenderCalls.push(func);
                }
            };
        }();
        Renderer = CanVGRenderer;
    }
    Tick.prototype = {
        addLabel: function() {
            var str, css, attr, dateTimeLabelFormat, tick = this, axis = tick.axis, options = axis.options, chart = axis.chart, horiz = axis.horiz, categories = axis.categories, names = axis.names, pos = tick.pos, labelOptions = options.labels, tickPositions = axis.tickPositions, width = horiz && categories && !labelOptions.step && !labelOptions.staggerLines && !labelOptions.rotation && chart.plotWidth / tickPositions.length || !horiz && (chart.margin[3] || .33 * chart.chartWidth), isFirst = pos === tickPositions[0], isLast = pos === tickPositions[tickPositions.length - 1], value = categories ? pick(categories[pos], names[pos], pos) : pos, label = tick.label, tickPositionInfo = tickPositions.info;
            axis.isDatetimeAxis && tickPositionInfo && (dateTimeLabelFormat = options.dateTimeLabelFormats[tickPositionInfo.higherRanks[pos] || tickPositionInfo.unitName]);
            tick.isFirst = isFirst;
            tick.isLast = isLast;
            str = axis.labelFormatter.call({
                axis: axis,
                chart: chart,
                isFirst: isFirst,
                isLast: isLast,
                dateTimeLabelFormat: dateTimeLabelFormat,
                value: axis.isLog ? correctFloat(lin2log(value)) : value
            });
            css = width && {
                width: mathMax(1, mathRound(width - 2 * (labelOptions.padding || 10))) + PX
            };
            css = extend(css, labelOptions.style);
            if (defined(label)) label && label.attr({
                text: str
            }).css(css); else {
                attr = {
                    align: axis.labelAlign
                };
                isNumber(labelOptions.rotation) && (attr.rotation = labelOptions.rotation);
                width && labelOptions.ellipsis && (attr._clipHeight = axis.len / tickPositions.length);
                tick.label = defined(str) && labelOptions.enabled ? chart.renderer.text(str, 0, 0, labelOptions.useHTML).attr(attr).css(css).add(axis.labelGroup) : null;
            }
        },
        getLabelSize: function() {
            var label = this.label, axis = this.axis;
            return label ? label.getBBox()[axis.horiz ? "height" : "width"] : 0;
        },
        getLabelSides: function() {
            var bBox = this.label.getBBox(), axis = this.axis, horiz = axis.horiz, options = axis.options, labelOptions = options.labels, size = horiz ? bBox.width : bBox.height, leftSide = horiz ? labelOptions.x - size * {
                left: 0,
                center: .5,
                right: 1
            }[axis.labelAlign] : 0, rightSide = horiz ? size + leftSide : size;
            return [ leftSide, rightSide ];
        },
        handleOverflow: function(index, xy) {
            var axisLeft, axisRight, neighbour, neighbourEdge, justifyToPlot, show = true, axis = this.axis, isFirst = this.isFirst, isLast = this.isLast, horiz = axis.horiz, pxPos = horiz ? xy.x : xy.y, reversed = axis.reversed, tickPositions = axis.tickPositions, sides = this.getLabelSides(), leftSide = sides[0], rightSide = sides[1], line = this.label.line || 0, labelEdge = axis.labelEdge, justifyLabel = axis.justifyLabels && (isFirst || isLast);
            labelEdge[line] === UNDEFINED || pxPos + leftSide > labelEdge[line] ? labelEdge[line] = pxPos + rightSide : justifyLabel || (show = false);
            if (justifyLabel) {
                justifyToPlot = axis.justifyToPlot;
                axisLeft = justifyToPlot ? axis.pos : 0;
                axisRight = justifyToPlot ? axisLeft + axis.len : axis.chart.chartWidth;
                do {
                    index += isFirst ? 1 : -1;
                    neighbour = axis.ticks[tickPositions[index]];
                } while (tickPositions[index] && (!neighbour || neighbour.label.line !== line));
                neighbourEdge = neighbour && neighbour.label.xy && neighbour.label.xy.x + neighbour.getLabelSides()[isFirst ? 0 : 1];
                if (isFirst && !reversed || isLast && reversed) {
                    if (axisLeft > pxPos + leftSide) {
                        pxPos = axisLeft - leftSide;
                        neighbour && pxPos + rightSide > neighbourEdge && (show = false);
                    }
                } else if (pxPos + rightSide > axisRight) {
                    pxPos = axisRight - rightSide;
                    neighbour && neighbourEdge > pxPos + leftSide && (show = false);
                }
                xy.x = pxPos;
            }
            return show;
        },
        getPosition: function(horiz, pos, tickmarkOffset, old) {
            var axis = this.axis, chart = axis.chart, cHeight = old && chart.oldChartHeight || chart.chartHeight;
            return {
                x: horiz ? axis.translate(pos + tickmarkOffset, null, null, old) + axis.transB : axis.left + axis.offset + (axis.opposite ? (old && chart.oldChartWidth || chart.chartWidth) - axis.right - axis.left : 0),
                y: horiz ? cHeight - axis.bottom + axis.offset - (axis.opposite ? axis.height : 0) : cHeight - axis.translate(pos + tickmarkOffset, null, null, old) - axis.transB
            };
        },
        getLabelPosition: function(x, y, label, horiz, labelOptions, tickmarkOffset, index, step) {
            var axis = this.axis, transA = axis.transA, reversed = axis.reversed, staggerLines = axis.staggerLines, baseline = axis.chart.renderer.fontMetrics(labelOptions.style.fontSize).b, rotation = labelOptions.rotation;
            x = x + labelOptions.x - (tickmarkOffset && horiz ? tickmarkOffset * transA * (reversed ? -1 : 1) : 0);
            y = y + labelOptions.y - (tickmarkOffset && !horiz ? tickmarkOffset * transA * (reversed ? 1 : -1) : 0);
            rotation && 2 === axis.side && (y -= baseline - baseline * mathCos(rotation * deg2rad));
            defined(labelOptions.y) || rotation || (y += baseline - label.getBBox().height / 2);
            if (staggerLines) {
                label.line = index / (step || 1) % staggerLines;
                y += label.line * (axis.labelOffset / staggerLines);
            }
            return {
                x: x,
                y: y
            };
        },
        getMarkPath: function(x, y, tickLength, tickWidth, horiz, renderer) {
            return renderer.crispLine([ M, x, y, L, x + (horiz ? 0 : -tickLength), y + (horiz ? tickLength : 0) ], tickWidth);
        },
        render: function(index, old, opacity) {
            var gridLinePath, markPath, attribs, tick = this, axis = tick.axis, options = axis.options, chart = axis.chart, renderer = chart.renderer, horiz = axis.horiz, type = tick.type, label = tick.label, pos = tick.pos, labelOptions = options.labels, gridLine = tick.gridLine, gridPrefix = type ? type + "Grid" : "grid", tickPrefix = type ? type + "Tick" : "tick", gridLineWidth = options[gridPrefix + "LineWidth"], gridLineColor = options[gridPrefix + "LineColor"], dashStyle = options[gridPrefix + "LineDashStyle"], tickLength = options[tickPrefix + "Length"], tickWidth = options[tickPrefix + "Width"] || 0, tickColor = options[tickPrefix + "Color"], tickPosition = options[tickPrefix + "Position"], mark = tick.mark, step = labelOptions.step, show = true, tickmarkOffset = axis.tickmarkOffset, xy = tick.getPosition(horiz, pos, tickmarkOffset, old), x = xy.x, y = xy.y, reverseCrisp = horiz && x === axis.pos + axis.len || !horiz && y === axis.pos ? -1 : 1;
            this.isActive = true;
            if (gridLineWidth) {
                gridLinePath = axis.getPlotLinePath(pos + tickmarkOffset, gridLineWidth * reverseCrisp, old, true);
                if (gridLine === UNDEFINED) {
                    attribs = {
                        stroke: gridLineColor,
                        "stroke-width": gridLineWidth
                    };
                    dashStyle && (attribs.dashstyle = dashStyle);
                    type || (attribs.zIndex = 1);
                    old && (attribs.opacity = 0);
                    tick.gridLine = gridLine = gridLineWidth ? renderer.path(gridLinePath).attr(attribs).add(axis.gridGroup) : null;
                }
                !old && gridLine && gridLinePath && gridLine[tick.isNew ? "attr" : "animate"]({
                    d: gridLinePath,
                    opacity: opacity
                });
            }
            if (tickWidth && tickLength) {
                "inside" === tickPosition && (tickLength = -tickLength);
                axis.opposite && (tickLength = -tickLength);
                markPath = tick.getMarkPath(x, y, tickLength, tickWidth * reverseCrisp, horiz, renderer);
                mark ? mark.animate({
                    d: markPath,
                    opacity: opacity
                }) : tick.mark = renderer.path(markPath).attr({
                    stroke: tickColor,
                    "stroke-width": tickWidth,
                    opacity: opacity
                }).add(axis.axisGroup);
            }
            if (label && !isNaN(x)) {
                label.xy = xy = tick.getLabelPosition(x, y, label, horiz, labelOptions, tickmarkOffset, index, step);
                tick.isFirst && !tick.isLast && !pick(options.showFirstLabel, 1) || tick.isLast && !tick.isFirst && !pick(options.showLastLabel, 1) ? show = false : axis.isRadial || labelOptions.step || labelOptions.rotation || old || 0 === opacity || (show = tick.handleOverflow(index, xy));
                step && index % step && (show = false);
                if (show && !isNaN(xy.y)) {
                    xy.opacity = opacity;
                    label[tick.isNew ? "attr" : "animate"](xy);
                    tick.isNew = false;
                } else label.attr("y", -9999);
            }
        },
        destroy: function() {
            destroyObjectProperties(this, this.axis);
        }
    };
    Highcharts.PlotLineOrBand = function(axis, options) {
        this.axis = axis;
        if (options) {
            this.options = options;
            this.id = options.id;
        }
    };
    Highcharts.PlotLineOrBand.prototype = {
        render: function() {
            var addEvent, eventType, xs, ys, x, y, plotLine = this, axis = plotLine.axis, horiz = axis.horiz, halfPointRange = (axis.pointRange || 0) / 2, options = plotLine.options, optionsLabel = options.label, label = plotLine.label, width = options.width, to = options.to, from = options.from, isBand = defined(from) && defined(to), value = options.value, dashStyle = options.dashStyle, svgElem = plotLine.svgElem, path = [], color = options.color, zIndex = options.zIndex, events = options.events, attribs = {}, renderer = axis.chart.renderer;
            if (axis.isLog) {
                from = log2lin(from);
                to = log2lin(to);
                value = log2lin(value);
            }
            if (width) {
                path = axis.getPlotLinePath(value, width);
                attribs = {
                    stroke: color,
                    "stroke-width": width
                };
                dashStyle && (attribs.dashstyle = dashStyle);
            } else {
                if (!isBand) return;
                from = mathMax(from, axis.min - halfPointRange);
                to = mathMin(to, axis.max + halfPointRange);
                path = axis.getPlotBandPath(from, to, options);
                color && (attribs.fill = color);
                if (options.borderWidth) {
                    attribs.stroke = options.borderColor;
                    attribs["stroke-width"] = options.borderWidth;
                }
            }
            defined(zIndex) && (attribs.zIndex = zIndex);
            if (svgElem) if (path) svgElem.animate({
                d: path
            }, null, svgElem.onGetPath); else {
                svgElem.hide();
                svgElem.onGetPath = function() {
                    svgElem.show();
                };
                label && (plotLine.label = label = label.destroy());
            } else if (path && path.length) {
                plotLine.svgElem = svgElem = renderer.path(path).attr(attribs).add();
                if (events) {
                    addEvent = function(eventType) {
                        svgElem.on(eventType, function(e) {
                            events[eventType].apply(plotLine, [ e ]);
                        });
                    };
                    for (eventType in events) addEvent(eventType);
                }
            }
            if (optionsLabel && defined(optionsLabel.text) && path && path.length && axis.width > 0 && axis.height > 0) {
                optionsLabel = merge({
                    align: horiz && isBand && "center",
                    x: horiz ? !isBand && 4 : 10,
                    verticalAlign: !horiz && isBand && "middle",
                    y: horiz ? isBand ? 16 : 10 : isBand ? 6 : -4,
                    rotation: horiz && !isBand && 90
                }, optionsLabel);
                if (!label) {
                    attribs = {
                        align: optionsLabel.textAlign || optionsLabel.align,
                        rotation: optionsLabel.rotation
                    };
                    defined(zIndex) && (attribs.zIndex = zIndex);
                    plotLine.label = label = renderer.text(optionsLabel.text, 0, 0, optionsLabel.useHTML).attr(attribs).css(optionsLabel.style).add();
                }
                xs = [ path[1], path[4], pick(path[6], path[1]) ];
                ys = [ path[2], path[5], pick(path[7], path[2]) ];
                x = arrayMin(xs);
                y = arrayMin(ys);
                label.align(optionsLabel, false, {
                    x: x,
                    y: y,
                    width: arrayMax(xs) - x,
                    height: arrayMax(ys) - y
                });
                label.show();
            } else label && label.hide();
            return plotLine;
        },
        destroy: function() {
            erase(this.axis.plotLinesAndBands, this);
            delete this.axis;
            destroyObjectProperties(this);
        }
    };
    AxisPlotLineOrBandExtension = {
        getPlotBandPath: function(from, to) {
            var toPath = this.getPlotLinePath(to), path = this.getPlotLinePath(from);
            path && toPath ? path.push(toPath[4], toPath[5], toPath[1], toPath[2]) : path = null;
            return path;
        },
        addPlotBand: function(options) {
            this.addPlotBandOrLine(options, "plotBands");
        },
        addPlotLine: function(options) {
            this.addPlotBandOrLine(options, "plotLines");
        },
        addPlotBandOrLine: function(options, coll) {
            var obj = new Highcharts.PlotLineOrBand(this, options).render(), userOptions = this.userOptions;
            if (obj) {
                if (coll) {
                    userOptions[coll] = userOptions[coll] || [];
                    userOptions[coll].push(options);
                }
                this.plotLinesAndBands.push(obj);
            }
            return obj;
        },
        removePlotBandOrLine: function(id) {
            var plotLinesAndBands = this.plotLinesAndBands, options = this.options, userOptions = this.userOptions, i = plotLinesAndBands.length;
            while (i--) plotLinesAndBands[i].id === id && plotLinesAndBands[i].destroy();
            each([ options.plotLines || [], userOptions.plotLines || [], options.plotBands || [], userOptions.plotBands || [] ], function(arr) {
                i = arr.length;
                while (i--) arr[i].id === id && erase(arr, arr[i]);
            });
        }
    };
    Axis.prototype = {
        defaultOptions: {
            dateTimeLabelFormats: {
                millisecond: "%H:%M:%S.%L",
                second: "%H:%M:%S",
                minute: "%H:%M",
                hour: "%H:%M",
                day: "%e. %b",
                week: "%e. %b",
                month: "%b '%y",
                year: "%Y"
            },
            endOnTick: false,
            gridLineColor: "#C0C0C0",
            labels: defaultLabelOptions,
            lineColor: "#C0D0E0",
            lineWidth: 1,
            minPadding: .01,
            maxPadding: .01,
            minorGridLineColor: "#E0E0E0",
            minorGridLineWidth: 1,
            minorTickColor: "#A0A0A0",
            minorTickLength: 2,
            minorTickPosition: "outside",
            startOfWeek: 1,
            startOnTick: false,
            tickColor: "#C0D0E0",
            tickLength: 10,
            tickmarkPlacement: "between",
            tickPixelInterval: 100,
            tickPosition: "outside",
            tickWidth: 1,
            title: {
                align: "middle",
                style: {
                    color: "#707070"
                }
            },
            type: "linear"
        },
        defaultYAxisOptions: {
            endOnTick: true,
            gridLineWidth: 1,
            tickPixelInterval: 72,
            showLastLabel: true,
            labels: {
                x: -8,
                y: 3
            },
            lineWidth: 0,
            maxPadding: .05,
            minPadding: .05,
            startOnTick: true,
            tickWidth: 0,
            title: {
                rotation: 270,
                text: "Values"
            },
            stackLabels: {
                enabled: false,
                formatter: function() {
                    return numberFormat(this.total, -1);
                },
                style: defaultLabelOptions.style
            }
        },
        defaultLeftAxisOptions: {
            labels: {
                x: -15,
                y: null
            },
            title: {
                rotation: 270
            }
        },
        defaultRightAxisOptions: {
            labels: {
                x: 15,
                y: null
            },
            title: {
                rotation: 90
            }
        },
        defaultBottomAxisOptions: {
            labels: {
                x: 0,
                y: 20
            },
            title: {
                rotation: 0
            }
        },
        defaultTopAxisOptions: {
            labels: {
                x: 0,
                y: -15
            },
            title: {
                rotation: 0
            }
        },
        init: function(chart, userOptions) {
            var isXAxis = userOptions.isX, axis = this;
            axis.horiz = chart.inverted ? !isXAxis : isXAxis;
            axis.isXAxis = isXAxis;
            axis.coll = isXAxis ? "xAxis" : "yAxis";
            axis.opposite = userOptions.opposite;
            axis.side = userOptions.side || (axis.horiz ? axis.opposite ? 0 : 2 : axis.opposite ? 1 : 3);
            axis.setOptions(userOptions);
            var options = this.options, type = options.type, isDatetimeAxis = "datetime" === type;
            axis.labelFormatter = options.labels.formatter || axis.defaultLabelFormatter;
            axis.userOptions = userOptions;
            axis.minPixelPadding = 0;
            axis.chart = chart;
            axis.reversed = options.reversed;
            axis.zoomEnabled = false !== options.zoomEnabled;
            axis.categories = options.categories || "category" === type;
            axis.names = [];
            axis.isLog = "logarithmic" === type;
            axis.isDatetimeAxis = isDatetimeAxis;
            axis.isLinked = defined(options.linkedTo);
            axis.tickmarkOffset = axis.categories && "between" === options.tickmarkPlacement ? .5 : 0;
            axis.ticks = {};
            axis.labelEdge = [];
            axis.minorTicks = {};
            axis.plotLinesAndBands = [];
            axis.alternateBands = {};
            axis.len = 0;
            axis.minRange = axis.userMinRange = options.minRange || options.maxZoom;
            axis.range = options.range;
            axis.offset = options.offset || 0;
            axis.stacks = {};
            axis.oldStacks = {};
            axis.max = null;
            axis.min = null;
            axis.crosshair = pick(options.crosshair, splat(chart.options.tooltip.crosshairs)[isXAxis ? 0 : 1], false);
            var eventType, events = axis.options.events;
            if (-1 === inArray(axis, chart.axes)) {
                isXAxis && !this.isColorAxis ? chart.axes.splice(chart.xAxis.length, 0, axis) : chart.axes.push(axis);
                chart[axis.coll].push(axis);
            }
            axis.series = axis.series || [];
            chart.inverted && isXAxis && axis.reversed === UNDEFINED && (axis.reversed = true);
            axis.removePlotBand = axis.removePlotBandOrLine;
            axis.removePlotLine = axis.removePlotBandOrLine;
            for (eventType in events) addEvent(axis, eventType, events[eventType]);
            if (axis.isLog) {
                axis.val2lin = log2lin;
                axis.lin2val = lin2log;
            }
        },
        setOptions: function(userOptions) {
            this.options = merge(this.defaultOptions, this.isXAxis ? {} : this.defaultYAxisOptions, [ this.defaultTopAxisOptions, this.defaultRightAxisOptions, this.defaultBottomAxisOptions, this.defaultLeftAxisOptions ][this.side], merge(defaultOptions[this.coll], userOptions));
        },
        defaultLabelFormatter: function() {
            var multi, ret, axis = this.axis, value = this.value, categories = axis.categories, dateTimeLabelFormat = this.dateTimeLabelFormat, numericSymbols = defaultOptions.lang.numericSymbols, i = numericSymbols && numericSymbols.length, formatOption = axis.options.labels.format, numericSymbolDetector = axis.isLog ? value : axis.tickInterval;
            if (formatOption) ret = format(formatOption, this); else if (categories) ret = value; else if (dateTimeLabelFormat) ret = dateFormat(dateTimeLabelFormat, value); else if (i && numericSymbolDetector >= 1e3) while (i-- && ret === UNDEFINED) {
                multi = Math.pow(1e3, i + 1);
                numericSymbolDetector >= multi && null !== numericSymbols[i] && (ret = numberFormat(value / multi, -1) + numericSymbols[i]);
            }
            ret === UNDEFINED && (ret = mathAbs(value) >= 1e4 ? numberFormat(value, 0) : numberFormat(value, -1, UNDEFINED, ""));
            return ret;
        },
        getSeriesExtremes: function() {
            var axis = this, chart = axis.chart;
            axis.hasVisibleSeries = false;
            axis.dataMin = axis.dataMax = null;
            axis.buildStacks && axis.buildStacks();
            each(axis.series, function(series) {
                if (series.visible || !chart.options.chart.ignoreHiddenSeries) {
                    var xData, seriesDataMin, seriesDataMax, seriesOptions = series.options, threshold = seriesOptions.threshold;
                    axis.hasVisibleSeries = true;
                    axis.isLog && 0 >= threshold && (threshold = null);
                    if (axis.isXAxis) {
                        xData = series.xData;
                        if (xData.length) {
                            axis.dataMin = mathMin(pick(axis.dataMin, xData[0]), arrayMin(xData));
                            axis.dataMax = mathMax(pick(axis.dataMax, xData[0]), arrayMax(xData));
                        }
                    } else {
                        series.getExtremes();
                        seriesDataMax = series.dataMax;
                        seriesDataMin = series.dataMin;
                        if (defined(seriesDataMin) && defined(seriesDataMax)) {
                            axis.dataMin = mathMin(pick(axis.dataMin, seriesDataMin), seriesDataMin);
                            axis.dataMax = mathMax(pick(axis.dataMax, seriesDataMax), seriesDataMax);
                        }
                        if (defined(threshold)) if (axis.dataMin >= threshold) {
                            axis.dataMin = threshold;
                            axis.ignoreMinPadding = true;
                        } else if (threshold > axis.dataMax) {
                            axis.dataMax = threshold;
                            axis.ignoreMaxPadding = true;
                        }
                    }
                }
            });
        },
        translate: function(val, backwards, cvsCoord, old, handleLog, pointPlacement) {
            var returnValue, axis = this, sign = 1, cvsOffset = 0, localA = old ? axis.oldTransA : axis.transA, localMin = old ? axis.oldMin : axis.min, minPixelPadding = axis.minPixelPadding, postTranslate = (axis.options.ordinal || axis.isLog && handleLog) && axis.lin2val;
            localA || (localA = axis.transA);
            if (cvsCoord) {
                sign *= -1;
                cvsOffset = axis.len;
            }
            if (axis.reversed) {
                sign *= -1;
                cvsOffset -= sign * (axis.sector || axis.len);
            }
            if (backwards) {
                val = val * sign + cvsOffset;
                val -= minPixelPadding;
                returnValue = val / localA + localMin;
                postTranslate && (returnValue = axis.lin2val(returnValue));
            } else {
                postTranslate && (val = axis.val2lin(val));
                "between" === pointPlacement && (pointPlacement = .5);
                returnValue = sign * (val - localMin) * localA + cvsOffset + sign * minPixelPadding + (isNumber(pointPlacement) ? localA * pointPlacement * axis.pointRange : 0);
            }
            return returnValue;
        },
        toPixels: function(value, paneCoordinates) {
            return this.translate(value, false, !this.horiz, null, true) + (paneCoordinates ? 0 : this.pos);
        },
        toValue: function(pixel, paneCoordinates) {
            return this.translate(pixel - (paneCoordinates ? 0 : this.pos), true, !this.horiz, null, true);
        },
        getPlotLinePath: function(value, lineWidth, old, force, translatedValue) {
            var x1, y1, x2, y2, skip, axis = this, chart = axis.chart, axisLeft = axis.left, axisTop = axis.top, cHeight = old && chart.oldChartHeight || chart.chartHeight, cWidth = old && chart.oldChartWidth || chart.chartWidth, transB = axis.transB;
            translatedValue = pick(translatedValue, axis.translate(value, null, null, old));
            x1 = x2 = mathRound(translatedValue + transB);
            y1 = y2 = mathRound(cHeight - translatedValue - transB);
            if (isNaN(translatedValue)) skip = true; else if (axis.horiz) {
                y1 = axisTop;
                y2 = cHeight - axis.bottom;
                (axisLeft > x1 || x1 > axisLeft + axis.width) && (skip = true);
            } else {
                x1 = axisLeft;
                x2 = cWidth - axis.right;
                (axisTop > y1 || y1 > axisTop + axis.height) && (skip = true);
            }
            return skip && !force ? null : chart.renderer.crispLine([ M, x1, y1, L, x2, y2 ], lineWidth || 1);
        },
        getLinearTickPositions: function(tickInterval, min, max) {
            var pos, lastPos, roundedMin = correctFloat(mathFloor(min / tickInterval) * tickInterval), roundedMax = correctFloat(mathCeil(max / tickInterval) * tickInterval), tickPositions = [];
            if (min === max && isNumber(min)) return [ min ];
            pos = roundedMin;
            while (roundedMax >= pos) {
                tickPositions.push(pos);
                pos = correctFloat(pos + tickInterval);
                if (pos === lastPos) break;
                lastPos = pos;
            }
            return tickPositions;
        },
        getMinorTickPositions: function() {
            var pos, i, len, axis = this, options = axis.options, tickPositions = axis.tickPositions, minorTickInterval = axis.minorTickInterval, minorTickPositions = [];
            if (axis.isLog) {
                len = tickPositions.length;
                for (i = 1; len > i; i++) minorTickPositions = minorTickPositions.concat(axis.getLogTickPositions(minorTickInterval, tickPositions[i - 1], tickPositions[i], true));
            } else if (axis.isDatetimeAxis && "auto" === options.minorTickInterval) {
                minorTickPositions = minorTickPositions.concat(axis.getTimeTicks(axis.normalizeTimeTickInterval(minorTickInterval), axis.min, axis.max, options.startOfWeek));
                minorTickPositions[0] < axis.min && minorTickPositions.shift();
            } else for (pos = axis.min + (tickPositions[0] - axis.min) % minorTickInterval; axis.max >= pos; pos += minorTickInterval) minorTickPositions.push(pos);
            return minorTickPositions;
        },
        adjustForMinRange: function() {
            var zoomOffset, closestDataRange, i, distance, xData, loopLength, minArgs, maxArgs, axis = this, options = axis.options, min = axis.min, max = axis.max, spaceAvailable = axis.dataMax - axis.dataMin >= axis.minRange;
            if (axis.isXAxis && axis.minRange === UNDEFINED && !axis.isLog) if (defined(options.min) || defined(options.max)) axis.minRange = null; else {
                each(axis.series, function(series) {
                    xData = series.xData;
                    loopLength = series.xIncrement ? 1 : xData.length - 1;
                    for (i = loopLength; i > 0; i--) {
                        distance = xData[i] - xData[i - 1];
                        (closestDataRange === UNDEFINED || closestDataRange > distance) && (closestDataRange = distance);
                    }
                });
                axis.minRange = mathMin(5 * closestDataRange, axis.dataMax - axis.dataMin);
            }
            if (axis.minRange > max - min) {
                var minRange = axis.minRange;
                zoomOffset = (minRange - max + min) / 2;
                minArgs = [ min - zoomOffset, pick(options.min, min - zoomOffset) ];
                spaceAvailable && (minArgs[2] = axis.dataMin);
                min = arrayMax(minArgs);
                maxArgs = [ min + minRange, pick(options.max, min + minRange) ];
                spaceAvailable && (maxArgs[2] = axis.dataMax);
                max = arrayMin(maxArgs);
                if (minRange > max - min) {
                    minArgs[0] = max - minRange;
                    minArgs[1] = pick(options.min, max - minRange);
                    min = arrayMax(minArgs);
                }
            }
            axis.min = min;
            axis.max = max;
        },
        setAxisTranslation: function(saveOld) {
            var closestPointRange, ordinalCorrection, axis = this, range = axis.max - axis.min, pointRange = axis.axisPointRange || 0, minPointOffset = 0, pointRangePadding = 0, linkedParent = axis.linkedParent, hasCategories = !!axis.categories, transA = axis.transA;
            if (axis.isXAxis || hasCategories || pointRange) {
                if (linkedParent) {
                    minPointOffset = linkedParent.minPointOffset;
                    pointRangePadding = linkedParent.pointRangePadding;
                } else each(axis.series, function(series) {
                    var seriesPointRange = hasCategories ? 1 : axis.isXAxis ? series.pointRange : axis.axisPointRange || 0, pointPlacement = series.options.pointPlacement, seriesClosestPointRange = series.closestPointRange;
                    seriesPointRange > range && (seriesPointRange = 0);
                    pointRange = mathMax(pointRange, seriesPointRange);
                    minPointOffset = mathMax(minPointOffset, isString(pointPlacement) ? 0 : seriesPointRange / 2);
                    pointRangePadding = mathMax(pointRangePadding, "on" === pointPlacement ? 0 : seriesPointRange);
                    !series.noSharedTooltip && defined(seriesClosestPointRange) && (closestPointRange = defined(closestPointRange) ? mathMin(closestPointRange, seriesClosestPointRange) : seriesClosestPointRange);
                });
                ordinalCorrection = axis.ordinalSlope && closestPointRange ? axis.ordinalSlope / closestPointRange : 1;
                axis.minPointOffset = minPointOffset *= ordinalCorrection;
                axis.pointRangePadding = pointRangePadding *= ordinalCorrection;
                axis.pointRange = mathMin(pointRange, range);
                axis.closestPointRange = closestPointRange;
            }
            saveOld && (axis.oldTransA = transA);
            axis.translationSlope = axis.transA = transA = axis.len / (range + pointRangePadding || 1);
            axis.transB = axis.horiz ? axis.left : axis.bottom;
            axis.minPixelPadding = transA * minPointOffset;
        },
        setTickPositions: function(secondPass) {
            var length, linkedParentExtremes, tickPositions, keepTwoTicksOnly, axis = this, chart = axis.chart, options = axis.options, isLog = axis.isLog, isDatetimeAxis = axis.isDatetimeAxis, isXAxis = axis.isXAxis, isLinked = axis.isLinked, tickPositioner = axis.options.tickPositioner, maxPadding = options.maxPadding, minPadding = options.minPadding, tickIntervalOption = options.tickInterval, minTickIntervalOption = options.minTickInterval, tickPixelIntervalOption = options.tickPixelInterval, categories = axis.categories;
            if (isLinked) {
                axis.linkedParent = chart[axis.coll][options.linkedTo];
                linkedParentExtremes = axis.linkedParent.getExtremes();
                axis.min = pick(linkedParentExtremes.min, linkedParentExtremes.dataMin);
                axis.max = pick(linkedParentExtremes.max, linkedParentExtremes.dataMax);
                options.type !== axis.linkedParent.options.type && error(11, 1);
            } else {
                axis.min = pick(axis.userMin, options.min, axis.dataMin);
                axis.max = pick(axis.userMax, options.max, axis.dataMax);
            }
            if (isLog) {
                !secondPass && 0 >= mathMin(axis.min, pick(axis.dataMin, axis.min)) && error(10, 1);
                axis.min = correctFloat(log2lin(axis.min));
                axis.max = correctFloat(log2lin(axis.max));
            }
            if (axis.range && defined(axis.max)) {
                axis.userMin = axis.min = mathMax(axis.min, axis.max - axis.range);
                axis.userMax = axis.max;
                axis.range = null;
            }
            axis.beforePadding && axis.beforePadding();
            axis.adjustForMinRange();
            if (!categories && !axis.axisPointRange && !axis.usePercentage && !isLinked && defined(axis.min) && defined(axis.max)) {
                length = axis.max - axis.min;
                if (length) {
                    defined(options.min) || defined(axis.userMin) || !minPadding || !(0 > axis.dataMin) && axis.ignoreMinPadding || (axis.min -= length * minPadding);
                    defined(options.max) || defined(axis.userMax) || !maxPadding || !(axis.dataMax > 0) && axis.ignoreMaxPadding || (axis.max += length * maxPadding);
                }
            }
            isNumber(options.floor) && (axis.min = mathMax(axis.min, options.floor));
            isNumber(options.ceiling) && (axis.max = mathMin(axis.max, options.ceiling));
            if (axis.min === axis.max || void 0 === axis.min || void 0 === axis.max) axis.tickInterval = 1; else if (isLinked && !tickIntervalOption && tickPixelIntervalOption === axis.linkedParent.options.tickPixelInterval) axis.tickInterval = axis.linkedParent.tickInterval; else {
                axis.tickInterval = pick(tickIntervalOption, categories ? 1 : (axis.max - axis.min) * tickPixelIntervalOption / mathMax(axis.len, tickPixelIntervalOption));
                if (!defined(tickIntervalOption) && tickPixelIntervalOption > axis.len && !this.isRadial && !this.isLog && !categories && options.startOnTick && options.endOnTick) {
                    keepTwoTicksOnly = true;
                    axis.tickInterval /= 4;
                }
            }
            isXAxis && !secondPass && each(axis.series, function(series) {
                series.processData(axis.min !== axis.oldMin || axis.max !== axis.oldMax);
            });
            axis.setAxisTranslation(true);
            axis.beforeSetTickPositions && axis.beforeSetTickPositions();
            axis.postProcessTickInterval && (axis.tickInterval = axis.postProcessTickInterval(axis.tickInterval));
            axis.pointRange && (axis.tickInterval = mathMax(axis.pointRange, axis.tickInterval));
            !tickIntervalOption && minTickIntervalOption > axis.tickInterval && (axis.tickInterval = minTickIntervalOption);
            isDatetimeAxis || isLog || tickIntervalOption || (axis.tickInterval = normalizeTickInterval(axis.tickInterval, null, getMagnitude(axis.tickInterval), options));
            axis.minorTickInterval = "auto" === options.minorTickInterval && axis.tickInterval ? axis.tickInterval / 5 : options.minorTickInterval;
            axis.tickPositions = tickPositions = options.tickPositions ? [].concat(options.tickPositions) : tickPositioner && tickPositioner.apply(axis, [ axis.min, axis.max ]);
            if (!tickPositions) {
                !axis.ordinalPositions && (axis.max - axis.min) / axis.tickInterval > mathMax(2 * axis.len, 200) && error(19, true);
                tickPositions = isDatetimeAxis ? axis.getTimeTicks(axis.normalizeTimeTickInterval(axis.tickInterval, options.units), axis.min, axis.max, options.startOfWeek, axis.ordinalPositions, axis.closestPointRange, true) : isLog ? axis.getLogTickPositions(axis.tickInterval, axis.min, axis.max) : axis.getLinearTickPositions(axis.tickInterval, axis.min, axis.max);
                keepTwoTicksOnly && tickPositions.splice(1, tickPositions.length - 2);
                axis.tickPositions = tickPositions;
            }
            if (!isLinked) {
                var singlePad, roundedMin = tickPositions[0], roundedMax = tickPositions[tickPositions.length - 1], minPointOffset = axis.minPointOffset || 0;
                options.startOnTick ? axis.min = roundedMin : axis.min - minPointOffset > roundedMin && tickPositions.shift();
                options.endOnTick ? axis.max = roundedMax : roundedMax > axis.max + minPointOffset && tickPositions.pop();
                if (1 === tickPositions.length) {
                    singlePad = mathAbs(axis.max) > 1e13 ? 1 : .001;
                    axis.min -= singlePad;
                    axis.max += singlePad;
                }
            }
        },
        setMaxTicks: function() {
            var chart = this.chart, maxTicks = chart.maxTicks || {}, tickPositions = this.tickPositions, key = this._maxTicksKey = [ this.coll, this.pos, this.len ].join("-");
            !this.isLinked && !this.isDatetimeAxis && tickPositions && tickPositions.length > (maxTicks[key] || 0) && false !== this.options.alignTicks && (maxTicks[key] = tickPositions.length);
            chart.maxTicks = maxTicks;
        },
        adjustTickAmount: function() {
            var axis = this, chart = axis.chart, key = axis._maxTicksKey, tickPositions = axis.tickPositions, maxTicks = chart.maxTicks;
            if (maxTicks && maxTicks[key] && !axis.isDatetimeAxis && !axis.categories && !axis.isLinked && false !== axis.options.alignTicks && this.min !== UNDEFINED) {
                var tickAmount, oldTickAmount = axis.tickAmount, calculatedTickAmount = tickPositions.length;
                axis.tickAmount = tickAmount = maxTicks[key];
                if (tickAmount > calculatedTickAmount) {
                    while (tickAmount > tickPositions.length) tickPositions.push(correctFloat(tickPositions[tickPositions.length - 1] + axis.tickInterval));
                    axis.transA *= (calculatedTickAmount - 1) / (tickAmount - 1);
                    axis.max = tickPositions[tickPositions.length - 1];
                }
                defined(oldTickAmount) && tickAmount !== oldTickAmount && (axis.isDirty = true);
            }
        },
        setScale: function() {
            var type, i, isDirtyData, isDirtyAxisLength, axis = this, stacks = axis.stacks;
            axis.oldMin = axis.min;
            axis.oldMax = axis.max;
            axis.oldAxisLength = axis.len;
            axis.setAxisSize();
            isDirtyAxisLength = axis.len !== axis.oldAxisLength;
            each(axis.series, function(series) {
                (series.isDirtyData || series.isDirty || series.xAxis.isDirty) && (isDirtyData = true);
            });
            if (isDirtyAxisLength || isDirtyData || axis.isLinked || axis.forceRedraw || axis.userMin !== axis.oldUserMin || axis.userMax !== axis.oldUserMax) {
                if (!axis.isXAxis) for (type in stacks) for (i in stacks[type]) {
                    stacks[type][i].total = null;
                    stacks[type][i].cum = 0;
                }
                axis.forceRedraw = false;
                axis.getSeriesExtremes();
                axis.setTickPositions();
                axis.oldUserMin = axis.userMin;
                axis.oldUserMax = axis.userMax;
                axis.isDirty || (axis.isDirty = isDirtyAxisLength || axis.min !== axis.oldMin || axis.max !== axis.oldMax);
            } else if (!axis.isXAxis) {
                axis.oldStacks && (stacks = axis.stacks = axis.oldStacks);
                for (type in stacks) for (i in stacks[type]) stacks[type][i].cum = stacks[type][i].total;
            }
            axis.setMaxTicks();
        },
        setExtremes: function(newMin, newMax, redraw, animation, eventArguments) {
            var axis = this, chart = axis.chart;
            redraw = pick(redraw, true);
            eventArguments = extend(eventArguments, {
                min: newMin,
                max: newMax
            });
            fireEvent(axis, "setExtremes", eventArguments, function() {
                axis.userMin = newMin;
                axis.userMax = newMax;
                axis.eventArgs = eventArguments;
                axis.isDirtyExtremes = true;
                redraw && chart.redraw(animation);
            });
        },
        zoom: function(newMin, newMax) {
            var dataMin = this.dataMin, dataMax = this.dataMax, options = this.options;
            if (!this.allowZoomOutside) {
                defined(dataMin) && mathMin(dataMin, pick(options.min, dataMin)) >= newMin && (newMin = UNDEFINED);
                defined(dataMax) && newMax >= mathMax(dataMax, pick(options.max, dataMax)) && (newMax = UNDEFINED);
            }
            this.displayBtn = newMin !== UNDEFINED || newMax !== UNDEFINED;
            this.setExtremes(newMin, newMax, false, UNDEFINED, {
                trigger: "zoom"
            });
            return true;
        },
        setAxisSize: function() {
            var chart = this.chart, options = this.options, offsetLeft = options.offsetLeft || 0, offsetRight = options.offsetRight || 0, horiz = this.horiz, width = pick(options.width, chart.plotWidth - offsetLeft + offsetRight), height = pick(options.height, chart.plotHeight), top = pick(options.top, chart.plotTop), left = pick(options.left, chart.plotLeft + offsetLeft), percentRegex = /%$/;
            percentRegex.test(height) && (height = parseInt(height, 10) / 100 * chart.plotHeight);
            percentRegex.test(top) && (top = parseInt(top, 10) / 100 * chart.plotHeight + chart.plotTop);
            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
            this.bottom = chart.chartHeight - height - top;
            this.right = chart.chartWidth - width - left;
            this.len = mathMax(horiz ? width : height, 0);
            this.pos = horiz ? left : top;
        },
        getExtremes: function() {
            var axis = this, isLog = axis.isLog;
            return {
                min: isLog ? correctFloat(lin2log(axis.min)) : axis.min,
                max: isLog ? correctFloat(lin2log(axis.max)) : axis.max,
                dataMin: axis.dataMin,
                dataMax: axis.dataMax,
                userMin: axis.userMin,
                userMax: axis.userMax
            };
        },
        getThreshold: function(threshold) {
            var axis = this, isLog = axis.isLog;
            var realMin = isLog ? lin2log(axis.min) : axis.min, realMax = isLog ? lin2log(axis.max) : axis.max;
            realMin > threshold || null === threshold ? threshold = realMin : threshold > realMax && (threshold = realMax);
            return axis.translate(threshold, 0, 1, 0, 1);
        },
        autoLabelAlign: function(rotation) {
            var ret, angle = (pick(rotation, 0) - 90 * this.side + 720) % 360;
            ret = angle > 15 && 165 > angle ? "right" : angle > 195 && 345 > angle ? "left" : "center";
            return ret;
        },
        getOffset: function() {
            var hasData, showAxis, titleOffsetOption, n, i, sortedPositions, lastRight, overlap, pos, bBox, x, w, lineNo, axis = this, chart = axis.chart, renderer = chart.renderer, options = axis.options, tickPositions = axis.tickPositions, ticks = axis.ticks, horiz = axis.horiz, side = axis.side, invertedSide = chart.inverted ? [ 1, 0, 3, 2 ][side] : side, titleOffset = 0, titleMargin = 0, axisTitleOptions = options.title, labelOptions = options.labels, labelOffset = 0, axisOffset = chart.axisOffset, clipOffset = chart.clipOffset, directionFactor = [ -1, 1, 1, -1 ][side], autoStaggerLines = 1, maxStaggerLines = pick(labelOptions.maxStaggerLines, 5), lineHeightCorrection = 2 === side ? renderer.fontMetrics(labelOptions.style.fontSize).b : 0;
            axis.hasData = hasData = axis.hasVisibleSeries || defined(axis.min) && defined(axis.max) && !!tickPositions;
            axis.showAxis = showAxis = hasData || pick(options.showEmpty, true);
            axis.staggerLines = axis.horiz && labelOptions.staggerLines;
            if (!axis.axisGroup) {
                axis.gridGroup = renderer.g("grid").attr({
                    zIndex: options.gridZIndex || 1
                }).add();
                axis.axisGroup = renderer.g("axis").attr({
                    zIndex: options.zIndex || 2
                }).add();
                axis.labelGroup = renderer.g("axis-labels").attr({
                    zIndex: labelOptions.zIndex || 7
                }).addClass(PREFIX + axis.coll.toLowerCase() + "-labels").add();
            }
            if (hasData || axis.isLinked) {
                axis.labelAlign = pick(labelOptions.align || axis.autoLabelAlign(labelOptions.rotation));
                each(tickPositions, function(pos) {
                    ticks[pos] ? ticks[pos].addLabel() : ticks[pos] = new Tick(axis, pos);
                });
                if (axis.horiz && !axis.staggerLines && maxStaggerLines && !labelOptions.rotation) {
                    sortedPositions = axis.reversed ? [].concat(tickPositions).reverse() : tickPositions;
                    while (maxStaggerLines > autoStaggerLines) {
                        lastRight = [];
                        overlap = false;
                        for (i = 0; sortedPositions.length > i; i++) {
                            pos = sortedPositions[i];
                            bBox = ticks[pos].label && ticks[pos].label.getBBox();
                            w = bBox ? bBox.width : 0;
                            lineNo = i % autoStaggerLines;
                            if (w) {
                                x = axis.translate(pos);
                                lastRight[lineNo] !== UNDEFINED && lastRight[lineNo] > x && (overlap = true);
                                lastRight[lineNo] = x + w;
                            }
                        }
                        if (!overlap) break;
                        autoStaggerLines++;
                    }
                    autoStaggerLines > 1 && (axis.staggerLines = autoStaggerLines);
                }
                each(tickPositions, function(pos) {
                    (0 === side || 2 === side || {
                        1: "left",
                        3: "right"
                    }[side] === axis.labelAlign) && (labelOffset = mathMax(ticks[pos].getLabelSize(), labelOffset));
                });
                if (axis.staggerLines) {
                    labelOffset *= axis.staggerLines;
                    axis.labelOffset = labelOffset;
                }
            } else for (n in ticks) {
                ticks[n].destroy();
                delete ticks[n];
            }
            if (axisTitleOptions && axisTitleOptions.text && false !== axisTitleOptions.enabled) {
                if (!axis.axisTitle) {
                    axis.axisTitle = renderer.text(axisTitleOptions.text, 0, 0, axisTitleOptions.useHTML).attr({
                        zIndex: 7,
                        rotation: axisTitleOptions.rotation || 0,
                        align: axisTitleOptions.textAlign || {
                            low: "left",
                            middle: "center",
                            high: "right"
                        }[axisTitleOptions.align]
                    }).addClass(PREFIX + this.coll.toLowerCase() + "-title").css(axisTitleOptions.style).add(axis.axisGroup);
                    axis.axisTitle.isNew = true;
                }
                if (showAxis) {
                    titleOffset = axis.axisTitle.getBBox()[horiz ? "height" : "width"];
                    titleMargin = pick(axisTitleOptions.margin, horiz ? 5 : 10);
                    titleOffsetOption = axisTitleOptions.offset;
                }
                axis.axisTitle[showAxis ? "show" : "hide"]();
            }
            axis.offset = directionFactor * pick(options.offset, axisOffset[side]);
            axis.axisTitleMargin = pick(titleOffsetOption, labelOffset + titleMargin + (labelOffset && directionFactor * options.labels[horiz ? "y" : "x"] - lineHeightCorrection));
            axisOffset[side] = mathMax(axisOffset[side], axis.axisTitleMargin + titleOffset + directionFactor * axis.offset);
            clipOffset[invertedSide] = mathMax(clipOffset[invertedSide], 2 * mathFloor(options.lineWidth / 2));
        },
        getLinePath: function(lineWidth) {
            var chart = this.chart, opposite = this.opposite, offset = this.offset, horiz = this.horiz, lineLeft = this.left + (opposite ? this.width : 0) + offset, lineTop = chart.chartHeight - this.bottom - (opposite ? this.height : 0) + offset;
            opposite && (lineWidth *= -1);
            return chart.renderer.crispLine([ M, horiz ? this.left : lineLeft, horiz ? lineTop : this.top, L, horiz ? chart.chartWidth - this.right : lineLeft, horiz ? lineTop : chart.chartHeight - this.bottom ], lineWidth);
        },
        getTitlePosition: function() {
            var horiz = this.horiz, axisLeft = this.left, axisTop = this.top, axisLength = this.len, axisTitleOptions = this.options.title, margin = horiz ? axisLeft : axisTop, opposite = this.opposite, offset = this.offset, fontSize = pInt(axisTitleOptions.style.fontSize || 12), alongAxis = {
                low: margin + (horiz ? 0 : axisLength),
                middle: margin + axisLength / 2,
                high: margin + (horiz ? axisLength : 0)
            }[axisTitleOptions.align], offAxis = (horiz ? axisTop + this.height : axisLeft) + (horiz ? 1 : -1) * (opposite ? -1 : 1) * this.axisTitleMargin + (2 === this.side ? fontSize : 0);
            return {
                x: horiz ? alongAxis : offAxis + (opposite ? this.width : 0) + offset + (axisTitleOptions.x || 0),
                y: horiz ? offAxis - (opposite ? this.height : 0) + offset : alongAxis + (axisTitleOptions.y || 0)
            };
        },
        render: function() {
            var sortedPositions, linePath, from, to, axis = this, horiz = axis.horiz, reversed = axis.reversed, chart = axis.chart, renderer = chart.renderer, options = axis.options, isLog = axis.isLog, isLinked = axis.isLinked, tickPositions = axis.tickPositions, axisTitle = axis.axisTitle, ticks = axis.ticks, minorTicks = axis.minorTicks, alternateBands = axis.alternateBands, stackLabelOptions = options.stackLabels, alternateGridColor = options.alternateGridColor, tickmarkOffset = axis.tickmarkOffset, lineWidth = options.lineWidth, hasRendered = chart.hasRendered, slideInTicks = hasRendered && defined(axis.oldMin) && !isNaN(axis.oldMin), hasData = axis.hasData, showAxis = axis.showAxis, overflow = options.labels.overflow, justifyLabels = axis.justifyLabels = horiz && false !== overflow;
            axis.labelEdge.length = 0;
            axis.justifyToPlot = "justify" === overflow;
            each([ ticks, minorTicks, alternateBands ], function(coll) {
                var pos;
                for (pos in coll) coll[pos].isActive = false;
            });
            if (hasData || isLinked) {
                axis.minorTickInterval && !axis.categories && each(axis.getMinorTickPositions(), function(pos) {
                    minorTicks[pos] || (minorTicks[pos] = new Tick(axis, pos, "minor"));
                    slideInTicks && minorTicks[pos].isNew && minorTicks[pos].render(null, true);
                    minorTicks[pos].render(null, false, 1);
                });
                if (tickPositions.length) {
                    sortedPositions = tickPositions.slice();
                    (horiz && reversed || !horiz && !reversed) && sortedPositions.reverse();
                    justifyLabels && (sortedPositions = sortedPositions.slice(1).concat([ sortedPositions[0] ]));
                    each(sortedPositions, function(pos, i) {
                        justifyLabels && (i = i === sortedPositions.length - 1 ? 0 : i + 1);
                        if (!isLinked || pos >= axis.min && axis.max >= pos) {
                            ticks[pos] || (ticks[pos] = new Tick(axis, pos));
                            slideInTicks && ticks[pos].isNew && ticks[pos].render(i, true, .1);
                            ticks[pos].render(i, false, 1);
                        }
                    });
                    if (tickmarkOffset && 0 === axis.min) {
                        ticks[-1] || (ticks[-1] = new Tick(axis, -1, null, true));
                        ticks[-1].render(-1);
                    }
                }
                alternateGridColor && each(tickPositions, function(pos, i) {
                    if (0 === i % 2 && axis.max > pos) {
                        alternateBands[pos] || (alternateBands[pos] = new Highcharts.PlotLineOrBand(axis));
                        from = pos + tickmarkOffset;
                        to = tickPositions[i + 1] !== UNDEFINED ? tickPositions[i + 1] + tickmarkOffset : axis.max;
                        alternateBands[pos].options = {
                            from: isLog ? lin2log(from) : from,
                            to: isLog ? lin2log(to) : to,
                            color: alternateGridColor
                        };
                        alternateBands[pos].render();
                        alternateBands[pos].isActive = true;
                    }
                });
                if (!axis._addedPlotLB) {
                    each((options.plotLines || []).concat(options.plotBands || []), function(plotLineOptions) {
                        axis.addPlotBandOrLine(plotLineOptions);
                    });
                    axis._addedPlotLB = true;
                }
            }
            each([ ticks, minorTicks, alternateBands ], function(coll) {
                var pos, i, forDestruction = [], delay = globalAnimation ? globalAnimation.duration || 500 : 0, destroyInactiveItems = function() {
                    i = forDestruction.length;
                    while (i--) if (coll[forDestruction[i]] && !coll[forDestruction[i]].isActive) {
                        coll[forDestruction[i]].destroy();
                        delete coll[forDestruction[i]];
                    }
                };
                for (pos in coll) if (!coll[pos].isActive) {
                    coll[pos].render(pos, false, 0);
                    coll[pos].isActive = false;
                    forDestruction.push(pos);
                }
                coll !== alternateBands && chart.hasRendered && delay ? delay && setTimeout(destroyInactiveItems, delay) : destroyInactiveItems();
            });
            if (lineWidth) {
                linePath = axis.getLinePath(lineWidth);
                axis.axisLine ? axis.axisLine.animate({
                    d: linePath
                }) : axis.axisLine = renderer.path(linePath).attr({
                    stroke: options.lineColor,
                    "stroke-width": lineWidth,
                    zIndex: 7
                }).add(axis.axisGroup);
                axis.axisLine[showAxis ? "show" : "hide"]();
            }
            if (axisTitle && showAxis) {
                axisTitle[axisTitle.isNew ? "attr" : "animate"](axis.getTitlePosition());
                axisTitle.isNew = false;
            }
            stackLabelOptions && stackLabelOptions.enabled && axis.renderStackTotals();
            axis.isDirty = false;
        },
        redraw: function() {
            var axis = this, chart = axis.chart, pointer = chart.pointer;
            pointer && pointer.reset(true);
            axis.render();
            each(axis.plotLinesAndBands, function(plotLine) {
                plotLine.render();
            });
            each(axis.series, function(series) {
                series.isDirty = true;
            });
        },
        destroy: function(keepEvents) {
            var stackKey, i, axis = this, stacks = axis.stacks, plotLinesAndBands = axis.plotLinesAndBands;
            keepEvents || removeEvent(axis);
            for (stackKey in stacks) {
                destroyObjectProperties(stacks[stackKey]);
                stacks[stackKey] = null;
            }
            each([ axis.ticks, axis.minorTicks, axis.alternateBands ], function(coll) {
                destroyObjectProperties(coll);
            });
            i = plotLinesAndBands.length;
            while (i--) plotLinesAndBands[i].destroy();
            each([ "stackTotalGroup", "axisLine", "axisTitle", "axisGroup", "cross", "gridGroup", "labelGroup" ], function(prop) {
                axis[prop] && (axis[prop] = axis[prop].destroy());
            });
            this.cross && this.cross.destroy();
        },
        drawCrosshair: function(e, point) {
            if (!this.crosshair) return;
            if (false === (defined(point) || !pick(this.crosshair.snap, true))) {
                this.hideCrosshair();
                return;
            }
            var path, pos, options = this.crosshair, animation = options.animation;
            pick(options.snap, true) ? defined(point) && (pos = this.chart.inverted != this.horiz ? point.plotX : this.len - point.plotY) : pos = this.horiz ? e.chartX - this.pos : this.len - e.chartY + this.pos;
            path = this.isRadial ? this.getPlotLinePath(this.isXAxis ? point.x : pick(point.stackY, point.y)) : this.getPlotLinePath(null, null, null, null, pos);
            if (null === path) {
                this.hideCrosshair();
                return;
            }
            if (this.cross) this.cross.attr({
                visibility: VISIBLE
            })[animation ? "animate" : "attr"]({
                d: path
            }, animation); else {
                var attribs = {
                    "stroke-width": options.width || 1,
                    stroke: options.color || "#C0C0C0",
                    zIndex: options.zIndex || 2
                };
                options.dashStyle && (attribs.dashstyle = options.dashStyle);
                this.cross = this.chart.renderer.path(path).attr(attribs).add();
            }
        },
        hideCrosshair: function() {
            this.cross && this.cross.hide();
        }
    };
    extend(Axis.prototype, AxisPlotLineOrBandExtension);
    Axis.prototype.getTimeTicks = function(normalizedInterval, min, max, startOfWeek) {
        var i, minYear, tickPositions = [], higherRanks = {}, useUTC = defaultOptions.global.useUTC, minDate = new Date(min - timezoneOffset), interval = normalizedInterval.unitRange, count = normalizedInterval.count;
        if (defined(min)) {
            if (interval >= timeUnits[SECOND]) {
                minDate.setMilliseconds(0);
                minDate.setSeconds(interval >= timeUnits[MINUTE] ? 0 : count * mathFloor(minDate.getSeconds() / count));
            }
            interval >= timeUnits[MINUTE] && minDate[setMinutes](interval >= timeUnits[HOUR] ? 0 : count * mathFloor(minDate[getMinutes]() / count));
            interval >= timeUnits[HOUR] && minDate[setHours](interval >= timeUnits[DAY] ? 0 : count * mathFloor(minDate[getHours]() / count));
            interval >= timeUnits[DAY] && minDate[setDate](interval >= timeUnits[MONTH] ? 1 : count * mathFloor(minDate[getDate]() / count));
            if (interval >= timeUnits[MONTH]) {
                minDate[setMonth](interval >= timeUnits[YEAR] ? 0 : count * mathFloor(minDate[getMonth]() / count));
                minYear = minDate[getFullYear]();
            }
            if (interval >= timeUnits[YEAR]) {
                minYear -= minYear % count;
                minDate[setFullYear](minYear);
            }
            interval === timeUnits[WEEK] && minDate[setDate](minDate[getDate]() - minDate[getDay]() + pick(startOfWeek, 1));
            i = 1;
            timezoneOffset && (minDate = new Date(minDate.getTime() + timezoneOffset));
            minYear = minDate[getFullYear]();
            var time = minDate.getTime(), minMonth = minDate[getMonth](), minDateDate = minDate[getDate](), localTimezoneOffset = useUTC ? timezoneOffset : (864e5 + 1e3 * 60 * minDate.getTimezoneOffset()) % 864e5;
            while (max > time) {
                tickPositions.push(time);
                interval === timeUnits[YEAR] ? time = makeTime(minYear + i * count, 0) : interval === timeUnits[MONTH] ? time = makeTime(minYear, minMonth + i * count) : useUTC || interval !== timeUnits[DAY] && interval !== timeUnits[WEEK] ? time += interval * count : time = makeTime(minYear, minMonth, minDateDate + i * count * (interval === timeUnits[DAY] ? 1 : 7));
                i++;
            }
            tickPositions.push(time);
            each(grep(tickPositions, function(time) {
                return timeUnits[HOUR] >= interval && time % timeUnits[DAY] === localTimezoneOffset;
            }), function(time) {
                higherRanks[time] = DAY;
            });
        }
        tickPositions.info = extend(normalizedInterval, {
            higherRanks: higherRanks,
            totalRange: interval * count
        });
        return tickPositions;
    };
    Axis.prototype.normalizeTimeTickInterval = function(tickInterval, unitsOption) {
        var count, i, units = unitsOption || [ [ MILLISECOND, [ 1, 2, 5, 10, 20, 25, 50, 100, 200, 500 ] ], [ SECOND, [ 1, 2, 5, 10, 15, 30 ] ], [ MINUTE, [ 1, 2, 5, 10, 15, 30 ] ], [ HOUR, [ 1, 2, 3, 4, 6, 8, 12 ] ], [ DAY, [ 1, 2 ] ], [ WEEK, [ 1, 2 ] ], [ MONTH, [ 1, 2, 3, 4, 6 ] ], [ YEAR, null ] ], unit = units[units.length - 1], interval = timeUnits[unit[0]], multiples = unit[1];
        for (i = 0; units.length > i; i++) {
            unit = units[i];
            interval = timeUnits[unit[0]];
            multiples = unit[1];
            if (units[i + 1]) {
                var lessThan = (interval * multiples[multiples.length - 1] + timeUnits[units[i + 1][0]]) / 2;
                if (lessThan >= tickInterval) break;
            }
        }
        interval === timeUnits[YEAR] && 5 * interval > tickInterval && (multiples = [ 1, 2, 5 ]);
        count = normalizeTickInterval(tickInterval / interval, multiples, unit[0] === YEAR ? mathMax(getMagnitude(tickInterval / interval), 1) : 1);
        return {
            unitRange: interval,
            count: count,
            unitName: unit[0]
        };
    };
    Axis.prototype.getLogTickPositions = function(interval, min, max, minor) {
        var axis = this, options = axis.options, axisLength = axis.len, positions = [];
        minor || (axis._minorAutoInterval = null);
        if (interval >= .5) {
            interval = mathRound(interval);
            positions = axis.getLinearTickPositions(interval, min, max);
        } else if (interval >= .08) {
            var intermediate, i, j, len, pos, lastPos, break2, roundedMin = mathFloor(min);
            intermediate = interval > .3 ? [ 1, 2, 4 ] : interval > .15 ? [ 1, 2, 4, 6, 8 ] : [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
            for (i = roundedMin; max + 1 > i && !break2; i++) {
                len = intermediate.length;
                for (j = 0; len > j && !break2; j++) {
                    pos = log2lin(lin2log(i) * intermediate[j]);
                    pos > min && (!minor || max >= lastPos) && positions.push(lastPos);
                    lastPos > max && (break2 = true);
                    lastPos = pos;
                }
            }
        } else {
            var realMin = lin2log(min), realMax = lin2log(max), tickIntervalOption = options[minor ? "minorTickInterval" : "tickInterval"], filteredTickIntervalOption = "auto" === tickIntervalOption ? null : tickIntervalOption, tickPixelIntervalOption = options.tickPixelInterval / (minor ? 5 : 1), totalPixelLength = minor ? axisLength / axis.tickPositions.length : axisLength;
            interval = pick(filteredTickIntervalOption, axis._minorAutoInterval, (realMax - realMin) * tickPixelIntervalOption / (totalPixelLength || 1));
            interval = normalizeTickInterval(interval, null, getMagnitude(interval));
            positions = map(axis.getLinearTickPositions(interval, realMin, realMax), log2lin);
            minor || (axis._minorAutoInterval = interval / 5);
        }
        minor || (axis.tickInterval = interval);
        return positions;
    };
    var Tooltip = Highcharts.Tooltip = function() {
        this.init.apply(this, arguments);
    };
    Tooltip.prototype = {
        init: function(chart, options) {
            var borderWidth = options.borderWidth, style = options.style, padding = pInt(style.padding);
            this.chart = chart;
            this.options = options;
            this.crosshairs = [];
            this.now = {
                x: 0,
                y: 0
            };
            this.isHidden = true;
            this.label = chart.renderer.label("", 0, 0, options.shape || "callout", null, null, options.useHTML, null, "tooltip").attr({
                padding: padding,
                fill: options.backgroundColor,
                "stroke-width": borderWidth,
                r: options.borderRadius,
                zIndex: 8
            }).css(style).css({
                padding: 0
            }).add().attr({
                y: -9999
            });
            useCanVG || this.label.shadow(options.shadow);
            this.shared = options.shared;
        },
        destroy: function() {
            this.label && (this.label = this.label.destroy());
            clearTimeout(this.hideTimer);
            clearTimeout(this.tooltipTimeout);
        },
        move: function(x, y, anchorX, anchorY) {
            var tooltip = this, now = tooltip.now, animate = false !== tooltip.options.animation && !tooltip.isHidden, skipAnchor = tooltip.followPointer || tooltip.len > 1;
            extend(now, {
                x: animate ? (2 * now.x + x) / 3 : x,
                y: animate ? (now.y + y) / 2 : y,
                anchorX: skipAnchor ? UNDEFINED : animate ? (2 * now.anchorX + anchorX) / 3 : anchorX,
                anchorY: skipAnchor ? UNDEFINED : animate ? (now.anchorY + anchorY) / 2 : anchorY
            });
            tooltip.label.attr(now);
            if (animate && (mathAbs(x - now.x) > 1 || mathAbs(y - now.y) > 1)) {
                clearTimeout(this.tooltipTimeout);
                this.tooltipTimeout = setTimeout(function() {
                    tooltip && tooltip.move(x, y, anchorX, anchorY);
                }, 32);
            }
        },
        hide: function() {
            var hoverPoints, tooltip = this;
            clearTimeout(this.hideTimer);
            if (!this.isHidden) {
                hoverPoints = this.chart.hoverPoints;
                this.hideTimer = setTimeout(function() {
                    tooltip.label.fadeOut();
                    tooltip.isHidden = true;
                }, pick(this.options.hideDelay, 500));
                hoverPoints && each(hoverPoints, function(point) {
                    point.setState();
                });
                this.chart.hoverPoints = null;
            }
        },
        getAnchor: function(points, mouseEvent) {
            var ret, yAxis, chart = this.chart, inverted = chart.inverted, plotTop = chart.plotTop, plotX = 0, plotY = 0;
            points = splat(points);
            ret = points[0].tooltipPos;
            if (this.followPointer && mouseEvent) {
                mouseEvent.chartX === UNDEFINED && (mouseEvent = chart.pointer.normalize(mouseEvent));
                ret = [ mouseEvent.chartX - chart.plotLeft, mouseEvent.chartY - plotTop ];
            }
            if (!ret) {
                each(points, function(point) {
                    yAxis = point.series.yAxis;
                    plotX += point.plotX;
                    plotY += (point.plotLow ? (point.plotLow + point.plotHigh) / 2 : point.plotY) + (!inverted && yAxis ? yAxis.top - plotTop : 0);
                });
                plotX /= points.length;
                plotY /= points.length;
                ret = [ inverted ? chart.plotWidth - plotY : plotX, this.shared && !inverted && points.length > 1 && mouseEvent ? mouseEvent.chartY - plotTop : inverted ? chart.plotHeight - plotX : plotY ];
            }
            return map(ret, mathRound);
        },
        getPosition: function(boxWidth, boxHeight, point) {
            var swapped, chart = this.chart, distance = this.distance, ret = {}, first = [ "y", chart.chartHeight, boxHeight, point.plotY + chart.plotTop ], second = [ "x", chart.chartWidth, boxWidth, point.plotX + chart.plotLeft ], preferFarSide = point.ttBelow || chart.inverted && !point.negative || !chart.inverted && point.negative, firstDimension = function(dim, outerSize, innerSize, point) {
                var roomLeft = point - distance > innerSize, roomRight = outerSize > point + distance + innerSize, alignedLeft = point - distance - innerSize, alignedRight = point + distance;
                if (preferFarSide && roomRight) ret[dim] = alignedRight; else if (!preferFarSide && roomLeft) ret[dim] = alignedLeft; else if (roomLeft) ret[dim] = alignedLeft; else {
                    if (!roomRight) return false;
                    ret[dim] = alignedRight;
                }
            }, secondDimension = function(dim, outerSize, innerSize, point) {
                if (distance > point || point > outerSize - distance) return false;
                ret[dim] = innerSize / 2 > point ? 1 : point > outerSize - innerSize / 2 ? outerSize - innerSize - 2 : point - innerSize / 2;
            }, swap = function(count) {
                var temp = first;
                first = second;
                second = temp;
                swapped = count;
            }, run = function() {
                if (false !== firstDimension.apply(0, first)) {
                    if (false === secondDimension.apply(0, second) && !swapped) {
                        swap(true);
                        run();
                    }
                } else if (swapped) ret.x = ret.y = 0; else {
                    swap(true);
                    run();
                }
            };
            (chart.inverted || this.len > 1) && swap();
            run();
            return ret;
        },
        defaultFormatter: function(tooltip) {
            var s, items = this.points || splat(this), series = items[0].series;
            s = [ tooltip.tooltipHeaderFormatter(items[0]) ];
            each(items, function(item) {
                series = item.series;
                s.push(series.tooltipFormatter && series.tooltipFormatter(item) || item.point.tooltipFormatter(series.tooltipOptions.pointFormat));
            });
            s.push(tooltip.options.footerFormat || "");
            return s.join("");
        },
        refresh: function(point, mouseEvent) {
            var x, y, anchor, text, borderColor, currentSeries, tooltip = this, chart = tooltip.chart, label = tooltip.label, options = tooltip.options, textConfig = {}, pointConfig = [], formatter = options.formatter || tooltip.defaultFormatter, hoverPoints = chart.hoverPoints, shared = tooltip.shared;
            clearTimeout(this.hideTimer);
            tooltip.followPointer = splat(point)[0].series.tooltipOptions.followPointer;
            anchor = tooltip.getAnchor(point, mouseEvent);
            x = anchor[0];
            y = anchor[1];
            if (!shared || point.series && point.series.noSharedTooltip) textConfig = point.getLabelConfig(); else {
                chart.hoverPoints = point;
                hoverPoints && each(hoverPoints, function(point) {
                    point.setState();
                });
                each(point, function(item) {
                    item.setState(HOVER_STATE);
                    pointConfig.push(item.getLabelConfig());
                });
                textConfig = {
                    x: point[0].category,
                    y: point[0].y
                };
                textConfig.points = pointConfig;
                this.len = pointConfig.length;
                point = point[0];
            }
            text = formatter.call(textConfig, tooltip);
            currentSeries = point.series;
            this.distance = pick(currentSeries.tooltipOptions.distance, 16);
            if (false === text) this.hide(); else {
                if (tooltip.isHidden) {
                    stop(label);
                    label.attr("opacity", 1).show();
                }
                label.attr({
                    text: text
                });
                borderColor = options.borderColor || point.color || currentSeries.color || "#606060";
                label.attr({
                    stroke: borderColor
                });
                tooltip.updatePosition({
                    plotX: x,
                    plotY: y,
                    negative: point.negative,
                    ttBelow: point.ttBelow
                });
                this.isHidden = false;
            }
            fireEvent(chart, "tooltipRefresh", {
                text: text,
                x: x + chart.plotLeft,
                y: y + chart.plotTop,
                borderColor: borderColor
            });
        },
        updatePosition: function(point) {
            var chart = this.chart, label = this.label, pos = (this.options.positioner || this.getPosition).call(this, label.width, label.height, point);
            this.move(mathRound(pos.x), mathRound(pos.y), point.plotX + chart.plotLeft, point.plotY + chart.plotTop);
        },
        tooltipHeaderFormatter: function(point) {
            var n, series = point.series, tooltipOptions = series.tooltipOptions, dateTimeLabelFormats = tooltipOptions.dateTimeLabelFormats, xDateFormat = tooltipOptions.xDateFormat, xAxis = series.xAxis, isDateTime = xAxis && "datetime" === xAxis.options.type && isNumber(point.key), headerFormat = tooltipOptions.headerFormat, closestPointRange = xAxis && xAxis.closestPointRange;
            if (isDateTime && !xDateFormat) {
                if (closestPointRange) {
                    for (n in timeUnits) if (timeUnits[n] >= closestPointRange || timeUnits[n] <= timeUnits[DAY] && point.key % timeUnits[n] > 0) {
                        xDateFormat = dateTimeLabelFormats[n];
                        break;
                    }
                } else xDateFormat = dateTimeLabelFormats.day;
                xDateFormat = xDateFormat || dateTimeLabelFormats.year;
            }
            isDateTime && xDateFormat && (headerFormat = headerFormat.replace("{point.key}", "{point.key:" + xDateFormat + "}"));
            return format(headerFormat, {
                point: point,
                series: series
            });
        }
    };
    var hoverChartIndex;
    hasTouch = doc.documentElement.ontouchstart !== UNDEFINED;
    var Pointer = Highcharts.Pointer = function(chart, options) {
        this.init(chart, options);
    };
    Pointer.prototype = {
        init: function(chart, options) {
            var zoomX, zoomY, chartOptions = options.chart, chartEvents = chartOptions.events, zoomType = useCanVG ? "" : chartOptions.zoomType, inverted = chart.inverted;
            this.options = options;
            this.chart = chart;
            this.zoomX = zoomX = /x/.test(zoomType);
            this.zoomY = zoomY = /y/.test(zoomType);
            this.zoomHor = zoomX && !inverted || zoomY && inverted;
            this.zoomVert = zoomY && !inverted || zoomX && inverted;
            this.hasZoom = zoomX || zoomY;
            this.runChartClick = chartEvents && !!chartEvents.click;
            this.pinchDown = [];
            this.lastValidTouch = {};
            if (Highcharts.Tooltip && options.tooltip.enabled) {
                chart.tooltip = new Tooltip(chart, options.tooltip);
                this.followTouchMove = options.tooltip.followTouchMove;
            }
            this.setDOMEvents();
        },
        normalize: function(e, chartPosition) {
            var chartX, chartY, ePos;
            e = e || window.event;
            e = washMouseEvent(e);
            e.target || (e.target = e.srcElement);
            ePos = e.touches ? e.touches.length ? e.touches.item(0) : e.changedTouches[0] : e;
            chartPosition || (this.chartPosition = chartPosition = offset(this.chart.container));
            if (ePos.pageX === UNDEFINED) {
                chartX = mathMax(e.x, e.clientX - chartPosition.left);
                chartY = e.y;
            } else {
                chartX = ePos.pageX - chartPosition.left;
                chartY = ePos.pageY - chartPosition.top;
            }
            return extend(e, {
                chartX: mathRound(chartX),
                chartY: mathRound(chartY)
            });
        },
        getCoordinates: function(e) {
            var coordinates = {
                xAxis: [],
                yAxis: []
            };
            each(this.chart.axes, function(axis) {
                coordinates[axis.isXAxis ? "xAxis" : "yAxis"].push({
                    axis: axis,
                    value: axis.toValue(e[axis.horiz ? "chartX" : "chartY"])
                });
            });
            return coordinates;
        },
        getIndex: function(e) {
            var chart = this.chart;
            return chart.inverted ? chart.plotHeight + chart.plotTop - e.chartY : e.chartX - chart.plotLeft;
        },
        runPointActions: function(e) {
            var followPointer, point, points, i, j, anchor, pointer = this, chart = pointer.chart, series = chart.series, tooltip = chart.tooltip, hoverPoint = chart.hoverPoint, hoverSeries = chart.hoverSeries, distance = chart.chartWidth, index = pointer.getIndex(e);
            if (tooltip && pointer.options.tooltip.shared && !(hoverSeries && hoverSeries.noSharedTooltip)) {
                points = [];
                i = series.length;
                for (j = 0; i > j; j++) if (series[j].visible && false !== series[j].options.enableMouseTracking && !series[j].noSharedTooltip && true !== series[j].singularTooltips && series[j].tooltipPoints.length) {
                    point = series[j].tooltipPoints[index];
                    if (point && point.series) {
                        point._dist = mathAbs(index - point.clientX);
                        distance = mathMin(distance, point._dist);
                        points.push(point);
                    }
                }
                i = points.length;
                while (i--) points[i]._dist > distance && points.splice(i, 1);
                if (points.length && points[0].clientX !== pointer.hoverX) {
                    tooltip.refresh(points, e);
                    pointer.hoverX = points[0].clientX;
                }
            }
            followPointer = hoverSeries && hoverSeries.tooltipOptions.followPointer;
            if (hoverSeries && hoverSeries.tracker && !followPointer) {
                point = hoverSeries.tooltipPoints[index];
                point && point !== hoverPoint && point.onMouseOver(e);
            } else if (tooltip && followPointer && !tooltip.isHidden) {
                anchor = tooltip.getAnchor([ {} ], e);
                tooltip.updatePosition({
                    plotX: anchor[0],
                    plotY: anchor[1]
                });
            }
            if (tooltip && !pointer._onDocumentMouseMove) {
                pointer._onDocumentMouseMove = function(e) {
                    charts[hoverChartIndex] && charts[hoverChartIndex].pointer.onDocumentMouseMove(e);
                };
                addEvent(doc, "mousemove", pointer._onDocumentMouseMove);
            }
            each(chart.axes, function(axis) {
                axis.drawCrosshair(e, pick(point, hoverPoint));
            });
        },
        reset: function(allowMove) {
            var pointer = this, chart = pointer.chart, hoverSeries = chart.hoverSeries, hoverPoint = chart.hoverPoint, tooltip = chart.tooltip, tooltipPoints = tooltip && tooltip.shared ? chart.hoverPoints : hoverPoint;
            allowMove = allowMove && tooltip && tooltipPoints;
            allowMove && splat(tooltipPoints)[0].plotX === UNDEFINED && (allowMove = false);
            if (allowMove) {
                tooltip.refresh(tooltipPoints);
                hoverPoint && hoverPoint.setState(hoverPoint.state, true);
            } else {
                hoverPoint && hoverPoint.onMouseOut();
                hoverSeries && hoverSeries.onMouseOut();
                tooltip && tooltip.hide();
                if (pointer._onDocumentMouseMove) {
                    removeEvent(doc, "mousemove", pointer._onDocumentMouseMove);
                    pointer._onDocumentMouseMove = null;
                }
                each(chart.axes, function(axis) {
                    axis.hideCrosshair();
                });
                pointer.hoverX = null;
            }
        },
        scaleGroups: function(attribs, clip) {
            var seriesAttribs, chart = this.chart;
            each(chart.series, function(series) {
                seriesAttribs = attribs || series.getPlotBox();
                if (series.xAxis && series.xAxis.zoomEnabled) {
                    series.group.attr(seriesAttribs);
                    if (series.markerGroup) {
                        series.markerGroup.attr(seriesAttribs);
                        series.markerGroup.clip(clip ? chart.clipRect : null);
                    }
                    series.dataLabelsGroup && series.dataLabelsGroup.attr(seriesAttribs);
                }
            });
            chart.clipRect.attr(clip || chart.clipBox);
        },
        dragStart: function(e) {
            var chart = this.chart;
            chart.mouseIsDown = e.type;
            chart.cancelClick = false;
            chart.mouseDownX = this.mouseDownX = e.chartX;
            chart.mouseDownY = this.mouseDownY = e.chartY;
        },
        drag: function(e) {
            var clickedInside, size, chart = this.chart, chartOptions = chart.options.chart, chartX = e.chartX, chartY = e.chartY, zoomHor = this.zoomHor, zoomVert = this.zoomVert, plotLeft = chart.plotLeft, plotTop = chart.plotTop, plotWidth = chart.plotWidth, plotHeight = chart.plotHeight, mouseDownX = this.mouseDownX, mouseDownY = this.mouseDownY;
            plotLeft > chartX ? chartX = plotLeft : chartX > plotLeft + plotWidth && (chartX = plotLeft + plotWidth);
            plotTop > chartY ? chartY = plotTop : chartY > plotTop + plotHeight && (chartY = plotTop + plotHeight);
            this.hasDragged = Math.sqrt(Math.pow(mouseDownX - chartX, 2) + Math.pow(mouseDownY - chartY, 2));
            if (this.hasDragged > 10) {
                clickedInside = chart.isInsidePlot(mouseDownX - plotLeft, mouseDownY - plotTop);
                chart.hasCartesianSeries && (this.zoomX || this.zoomY) && clickedInside && (this.selectionMarker || (this.selectionMarker = chart.renderer.rect(plotLeft, plotTop, zoomHor ? 1 : plotWidth, zoomVert ? 1 : plotHeight, 0).attr({
                    fill: chartOptions.selectionMarkerFill || "rgba(69,114,167,0.25)",
                    zIndex: 7
                }).add()));
                if (this.selectionMarker && zoomHor) {
                    size = chartX - mouseDownX;
                    this.selectionMarker.attr({
                        width: mathAbs(size),
                        x: (size > 0 ? 0 : size) + mouseDownX
                    });
                }
                if (this.selectionMarker && zoomVert) {
                    size = chartY - mouseDownY;
                    this.selectionMarker.attr({
                        height: mathAbs(size),
                        y: (size > 0 ? 0 : size) + mouseDownY
                    });
                }
                clickedInside && !this.selectionMarker && chartOptions.panning && chart.pan(e, chartOptions.panning);
            }
        },
        drop: function(e) {
            var chart = this.chart, hasPinched = this.hasPinched;
            if (this.selectionMarker) {
                var runZoom, selectionData = {
                    xAxis: [],
                    yAxis: [],
                    originalEvent: e.originalEvent || e
                }, selectionBox = this.selectionMarker, selectionLeft = selectionBox.attr ? selectionBox.attr("x") : selectionBox.x, selectionTop = selectionBox.attr ? selectionBox.attr("y") : selectionBox.y, selectionWidth = selectionBox.attr ? selectionBox.attr("width") : selectionBox.width, selectionHeight = selectionBox.attr ? selectionBox.attr("height") : selectionBox.height;
                if (this.hasDragged || hasPinched) {
                    each(chart.axes, function(axis) {
                        if (axis.zoomEnabled) {
                            var horiz = axis.horiz, selectionMin = axis.toValue(horiz ? selectionLeft : selectionTop), selectionMax = axis.toValue(horiz ? selectionLeft + selectionWidth : selectionTop + selectionHeight);
                            if (!isNaN(selectionMin) && !isNaN(selectionMax)) {
                                selectionData[axis.coll].push({
                                    axis: axis,
                                    min: mathMin(selectionMin, selectionMax),
                                    max: mathMax(selectionMin, selectionMax)
                                });
                                runZoom = true;
                            }
                        }
                    });
                    runZoom && fireEvent(chart, "selection", selectionData, function(args) {
                        chart.zoom(extend(args, hasPinched ? {
                            animation: false
                        } : null));
                    });
                }
                this.selectionMarker = this.selectionMarker.destroy();
                hasPinched && this.scaleGroups();
            }
            if (chart) {
                css(chart.container, {
                    cursor: chart._cursor
                });
                chart.cancelClick = this.hasDragged > 10;
                chart.mouseIsDown = this.hasDragged = this.hasPinched = false;
                this.pinchDown = [];
            }
        },
        onContainerMouseDown: function(e) {
            e = this.normalize(e);
            e.preventDefault && e.preventDefault();
            this.dragStart(e);
        },
        onDocumentMouseUp: function(e) {
            charts[hoverChartIndex] && charts[hoverChartIndex].pointer.drop(e);
        },
        onDocumentMouseMove: function(e) {
            var chart = this.chart, chartPosition = this.chartPosition, hoverSeries = chart.hoverSeries;
            e = this.normalize(e, chartPosition);
            chartPosition && hoverSeries && !this.inClass(e.target, "highcharts-tracker") && !chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop) && this.reset();
        },
        onContainerMouseLeave: function() {
            var chart = charts[hoverChartIndex];
            if (chart) {
                chart.pointer.reset();
                chart.pointer.chartPosition = null;
            }
        },
        onContainerMouseMove: function(e) {
            var chart = this.chart;
            hoverChartIndex = chart.index;
            e = this.normalize(e);
            "mousedown" === chart.mouseIsDown && this.drag(e);
            !this.inClass(e.target, "highcharts-tracker") && !chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop) || chart.openMenu || this.runPointActions(e);
        },
        inClass: function(element, className) {
            var elemClassName;
            while (element) {
                elemClassName = attr(element, "class");
                if (elemClassName) {
                    if (-1 !== elemClassName.indexOf(className)) return true;
                    if (-1 !== elemClassName.indexOf(PREFIX + "container")) return false;
                }
                element = element.parentNode;
            }
        },
        onTrackerMouseOut: function(e) {
            var series = this.chart.hoverSeries, relatedTarget = e.relatedTarget || e.toElement, relatedSeries = relatedTarget && relatedTarget.point && relatedTarget.point.series;
            !series || series.options.stickyTracking || this.inClass(relatedTarget, PREFIX + "tooltip") || relatedSeries === series || series.onMouseOut();
        },
        onContainerClick: function(e) {
            var chart = this.chart, hoverPoint = chart.hoverPoint, plotLeft = chart.plotLeft, plotTop = chart.plotTop;
            e = this.normalize(e);
            e.cancelBubble = true;
            if (!chart.cancelClick) if (hoverPoint && this.inClass(e.target, PREFIX + "tracker")) {
                fireEvent(hoverPoint.series, "click", extend(e, {
                    point: hoverPoint
                }));
                chart.hoverPoint && hoverPoint.firePointEvent("click", e);
            } else {
                extend(e, this.getCoordinates(e));
                chart.isInsidePlot(e.chartX - plotLeft, e.chartY - plotTop) && fireEvent(chart, "click", e);
            }
        },
        setDOMEvents: function() {
            var pointer = this, container = pointer.chart.container;
            container.onmousedown = function(e) {
                pointer.onContainerMouseDown(e);
            };
            container.onmousemove = function(e) {
                pointer.onContainerMouseMove(e);
            };
            container.onclick = function(e) {
                pointer.onContainerClick(e);
            };
            addEvent(container, "mouseleave", pointer.onContainerMouseLeave);
            1 === chartCount && addEvent(doc, "mouseup", pointer.onDocumentMouseUp);
            if (hasTouch) {
                container.ontouchstart = function(e) {
                    pointer.onContainerTouchStart(e);
                };
                container.ontouchmove = function(e) {
                    pointer.onContainerTouchMove(e);
                };
                1 === chartCount && addEvent(doc, "touchend", pointer.onDocumentTouchEnd);
            }
        },
        destroy: function() {
            var prop;
            removeEvent(this.chart.container, "mouseleave", this.onContainerMouseLeave);
            if (!chartCount) {
                removeEvent(doc, "mouseup", this.onDocumentMouseUp);
                removeEvent(doc, "touchend", this.onDocumentTouchEnd);
            }
            clearInterval(this.tooltipTimeout);
            for (prop in this) this[prop] = null;
        }
    };
    extend(Highcharts.Pointer.prototype, {
        pinchTranslate: function(pinchDown, touches, transform, selectionMarker, clip, lastValidTouch) {
            (this.zoomHor || this.pinchHor) && this.pinchTranslateDirection(true, pinchDown, touches, transform, selectionMarker, clip, lastValidTouch);
            (this.zoomVert || this.pinchVert) && this.pinchTranslateDirection(false, pinchDown, touches, transform, selectionMarker, clip, lastValidTouch);
        },
        pinchTranslateDirection: function(horiz, pinchDown, touches, transform, selectionMarker, clip, lastValidTouch, forcedScale) {
            var selectionWH, selectionXY, clipXY, outOfBounds, transformScale, scaleKey, chart = this.chart, xy = horiz ? "x" : "y", XY = horiz ? "X" : "Y", sChartXY = "chart" + XY, wh = horiz ? "width" : "height", plotLeftTop = chart["plot" + (horiz ? "Left" : "Top")], scale = forcedScale || 1, inverted = chart.inverted, bounds = chart.bounds[horiz ? "h" : "v"], singleTouch = 1 === pinchDown.length, touch0Start = pinchDown[0][sChartXY], touch0Now = touches[0][sChartXY], touch1Start = !singleTouch && pinchDown[1][sChartXY], touch1Now = !singleTouch && touches[1][sChartXY], setScale = function() {
                !singleTouch && mathAbs(touch0Start - touch1Start) > 20 && (scale = forcedScale || mathAbs(touch0Now - touch1Now) / mathAbs(touch0Start - touch1Start));
                clipXY = (plotLeftTop - touch0Now) / scale + touch0Start;
                selectionWH = chart["plot" + (horiz ? "Width" : "Height")] / scale;
            };
            setScale();
            selectionXY = clipXY;
            if (bounds.min > selectionXY) {
                selectionXY = bounds.min;
                outOfBounds = true;
            } else if (selectionXY + selectionWH > bounds.max) {
                selectionXY = bounds.max - selectionWH;
                outOfBounds = true;
            }
            if (outOfBounds) {
                touch0Now -= .8 * (touch0Now - lastValidTouch[xy][0]);
                singleTouch || (touch1Now -= .8 * (touch1Now - lastValidTouch[xy][1]));
                setScale();
            } else lastValidTouch[xy] = [ touch0Now, touch1Now ];
            if (!inverted) {
                clip[xy] = clipXY - plotLeftTop;
                clip[wh] = selectionWH;
            }
            scaleKey = inverted ? horiz ? "scaleY" : "scaleX" : "scale" + XY;
            transformScale = inverted ? 1 / scale : scale;
            selectionMarker[wh] = selectionWH;
            selectionMarker[xy] = selectionXY;
            transform[scaleKey] = scale;
            transform["translate" + XY] = transformScale * plotLeftTop + (touch0Now - transformScale * touch0Start);
        },
        pinch: function(e) {
            var self = this, chart = self.chart, pinchDown = self.pinchDown, followTouchMove = self.followTouchMove, touches = e.touches, touchesLength = touches.length, lastValidTouch = self.lastValidTouch, hasZoom = self.hasZoom, selectionMarker = self.selectionMarker, transform = {}, fireClickEvent = 1 === touchesLength && (self.inClass(e.target, PREFIX + "tracker") && chart.runTrackerClick || chart.runChartClick), clip = {};
            !hasZoom && !followTouchMove || fireClickEvent || e.preventDefault();
            map(touches, function(e) {
                return self.normalize(e);
            });
            if ("touchstart" === e.type) {
                each(touches, function(e, i) {
                    pinchDown[i] = {
                        chartX: e.chartX,
                        chartY: e.chartY
                    };
                });
                lastValidTouch.x = [ pinchDown[0].chartX, pinchDown[1] && pinchDown[1].chartX ];
                lastValidTouch.y = [ pinchDown[0].chartY, pinchDown[1] && pinchDown[1].chartY ];
                each(chart.axes, function(axis) {
                    if (axis.zoomEnabled) {
                        var bounds = chart.bounds[axis.horiz ? "h" : "v"], minPixelPadding = axis.minPixelPadding, min = axis.toPixels(axis.dataMin), max = axis.toPixels(axis.dataMax), absMin = mathMin(min, max), absMax = mathMax(min, max);
                        bounds.min = mathMin(axis.pos, absMin - minPixelPadding);
                        bounds.max = mathMax(axis.pos + axis.len, absMax + minPixelPadding);
                    }
                });
            } else if (pinchDown.length) {
                selectionMarker || (self.selectionMarker = selectionMarker = extend({
                    destroy: noop
                }, chart.plotBox));
                self.pinchTranslate(pinchDown, touches, transform, selectionMarker, clip, lastValidTouch);
                self.hasPinched = hasZoom;
                self.scaleGroups(transform, clip);
                !hasZoom && followTouchMove && 1 === touchesLength && this.runPointActions(self.normalize(e));
            }
        },
        onContainerTouchStart: function(e) {
            var chart = this.chart;
            hoverChartIndex = chart.index;
            if (1 === e.touches.length) {
                e = this.normalize(e);
                if (chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) {
                    this.runPointActions(e);
                    this.pinch(e);
                } else this.reset();
            } else 2 === e.touches.length && this.pinch(e);
        },
        onContainerTouchMove: function(e) {
            (1 === e.touches.length || 2 === e.touches.length) && this.pinch(e);
        },
        onDocumentTouchEnd: function(e) {
            charts[hoverChartIndex] && charts[hoverChartIndex].pointer.drop(e);
        }
    });
    if (win.PointerEvent || win.MSPointerEvent) {
        var touches = {}, hasPointerEvent = !!win.PointerEvent, getWebkitTouches = function() {
            var key, fake = [];
            fake.item = function(i) {
                return this[i];
            };
            for (key in touches) touches.hasOwnProperty(key) && fake.push({
                pageX: touches[key].pageX,
                pageY: touches[key].pageY,
                target: touches[key].target
            });
            return fake;
        }, translateMSPointer = function(e, method, wktype, callback) {
            var p;
            e = e.originalEvent || e;
            if (("touch" === e.pointerType || e.pointerType === e.MSPOINTER_TYPE_TOUCH) && charts[hoverChartIndex]) {
                callback(e);
                p = charts[hoverChartIndex].pointer;
                p[method]({
                    type: wktype,
                    target: e.currentTarget,
                    preventDefault: noop,
                    touches: getWebkitTouches()
                });
            }
        };
        extend(Pointer.prototype, {
            onContainerPointerDown: function(e) {
                translateMSPointer(e, "onContainerTouchStart", "touchstart", function(e) {
                    touches[e.pointerId] = {
                        pageX: e.pageX,
                        pageY: e.pageY,
                        target: e.currentTarget
                    };
                });
            },
            onContainerPointerMove: function(e) {
                translateMSPointer(e, "onContainerTouchMove", "touchmove", function(e) {
                    touches[e.pointerId] = {
                        pageX: e.pageX,
                        pageY: e.pageY
                    };
                    touches[e.pointerId].target || (touches[e.pointerId].target = e.currentTarget);
                });
            },
            onDocumentPointerUp: function(e) {
                translateMSPointer(e, "onContainerTouchEnd", "touchend", function(e) {
                    delete touches[e.pointerId];
                });
            },
            batchMSEvents: function(fn) {
                fn(this.chart.container, hasPointerEvent ? "pointerdown" : "MSPointerDown", this.onContainerPointerDown);
                fn(this.chart.container, hasPointerEvent ? "pointermove" : "MSPointerMove", this.onContainerPointerMove);
                fn(doc, hasPointerEvent ? "pointerup" : "MSPointerUp", this.onDocumentPointerUp);
            }
        });
        wrap(Pointer.prototype, "init", function(proceed, chart, options) {
            proceed.call(this, chart, options);
            (this.hasZoom || this.followTouchMove) && css(chart.container, {
                "-ms-touch-action": NONE,
                "touch-action": NONE
            });
        });
        wrap(Pointer.prototype, "setDOMEvents", function(proceed) {
            proceed.apply(this);
            (this.hasZoom || this.followTouchMove) && this.batchMSEvents(addEvent);
        });
        wrap(Pointer.prototype, "destroy", function(proceed) {
            this.batchMSEvents(removeEvent);
            proceed.call(this);
        });
    }
    var Legend = Highcharts.Legend = function(chart, options) {
        this.init(chart, options);
    };
    Legend.prototype = {
        init: function(chart, options) {
            var legend = this, itemStyle = options.itemStyle, padding = pick(options.padding, 8), itemMarginTop = options.itemMarginTop || 0;
            this.options = options;
            if (!options.enabled) return;
            legend.baseline = pInt(itemStyle.fontSize) + 3 + itemMarginTop;
            legend.itemStyle = itemStyle;
            legend.itemHiddenStyle = merge(itemStyle, options.itemHiddenStyle);
            legend.itemMarginTop = itemMarginTop;
            legend.padding = padding;
            legend.initialItemX = padding;
            legend.initialItemY = padding - 5;
            legend.maxItemWidth = 0;
            legend.chart = chart;
            legend.itemHeight = 0;
            legend.lastLineHeight = 0;
            legend.symbolWidth = pick(options.symbolWidth, 16);
            legend.pages = [];
            legend.render();
            addEvent(legend.chart, "endResize", function() {
                legend.positionCheckboxes();
            });
        },
        colorizeItem: function(item, visible) {
            var key, val, legend = this, options = legend.options, legendItem = item.legendItem, legendLine = item.legendLine, legendSymbol = item.legendSymbol, hiddenColor = legend.itemHiddenStyle.color, textColor = visible ? options.itemStyle.color : hiddenColor, symbolColor = visible ? item.legendColor || item.color || "#CCC" : hiddenColor, markerOptions = item.options && item.options.marker, symbolAttr = {
                fill: symbolColor
            };
            legendItem && legendItem.css({
                fill: textColor,
                color: textColor
            });
            legendLine && legendLine.attr({
                stroke: symbolColor
            });
            if (legendSymbol) {
                if (markerOptions && legendSymbol.isMarker) {
                    symbolAttr.stroke = symbolColor;
                    markerOptions = item.convertAttribs(markerOptions);
                    for (key in markerOptions) {
                        val = markerOptions[key];
                        val !== UNDEFINED && (symbolAttr[key] = val);
                    }
                }
                legendSymbol.attr(symbolAttr);
            }
        },
        positionItem: function(item) {
            var legend = this, options = legend.options, symbolPadding = options.symbolPadding, ltr = !options.rtl, legendItemPos = item._legendItemPos, itemX = legendItemPos[0], itemY = legendItemPos[1], checkbox = item.checkbox;
            item.legendGroup && item.legendGroup.translate(ltr ? itemX : legend.legendWidth - itemX - 2 * symbolPadding - 4, itemY);
            if (checkbox) {
                checkbox.x = itemX;
                checkbox.y = itemY;
            }
        },
        destroyItem: function(item) {
            var checkbox = item.checkbox;
            each([ "legendItem", "legendLine", "legendSymbol", "legendGroup" ], function(key) {
                item[key] && (item[key] = item[key].destroy());
            });
            checkbox && discardElement(item.checkbox);
        },
        destroy: function() {
            var legend = this, legendGroup = legend.group, box = legend.box;
            box && (legend.box = box.destroy());
            legendGroup && (legend.group = legendGroup.destroy());
        },
        positionCheckboxes: function(scrollOffset) {
            var translateY, alignAttr = this.group.alignAttr, clipHeight = this.clipHeight || this.legendHeight;
            if (alignAttr) {
                translateY = alignAttr.translateY;
                each(this.allItems, function(item) {
                    var top, checkbox = item.checkbox;
                    if (checkbox) {
                        top = translateY + checkbox.y + (scrollOffset || 0) + 3;
                        css(checkbox, {
                            left: alignAttr.translateX + item.checkboxOffset + checkbox.x - 20 + PX,
                            top: top + PX,
                            display: top > translateY - 6 && translateY + clipHeight - 6 > top ? "" : NONE
                        });
                    }
                });
            }
        },
        renderTitle: function() {
            var bBox, options = this.options, padding = this.padding, titleOptions = options.title, titleHeight = 0;
            if (titleOptions.text) {
                this.title || (this.title = this.chart.renderer.label(titleOptions.text, padding - 3, padding - 4, null, null, null, null, null, "legend-title").attr({
                    zIndex: 1
                }).css(titleOptions.style).add(this.group));
                bBox = this.title.getBBox();
                titleHeight = bBox.height;
                this.offsetWidth = bBox.width;
                this.contentGroup.attr({
                    translateY: titleHeight
                });
            }
            this.titleHeight = titleHeight;
        },
        renderItem: function(item) {
            var itemHeight, bBox, itemWidth, legend = this, chart = legend.chart, renderer = chart.renderer, options = legend.options, horizontal = "horizontal" === options.layout, symbolWidth = legend.symbolWidth, symbolPadding = options.symbolPadding, itemStyle = legend.itemStyle, itemHiddenStyle = legend.itemHiddenStyle, padding = legend.padding, itemDistance = horizontal ? pick(options.itemDistance, 20) : 0, ltr = !options.rtl, widthOption = options.width, itemMarginBottom = options.itemMarginBottom || 0, itemMarginTop = legend.itemMarginTop, initialItemX = legend.initialItemX, li = item.legendItem, series = item.series && item.series.drawLegendSymbol ? item.series : item, seriesOptions = series.options, showCheckbox = legend.createCheckboxForItem && seriesOptions && seriesOptions.showCheckbox, useHTML = options.useHTML;
            if (!li) {
                item.legendGroup = renderer.g("legend-item").attr({
                    zIndex: 1
                }).add(legend.scrollGroup);
                series.drawLegendSymbol(legend, item);
                item.legendItem = li = renderer.text(options.labelFormat ? format(options.labelFormat, item) : options.labelFormatter.call(item), ltr ? symbolWidth + symbolPadding : -symbolPadding, legend.baseline, useHTML).css(merge(item.visible ? itemStyle : itemHiddenStyle)).attr({
                    align: ltr ? "left" : "right",
                    zIndex: 2
                }).add(item.legendGroup);
                legend.setItemEvents && legend.setItemEvents(item, li, useHTML, itemStyle, itemHiddenStyle);
                legend.colorizeItem(item, item.visible);
                showCheckbox && legend.createCheckboxForItem(item);
            }
            bBox = li.getBBox();
            itemWidth = item.checkboxOffset = options.itemWidth || item.legendItemWidth || symbolWidth + symbolPadding + bBox.width + itemDistance + (showCheckbox ? 20 : 0);
            legend.itemHeight = itemHeight = mathRound(item.legendItemHeight || bBox.height);
            if (horizontal && legend.itemX - initialItemX + itemWidth > (widthOption || chart.chartWidth - 2 * padding - initialItemX - options.x)) {
                legend.itemX = initialItemX;
                legend.itemY += itemMarginTop + legend.lastLineHeight + itemMarginBottom;
                legend.lastLineHeight = 0;
            }
            legend.maxItemWidth = mathMax(legend.maxItemWidth, itemWidth);
            legend.lastItemY = itemMarginTop + legend.itemY + itemMarginBottom;
            legend.lastLineHeight = mathMax(itemHeight, legend.lastLineHeight);
            item._legendItemPos = [ legend.itemX, legend.itemY ];
            if (horizontal) legend.itemX += itemWidth; else {
                legend.itemY += itemMarginTop + itemHeight + itemMarginBottom;
                legend.lastLineHeight = itemHeight;
            }
            legend.offsetWidth = widthOption || mathMax((horizontal ? legend.itemX - initialItemX - itemDistance : itemWidth) + padding, legend.offsetWidth);
        },
        getAllItems: function() {
            var allItems = [];
            each(this.chart.series, function(series) {
                var seriesOptions = series.options;
                if (!pick(seriesOptions.showInLegend, defined(seriesOptions.linkedTo) ? false : UNDEFINED, true)) return;
                allItems = allItems.concat(series.legendItems || ("point" === seriesOptions.legendType ? series.data : series));
            });
            return allItems;
        },
        render: function() {
            var allItems, display, legendWidth, legendHeight, legend = this, chart = legend.chart, renderer = chart.renderer, legendGroup = legend.group, box = legend.box, options = legend.options, padding = legend.padding, legendBorderWidth = options.borderWidth, legendBackgroundColor = options.backgroundColor;
            legend.itemX = legend.initialItemX;
            legend.itemY = legend.initialItemY;
            legend.offsetWidth = 0;
            legend.lastItemY = 0;
            if (!legendGroup) {
                legend.group = legendGroup = renderer.g("legend").attr({
                    zIndex: 7
                }).add();
                legend.contentGroup = renderer.g().attr({
                    zIndex: 1
                }).add(legendGroup);
                legend.scrollGroup = renderer.g().add(legend.contentGroup);
            }
            legend.renderTitle();
            allItems = legend.getAllItems();
            stableSort(allItems, function(a, b) {
                return (a.options && a.options.legendIndex || 0) - (b.options && b.options.legendIndex || 0);
            });
            options.reversed && allItems.reverse();
            legend.allItems = allItems;
            legend.display = display = !!allItems.length;
            each(allItems, function(item) {
                legend.renderItem(item);
            });
            legendWidth = options.width || legend.offsetWidth;
            legendHeight = legend.lastItemY + legend.lastLineHeight + legend.titleHeight;
            legendHeight = legend.handleOverflow(legendHeight);
            if (legendBorderWidth || legendBackgroundColor) {
                legendWidth += padding;
                legendHeight += padding;
                if (box) {
                    if (legendWidth > 0 && legendHeight > 0) {
                        box[box.isNew ? "attr" : "animate"](box.crisp({
                            width: legendWidth,
                            height: legendHeight
                        }));
                        box.isNew = false;
                    }
                } else {
                    legend.box = box = renderer.rect(0, 0, legendWidth, legendHeight, options.borderRadius, legendBorderWidth || 0).attr({
                        stroke: options.borderColor,
                        "stroke-width": legendBorderWidth || 0,
                        fill: legendBackgroundColor || NONE
                    }).add(legendGroup).shadow(options.shadow);
                    box.isNew = true;
                }
                box[display ? "show" : "hide"]();
            }
            legend.legendWidth = legendWidth;
            legend.legendHeight = legendHeight;
            each(allItems, function(item) {
                legend.positionItem(item);
            });
            display && legendGroup.align(extend({
                width: legendWidth,
                height: legendHeight
            }, options), true, "spacingBox");
            chart.isResizing || this.positionCheckboxes();
        },
        handleOverflow: function(legendHeight) {
            var clipHeight, lastY, legend = this, chart = this.chart, renderer = chart.renderer, options = this.options, optionsY = options.y, alignTop = "top" === options.verticalAlign, spaceHeight = chart.spacingBox.height + (alignTop ? -optionsY : optionsY) - this.padding, maxHeight = options.maxHeight, clipRect = this.clipRect, navOptions = options.navigation, animation = pick(navOptions.animation, true), arrowSize = navOptions.arrowSize || 12, nav = this.nav, pages = this.pages, allItems = this.allItems;
            "horizontal" === options.layout && (spaceHeight /= 2);
            maxHeight && (spaceHeight = mathMin(spaceHeight, maxHeight));
            pages.length = 0;
            if (legendHeight > spaceHeight && !options.useHTML) {
                this.clipHeight = clipHeight = spaceHeight - 20 - this.titleHeight - this.padding;
                this.currentPage = pick(this.currentPage, 1);
                this.fullHeight = legendHeight;
                each(allItems, function(item, i) {
                    var y = item._legendItemPos[1], h = mathRound(item.legendItem.getBBox().height), len = pages.length;
                    if (!len || y - pages[len - 1] > clipHeight && (lastY || y) !== pages[len - 1]) {
                        pages.push(lastY || y);
                        len++;
                    }
                    i === allItems.length - 1 && y + h - pages[len - 1] > clipHeight && pages.push(y);
                    y !== lastY && (lastY = y);
                });
                if (!clipRect) {
                    clipRect = legend.clipRect = renderer.clipRect(0, this.padding, 9999, 0);
                    legend.contentGroup.clip(clipRect);
                }
                clipRect.attr({
                    height: clipHeight
                });
                if (!nav) {
                    this.nav = nav = renderer.g().attr({
                        zIndex: 1
                    }).add(this.group);
                    this.up = renderer.symbol("triangle", 0, 0, arrowSize, arrowSize).on("click", function() {
                        legend.scroll(-1, animation);
                    }).add(nav);
                    this.pager = renderer.text("", 15, 10).css(navOptions.style).add(nav);
                    this.down = renderer.symbol("triangle-down", 0, 0, arrowSize, arrowSize).on("click", function() {
                        legend.scroll(1, animation);
                    }).add(nav);
                }
                legend.scroll(0);
                legendHeight = spaceHeight;
            } else if (nav) {
                clipRect.attr({
                    height: chart.chartHeight
                });
                nav.hide();
                this.scrollGroup.attr({
                    translateY: 1
                });
                this.clipHeight = 0;
            }
            return legendHeight;
        },
        scroll: function(scrollBy, animation) {
            var scrollOffset, pages = this.pages, pageCount = pages.length, currentPage = this.currentPage + scrollBy, clipHeight = this.clipHeight, navOptions = this.options.navigation, activeColor = navOptions.activeColor, inactiveColor = navOptions.inactiveColor, pager = this.pager, padding = this.padding;
            currentPage > pageCount && (currentPage = pageCount);
            if (currentPage > 0) {
                animation !== UNDEFINED && setAnimation(animation, this.chart);
                this.nav.attr({
                    translateX: padding,
                    translateY: clipHeight + this.padding + 7 + this.titleHeight,
                    visibility: VISIBLE
                });
                this.up.attr({
                    fill: 1 === currentPage ? inactiveColor : activeColor
                }).css({
                    cursor: 1 === currentPage ? "default" : "pointer"
                });
                pager.attr({
                    text: currentPage + "/" + pageCount
                });
                this.down.attr({
                    x: 18 + this.pager.getBBox().width,
                    fill: currentPage === pageCount ? inactiveColor : activeColor
                }).css({
                    cursor: currentPage === pageCount ? "default" : "pointer"
                });
                scrollOffset = -pages[currentPage - 1] + this.initialItemY;
                this.scrollGroup.animate({
                    translateY: scrollOffset
                });
                this.currentPage = currentPage;
                this.positionCheckboxes(scrollOffset);
            }
        }
    };
    var LegendSymbolMixin = Highcharts.LegendSymbolMixin = {
        drawRectangle: function(legend, item) {
            var symbolHeight = legend.options.symbolHeight || 12;
            item.legendSymbol = this.chart.renderer.rect(0, legend.baseline - 5 - symbolHeight / 2, legend.symbolWidth, symbolHeight, legend.options.symbolRadius || 0).attr({
                zIndex: 3
            }).add(item.legendGroup);
        },
        drawLineMarker: function(legend) {
            var radius, legendSymbol, attr, options = this.options, markerOptions = options.marker, legendOptions = legend.options, symbolWidth = legend.symbolWidth, renderer = this.chart.renderer, legendItemGroup = this.legendGroup, verticalCenter = legend.baseline - mathRound(.3 * renderer.fontMetrics(legendOptions.itemStyle.fontSize).b);
            if (options.lineWidth) {
                attr = {
                    "stroke-width": options.lineWidth
                };
                options.dashStyle && (attr.dashstyle = options.dashStyle);
                this.legendLine = renderer.path([ M, 0, verticalCenter, L, symbolWidth, verticalCenter ]).attr(attr).add(legendItemGroup);
            }
            if (markerOptions && false !== markerOptions.enabled) {
                radius = markerOptions.radius;
                this.legendSymbol = legendSymbol = renderer.symbol(this.symbol, symbolWidth / 2 - radius, verticalCenter - radius, 2 * radius, 2 * radius).add(legendItemGroup);
                legendSymbol.isMarker = true;
            }
        }
    };
    (/Trident\/7\.0/.test(userAgent) || isFirefox) && wrap(Legend.prototype, "positionItem", function(proceed, item) {
        var legend = this, runPositionItem = function() {
            item._legendItemPos && proceed.call(legend, item);
        };
        runPositionItem();
        setTimeout(runPositionItem);
    });
    Chart.prototype = {
        init: function(userOptions, callback) {
            var options, seriesOptions = userOptions.series;
            userOptions.series = null;
            options = merge(defaultOptions, userOptions);
            options.series = userOptions.series = seriesOptions;
            this.userOptions = userOptions;
            var optionsChart = options.chart;
            this.margin = this.splashArray("margin", optionsChart);
            this.spacing = this.splashArray("spacing", optionsChart);
            var chartEvents = optionsChart.events;
            this.bounds = {
                h: {},
                v: {}
            };
            this.callback = callback;
            this.isResizing = 0;
            this.options = options;
            this.axes = [];
            this.series = [];
            this.hasCartesianSeries = optionsChart.showAxes;
            var eventType, chart = this;
            chart.index = charts.length;
            charts.push(chart);
            chartCount++;
            false !== optionsChart.reflow && addEvent(chart, "load", function() {
                chart.initReflow();
            });
            if (chartEvents) for (eventType in chartEvents) addEvent(chart, eventType, chartEvents[eventType]);
            chart.xAxis = [];
            chart.yAxis = [];
            chart.animation = useCanVG ? false : pick(optionsChart.animation, true);
            chart.pointCount = 0;
            chart.counters = new ChartCounters();
            chart.firstRender();
        },
        initSeries: function(options) {
            var series, chart = this, optionsChart = chart.options.chart, type = options.type || optionsChart.type || optionsChart.defaultSeriesType, constr = seriesTypes[type];
            constr || error(17, true);
            series = new constr();
            series.init(this, options);
            return series;
        },
        isInsidePlot: function(plotX, plotY, inverted) {
            var x = inverted ? plotY : plotX, y = inverted ? plotX : plotY;
            return x >= 0 && this.plotWidth >= x && y >= 0 && this.plotHeight >= y;
        },
        adjustTickAmounts: function() {
            false !== this.options.chart.alignTicks && each(this.axes, function(axis) {
                axis.adjustTickAmount();
            });
            this.maxTicks = null;
        },
        redraw: function(animation) {
            var hasStackedSeries, hasDirtyStacks, serie, chart = this, axes = chart.axes, series = chart.series, pointer = chart.pointer, legend = chart.legend, redrawLegend = chart.isDirtyLegend, isDirtyBox = chart.isDirtyBox, seriesLength = series.length, i = seriesLength, renderer = chart.renderer, isHiddenChart = renderer.isHidden(), afterRedraw = [];
            setAnimation(animation, chart);
            isHiddenChart && chart.cloneRenderTo();
            chart.layOutTitles();
            while (i--) {
                serie = series[i];
                if (serie.options.stacking) {
                    hasStackedSeries = true;
                    if (serie.isDirty) {
                        hasDirtyStacks = true;
                        break;
                    }
                }
            }
            if (hasDirtyStacks) {
                i = seriesLength;
                while (i--) {
                    serie = series[i];
                    serie.options.stacking && (serie.isDirty = true);
                }
            }
            each(series, function(serie) {
                serie.isDirty && "point" === serie.options.legendType && (redrawLegend = true);
            });
            if (redrawLegend && legend.options.enabled) {
                legend.render();
                chart.isDirtyLegend = false;
            }
            hasStackedSeries && chart.getStacks();
            if (chart.hasCartesianSeries) {
                if (!chart.isResizing) {
                    chart.maxTicks = null;
                    each(axes, function(axis) {
                        axis.setScale();
                    });
                }
                chart.adjustTickAmounts();
                chart.getMargins();
                each(axes, function(axis) {
                    axis.isDirty && (isDirtyBox = true);
                });
                each(axes, function(axis) {
                    if (axis.isDirtyExtremes) {
                        axis.isDirtyExtremes = false;
                        afterRedraw.push(function() {
                            fireEvent(axis, "afterSetExtremes", extend(axis.eventArgs, axis.getExtremes()));
                            delete axis.eventArgs;
                        });
                    }
                    (isDirtyBox || hasStackedSeries) && axis.redraw();
                });
            }
            isDirtyBox && chart.drawChartBox();
            each(series, function(serie) {
                serie.isDirty && serie.visible && (!serie.isCartesian || serie.xAxis) && serie.redraw();
            });
            pointer && pointer.reset(true);
            renderer.draw();
            fireEvent(chart, "redraw");
            isHiddenChart && chart.cloneRenderTo(true);
            each(afterRedraw, function(callback) {
                callback.call();
            });
        },
        get: function(id) {
            var chart = this, axes = chart.axes, series = chart.series;
            var i, j, points;
            for (i = 0; axes.length > i; i++) if (axes[i].options.id === id) return axes[i];
            for (i = 0; series.length > i; i++) if (series[i].options.id === id) return series[i];
            for (i = 0; series.length > i; i++) {
                points = series[i].points || [];
                for (j = 0; points.length > j; j++) if (points[j].id === id) return points[j];
            }
            return null;
        },
        getAxes: function() {
            var optionsArray, axis, chart = this, options = this.options, xAxisOptions = options.xAxis = splat(options.xAxis || {}), yAxisOptions = options.yAxis = splat(options.yAxis || {});
            each(xAxisOptions, function(axis, i) {
                axis.index = i;
                axis.isX = true;
            });
            each(yAxisOptions, function(axis, i) {
                axis.index = i;
            });
            optionsArray = xAxisOptions.concat(yAxisOptions);
            each(optionsArray, function(axisOptions) {
                axis = new Axis(chart, axisOptions);
            });
            chart.adjustTickAmounts();
        },
        getSelectedPoints: function() {
            var points = [];
            each(this.series, function(serie) {
                points = points.concat(grep(serie.points || [], function(point) {
                    return point.selected;
                }));
            });
            return points;
        },
        getSelectedSeries: function() {
            return grep(this.series, function(serie) {
                return serie.selected;
            });
        },
        getStacks: function() {
            var chart = this;
            each(chart.yAxis, function(axis) {
                axis.stacks && axis.hasVisibleSeries && (axis.oldStacks = axis.stacks);
            });
            each(chart.series, function(series) {
                !series.options.stacking || true !== series.visible && false !== chart.options.chart.ignoreHiddenSeries || (series.stackKey = series.type + pick(series.options.stack, ""));
            });
        },
        setTitle: function(titleOptions, subtitleOptions, redraw) {
            var chartTitleOptions, chartSubtitleOptions, chart = this, options = chart.options;
            chartTitleOptions = options.title = merge(options.title, titleOptions);
            chartSubtitleOptions = options.subtitle = merge(options.subtitle, subtitleOptions);
            each([ [ "title", titleOptions, chartTitleOptions ], [ "subtitle", subtitleOptions, chartSubtitleOptions ] ], function(arr) {
                var name = arr[0], title = chart[name], titleOptions = arr[1], chartTitleOptions = arr[2];
                title && titleOptions && (chart[name] = title = title.destroy());
                chartTitleOptions && chartTitleOptions.text && !title && (chart[name] = chart.renderer.text(chartTitleOptions.text, 0, 0, chartTitleOptions.useHTML).attr({
                    align: chartTitleOptions.align,
                    "class": PREFIX + name,
                    zIndex: chartTitleOptions.zIndex || 4
                }).css(chartTitleOptions.style).add());
            });
            chart.layOutTitles(redraw);
        },
        layOutTitles: function(redraw) {
            var requiresDirtyBox, titleOffset = 0, title = this.title, subtitle = this.subtitle, options = this.options, titleOptions = options.title, subtitleOptions = options.subtitle, autoWidth = this.spacingBox.width - 44;
            if (title) {
                title.css({
                    width: (titleOptions.width || autoWidth) + PX
                }).align(extend({
                    y: 15
                }, titleOptions), false, "spacingBox");
                titleOptions.floating || titleOptions.verticalAlign || (titleOffset = title.getBBox().height);
            }
            if (subtitle) {
                subtitle.css({
                    width: (subtitleOptions.width || autoWidth) + PX
                }).align(extend({
                    y: titleOffset + titleOptions.margin
                }, subtitleOptions), false, "spacingBox");
                subtitleOptions.floating || subtitleOptions.verticalAlign || (titleOffset = mathCeil(titleOffset + subtitle.getBBox().height));
            }
            requiresDirtyBox = this.titleOffset !== titleOffset;
            this.titleOffset = titleOffset;
            if (!this.isDirtyBox && requiresDirtyBox) {
                this.isDirtyBox = requiresDirtyBox;
                this.hasRendered && pick(redraw, true) && this.isDirtyBox && this.redraw();
            }
        },
        getChartSize: function() {
            var chart = this, optionsChart = chart.options.chart, widthOption = optionsChart.width, heightOption = optionsChart.height, renderTo = chart.renderToClone || chart.renderTo;
            defined(widthOption) || (chart.containerWidth = adapterRun(renderTo, "width"));
            defined(heightOption) || (chart.containerHeight = adapterRun(renderTo, "height"));
            chart.chartWidth = mathMax(0, widthOption || chart.containerWidth || 600);
            chart.chartHeight = mathMax(0, pick(heightOption, chart.containerHeight > 19 ? chart.containerHeight : 400));
        },
        cloneRenderTo: function(revert) {
            var clone = this.renderToClone, container = this.container;
            if (revert) {
                if (clone) {
                    this.renderTo.appendChild(container);
                    discardElement(clone);
                    delete this.renderToClone;
                }
            } else {
                container && container.parentNode === this.renderTo && this.renderTo.removeChild(container);
                this.renderToClone = clone = this.renderTo.cloneNode(0);
                css(clone, {
                    position: ABSOLUTE,
                    top: "-9999px",
                    display: "block"
                });
                clone.style.setProperty && clone.style.setProperty("display", "block", "important");
                doc.body.appendChild(clone);
                container && clone.appendChild(container);
            }
        },
        getContainer: function() {
            var container, chartWidth, chartHeight, renderTo, oldChartIndex, containerId, chart = this, optionsChart = chart.options.chart, indexAttrName = "data-highcharts-chart";
            chart.renderTo = renderTo = optionsChart.renderTo;
            containerId = PREFIX + idCounter++;
            isString(renderTo) && (chart.renderTo = renderTo = doc.getElementById(renderTo));
            renderTo || error(13, true);
            oldChartIndex = pInt(attr(renderTo, indexAttrName));
            !isNaN(oldChartIndex) && charts[oldChartIndex] && charts[oldChartIndex].hasRendered && charts[oldChartIndex].destroy();
            attr(renderTo, indexAttrName, chart.index);
            renderTo.innerHTML = "";
            optionsChart.skipClone || renderTo.offsetWidth || chart.cloneRenderTo();
            chart.getChartSize();
            chartWidth = chart.chartWidth;
            chartHeight = chart.chartHeight;
            chart.container = container = createElement(DIV, {
                className: PREFIX + "container" + (optionsChart.className ? " " + optionsChart.className : ""),
                id: containerId
            }, extend({
                position: RELATIVE,
                overflow: HIDDEN,
                width: chartWidth + PX,
                height: chartHeight + PX,
                textAlign: "left",
                lineHeight: "normal",
                zIndex: 0,
                "-webkit-tap-highlight-color": "rgba(0,0,0,0)"
            }, optionsChart.style), chart.renderToClone || renderTo);
            chart._cursor = container.style.cursor;
            chart.renderer = optionsChart.forExport ? new SVGRenderer(container, chartWidth, chartHeight, optionsChart.style, true) : new Renderer(container, chartWidth, chartHeight, optionsChart.style);
            useCanVG && chart.renderer.create(chart, container, chartWidth, chartHeight);
        },
        getMargins: function() {
            var axisOffset, chart = this, spacing = chart.spacing, legend = chart.legend, margin = chart.margin, legendOptions = chart.options.legend, legendMargin = pick(legendOptions.margin, 20), legendX = legendOptions.x, legendY = legendOptions.y, align = legendOptions.align, verticalAlign = legendOptions.verticalAlign, titleOffset = chart.titleOffset;
            chart.resetMargins();
            axisOffset = chart.axisOffset;
            titleOffset && !defined(margin[0]) && (chart.plotTop = mathMax(chart.plotTop, titleOffset + chart.options.title.margin + spacing[0]));
            legend.display && !legendOptions.floating && ("right" === align ? defined(margin[1]) || (chart.marginRight = mathMax(chart.marginRight, legend.legendWidth - legendX + legendMargin + spacing[1])) : "left" === align ? defined(margin[3]) || (chart.plotLeft = mathMax(chart.plotLeft, legend.legendWidth + legendX + legendMargin + spacing[3])) : "top" === verticalAlign ? defined(margin[0]) || (chart.plotTop = mathMax(chart.plotTop, legend.legendHeight + legendY + legendMargin + spacing[0])) : "bottom" === verticalAlign && (defined(margin[2]) || (chart.marginBottom = mathMax(chart.marginBottom, legend.legendHeight - legendY + legendMargin + spacing[2]))));
            chart.extraBottomMargin && (chart.marginBottom += chart.extraBottomMargin);
            chart.extraTopMargin && (chart.plotTop += chart.extraTopMargin);
            chart.hasCartesianSeries && each(chart.axes, function(axis) {
                axis.getOffset();
            });
            defined(margin[3]) || (chart.plotLeft += axisOffset[3]);
            defined(margin[0]) || (chart.plotTop += axisOffset[0]);
            defined(margin[2]) || (chart.marginBottom += axisOffset[2]);
            defined(margin[1]) || (chart.marginRight += axisOffset[1]);
            chart.setChartSize();
        },
        reflow: function(e) {
            var chart = this, optionsChart = chart.options.chart, renderTo = chart.renderTo, width = optionsChart.width || adapterRun(renderTo, "width"), height = optionsChart.height || adapterRun(renderTo, "height"), target = e ? e.target : win, doReflow = function() {
                if (chart.container) {
                    chart.setSize(width, height, false);
                    chart.hasUserSize = null;
                }
            };
            if (!chart.hasUserSize && width && height && (target === win || target === doc)) {
                if (width !== chart.containerWidth || height !== chart.containerHeight) {
                    clearTimeout(chart.reflowTimeout);
                    e ? chart.reflowTimeout = setTimeout(doReflow, 100) : doReflow();
                }
                chart.containerWidth = width;
                chart.containerHeight = height;
            }
        },
        initReflow: function() {
            var chart = this, reflow = function(e) {
                chart.reflow(e);
            };
            addEvent(win, "resize", reflow);
            addEvent(chart, "destroy", function() {
                removeEvent(win, "resize", reflow);
            });
        },
        setSize: function(width, height, animation) {
            var chartWidth, chartHeight, fireEndResize, chart = this;
            chart.isResizing += 1;
            fireEndResize = function() {
                chart && fireEvent(chart, "endResize", null, function() {
                    chart.isResizing -= 1;
                });
            };
            setAnimation(animation, chart);
            chart.oldChartHeight = chart.chartHeight;
            chart.oldChartWidth = chart.chartWidth;
            if (defined(width)) {
                chart.chartWidth = chartWidth = mathMax(0, mathRound(width));
                chart.hasUserSize = !!chartWidth;
            }
            defined(height) && (chart.chartHeight = chartHeight = mathMax(0, mathRound(height)));
            (globalAnimation ? animate : css)(chart.container, {
                width: chartWidth + PX,
                height: chartHeight + PX
            }, globalAnimation);
            chart.setChartSize(true);
            chart.renderer.setSize(chartWidth, chartHeight, animation);
            chart.maxTicks = null;
            each(chart.axes, function(axis) {
                axis.isDirty = true;
                axis.setScale();
            });
            each(chart.series, function(serie) {
                serie.isDirty = true;
            });
            chart.isDirtyLegend = true;
            chart.isDirtyBox = true;
            chart.layOutTitles();
            chart.getMargins();
            chart.redraw(animation);
            chart.oldChartHeight = null;
            fireEvent(chart, "resize");
            false === globalAnimation ? fireEndResize() : setTimeout(fireEndResize, globalAnimation && globalAnimation.duration || 500);
        },
        setChartSize: function(skipAxes) {
            var clipX, clipY, plotLeft, plotTop, plotWidth, plotHeight, plotBorderWidth, chart = this, inverted = chart.inverted, renderer = chart.renderer, chartWidth = chart.chartWidth, chartHeight = chart.chartHeight, optionsChart = chart.options.chart, spacing = chart.spacing, clipOffset = chart.clipOffset;
            chart.plotLeft = plotLeft = mathRound(chart.plotLeft);
            chart.plotTop = plotTop = mathRound(chart.plotTop);
            chart.plotWidth = plotWidth = mathMax(0, mathRound(chartWidth - plotLeft - chart.marginRight));
            chart.plotHeight = plotHeight = mathMax(0, mathRound(chartHeight - plotTop - chart.marginBottom));
            chart.plotSizeX = inverted ? plotHeight : plotWidth;
            chart.plotSizeY = inverted ? plotWidth : plotHeight;
            chart.plotBorderWidth = optionsChart.plotBorderWidth || 0;
            chart.spacingBox = renderer.spacingBox = {
                x: spacing[3],
                y: spacing[0],
                width: chartWidth - spacing[3] - spacing[1],
                height: chartHeight - spacing[0] - spacing[2]
            };
            chart.plotBox = renderer.plotBox = {
                x: plotLeft,
                y: plotTop,
                width: plotWidth,
                height: plotHeight
            };
            plotBorderWidth = 2 * mathFloor(chart.plotBorderWidth / 2);
            clipX = mathCeil(mathMax(plotBorderWidth, clipOffset[3]) / 2);
            clipY = mathCeil(mathMax(plotBorderWidth, clipOffset[0]) / 2);
            chart.clipBox = {
                x: clipX,
                y: clipY,
                width: mathFloor(chart.plotSizeX - mathMax(plotBorderWidth, clipOffset[1]) / 2 - clipX),
                height: mathFloor(chart.plotSizeY - mathMax(plotBorderWidth, clipOffset[2]) / 2 - clipY)
            };
            skipAxes || each(chart.axes, function(axis) {
                axis.setAxisSize();
                axis.setAxisTranslation();
            });
        },
        resetMargins: function() {
            var chart = this, spacing = chart.spacing, margin = chart.margin;
            chart.plotTop = pick(margin[0], spacing[0]);
            chart.marginRight = pick(margin[1], spacing[1]);
            chart.marginBottom = pick(margin[2], spacing[2]);
            chart.plotLeft = pick(margin[3], spacing[3]);
            chart.axisOffset = [ 0, 0, 0, 0 ];
            chart.clipOffset = [ 0, 0, 0, 0 ];
        },
        drawChartBox: function() {
            var mgn, bgAttr, chart = this, optionsChart = chart.options.chart, renderer = chart.renderer, chartWidth = chart.chartWidth, chartHeight = chart.chartHeight, chartBackground = chart.chartBackground, plotBackground = chart.plotBackground, plotBorder = chart.plotBorder, plotBGImage = chart.plotBGImage, chartBorderWidth = optionsChart.borderWidth || 0, chartBackgroundColor = optionsChart.backgroundColor, plotBackgroundColor = optionsChart.plotBackgroundColor, plotBackgroundImage = optionsChart.plotBackgroundImage, plotBorderWidth = optionsChart.plotBorderWidth || 0, plotLeft = chart.plotLeft, plotTop = chart.plotTop, plotWidth = chart.plotWidth, plotHeight = chart.plotHeight, plotBox = chart.plotBox, clipRect = chart.clipRect, clipBox = chart.clipBox;
            mgn = chartBorderWidth + (optionsChart.shadow ? 8 : 0);
            if (chartBorderWidth || chartBackgroundColor) if (chartBackground) chartBackground.animate(chartBackground.crisp({
                width: chartWidth - mgn,
                height: chartHeight - mgn
            })); else {
                bgAttr = {
                    fill: chartBackgroundColor || NONE
                };
                if (chartBorderWidth) {
                    bgAttr.stroke = optionsChart.borderColor;
                    bgAttr["stroke-width"] = chartBorderWidth;
                }
                chart.chartBackground = renderer.rect(mgn / 2, mgn / 2, chartWidth - mgn, chartHeight - mgn, optionsChart.borderRadius, chartBorderWidth).attr(bgAttr).addClass(PREFIX + "background").add().shadow(optionsChart.shadow);
            }
            plotBackgroundColor && (plotBackground ? plotBackground.animate(plotBox) : chart.plotBackground = renderer.rect(plotLeft, plotTop, plotWidth, plotHeight, 0).attr({
                fill: plotBackgroundColor
            }).add().shadow(optionsChart.plotShadow));
            plotBackgroundImage && (plotBGImage ? plotBGImage.animate(plotBox) : chart.plotBGImage = renderer.image(plotBackgroundImage, plotLeft, plotTop, plotWidth, plotHeight).add());
            clipRect ? clipRect.animate({
                width: clipBox.width,
                height: clipBox.height
            }) : chart.clipRect = renderer.clipRect(clipBox);
            plotBorderWidth && (plotBorder ? plotBorder.animate(plotBorder.crisp({
                x: plotLeft,
                y: plotTop,
                width: plotWidth,
                height: plotHeight
            })) : chart.plotBorder = renderer.rect(plotLeft, plotTop, plotWidth, plotHeight, 0, -plotBorderWidth).attr({
                stroke: optionsChart.plotBorderColor,
                "stroke-width": plotBorderWidth,
                fill: NONE,
                zIndex: 1
            }).add());
            chart.isDirtyBox = false;
        },
        propFromSeries: function() {
            var klass, i, value, chart = this, optionsChart = chart.options.chart, seriesOptions = chart.options.series;
            each([ "inverted", "angular", "polar" ], function(key) {
                klass = seriesTypes[optionsChart.type || optionsChart.defaultSeriesType];
                value = chart[key] || optionsChart[key] || klass && klass.prototype[key];
                i = seriesOptions && seriesOptions.length;
                while (!value && i--) {
                    klass = seriesTypes[seriesOptions[i].type];
                    klass && klass.prototype[key] && (value = true);
                }
                chart[key] = value;
            });
        },
        linkSeries: function() {
            var chart = this, chartSeries = chart.series;
            each(chartSeries, function(series) {
                series.linkedSeries.length = 0;
            });
            each(chartSeries, function(series) {
                var linkedTo = series.options.linkedTo;
                if (isString(linkedTo)) {
                    linkedTo = ":previous" === linkedTo ? chart.series[series.index - 1] : chart.get(linkedTo);
                    if (linkedTo) {
                        linkedTo.linkedSeries.push(series);
                        series.linkedParent = linkedTo;
                    }
                }
            });
        },
        renderSeries: function() {
            each(this.series, function(serie) {
                serie.translate();
                serie.setTooltipPoints && serie.setTooltipPoints();
                serie.render();
            });
        },
        render: function() {
            var chart = this, axes = chart.axes, renderer = chart.renderer, options = chart.options;
            var creditsHref, labels = options.labels, credits = options.credits;
            chart.setTitle();
            chart.legend = new Legend(chart, options.legend);
            chart.getStacks();
            each(axes, function(axis) {
                axis.setScale();
            });
            chart.getMargins();
            chart.maxTicks = null;
            each(axes, function(axis) {
                axis.setTickPositions(true);
                axis.setMaxTicks();
            });
            chart.adjustTickAmounts();
            chart.getMargins();
            chart.drawChartBox();
            chart.hasCartesianSeries && each(axes, function(axis) {
                axis.render();
            });
            chart.seriesGroup || (chart.seriesGroup = renderer.g("series-group").attr({
                zIndex: 3
            }).add());
            chart.renderSeries();
            labels.items && each(labels.items, function(label) {
                var style = extend(labels.style, label.style), x = pInt(style.left) + chart.plotLeft, y = pInt(style.top) + chart.plotTop + 12;
                delete style.left;
                delete style.top;
                renderer.text(label.html, x, y).attr({
                    zIndex: 2
                }).css(style).add();
            });
            if (credits.enabled && !chart.credits) {
                creditsHref = credits.href;
                chart.credits = renderer.text(credits.text, 0, 0).on("click", function() {
                    creditsHref && (location.href = creditsHref);
                }).attr({
                    align: credits.position.align,
                    zIndex: 8
                }).css(credits.style).add().align(credits.position);
            }
            chart.hasRendered = true;
        },
        destroy: function() {
            var i, chart = this, axes = chart.axes, series = chart.series, container = chart.container, parentNode = container && container.parentNode;
            fireEvent(chart, "destroy");
            charts[chart.index] = UNDEFINED;
            chartCount--;
            chart.renderTo.removeAttribute("data-highcharts-chart");
            removeEvent(chart);
            i = axes.length;
            while (i--) axes[i] = axes[i].destroy();
            i = series.length;
            while (i--) series[i] = series[i].destroy();
            each([ "title", "subtitle", "chartBackground", "plotBackground", "plotBGImage", "plotBorder", "seriesGroup", "clipRect", "credits", "pointer", "scroller", "rangeSelector", "legend", "resetZoomButton", "tooltip", "renderer" ], function(name) {
                var prop = chart[name];
                prop && prop.destroy && (chart[name] = prop.destroy());
            });
            if (container) {
                container.innerHTML = "";
                removeEvent(container);
                parentNode && discardElement(container);
            }
            for (i in chart) delete chart[i];
        },
        isReadyToRender: function() {
            var chart = this;
            if (!hasSVG && win == win.top && "complete" !== doc.readyState || useCanVG && !win.canvg) {
                useCanVG ? CanVGController.push(function() {
                    chart.firstRender();
                }, chart.options.global.canvasToolsURL) : doc.attachEvent("onreadystatechange", function() {
                    doc.detachEvent("onreadystatechange", chart.firstRender);
                    "complete" === doc.readyState && chart.firstRender();
                });
                return false;
            }
            return true;
        },
        firstRender: function() {
            var chart = this, options = chart.options, callback = chart.callback;
            if (!chart.isReadyToRender()) return;
            chart.getContainer();
            fireEvent(chart, "init");
            chart.resetMargins();
            chart.setChartSize();
            chart.propFromSeries();
            chart.getAxes();
            each(options.series || [], function(serieOptions) {
                chart.initSeries(serieOptions);
            });
            chart.linkSeries();
            fireEvent(chart, "beforeRender");
            Highcharts.Pointer && (chart.pointer = new Pointer(chart, options));
            chart.render();
            chart.renderer.draw();
            callback && callback.apply(chart, [ chart ]);
            each(chart.callbacks, function(fn) {
                fn.apply(chart, [ chart ]);
            });
            chart.cloneRenderTo(true);
            fireEvent(chart, "load");
        },
        splashArray: function(target, options) {
            var oVar = options[target], tArray = isObject(oVar) ? oVar : [ oVar, oVar, oVar, oVar ];
            return [ pick(options[target + "Top"], tArray[0]), pick(options[target + "Right"], tArray[1]), pick(options[target + "Bottom"], tArray[2]), pick(options[target + "Left"], tArray[3]) ];
        }
    };
    Chart.prototype.callbacks = [];
    var CenteredSeriesMixin = Highcharts.CenteredSeriesMixin = {
        getCenter: function() {
            var handleSlicingRoom, isPercent, options = this.options, chart = this.chart, slicingRoom = 2 * (options.slicedOffset || 0), plotWidth = chart.plotWidth - 2 * slicingRoom, plotHeight = chart.plotHeight - 2 * slicingRoom, centerOption = options.center, positions = [ pick(centerOption[0], "50%"), pick(centerOption[1], "50%"), options.size || "100%", options.innerSize || 0 ], smallestSize = mathMin(plotWidth, plotHeight);
            return map(positions, function(length, i) {
                isPercent = /%$/.test(length);
                handleSlicingRoom = 2 > i || 2 === i && isPercent;
                return (isPercent ? [ plotWidth, plotHeight, smallestSize, smallestSize ][i] * pInt(length) / 100 : length) + (handleSlicingRoom ? slicingRoom : 0);
            });
        }
    };
    var Point = function() {};
    Point.prototype = {
        init: function(series, options, x) {
            var colors, point = this;
            point.series = series;
            point.applyOptions(options, x);
            point.pointAttr = {};
            if (series.options.colorByPoint) {
                colors = series.options.colors || series.chart.options.colors;
                point.color = point.color || colors[series.colorCounter++];
                series.colorCounter === colors.length && (series.colorCounter = 0);
            }
            series.chart.pointCount++;
            return point;
        },
        applyOptions: function(options, x) {
            var point = this, series = point.series, pointValKey = series.pointValKey;
            options = Point.prototype.optionsToObject.call(this, options);
            extend(point, options);
            point.options = point.options ? extend(point.options, options) : options;
            pointValKey && (point.y = point[pointValKey]);
            point.x === UNDEFINED && series && (point.x = x === UNDEFINED ? series.autoIncrement() : x);
            return point;
        },
        optionsToObject: function(options) {
            var firstItemType, ret = {}, series = this.series, pointArrayMap = series.pointArrayMap || [ "y" ], valueCount = pointArrayMap.length, i = 0, j = 0;
            if ("number" == typeof options || null === options) ret[pointArrayMap[0]] = options; else if (isArray(options)) {
                if (options.length > valueCount) {
                    firstItemType = typeof options[0];
                    "string" === firstItemType ? ret.name = options[0] : "number" === firstItemType && (ret.x = options[0]);
                    i++;
                }
                while (valueCount > j) ret[pointArrayMap[j++]] = options[i++];
            } else if ("object" == typeof options) {
                ret = options;
                options.dataLabels && (series._hasPointLabels = true);
                options.marker && (series._hasPointMarkers = true);
            }
            return ret;
        },
        destroy: function() {
            var prop, point = this, series = point.series, chart = series.chart, hoverPoints = chart.hoverPoints;
            chart.pointCount--;
            if (hoverPoints) {
                point.setState();
                erase(hoverPoints, point);
                hoverPoints.length || (chart.hoverPoints = null);
            }
            point === chart.hoverPoint && point.onMouseOut();
            if (point.graphic || point.dataLabel) {
                removeEvent(point);
                point.destroyElements();
            }
            point.legendItem && chart.legend.destroyItem(point);
            for (prop in point) point[prop] = null;
        },
        destroyElements: function() {
            var prop, point = this, props = [ "graphic", "dataLabel", "dataLabelUpper", "group", "connector", "shadowGroup" ], i = 6;
            while (i--) {
                prop = props[i];
                point[prop] && (point[prop] = point[prop].destroy());
            }
        },
        getLabelConfig: function() {
            var point = this;
            return {
                x: point.category,
                y: point.y,
                key: point.name || point.category,
                series: point.series,
                point: point,
                percentage: point.percentage,
                total: point.total || point.stackTotal
            };
        },
        tooltipFormatter: function(pointFormat) {
            var series = this.series, seriesTooltipOptions = series.tooltipOptions, valueDecimals = pick(seriesTooltipOptions.valueDecimals, ""), valuePrefix = seriesTooltipOptions.valuePrefix || "", valueSuffix = seriesTooltipOptions.valueSuffix || "";
            each(series.pointArrayMap || [ "y" ], function(key) {
                key = "{point." + key;
                (valuePrefix || valueSuffix) && (pointFormat = pointFormat.replace(key + "}", valuePrefix + key + "}" + valueSuffix));
                pointFormat = pointFormat.replace(key + "}", key + ":,." + valueDecimals + "f}");
            });
            return format(pointFormat, {
                point: this,
                series: this.series
            });
        },
        firePointEvent: function(eventType, eventArgs, defaultFunction) {
            var point = this, series = this.series, seriesOptions = series.options;
            (seriesOptions.point.events[eventType] || point.options && point.options.events && point.options.events[eventType]) && this.importEvents();
            "click" === eventType && seriesOptions.allowPointSelect && (defaultFunction = function(event) {
                point.select(null, event.ctrlKey || event.metaKey || event.shiftKey);
            });
            fireEvent(this, eventType, eventArgs, defaultFunction);
        }
    };
    var Series = function() {};
    Series.prototype = {
        isCartesian: true,
        type: "line",
        pointClass: Point,
        sorted: true,
        requireSorting: true,
        pointAttrToOptions: {
            stroke: "lineColor",
            "stroke-width": "lineWidth",
            fill: "fillColor",
            r: "radius"
        },
        axisTypes: [ "xAxis", "yAxis" ],
        colorCounter: 0,
        parallelArrays: [ "x", "y" ],
        init: function(chart, options) {
            var eventType, events, series = this, chartSeries = chart.series, sortByIndex = function(a, b) {
                return pick(a.options.index, a._i) - pick(b.options.index, b._i);
            };
            series.chart = chart;
            series.options = options = series.setOptions(options);
            series.linkedSeries = [];
            series.bindAxes();
            extend(series, {
                name: options.name,
                state: NORMAL_STATE,
                pointAttr: {},
                visible: false !== options.visible,
                selected: true === options.selected
            });
            useCanVG && (options.animation = false);
            events = options.events;
            for (eventType in events) addEvent(series, eventType, events[eventType]);
            (events && events.click || options.point && options.point.events && options.point.events.click || options.allowPointSelect) && (chart.runTrackerClick = true);
            series.getColor();
            series.getSymbol();
            each(series.parallelArrays, function(key) {
                series[key + "Data"] = [];
            });
            series.setData(options.data, false);
            series.isCartesian && (chart.hasCartesianSeries = true);
            chartSeries.push(series);
            series._i = chartSeries.length - 1;
            stableSort(chartSeries, sortByIndex);
            this.yAxis && stableSort(this.yAxis.series, sortByIndex);
            each(chartSeries, function(series, i) {
                series.index = i;
                series.name = series.name || "Series " + (i + 1);
            });
        },
        bindAxes: function() {
            var axisOptions, series = this, seriesOptions = series.options, chart = series.chart;
            each(series.axisTypes || [], function(AXIS) {
                each(chart[AXIS], function(axis) {
                    axisOptions = axis.options;
                    if (seriesOptions[AXIS] === axisOptions.index || seriesOptions[AXIS] !== UNDEFINED && seriesOptions[AXIS] === axisOptions.id || seriesOptions[AXIS] === UNDEFINED && 0 === axisOptions.index) {
                        axis.series.push(series);
                        series[AXIS] = axis;
                        axis.isDirty = true;
                    }
                });
                series[AXIS] || series.optionalAxis === AXIS || error(18, true);
            });
        },
        updateParallelArrays: function(point, i) {
            var series = point.series, args = arguments, fn = "number" == typeof i ? function(key) {
                var val = "y" === key && series.toYData ? series.toYData(point) : point[key];
                series[key + "Data"][i] = val;
            } : function(key) {
                Array.prototype[i].apply(series[key + "Data"], Array.prototype.slice.call(args, 2));
            };
            each(series.parallelArrays, fn);
        },
        autoIncrement: function() {
            var series = this, options = series.options, xIncrement = series.xIncrement;
            xIncrement = pick(xIncrement, options.pointStart, 0);
            series.pointInterval = pick(series.pointInterval, options.pointInterval, 1);
            series.xIncrement = xIncrement + series.pointInterval;
            return xIncrement;
        },
        getSegments: function() {
            var i, series = this, lastNull = -1, segments = [], points = series.points, pointsLength = points.length;
            if (pointsLength) if (series.options.connectNulls) {
                i = pointsLength;
                while (i--) null === points[i].y && points.splice(i, 1);
                points.length && (segments = [ points ]);
            } else each(points, function(point, i) {
                if (null === point.y) {
                    i > lastNull + 1 && segments.push(points.slice(lastNull + 1, i));
                    lastNull = i;
                } else i === pointsLength - 1 && segments.push(points.slice(lastNull + 1, i + 1));
            });
            series.segments = segments;
        },
        setOptions: function(itemOptions) {
            var options, chart = this.chart, chartOptions = chart.options, plotOptions = chartOptions.plotOptions, userOptions = chart.userOptions || {}, userPlotOptions = userOptions.plotOptions || {}, typeOptions = plotOptions[this.type];
            this.userOptions = itemOptions;
            options = merge(typeOptions, plotOptions.series, itemOptions);
            this.tooltipOptions = merge(defaultOptions.tooltip, defaultOptions.plotOptions[this.type].tooltip, userOptions.tooltip, userPlotOptions.series && userPlotOptions.series.tooltip, userPlotOptions[this.type] && userPlotOptions[this.type].tooltip, itemOptions.tooltip);
            null === typeOptions.marker && delete options.marker;
            return options;
        },
        getColor: function() {
            var color, colorIndex, options = this.options, userOptions = this.userOptions, defaultColors = this.chart.options.colors, counters = this.chart.counters;
            color = options.color || defaultPlotOptions[this.type].color;
            if (!color && !options.colorByPoint) {
                if (defined(userOptions._colorIndex)) colorIndex = userOptions._colorIndex; else {
                    userOptions._colorIndex = counters.color;
                    colorIndex = counters.color++;
                }
                color = defaultColors[colorIndex];
            }
            this.color = color;
            counters.wrapColor(defaultColors.length);
        },
        getSymbol: function() {
            var symbolIndex, series = this, userOptions = series.userOptions, seriesMarkerOption = series.options.marker, chart = series.chart, defaultSymbols = chart.options.symbols, counters = chart.counters;
            series.symbol = seriesMarkerOption.symbol;
            if (!series.symbol) {
                if (defined(userOptions._symbolIndex)) symbolIndex = userOptions._symbolIndex; else {
                    userOptions._symbolIndex = counters.symbol;
                    symbolIndex = counters.symbol++;
                }
                series.symbol = defaultSymbols[symbolIndex];
            }
            /^url/.test(series.symbol) && (seriesMarkerOption.radius = 0);
            counters.wrapSymbol(defaultSymbols.length);
        },
        drawLegendSymbol: LegendSymbolMixin.drawLineMarker,
        setData: function(data, redraw, animation, updatePoints) {
            var dataLength, i, pt, series = this, oldData = series.points, oldDataLength = oldData && oldData.length || 0, options = series.options, chart = series.chart, firstPoint = null, xAxis = series.xAxis, hasCategories = xAxis && !!xAxis.categories, tooltipPoints = series.tooltipPoints, turboThreshold = options.turboThreshold, xData = this.xData, yData = this.yData, pointArrayMap = series.pointArrayMap, valueCount = pointArrayMap && pointArrayMap.length;
            data = data || [];
            dataLength = data.length;
            redraw = pick(redraw, true);
            if (false === updatePoints || !dataLength || oldDataLength !== dataLength || series.cropped || series.hasGroupedData) {
                series.xIncrement = null;
                series.pointRange = hasCategories ? 1 : options.pointRange;
                series.colorCounter = 0;
                each(this.parallelArrays, function(key) {
                    series[key + "Data"].length = 0;
                });
                if (turboThreshold && dataLength > turboThreshold) {
                    i = 0;
                    while (null === firstPoint && dataLength > i) {
                        firstPoint = data[i];
                        i++;
                    }
                    if (isNumber(firstPoint)) {
                        var x = pick(options.pointStart, 0), pointInterval = pick(options.pointInterval, 1);
                        for (i = 0; dataLength > i; i++) {
                            xData[i] = x;
                            yData[i] = data[i];
                            x += pointInterval;
                        }
                        series.xIncrement = x;
                    } else if (isArray(firstPoint)) if (valueCount) for (i = 0; dataLength > i; i++) {
                        pt = data[i];
                        xData[i] = pt[0];
                        yData[i] = pt.slice(1, valueCount + 1);
                    } else for (i = 0; dataLength > i; i++) {
                        pt = data[i];
                        xData[i] = pt[0];
                        yData[i] = pt[1];
                    } else error(12);
                } else for (i = 0; dataLength > i; i++) if (data[i] !== UNDEFINED) {
                    pt = {
                        series: series
                    };
                    series.pointClass.prototype.applyOptions.apply(pt, [ data[i] ]);
                    series.updateParallelArrays(pt, i);
                    hasCategories && pt.name && (xAxis.names[pt.x] = pt.name);
                }
                isString(yData[0]) && error(14, true);
                series.data = [];
                series.options.data = data;
                i = oldDataLength;
                while (i--) oldData[i] && oldData[i].destroy && oldData[i].destroy();
                tooltipPoints && (tooltipPoints.length = 0);
                xAxis && (xAxis.minRange = xAxis.userMinRange);
                series.isDirty = series.isDirtyData = chart.isDirtyBox = true;
                animation = false;
            } else each(data, function(point, i) {
                oldData[i].update(point, false);
            });
            redraw && chart.redraw(animation);
        },
        processData: function(force) {
            var croppedData, cropped, distance, closestPointRange, i, min, max, series = this, processedXData = series.xData, processedYData = series.yData, dataLength = processedXData.length, cropStart = 0, xAxis = series.xAxis, options = series.options, cropThreshold = options.cropThreshold, activePointCount = 0, isCartesian = series.isCartesian;
            if (isCartesian && !series.isDirty && !xAxis.isDirty && !series.yAxis.isDirty && !force) return false;
            if (isCartesian && series.sorted && (!cropThreshold || dataLength > cropThreshold || series.forceCrop)) {
                min = xAxis.min;
                max = xAxis.max;
                if (min > processedXData[dataLength - 1] || processedXData[0] > max) {
                    processedXData = [];
                    processedYData = [];
                } else if (min > processedXData[0] || processedXData[dataLength - 1] > max) {
                    croppedData = this.cropData(series.xData, series.yData, min, max);
                    processedXData = croppedData.xData;
                    processedYData = croppedData.yData;
                    cropStart = croppedData.start;
                    cropped = true;
                    activePointCount = processedXData.length;
                }
            }
            for (i = processedXData.length - 1; i >= 0; i--) {
                distance = processedXData[i] - processedXData[i - 1];
                !cropped && processedXData[i] > min && max > processedXData[i] && activePointCount++;
                distance > 0 && (closestPointRange === UNDEFINED || closestPointRange > distance) ? closestPointRange = distance : 0 > distance && series.requireSorting && error(15);
            }
            series.cropped = cropped;
            series.cropStart = cropStart;
            series.processedXData = processedXData;
            series.processedYData = processedYData;
            series.activePointCount = activePointCount;
            null === options.pointRange && (series.pointRange = closestPointRange || 1);
            series.closestPointRange = closestPointRange;
        },
        cropData: function(xData, yData, min, max) {
            var i, dataLength = xData.length, cropStart = 0, cropEnd = dataLength, cropShoulder = pick(this.cropShoulder, 1);
            for (i = 0; dataLength > i; i++) if (xData[i] >= min) {
                cropStart = mathMax(0, i - cropShoulder);
                break;
            }
            for (;dataLength > i; i++) if (xData[i] > max) {
                cropEnd = i + cropShoulder;
                break;
            }
            return {
                xData: xData.slice(cropStart, cropEnd),
                yData: yData.slice(cropStart, cropEnd),
                start: cropStart,
                end: cropEnd
            };
        },
        generatePoints: function() {
            var dataLength, cursor, point, i, series = this, options = series.options, dataOptions = options.data, data = series.data, processedXData = series.processedXData, processedYData = series.processedYData, pointClass = series.pointClass, processedDataLength = processedXData.length, cropStart = series.cropStart || 0, hasGroupedData = series.hasGroupedData, points = [];
            if (!data && !hasGroupedData) {
                var arr = [];
                arr.length = dataOptions.length;
                data = series.data = arr;
            }
            for (i = 0; processedDataLength > i; i++) {
                cursor = cropStart + i;
                if (hasGroupedData) points[i] = new pointClass().init(series, [ processedXData[i] ].concat(splat(processedYData[i]))); else {
                    data[cursor] ? point = data[cursor] : dataOptions[cursor] !== UNDEFINED && (data[cursor] = point = new pointClass().init(series, dataOptions[cursor], processedXData[i]));
                    points[i] = point;
                }
            }
            if (data && (processedDataLength !== (dataLength = data.length) || hasGroupedData)) for (i = 0; dataLength > i; i++) {
                i !== cropStart || hasGroupedData || (i += processedDataLength);
                if (data[i]) {
                    data[i].destroyElements();
                    data[i].plotX = UNDEFINED;
                }
            }
            series.data = data;
            series.points = points;
        },
        getExtremes: function(yData) {
            var yDataLength, validValue, withinRange, dataMin, dataMax, x, y, i, j, xAxis = this.xAxis, yAxis = this.yAxis, xData = this.processedXData, activeYData = [], activeCounter = 0, xExtremes = xAxis.getExtremes(), xMin = xExtremes.min, xMax = xExtremes.max;
            yData = yData || this.stackedYData || this.processedYData;
            yDataLength = yData.length;
            for (i = 0; yDataLength > i; i++) {
                x = xData[i];
                y = yData[i];
                validValue = null !== y && y !== UNDEFINED && (!yAxis.isLog || y.length || y > 0);
                withinRange = this.getExtremesFromAll || this.cropped || (xData[i + 1] || x) >= xMin && xMax >= (xData[i - 1] || x);
                if (validValue && withinRange) {
                    j = y.length;
                    if (j) while (j--) null !== y[j] && (activeYData[activeCounter++] = y[j]); else activeYData[activeCounter++] = y;
                }
            }
            this.dataMin = pick(dataMin, arrayMin(activeYData));
            this.dataMax = pick(dataMax, arrayMax(activeYData));
        },
        translate: function() {
            this.processedXData || this.processData();
            this.generatePoints();
            var i, series = this, options = series.options, stacking = options.stacking, xAxis = series.xAxis, categories = xAxis.categories, yAxis = series.yAxis, points = series.points, dataLength = points.length, hasModifyValue = !!series.modifyValue, pointPlacement = options.pointPlacement, dynamicallyPlaced = "between" === pointPlacement || isNumber(pointPlacement), threshold = options.threshold;
            for (i = 0; dataLength > i; i++) {
                var pointStack, stackValues, point = points[i], xValue = point.x, yValue = point.y, yBottom = point.low, stack = stacking && yAxis.stacks[(series.negStacks && threshold > yValue ? "-" : "") + series.stackKey];
                yAxis.isLog && 0 >= yValue && (point.y = yValue = null);
                point.plotX = xAxis.translate(xValue, 0, 0, 0, 1, pointPlacement, "flags" === this.type);
                if (stacking && series.visible && stack && stack[xValue]) {
                    pointStack = stack[xValue];
                    stackValues = pointStack.points[series.index + "," + i];
                    yBottom = stackValues[0];
                    yValue = stackValues[1];
                    0 === yBottom && (yBottom = pick(threshold, yAxis.min));
                    yAxis.isLog && 0 >= yBottom && (yBottom = null);
                    point.total = point.stackTotal = pointStack.total;
                    point.percentage = pointStack.total && 100 * (point.y / pointStack.total);
                    point.stackY = yValue;
                    pointStack.setOffset(series.pointXOffset || 0, series.barW || 0);
                }
                point.yBottom = defined(yBottom) ? yAxis.translate(yBottom, 0, 1, 0, 1) : null;
                hasModifyValue && (yValue = series.modifyValue(yValue, point));
                point.plotY = "number" == typeof yValue && 1/0 !== yValue ? yAxis.translate(yValue, 0, 1, 0, 1) : UNDEFINED;
                point.clientX = dynamicallyPlaced ? xAxis.translate(xValue, 0, 0, 0, 1) : point.plotX;
                point.negative = (threshold || 0) > point.y;
                point.category = categories && categories[point.x] !== UNDEFINED ? categories[point.x] : point.x;
            }
            series.getSegments();
        },
        animate: function(init) {
            var clipRect, markerClipRect, sharedClipKey, series = this, chart = series.chart, renderer = chart.renderer, animation = series.options.animation, clipBox = series.clipBox || chart.clipBox, inverted = chart.inverted;
            animation && !isObject(animation) && (animation = defaultPlotOptions[series.type].animation);
            sharedClipKey = [ "_sharedClip", animation.duration, animation.easing, clipBox.height ].join(",");
            if (init) {
                clipRect = chart[sharedClipKey];
                markerClipRect = chart[sharedClipKey + "m"];
                if (!clipRect) {
                    chart[sharedClipKey] = clipRect = renderer.clipRect(extend(clipBox, {
                        width: 0
                    }));
                    chart[sharedClipKey + "m"] = markerClipRect = renderer.clipRect(-99, inverted ? -chart.plotLeft : -chart.plotTop, 99, inverted ? chart.chartWidth : chart.chartHeight);
                }
                series.group.clip(clipRect);
                series.markerGroup.clip(markerClipRect);
                series.sharedClipKey = sharedClipKey;
            } else {
                clipRect = chart[sharedClipKey];
                clipRect && clipRect.animate({
                    width: chart.plotSizeX
                }, animation);
                chart[sharedClipKey + "m"] && chart[sharedClipKey + "m"].animate({
                    width: chart.plotSizeX + 99
                }, animation);
                series.animate = null;
            }
        },
        afterAnimate: function() {
            var chart = this.chart, sharedClipKey = this.sharedClipKey, group = this.group, clipBox = this.clipBox;
            if (group && false !== this.options.clip) {
                sharedClipKey && clipBox || group.clip(clipBox ? chart.renderer.clipRect(clipBox) : chart.clipRect);
                this.markerGroup.clip();
            }
            fireEvent(this, "afterAnimate");
            setTimeout(function() {
                if (sharedClipKey && chart[sharedClipKey]) {
                    clipBox || (chart[sharedClipKey] = chart[sharedClipKey].destroy());
                    chart[sharedClipKey + "m"] && (chart[sharedClipKey + "m"] = chart[sharedClipKey + "m"].destroy());
                }
            }, 100);
        },
        drawPoints: function() {
            var pointAttr, plotX, plotY, i, point, radius, symbol, isImage, graphic, pointMarkerOptions, enabled, isInside, series = this, points = series.points, chart = series.chart, options = series.options, seriesMarkerOptions = options.marker, seriesPointAttr = series.pointAttr[""], markerGroup = series.markerGroup, globallyEnabled = pick(seriesMarkerOptions.enabled, series.activePointCount < .5 * series.xAxis.len / seriesMarkerOptions.radius);
            if (false !== seriesMarkerOptions.enabled || series._hasPointMarkers) {
                i = points.length;
                while (i--) {
                    point = points[i];
                    plotX = mathFloor(point.plotX);
                    plotY = point.plotY;
                    graphic = point.graphic;
                    pointMarkerOptions = point.marker || {};
                    enabled = globallyEnabled && pointMarkerOptions.enabled === UNDEFINED || pointMarkerOptions.enabled;
                    isInside = chart.isInsidePlot(mathRound(plotX), plotY, chart.inverted);
                    if (enabled && plotY !== UNDEFINED && !isNaN(plotY) && null !== point.y) {
                        pointAttr = point.pointAttr[point.selected ? SELECT_STATE : NORMAL_STATE] || seriesPointAttr;
                        radius = pointAttr.r;
                        symbol = pick(pointMarkerOptions.symbol, series.symbol);
                        isImage = 0 === symbol.indexOf("url");
                        graphic ? graphic[isInside ? "show" : "hide"](true).animate(extend({
                            x: plotX - radius,
                            y: plotY - radius
                        }, graphic.symbolName ? {
                            width: 2 * radius,
                            height: 2 * radius
                        } : {})) : isInside && (radius > 0 || isImage) && (point.graphic = graphic = chart.renderer.symbol(symbol, plotX - radius, plotY - radius, 2 * radius, 2 * radius).attr(pointAttr).add(markerGroup));
                    } else graphic && (point.graphic = graphic.destroy());
                }
            }
        },
        convertAttribs: function(options, base1, base2, base3) {
            var attr, option, conversion = this.pointAttrToOptions, obj = {};
            options = options || {};
            base1 = base1 || {};
            base2 = base2 || {};
            base3 = base3 || {};
            for (attr in conversion) {
                option = conversion[attr];
                obj[attr] = pick(options[option], base1[attr], base2[attr], base3[attr]);
            }
            return obj;
        },
        getAttribs: function() {
            var pointStateOptionsHover, i, point, pointAttr, attr, key, series = this, seriesOptions = series.options, normalOptions = defaultPlotOptions[series.type].marker ? seriesOptions.marker : seriesOptions, stateOptions = normalOptions.states, stateOptionsHover = stateOptions[HOVER_STATE], seriesColor = series.color, normalDefaults = {
                stroke: seriesColor,
                fill: seriesColor
            }, points = series.points || [], seriesPointAttr = [], pointAttrToOptions = series.pointAttrToOptions, hasPointSpecificOptions = series.hasPointSpecificOptions, negativeColor = seriesOptions.negativeColor, defaultLineColor = normalOptions.lineColor, defaultFillColor = normalOptions.fillColor, turboThreshold = seriesOptions.turboThreshold;
            if (seriesOptions.marker) {
                stateOptionsHover.radius = stateOptionsHover.radius || normalOptions.radius + 2;
                stateOptionsHover.lineWidth = stateOptionsHover.lineWidth || normalOptions.lineWidth + 1;
            } else stateOptionsHover.color = stateOptionsHover.color || Color(stateOptionsHover.color || seriesColor).brighten(stateOptionsHover.brightness).get();
            seriesPointAttr[NORMAL_STATE] = series.convertAttribs(normalOptions, normalDefaults);
            each([ HOVER_STATE, SELECT_STATE ], function(state) {
                seriesPointAttr[state] = series.convertAttribs(stateOptions[state], seriesPointAttr[NORMAL_STATE]);
            });
            series.pointAttr = seriesPointAttr;
            i = points.length;
            if (!turboThreshold || turboThreshold > i || hasPointSpecificOptions) while (i--) {
                point = points[i];
                normalOptions = point.options && point.options.marker || point.options;
                normalOptions && false === normalOptions.enabled && (normalOptions.radius = 0);
                point.negative && negativeColor && (point.color = point.fillColor = negativeColor);
                hasPointSpecificOptions = seriesOptions.colorByPoint || point.color;
                if (point.options) for (key in pointAttrToOptions) defined(normalOptions[pointAttrToOptions[key]]) && (hasPointSpecificOptions = true);
                if (hasPointSpecificOptions) {
                    normalOptions = normalOptions || {};
                    pointAttr = [];
                    stateOptions = normalOptions.states || {};
                    pointStateOptionsHover = stateOptions[HOVER_STATE] = stateOptions[HOVER_STATE] || {};
                    seriesOptions.marker || (pointStateOptionsHover.color = pointStateOptionsHover.color || !point.options.color && stateOptionsHover.color || Color(point.color).brighten(pointStateOptionsHover.brightness || stateOptionsHover.brightness).get());
                    attr = {
                        color: point.color
                    };
                    defaultFillColor || (attr.fillColor = point.color);
                    defaultLineColor || (attr.lineColor = point.color);
                    pointAttr[NORMAL_STATE] = series.convertAttribs(extend(attr, normalOptions), seriesPointAttr[NORMAL_STATE]);
                    pointAttr[HOVER_STATE] = series.convertAttribs(stateOptions[HOVER_STATE], seriesPointAttr[HOVER_STATE], pointAttr[NORMAL_STATE]);
                    pointAttr[SELECT_STATE] = series.convertAttribs(stateOptions[SELECT_STATE], seriesPointAttr[SELECT_STATE], pointAttr[NORMAL_STATE]);
                } else pointAttr = seriesPointAttr;
                point.pointAttr = pointAttr;
            }
        },
        destroy: function() {
            var destroy, i, point, prop, axis, series = this, chart = series.chart, issue134 = /AppleWebKit\/533/.test(userAgent), data = series.data || [];
            fireEvent(series, "destroy");
            removeEvent(series);
            each(series.axisTypes || [], function(AXIS) {
                axis = series[AXIS];
                if (axis) {
                    erase(axis.series, series);
                    axis.isDirty = axis.forceRedraw = true;
                }
            });
            series.legendItem && series.chart.legend.destroyItem(series);
            i = data.length;
            while (i--) {
                point = data[i];
                point && point.destroy && point.destroy();
            }
            series.points = null;
            clearTimeout(series.animationTimeout);
            each([ "area", "graph", "dataLabelsGroup", "group", "markerGroup", "tracker", "graphNeg", "areaNeg", "posClip", "negClip" ], function(prop) {
                if (series[prop]) {
                    destroy = issue134 && "group" === prop ? "hide" : "destroy";
                    series[prop][destroy]();
                }
            });
            chart.hoverSeries === series && (chart.hoverSeries = null);
            erase(chart.series, series);
            for (prop in series) delete series[prop];
        },
        getSegmentPath: function(segment) {
            var series = this, segmentPath = [], step = series.options.step;
            each(segment, function(point, i) {
                var lastPoint, plotX = point.plotX, plotY = point.plotY;
                if (series.getPointSpline) segmentPath.push.apply(segmentPath, series.getPointSpline(segment, point, i)); else {
                    segmentPath.push(i ? L : M);
                    if (step && i) {
                        lastPoint = segment[i - 1];
                        "right" === step ? segmentPath.push(lastPoint.plotX, plotY) : "center" === step ? segmentPath.push((lastPoint.plotX + plotX) / 2, lastPoint.plotY, (lastPoint.plotX + plotX) / 2, plotY) : segmentPath.push(plotX, lastPoint.plotY);
                    }
                    segmentPath.push(point.plotX, point.plotY);
                }
            });
            return segmentPath;
        },
        getGraphPath: function() {
            var segmentPath, series = this, graphPath = [], singlePoints = [];
            each(series.segments, function(segment) {
                segmentPath = series.getSegmentPath(segment);
                segment.length > 1 ? graphPath = graphPath.concat(segmentPath) : singlePoints.push(segment[0]);
            });
            series.singlePoints = singlePoints;
            series.graphPath = graphPath;
            return graphPath;
        },
        drawGraph: function() {
            var series = this, options = this.options, props = [ [ "graph", options.lineColor || this.color ] ], lineWidth = options.lineWidth, dashStyle = options.dashStyle, roundCap = "square" !== options.linecap, graphPath = this.getGraphPath(), negativeColor = options.negativeColor;
            negativeColor && props.push([ "graphNeg", negativeColor ]);
            each(props, function(prop, i) {
                var attribs, graphKey = prop[0], graph = series[graphKey];
                if (graph) {
                    stop(graph);
                    graph.animate({
                        d: graphPath
                    });
                } else if (lineWidth && graphPath.length) {
                    attribs = {
                        stroke: prop[1],
                        "stroke-width": lineWidth,
                        fill: NONE,
                        zIndex: 1
                    };
                    dashStyle ? attribs.dashstyle = dashStyle : roundCap && (attribs["stroke-linecap"] = attribs["stroke-linejoin"] = "round");
                    series[graphKey] = series.chart.renderer.path(graphPath).attr(attribs).add(series.group).shadow(!i && options.shadow);
                }
            });
        },
        clipNeg: function() {
            var translatedThreshold, posAttr, negAttr, above, below, options = this.options, chart = this.chart, renderer = chart.renderer, negativeColor = options.negativeColor || options.negativeFillColor, graph = this.graph, area = this.area, posClip = this.posClip, negClip = this.negClip, chartWidth = chart.chartWidth, chartHeight = chart.chartHeight, chartSizeMax = mathMax(chartWidth, chartHeight), yAxis = this.yAxis;
            if (negativeColor && (graph || area)) {
                translatedThreshold = mathRound(yAxis.toPixels(options.threshold || 0, true));
                0 > translatedThreshold && (chartSizeMax -= translatedThreshold);
                above = {
                    x: 0,
                    y: 0,
                    width: chartSizeMax,
                    height: translatedThreshold
                };
                below = {
                    x: 0,
                    y: translatedThreshold,
                    width: chartSizeMax,
                    height: chartSizeMax
                };
                if (chart.inverted) {
                    above.height = below.y = chart.plotWidth - translatedThreshold;
                    if (renderer.isVML) {
                        above = {
                            x: chart.plotWidth - translatedThreshold - chart.plotLeft,
                            y: 0,
                            width: chartWidth,
                            height: chartHeight
                        };
                        below = {
                            x: translatedThreshold + chart.plotLeft - chartWidth,
                            y: 0,
                            width: chart.plotLeft + translatedThreshold,
                            height: chartWidth
                        };
                    }
                }
                if (yAxis.reversed) {
                    posAttr = below;
                    negAttr = above;
                } else {
                    posAttr = above;
                    negAttr = below;
                }
                if (posClip) {
                    posClip.animate(posAttr);
                    negClip.animate(negAttr);
                } else {
                    this.posClip = posClip = renderer.clipRect(posAttr);
                    this.negClip = negClip = renderer.clipRect(negAttr);
                    if (graph && this.graphNeg) {
                        graph.clip(posClip);
                        this.graphNeg.clip(negClip);
                    }
                    if (area) {
                        area.clip(posClip);
                        this.areaNeg.clip(negClip);
                    }
                }
            }
        },
        invertGroups: function() {
            function setInvert() {
                var size = {
                    width: series.yAxis.len,
                    height: series.xAxis.len
                };
                each([ "group", "markerGroup" ], function(groupName) {
                    series[groupName] && series[groupName].attr(size).invert();
                });
            }
            var series = this, chart = series.chart;
            if (!series.xAxis) return;
            addEvent(chart, "resize", setInvert);
            addEvent(series, "destroy", function() {
                removeEvent(chart, "resize", setInvert);
            });
            setInvert();
            series.invertGroups = setInvert;
        },
        plotGroup: function(prop, name, visibility, zIndex, parent) {
            var group = this[prop], isNew = !group;
            isNew && (this[prop] = group = this.chart.renderer.g(name).attr({
                visibility: visibility,
                zIndex: zIndex || .1
            }).add(parent));
            group[isNew ? "attr" : "animate"](this.getPlotBox());
            return group;
        },
        getPlotBox: function() {
            var chart = this.chart, xAxis = this.xAxis, yAxis = this.yAxis;
            if (chart.inverted) {
                xAxis = yAxis;
                yAxis = this.xAxis;
            }
            return {
                translateX: xAxis ? xAxis.left : chart.plotLeft,
                translateY: yAxis ? yAxis.top : chart.plotTop,
                scaleX: 1,
                scaleY: 1
            };
        },
        render: function() {
            var group, series = this, chart = series.chart, options = series.options, animation = options.animation, animDuration = animation && !!series.animate && chart.renderer.isSVG && pick(animation.duration, 500) || 0, visibility = series.visible ? VISIBLE : HIDDEN, zIndex = options.zIndex, hasRendered = series.hasRendered, chartSeriesGroup = chart.seriesGroup;
            group = series.plotGroup("group", "series", visibility, zIndex, chartSeriesGroup);
            series.markerGroup = series.plotGroup("markerGroup", "markers", visibility, zIndex, chartSeriesGroup);
            animDuration && series.animate(true);
            series.getAttribs();
            group.inverted = series.isCartesian ? chart.inverted : false;
            if (series.drawGraph) {
                series.drawGraph();
                series.clipNeg();
            }
            series.drawDataLabels && series.drawDataLabels();
            series.visible && series.drawPoints();
            series.drawTracker && false !== series.options.enableMouseTracking && series.drawTracker();
            chart.inverted && series.invertGroups();
            false === options.clip || series.sharedClipKey || hasRendered || group.clip(chart.clipRect);
            animDuration && series.animate();
            hasRendered || (animDuration ? series.animationTimeout = setTimeout(function() {
                series.afterAnimate();
            }, animDuration) : series.afterAnimate());
            series.isDirty = series.isDirtyData = false;
            series.hasRendered = true;
        },
        redraw: function() {
            var series = this, chart = series.chart, wasDirtyData = series.isDirtyData, group = series.group, xAxis = series.xAxis, yAxis = series.yAxis;
            if (group) {
                chart.inverted && group.attr({
                    width: chart.plotWidth,
                    height: chart.plotHeight
                });
                group.animate({
                    translateX: pick(xAxis && xAxis.left, chart.plotLeft),
                    translateY: pick(yAxis && yAxis.top, chart.plotTop)
                });
            }
            series.translate();
            series.setTooltipPoints && series.setTooltipPoints(true);
            series.render();
            wasDirtyData && fireEvent(series, "updatedData");
        }
    };
    StackItem.prototype = {
        destroy: function() {
            destroyObjectProperties(this, this.axis);
        },
        render: function(group) {
            var options = this.options, formatOption = options.format, str = formatOption ? format(formatOption, this) : options.formatter.call(this);
            this.label ? this.label.attr({
                text: str,
                visibility: HIDDEN
            }) : this.label = this.axis.chart.renderer.text(str, null, null, options.useHTML).css(options.style).attr({
                align: this.textAlign,
                rotation: options.rotation,
                visibility: HIDDEN
            }).add(group);
        },
        setOffset: function(xOffset, xWidth) {
            var alignAttr, stackItem = this, axis = stackItem.axis, chart = axis.chart, inverted = chart.inverted, neg = this.isNegative, y = axis.translate(axis.usePercentage ? 100 : this.total, 0, 0, 0, 1), yZero = axis.translate(0), h = mathAbs(y - yZero), x = chart.xAxis[0].translate(this.x) + xOffset, plotHeight = chart.plotHeight, stackBox = {
                x: inverted ? neg ? y : y - h : x,
                y: inverted ? plotHeight - x - xWidth : neg ? plotHeight - y - h : plotHeight - y,
                width: inverted ? h : xWidth,
                height: inverted ? xWidth : h
            }, label = this.label;
            if (label) {
                label.align(this.alignOptions, null, stackBox);
                alignAttr = label.alignAttr;
                label[false === this.options.crop || chart.isInsidePlot(alignAttr.x, alignAttr.y) ? "show" : "hide"](true);
            }
        }
    };
    Axis.prototype.buildStacks = function() {
        var series = this.series, reversedStacks = pick(this.options.reversedStacks, true), i = series.length;
        if (!this.isXAxis) {
            this.usePercentage = false;
            while (i--) series[reversedStacks ? i : series.length - i - 1].setStackedPoints();
            if (this.usePercentage) for (i = 0; series.length > i; i++) series[i].setPercentStacks();
        }
    };
    Axis.prototype.renderStackTotals = function() {
        var stackKey, oneStack, stackCategory, axis = this, chart = axis.chart, renderer = chart.renderer, stacks = axis.stacks, stackTotalGroup = axis.stackTotalGroup;
        stackTotalGroup || (axis.stackTotalGroup = stackTotalGroup = renderer.g("stack-labels").attr({
            visibility: VISIBLE,
            zIndex: 6
        }).add());
        stackTotalGroup.translate(chart.plotLeft, chart.plotTop);
        for (stackKey in stacks) {
            oneStack = stacks[stackKey];
            for (stackCategory in oneStack) oneStack[stackCategory].render(stackTotalGroup);
        }
    };
    Series.prototype.setStackedPoints = function() {
        if (!this.options.stacking || true !== this.visible && false !== this.chart.options.chart.ignoreHiddenSeries) return;
        var isNegative, stack, other, key, pointKey, i, x, y, series = this, xData = series.processedXData, yData = series.processedYData, stackedYData = [], yDataLength = yData.length, seriesOptions = series.options, threshold = seriesOptions.threshold, stackOption = seriesOptions.stack, stacking = seriesOptions.stacking, stackKey = series.stackKey, negKey = "-" + stackKey, negStacks = series.negStacks, yAxis = series.yAxis, stacks = yAxis.stacks, oldStacks = yAxis.oldStacks;
        for (i = 0; yDataLength > i; i++) {
            x = xData[i];
            y = yData[i];
            pointKey = series.index + "," + i;
            isNegative = negStacks && threshold > y;
            key = isNegative ? negKey : stackKey;
            stacks[key] || (stacks[key] = {});
            if (!stacks[key][x]) if (oldStacks[key] && oldStacks[key][x]) {
                stacks[key][x] = oldStacks[key][x];
                stacks[key][x].total = null;
            } else stacks[key][x] = new StackItem(yAxis, yAxis.options.stackLabels, isNegative, x, stackOption);
            stack = stacks[key][x];
            stack.points[pointKey] = [ stack.cum || 0 ];
            if ("percent" === stacking) {
                other = isNegative ? stackKey : negKey;
                if (negStacks && stacks[other] && stacks[other][x]) {
                    other = stacks[other][x];
                    stack.total = other.total = mathMax(other.total, stack.total) + mathAbs(y) || 0;
                } else stack.total = correctFloat(stack.total + (mathAbs(y) || 0));
            } else stack.total = correctFloat(stack.total + (y || 0));
            stack.cum = (stack.cum || 0) + (y || 0);
            stack.points[pointKey].push(stack.cum);
            stackedYData[i] = stack.cum;
        }
        "percent" === stacking && (yAxis.usePercentage = true);
        this.stackedYData = stackedYData;
        yAxis.oldStacks = {};
    };
    Series.prototype.setPercentStacks = function() {
        var series = this, stackKey = series.stackKey, stacks = series.yAxis.stacks, processedXData = series.processedXData;
        each([ stackKey, "-" + stackKey ], function(key) {
            var x, stack, pointExtremes, totalFactor, i = processedXData.length;
            while (i--) {
                x = processedXData[i];
                stack = stacks[key] && stacks[key][x];
                pointExtremes = stack && stack.points[series.index + "," + i];
                if (pointExtremes) {
                    totalFactor = stack.total ? 100 / stack.total : 0;
                    pointExtremes[0] = correctFloat(pointExtremes[0] * totalFactor);
                    pointExtremes[1] = correctFloat(pointExtremes[1] * totalFactor);
                    series.stackedYData[i] = pointExtremes[1];
                }
            }
        });
    };
    extend(Chart.prototype, {
        addSeries: function(options, redraw, animation) {
            var series, chart = this;
            if (options) {
                redraw = pick(redraw, true);
                fireEvent(chart, "addSeries", {
                    options: options
                }, function() {
                    series = chart.initSeries(options);
                    chart.isDirtyLegend = true;
                    chart.linkSeries();
                    redraw && chart.redraw(animation);
                });
            }
            return series;
        },
        addAxis: function(options, isX, redraw, animation) {
            var axis, key = isX ? "xAxis" : "yAxis", chartOptions = this.options;
            axis = new Axis(this, merge(options, {
                index: this[key].length,
                isX: isX
            }));
            chartOptions[key] = splat(chartOptions[key] || {});
            chartOptions[key].push(options);
            pick(redraw, true) && this.redraw(animation);
        },
        showLoading: function(str) {
            var chart = this, options = chart.options, loadingDiv = chart.loadingDiv;
            var loadingOptions = options.loading;
            if (!loadingDiv) {
                chart.loadingDiv = loadingDiv = createElement(DIV, {
                    className: PREFIX + "loading"
                }, extend(loadingOptions.style, {
                    zIndex: 10,
                    display: NONE
                }), chart.container);
                chart.loadingSpan = createElement("span", null, loadingOptions.labelStyle, loadingDiv);
            }
            chart.loadingSpan.innerHTML = str || options.lang.loading;
            if (!chart.loadingShown) {
                css(loadingDiv, {
                    opacity: 0,
                    display: "",
                    left: chart.plotLeft + PX,
                    top: chart.plotTop + PX,
                    width: chart.plotWidth + PX,
                    height: chart.plotHeight + PX
                });
                animate(loadingDiv, {
                    opacity: loadingOptions.style.opacity
                }, {
                    duration: loadingOptions.showDuration || 0
                });
                chart.loadingShown = true;
            }
        },
        hideLoading: function() {
            var options = this.options, loadingDiv = this.loadingDiv;
            loadingDiv && animate(loadingDiv, {
                opacity: 0
            }, {
                duration: options.loading.hideDuration || 100,
                complete: function() {
                    css(loadingDiv, {
                        display: NONE
                    });
                }
            });
            this.loadingShown = false;
        }
    });
    extend(Point.prototype, {
        update: function(options, redraw, animation) {
            var i, point = this, series = point.series, graphic = point.graphic, data = series.data, chart = series.chart, seriesOptions = series.options;
            redraw = pick(redraw, true);
            point.firePointEvent("update", {
                options: options
            }, function() {
                point.applyOptions(options);
                if (isObject(options)) {
                    series.getAttribs();
                    graphic && (options && options.marker && options.marker.symbol ? point.graphic = graphic.destroy() : graphic.attr(point.pointAttr[point.state || ""]));
                    options && options.dataLabels && point.dataLabel && (point.dataLabel = point.dataLabel.destroy());
                }
                i = inArray(point, data);
                series.updateParallelArrays(point, i);
                seriesOptions.data[i] = point.options;
                series.isDirty = series.isDirtyData = true;
                !series.fixedBox && series.hasCartesianSeries && (chart.isDirtyBox = true);
                "point" === seriesOptions.legendType && chart.legend.destroyItem(point);
                redraw && chart.redraw(animation);
            });
        },
        remove: function(redraw, animation) {
            var i, point = this, series = point.series, points = series.points, chart = series.chart, data = series.data;
            setAnimation(animation, chart);
            redraw = pick(redraw, true);
            point.firePointEvent("remove", null, function() {
                i = inArray(point, data);
                data.length === points.length && points.splice(i, 1);
                data.splice(i, 1);
                series.options.data.splice(i, 1);
                series.updateParallelArrays(point, "splice", i, 1);
                point.destroy();
                series.isDirty = true;
                series.isDirtyData = true;
                redraw && chart.redraw();
            });
        }
    });
    extend(Series.prototype, {
        addPoint: function(options, redraw, shift, animation) {
            var point, isInTheMiddle, x, i, series = this, seriesOptions = series.options, data = series.data, graph = series.graph, area = series.area, chart = series.chart, names = series.xAxis && series.xAxis.names, currentShift = graph && graph.shift || 0, dataOptions = seriesOptions.data, xData = series.xData;
            setAnimation(animation, chart);
            shift && each([ graph, area, series.graphNeg, series.areaNeg ], function(shape) {
                shape && (shape.shift = currentShift + 1);
            });
            area && (area.isArea = true);
            redraw = pick(redraw, true);
            point = {
                series: series
            };
            series.pointClass.prototype.applyOptions.apply(point, [ options ]);
            x = point.x;
            i = xData.length;
            if (series.requireSorting && xData[i - 1] > x) {
                isInTheMiddle = true;
                while (i && xData[i - 1] > x) i--;
            }
            series.updateParallelArrays(point, "splice", i, 0, 0);
            series.updateParallelArrays(point, i);
            names && (names[x] = point.name);
            dataOptions.splice(i, 0, options);
            if (isInTheMiddle) {
                series.data.splice(i, 0, null);
                series.processData();
            }
            "point" === seriesOptions.legendType && series.generatePoints();
            if (shift) if (data[0] && data[0].remove) data[0].remove(false); else {
                data.shift();
                series.updateParallelArrays(point, "shift");
                dataOptions.shift();
            }
            series.isDirty = true;
            series.isDirtyData = true;
            if (redraw) {
                series.getAttribs();
                chart.redraw();
            }
        },
        remove: function(redraw, animation) {
            var series = this, chart = series.chart;
            redraw = pick(redraw, true);
            if (!series.isRemoving) {
                series.isRemoving = true;
                fireEvent(series, "remove", null, function() {
                    series.destroy();
                    chart.isDirtyLegend = chart.isDirtyBox = true;
                    chart.linkSeries();
                    redraw && chart.redraw(animation);
                });
            }
            series.isRemoving = false;
        },
        update: function(newOptions, redraw) {
            var n, chart = this.chart, oldOptions = this.userOptions, oldType = this.type, proto = seriesTypes[oldType].prototype;
            newOptions = merge(oldOptions, {
                animation: false,
                index: this.index,
                pointStart: this.xData[0]
            }, {
                data: this.options.data
            }, newOptions);
            this.remove(false);
            for (n in proto) proto.hasOwnProperty(n) && (this[n] = UNDEFINED);
            extend(this, seriesTypes[newOptions.type || oldType].prototype);
            this.init(chart, newOptions);
            pick(redraw, true) && chart.redraw(false);
        }
    });
    extend(Axis.prototype, {
        update: function(newOptions, redraw) {
            var chart = this.chart;
            newOptions = chart.options[this.coll][this.options.index] = merge(this.userOptions, newOptions);
            this.destroy(true);
            this._addedPlotLB = UNDEFINED;
            this.init(chart, extend(newOptions, {
                events: UNDEFINED
            }));
            chart.isDirtyBox = true;
            pick(redraw, true) && chart.redraw();
        },
        remove: function(redraw) {
            var chart = this.chart, key = this.coll, axisSeries = this.series, i = axisSeries.length;
            while (i--) axisSeries[i] && axisSeries[i].remove(false);
            erase(chart.axes, this);
            erase(chart[key], this);
            chart.options[key].splice(this.options.index, 1);
            each(chart[key], function(axis, i) {
                axis.options.index = i;
            });
            this.destroy();
            chart.isDirtyBox = true;
            pick(redraw, true) && chart.redraw();
        },
        setTitle: function(newTitleOptions, redraw) {
            this.update({
                title: newTitleOptions
            }, redraw);
        },
        setCategories: function(categories, redraw) {
            this.update({
                categories: categories
            }, redraw);
        }
    });
    var LineSeries = extendClass(Series);
    seriesTypes.line = LineSeries;
    defaultPlotOptions.area = merge(defaultSeriesOptions, {
        threshold: 0
    });
    var AreaSeries = extendClass(Series, {
        type: "area",
        getSegments: function() {
            var plotX, plotY, val, i, x, segments = [], segment = [], keys = [], xAxis = this.xAxis, yAxis = this.yAxis, stack = yAxis.stacks[this.stackKey], pointMap = {}, points = this.points, connectNulls = this.options.connectNulls;
            if (this.options.stacking && !this.cropped) {
                for (i = 0; points.length > i; i++) pointMap[points[i].x] = points[i];
                for (x in stack) null !== stack[x].total && keys.push(+x);
                keys.sort(function(a, b) {
                    return a - b;
                });
                each(keys, function(x) {
                    if (connectNulls && (!pointMap[x] || null === pointMap[x].y)) return;
                    if (pointMap[x]) segment.push(pointMap[x]); else {
                        plotX = xAxis.translate(x);
                        val = stack[x].percent ? stack[x].total ? 100 * stack[x].cum / stack[x].total : 0 : stack[x].cum;
                        plotY = yAxis.toPixels(val, true);
                        segment.push({
                            y: null,
                            plotX: plotX,
                            clientX: plotX,
                            plotY: plotY,
                            yBottom: plotY,
                            onMouseOver: noop
                        });
                    }
                });
                segment.length && segments.push(segment);
            } else {
                Series.prototype.getSegments.call(this);
                segments = this.segments;
            }
            this.segments = segments;
        },
        getSegmentPath: function(segment) {
            var i, yBottom, segmentPath = Series.prototype.getSegmentPath.call(this, segment), areaSegmentPath = [].concat(segmentPath), options = this.options, segLength = segmentPath.length, translatedThreshold = this.yAxis.getThreshold(options.threshold);
            3 === segLength && areaSegmentPath.push(L, segmentPath[1], segmentPath[2]);
            if (options.stacking && !this.closedStacks) for (i = segment.length - 1; i >= 0; i--) {
                yBottom = pick(segment[i].yBottom, translatedThreshold);
                segment.length - 1 > i && options.step && areaSegmentPath.push(segment[i + 1].plotX, yBottom);
                areaSegmentPath.push(segment[i].plotX, yBottom);
            } else this.closeSegment(areaSegmentPath, segment, translatedThreshold);
            this.areaPath = this.areaPath.concat(areaSegmentPath);
            return segmentPath;
        },
        closeSegment: function(path, segment, translatedThreshold) {
            path.push(L, segment[segment.length - 1].plotX, translatedThreshold, L, segment[0].plotX, translatedThreshold);
        },
        drawGraph: function() {
            this.areaPath = [];
            Series.prototype.drawGraph.apply(this);
            var series = this, areaPath = this.areaPath, options = this.options, negativeColor = options.negativeColor, negativeFillColor = options.negativeFillColor, props = [ [ "area", this.color, options.fillColor ] ];
            (negativeColor || negativeFillColor) && props.push([ "areaNeg", negativeColor, negativeFillColor ]);
            each(props, function(prop) {
                var areaKey = prop[0], area = series[areaKey];
                area ? area.animate({
                    d: areaPath
                }) : series[areaKey] = series.chart.renderer.path(areaPath).attr({
                    fill: pick(prop[2], Color(prop[1]).setOpacity(pick(options.fillOpacity, .75)).get()),
                    zIndex: 0
                }).add(series.group);
            });
        },
        drawLegendSymbol: LegendSymbolMixin.drawRectangle
    });
    seriesTypes.area = AreaSeries;
    defaultPlotOptions.spline = merge(defaultSeriesOptions);
    var SplineSeries = extendClass(Series, {
        type: "spline",
        getPointSpline: function(segment, point, i) {
            var leftContX, leftContY, rightContX, rightContY, ret, smoothing = 1.5, denom = smoothing + 1, plotX = point.plotX, plotY = point.plotY, lastPoint = segment[i - 1], nextPoint = segment[i + 1];
            if (lastPoint && nextPoint) {
                var correction, lastX = lastPoint.plotX, lastY = lastPoint.plotY, nextX = nextPoint.plotX, nextY = nextPoint.plotY;
                leftContX = (smoothing * plotX + lastX) / denom;
                leftContY = (smoothing * plotY + lastY) / denom;
                rightContX = (smoothing * plotX + nextX) / denom;
                rightContY = (smoothing * plotY + nextY) / denom;
                correction = (rightContY - leftContY) * (rightContX - plotX) / (rightContX - leftContX) + plotY - rightContY;
                leftContY += correction;
                rightContY += correction;
                if (leftContY > lastY && leftContY > plotY) {
                    leftContY = mathMax(lastY, plotY);
                    rightContY = 2 * plotY - leftContY;
                } else if (lastY > leftContY && plotY > leftContY) {
                    leftContY = mathMin(lastY, plotY);
                    rightContY = 2 * plotY - leftContY;
                }
                if (rightContY > nextY && rightContY > plotY) {
                    rightContY = mathMax(nextY, plotY);
                    leftContY = 2 * plotY - rightContY;
                } else if (nextY > rightContY && plotY > rightContY) {
                    rightContY = mathMin(nextY, plotY);
                    leftContY = 2 * plotY - rightContY;
                }
                point.rightContX = rightContX;
                point.rightContY = rightContY;
            }
            if (i) {
                ret = [ "C", lastPoint.rightContX || lastPoint.plotX, lastPoint.rightContY || lastPoint.plotY, leftContX || plotX, leftContY || plotY, plotX, plotY ];
                lastPoint.rightContX = lastPoint.rightContY = null;
            } else ret = [ M, plotX, plotY ];
            return ret;
        }
    });
    seriesTypes.spline = SplineSeries;
    defaultPlotOptions.areaspline = merge(defaultPlotOptions.area);
    var areaProto = AreaSeries.prototype, AreaSplineSeries = extendClass(SplineSeries, {
        type: "areaspline",
        closedStacks: true,
        getSegmentPath: areaProto.getSegmentPath,
        closeSegment: areaProto.closeSegment,
        drawGraph: areaProto.drawGraph,
        drawLegendSymbol: LegendSymbolMixin.drawRectangle
    });
    seriesTypes.areaspline = AreaSplineSeries;
    defaultPlotOptions.column = merge(defaultSeriesOptions, {
        borderColor: "#FFFFFF",
        borderRadius: 0,
        groupPadding: .2,
        marker: null,
        pointPadding: .1,
        minPointLength: 0,
        cropThreshold: 50,
        pointRange: null,
        states: {
            hover: {
                brightness: .1,
                shadow: false,
                halo: false
            },
            select: {
                color: "#C0C0C0",
                borderColor: "#000000",
                shadow: false
            }
        },
        dataLabels: {
            align: null,
            verticalAlign: null,
            y: null
        },
        stickyTracking: false,
        tooltip: {
            distance: 6
        },
        threshold: 0
    });
    var ColumnSeries = extendClass(Series, {
        type: "column",
        pointAttrToOptions: {
            stroke: "borderColor",
            fill: "color",
            r: "borderRadius"
        },
        cropShoulder: 0,
        trackerGroups: [ "group", "dataLabelsGroup" ],
        negStacks: true,
        init: function() {
            Series.prototype.init.apply(this, arguments);
            var series = this, chart = series.chart;
            chart.hasRendered && each(chart.series, function(otherSeries) {
                otherSeries.type === series.type && (otherSeries.isDirty = true);
            });
        },
        getColumnMetrics: function() {
            var stackKey, columnIndex, series = this, options = series.options, xAxis = series.xAxis, yAxis = series.yAxis, reversedXAxis = xAxis.reversed, stackGroups = {}, columnCount = 0;
            false === options.grouping ? columnCount = 1 : each(series.chart.series, function(otherSeries) {
                var otherOptions = otherSeries.options, otherYAxis = otherSeries.yAxis;
                if (otherSeries.type === series.type && otherSeries.visible && yAxis.len === otherYAxis.len && yAxis.pos === otherYAxis.pos) {
                    if (otherOptions.stacking) {
                        stackKey = otherSeries.stackKey;
                        stackGroups[stackKey] === UNDEFINED && (stackGroups[stackKey] = columnCount++);
                        columnIndex = stackGroups[stackKey];
                    } else false !== otherOptions.grouping && (columnIndex = columnCount++);
                    otherSeries.columnIndex = columnIndex;
                }
            });
            var categoryWidth = mathMin(mathAbs(xAxis.transA) * (xAxis.ordinalSlope || options.pointRange || xAxis.closestPointRange || xAxis.tickInterval || 1), xAxis.len), groupPadding = categoryWidth * options.groupPadding, groupWidth = categoryWidth - 2 * groupPadding, pointOffsetWidth = groupWidth / columnCount, optionPointWidth = options.pointWidth, pointPadding = defined(optionPointWidth) ? (pointOffsetWidth - optionPointWidth) / 2 : pointOffsetWidth * options.pointPadding, pointWidth = pick(optionPointWidth, pointOffsetWidth - 2 * pointPadding), colIndex = (reversedXAxis ? columnCount - (series.columnIndex || 0) : series.columnIndex) || 0, pointXOffset = pointPadding + (groupPadding + colIndex * pointOffsetWidth - categoryWidth / 2) * (reversedXAxis ? -1 : 1);
            return series.columnMetrics = {
                width: pointWidth,
                offset: pointXOffset
            };
        },
        translate: function() {
            var series = this, chart = series.chart, options = series.options, borderWidth = series.borderWidth = pick(options.borderWidth, series.activePointCount > .5 * series.xAxis.len ? 0 : 1), yAxis = series.yAxis, threshold = options.threshold, translatedThreshold = series.translatedThreshold = yAxis.getThreshold(threshold), minPointLength = pick(options.minPointLength, 5), metrics = series.getColumnMetrics(), pointWidth = metrics.width, seriesBarW = series.barW = mathCeil(mathMax(pointWidth, 1 + 2 * borderWidth)), pointXOffset = series.pointXOffset = metrics.offset, xCrisp = -(borderWidth % 2 ? .5 : 0), yCrisp = borderWidth % 2 ? .5 : 1;
            chart.renderer.isVML && chart.inverted && (yCrisp += 1);
            Series.prototype.translate.apply(series);
            each(series.points, function(point) {
                var right, bottom, fromTop, fromLeft, yBottom = pick(point.yBottom, translatedThreshold), plotY = mathMin(mathMax(-999 - yBottom, point.plotY), yAxis.len + 999 + yBottom), barX = point.plotX + pointXOffset, barW = seriesBarW, barY = mathMin(plotY, yBottom), barH = mathMax(plotY, yBottom) - barY;
                if (minPointLength > mathAbs(barH) && minPointLength) {
                    barH = minPointLength;
                    barY = mathRound(mathAbs(barY - translatedThreshold) > minPointLength ? yBottom - minPointLength : translatedThreshold - (translatedThreshold >= yAxis.translate(point.y, 0, 1, 0, 1) ? minPointLength : 0));
                }
                point.barX = barX;
                point.pointWidth = pointWidth;
                point.tooltipPos = chart.inverted ? [ yAxis.len - plotY, series.xAxis.len - barX - barW / 2 ] : [ barX + barW / 2, plotY ];
                fromLeft = .5 > mathAbs(barX);
                right = mathRound(barX + barW) + xCrisp;
                barX = mathRound(barX) + xCrisp;
                barW = right - barX;
                fromTop = .5 > mathAbs(barY);
                bottom = mathRound(barY + barH) + yCrisp;
                barY = mathRound(barY) + yCrisp;
                barH = bottom - barY;
                if (fromLeft) {
                    barX += 1;
                    barW -= 1;
                }
                if (fromTop) {
                    barY -= 1;
                    barH += 1;
                }
                point.shapeType = "rect";
                point.shapeArgs = {
                    x: barX,
                    y: barY,
                    width: barW,
                    height: barH
                };
            });
        },
        getSymbol: noop,
        drawLegendSymbol: LegendSymbolMixin.drawRectangle,
        drawGraph: noop,
        drawPoints: function() {
            var shapeArgs, pointAttr, borderAttr, series = this, chart = this.chart, options = series.options, renderer = chart.renderer, animationLimit = options.animationLimit || 250;
            each(series.points, function(point) {
                var plotY = point.plotY, graphic = point.graphic;
                if (plotY === UNDEFINED || isNaN(plotY) || null === point.y) graphic && (point.graphic = graphic.destroy()); else {
                    shapeArgs = point.shapeArgs;
                    borderAttr = defined(series.borderWidth) ? {
                        "stroke-width": series.borderWidth
                    } : {};
                    pointAttr = point.pointAttr[point.selected ? SELECT_STATE : NORMAL_STATE] || series.pointAttr[NORMAL_STATE];
                    if (graphic) {
                        stop(graphic);
                        graphic.attr(borderAttr)[animationLimit > chart.pointCount ? "animate" : "attr"](merge(shapeArgs));
                    } else point.graphic = graphic = renderer[point.shapeType](shapeArgs).attr(pointAttr).attr(borderAttr).add(series.group).shadow(options.shadow, null, options.stacking && !options.borderRadius);
                }
            });
        },
        animate: function(init) {
            var translatedThreshold, series = this, yAxis = this.yAxis, options = series.options, inverted = this.chart.inverted, attr = {};
            if (hasSVG) if (init) {
                attr.scaleY = .001;
                translatedThreshold = mathMin(yAxis.pos + yAxis.len, mathMax(yAxis.pos, yAxis.toPixels(options.threshold)));
                inverted ? attr.translateX = translatedThreshold - yAxis.len : attr.translateY = translatedThreshold;
                series.group.attr(attr);
            } else {
                attr.scaleY = 1;
                attr[inverted ? "translateX" : "translateY"] = yAxis.pos;
                series.group.animate(attr, series.options.animation);
                series.animate = null;
            }
        },
        remove: function() {
            var series = this, chart = series.chart;
            chart.hasRendered && each(chart.series, function(otherSeries) {
                otherSeries.type === series.type && (otherSeries.isDirty = true);
            });
            Series.prototype.remove.apply(series, arguments);
        }
    });
    seriesTypes.column = ColumnSeries;
    defaultPlotOptions.bar = merge(defaultPlotOptions.column);
    var BarSeries = extendClass(ColumnSeries, {
        type: "bar",
        inverted: true
    });
    seriesTypes.bar = BarSeries;
    defaultPlotOptions.scatter = merge(defaultSeriesOptions, {
        lineWidth: 0,
        tooltip: {
            headerFormat: '<span style="color:{series.color}">●</span> <span style="font-size: 10px;"> {series.name}</span><br/>',
            pointFormat: "x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>"
        },
        stickyTracking: false
    });
    var ScatterSeries = extendClass(Series, {
        type: "scatter",
        sorted: false,
        requireSorting: false,
        noSharedTooltip: true,
        trackerGroups: [ "markerGroup" ],
        takeOrdinalPosition: false,
        singularTooltips: true,
        drawGraph: function() {
            this.options.lineWidth && Series.prototype.drawGraph.call(this);
        }
    });
    seriesTypes.scatter = ScatterSeries;
    defaultPlotOptions.pie = merge(defaultSeriesOptions, {
        borderColor: "#FFFFFF",
        borderWidth: 1,
        center: [ null, null ],
        clip: false,
        colorByPoint: true,
        dataLabels: {
            distance: 30,
            enabled: true,
            formatter: function() {
                return this.point.name;
            }
        },
        ignoreHiddenPoint: true,
        legendType: "point",
        marker: null,
        size: null,
        showInLegend: false,
        slicedOffset: 10,
        states: {
            hover: {
                brightness: .1,
                shadow: false
            }
        },
        stickyTracking: false,
        tooltip: {
            followPointer: true
        }
    });
    var PiePoint = extendClass(Point, {
        init: function() {
            Point.prototype.init.apply(this, arguments);
            var toggleSlice, point = this;
            0 > point.y && (point.y = null);
            extend(point, {
                visible: false !== point.visible,
                name: pick(point.name, "Slice")
            });
            toggleSlice = function(e) {
                point.slice("select" === e.type);
            };
            addEvent(point, "select", toggleSlice);
            addEvent(point, "unselect", toggleSlice);
            return point;
        },
        setVisible: function(vis) {
            var point = this, series = point.series, chart = series.chart;
            point.visible = point.options.visible = vis = vis === UNDEFINED ? !point.visible : vis;
            series.options.data[inArray(point, series.data)] = point.options;
            each([ "graphic", "dataLabel", "connector", "shadowGroup" ], function(key) {
                point[key] && point[key][vis ? "show" : "hide"](true);
            });
            point.legendItem && chart.legend.colorizeItem(point, vis);
            if (!series.isDirty && series.options.ignoreHiddenPoint) {
                series.isDirty = true;
                chart.redraw();
            }
        },
        slice: function(sliced, redraw, animation) {
            var translation, point = this, series = point.series, chart = series.chart;
            setAnimation(animation, chart);
            redraw = pick(redraw, true);
            point.sliced = point.options.sliced = sliced = defined(sliced) ? sliced : !point.sliced;
            series.options.data[inArray(point, series.data)] = point.options;
            translation = sliced ? point.slicedTranslation : {
                translateX: 0,
                translateY: 0
            };
            point.graphic.animate(translation);
            point.shadowGroup && point.shadowGroup.animate(translation);
        },
        haloPath: function(size) {
            var shapeArgs = this.shapeArgs, chart = this.series.chart;
            return this.series.chart.renderer.symbols.arc(chart.plotLeft + shapeArgs.x, chart.plotTop + shapeArgs.y, shapeArgs.r + size, shapeArgs.r + size, {
                innerR: this.shapeArgs.r,
                start: shapeArgs.start,
                end: shapeArgs.end
            });
        }
    });
    var PieSeries = {
        type: "pie",
        isCartesian: false,
        pointClass: PiePoint,
        requireSorting: false,
        noSharedTooltip: true,
        trackerGroups: [ "group", "dataLabelsGroup" ],
        axisTypes: [],
        pointAttrToOptions: {
            stroke: "borderColor",
            "stroke-width": "borderWidth",
            fill: "color"
        },
        singularTooltips: true,
        getColor: noop,
        animate: function(init) {
            var series = this, points = series.points, startAngleRad = series.startAngleRad;
            if (!init) {
                each(points, function(point) {
                    var graphic = point.graphic, args = point.shapeArgs;
                    if (graphic) {
                        graphic.attr({
                            r: series.center[3] / 2,
                            start: startAngleRad,
                            end: startAngleRad
                        });
                        graphic.animate({
                            r: args.r,
                            start: args.start,
                            end: args.end
                        }, series.options.animation);
                    }
                });
                series.animate = null;
            }
        },
        setData: function(data, redraw, animation, updatePoints) {
            Series.prototype.setData.call(this, data, false, animation, updatePoints);
            this.processData();
            this.generatePoints();
            pick(redraw, true) && this.chart.redraw(animation);
        },
        generatePoints: function() {
            var i, points, len, point, total = 0, ignoreHiddenPoint = this.options.ignoreHiddenPoint;
            Series.prototype.generatePoints.call(this);
            points = this.points;
            len = points.length;
            for (i = 0; len > i; i++) {
                point = points[i];
                total += ignoreHiddenPoint && !point.visible ? 0 : point.y;
            }
            this.total = total;
            for (i = 0; len > i; i++) {
                point = points[i];
                point.percentage = total > 0 ? 100 * (point.y / total) : 0;
                point.total = total;
            }
        },
        translate: function(positions) {
            this.generatePoints();
            var start, end, angle, radiusX, radiusY, i, point, series = this, cumulative = 0, precision = 1e3, options = series.options, slicedOffset = options.slicedOffset, connectorOffset = slicedOffset + options.borderWidth, startAngle = options.startAngle || 0, startAngleRad = series.startAngleRad = mathPI / 180 * (startAngle - 90), endAngleRad = series.endAngleRad = mathPI / 180 * (pick(options.endAngle, startAngle + 360) - 90), circ = endAngleRad - startAngleRad, points = series.points, labelDistance = options.dataLabels.distance, ignoreHiddenPoint = options.ignoreHiddenPoint, len = points.length;
            positions || (series.center = positions = series.getCenter());
            series.getX = function(y, left) {
                angle = math.asin(mathMin((y - positions[1]) / (positions[2] / 2 + labelDistance), 1));
                return positions[0] + (left ? -1 : 1) * mathCos(angle) * (positions[2] / 2 + labelDistance);
            };
            for (i = 0; len > i; i++) {
                point = points[i];
                start = startAngleRad + cumulative * circ;
                (!ignoreHiddenPoint || point.visible) && (cumulative += point.percentage / 100);
                end = startAngleRad + cumulative * circ;
                point.shapeType = "arc";
                point.shapeArgs = {
                    x: positions[0],
                    y: positions[1],
                    r: positions[2] / 2,
                    innerR: positions[3] / 2,
                    start: mathRound(start * precision) / precision,
                    end: mathRound(end * precision) / precision
                };
                angle = (end + start) / 2;
                angle > 1.5 * mathPI ? angle -= 2 * mathPI : -mathPI / 2 > angle && (angle += 2 * mathPI);
                point.slicedTranslation = {
                    translateX: mathRound(mathCos(angle) * slicedOffset),
                    translateY: mathRound(mathSin(angle) * slicedOffset)
                };
                radiusX = mathCos(angle) * positions[2] / 2;
                radiusY = mathSin(angle) * positions[2] / 2;
                point.tooltipPos = [ positions[0] + .7 * radiusX, positions[1] + .7 * radiusY ];
                point.half = -mathPI / 2 > angle || angle > mathPI / 2 ? 1 : 0;
                point.angle = angle;
                connectorOffset = mathMin(connectorOffset, labelDistance / 2);
                point.labelPos = [ positions[0] + radiusX + mathCos(angle) * labelDistance, positions[1] + radiusY + mathSin(angle) * labelDistance, positions[0] + radiusX + mathCos(angle) * connectorOffset, positions[1] + radiusY + mathSin(angle) * connectorOffset, positions[0] + radiusX, positions[1] + radiusY, 0 > labelDistance ? "center" : point.half ? "right" : "left", angle ];
            }
        },
        drawGraph: null,
        drawPoints: function() {
            var groupTranslation, graphic, shadowGroup, shapeArgs, series = this, chart = series.chart, renderer = chart.renderer, shadow = series.options.shadow;
            shadow && !series.shadowGroup && (series.shadowGroup = renderer.g("shadow").add(series.group));
            each(series.points, function(point) {
                graphic = point.graphic;
                shapeArgs = point.shapeArgs;
                shadowGroup = point.shadowGroup;
                shadow && !shadowGroup && (shadowGroup = point.shadowGroup = renderer.g("shadow").add(series.shadowGroup));
                groupTranslation = point.sliced ? point.slicedTranslation : {
                    translateX: 0,
                    translateY: 0
                };
                shadowGroup && shadowGroup.attr(groupTranslation);
                graphic ? graphic.animate(extend(shapeArgs, groupTranslation)) : point.graphic = graphic = renderer[point.shapeType](shapeArgs).setRadialReference(series.center).attr(point.pointAttr[point.selected ? SELECT_STATE : NORMAL_STATE]).attr({
                    "stroke-linejoin": "round"
                }).attr(groupTranslation).add(series.group).shadow(shadow, shadowGroup);
                void 0 !== point.visible && point.setVisible(point.visible);
            });
        },
        sortByAngle: function(points, sign) {
            points.sort(function(a, b) {
                return void 0 !== a.angle && (b.angle - a.angle) * sign;
            });
        },
        drawLegendSymbol: LegendSymbolMixin.drawRectangle,
        getCenter: CenteredSeriesMixin.getCenter,
        getSymbol: noop
    };
    PieSeries = extendClass(Series, PieSeries);
    seriesTypes.pie = PieSeries;
    Series.prototype.drawDataLabels = function() {
        var pointOptions, generalOptions, str, dataLabelsGroup, series = this, seriesOptions = series.options, cursor = seriesOptions.cursor, options = seriesOptions.dataLabels, points = series.points;
        if (options.enabled || series._hasPointLabels) {
            series.dlProcessOptions && series.dlProcessOptions(options);
            dataLabelsGroup = series.plotGroup("dataLabelsGroup", "data-labels", HIDDEN, options.zIndex || 6);
            if (!series.hasRendered && pick(options.defer, true)) {
                dataLabelsGroup.attr({
                    opacity: 0
                });
                addEvent(series, "afterAnimate", function() {
                    series.dataLabelsGroup.show()[seriesOptions.animation ? "animate" : "attr"]({
                        opacity: 1
                    }, {
                        duration: 200
                    });
                });
            }
            generalOptions = options;
            each(points, function(point) {
                var enabled, labelConfig, attr, name, rotation, dataLabel = point.dataLabel, connector = point.connector, isNew = true;
                pointOptions = point.options && point.options.dataLabels;
                enabled = pick(pointOptions && pointOptions.enabled, generalOptions.enabled);
                if (dataLabel && !enabled) point.dataLabel = dataLabel.destroy(); else if (enabled) {
                    options = merge(generalOptions, pointOptions);
                    rotation = options.rotation;
                    labelConfig = point.getLabelConfig();
                    str = options.format ? format(options.format, labelConfig) : options.formatter.call(labelConfig, options);
                    options.style.color = pick(options.color, options.style.color, series.color, "black");
                    if (dataLabel) if (defined(str)) {
                        dataLabel.attr({
                            text: str
                        });
                        isNew = false;
                    } else {
                        point.dataLabel = dataLabel = dataLabel.destroy();
                        connector && (point.connector = connector.destroy());
                    } else if (defined(str)) {
                        attr = {
                            fill: options.backgroundColor,
                            stroke: options.borderColor,
                            "stroke-width": options.borderWidth,
                            r: options.borderRadius || 0,
                            rotation: rotation,
                            padding: options.padding,
                            zIndex: 1
                        };
                        for (name in attr) attr[name] === UNDEFINED && delete attr[name];
                        dataLabel = point.dataLabel = series.chart.renderer[rotation ? "text" : "label"](str, 0, -999, null, null, null, options.useHTML).attr(attr).css(extend(options.style, cursor && {
                            cursor: cursor
                        })).add(dataLabelsGroup).shadow(options.shadow);
                    }
                    dataLabel && series.alignDataLabel(point, dataLabel, options, null, isNew);
                }
            });
        }
    };
    Series.prototype.alignDataLabel = function(point, dataLabel, options, alignTo, isNew) {
        var alignAttr, chart = this.chart, inverted = chart.inverted, plotX = pick(point.plotX, -999), plotY = pick(point.plotY, -999), bBox = dataLabel.getBBox(), visible = this.visible && (point.series.forceDL || chart.isInsidePlot(plotX, mathRound(plotY), inverted) || alignTo && chart.isInsidePlot(plotX, inverted ? alignTo.x + 1 : alignTo.y + alignTo.height - 1, inverted));
        if (visible) {
            alignTo = extend({
                x: inverted ? chart.plotWidth - plotY : plotX,
                y: mathRound(inverted ? chart.plotHeight - plotX : plotY),
                width: 0,
                height: 0
            }, alignTo);
            extend(options, {
                width: bBox.width,
                height: bBox.height
            });
            if (options.rotation) {
                alignAttr = {
                    align: options.align,
                    x: alignTo.x + options.x + alignTo.width / 2,
                    y: alignTo.y + options.y + alignTo.height / 2
                };
                dataLabel[isNew ? "attr" : "animate"](alignAttr);
            } else {
                dataLabel.align(options, null, alignTo);
                alignAttr = dataLabel.alignAttr;
                "justify" === pick(options.overflow, "justify") ? this.justifyDataLabel(dataLabel, options, alignAttr, bBox, alignTo, isNew) : pick(options.crop, true) && (visible = chart.isInsidePlot(alignAttr.x, alignAttr.y) && chart.isInsidePlot(alignAttr.x + bBox.width, alignAttr.y + bBox.height));
            }
        }
        if (!visible) {
            dataLabel.attr({
                y: -999
            });
            dataLabel.placed = false;
        }
    };
    Series.prototype.justifyDataLabel = function(dataLabel, options, alignAttr, bBox, alignTo, isNew) {
        var off, justified, chart = this.chart, align = options.align, verticalAlign = options.verticalAlign;
        off = alignAttr.x;
        if (0 > off) {
            "right" === align ? options.align = "left" : options.x = -off;
            justified = true;
        }
        off = alignAttr.x + bBox.width;
        if (off > chart.plotWidth) {
            "left" === align ? options.align = "right" : options.x = chart.plotWidth - off;
            justified = true;
        }
        off = alignAttr.y;
        if (0 > off) {
            "bottom" === verticalAlign ? options.verticalAlign = "top" : options.y = -off;
            justified = true;
        }
        off = alignAttr.y + bBox.height;
        if (off > chart.plotHeight) {
            "top" === verticalAlign ? options.verticalAlign = "bottom" : options.y = chart.plotHeight - off;
            justified = true;
        }
        if (justified) {
            dataLabel.placed = !isNew;
            dataLabel.align(options, null, alignTo);
        }
    };
    if (seriesTypes.pie) {
        seriesTypes.pie.prototype.drawDataLabels = function() {
            var point, connector, connectorPath, dataLabel, dataLabelWidth, labelPos, labelHeight, x, y, visibility, rankArr, i, j, series = this, data = series.data, chart = series.chart, options = series.options.dataLabels, connectorPadding = pick(options.connectorPadding, 10), connectorWidth = pick(options.connectorWidth, 1), plotWidth = chart.plotWidth, plotHeight = chart.plotHeight, softConnector = pick(options.softConnector, true), distanceOption = options.distance, seriesCenter = series.center, radius = seriesCenter[2] / 2, centerY = seriesCenter[1], outside = distanceOption > 0, halves = [ [], [] ], overflow = [ 0, 0, 0, 0 ], sort = function(a, b) {
                return b.y - a.y;
            };
            if (!series.visible || !options.enabled && !series._hasPointLabels) return;
            Series.prototype.drawDataLabels.apply(series);
            each(data, function(point) {
                point.dataLabel && point.visible && halves[point.half].push(point);
            });
            i = 0;
            while (!labelHeight && data[i]) {
                labelHeight = data[i] && data[i].dataLabel && (data[i].dataLabel.getBBox().height || 21);
                i++;
            }
            i = 2;
            while (i--) {
                var slotsLength, pos, slotIndex, slots = [], usedSlots = [], points = halves[i], length = points.length;
                series.sortByAngle(points, i - .5);
                if (distanceOption > 0) {
                    for (pos = centerY - radius - distanceOption; centerY + radius + distanceOption >= pos; pos += labelHeight) slots.push(pos);
                    slotsLength = slots.length;
                    if (length > slotsLength) {
                        rankArr = [].concat(points);
                        rankArr.sort(sort);
                        j = length;
                        while (j--) rankArr[j].rank = j;
                        j = length;
                        while (j--) points[j].rank >= slotsLength && points.splice(j, 1);
                        length = points.length;
                    }
                    for (j = 0; length > j; j++) {
                        point = points[j];
                        labelPos = point.labelPos;
                        var distance, slotI, closest = 9999;
                        for (slotI = 0; slotsLength > slotI; slotI++) {
                            distance = mathAbs(slots[slotI] - labelPos[1]);
                            if (closest > distance) {
                                closest = distance;
                                slotIndex = slotI;
                            }
                        }
                        if (j > slotIndex && null !== slots[j]) slotIndex = j; else if (length - j + slotIndex > slotsLength && null !== slots[j]) {
                            slotIndex = slotsLength - length + j;
                            while (null === slots[slotIndex]) slotIndex++;
                        } else while (null === slots[slotIndex]) slotIndex++;
                        usedSlots.push({
                            i: slotIndex,
                            y: slots[slotIndex]
                        });
                        slots[slotIndex] = null;
                    }
                    usedSlots.sort(sort);
                }
                for (j = 0; length > j; j++) {
                    var slot, naturalY;
                    point = points[j];
                    labelPos = point.labelPos;
                    dataLabel = point.dataLabel;
                    visibility = false === point.visible ? HIDDEN : VISIBLE;
                    naturalY = labelPos[1];
                    if (distanceOption > 0) {
                        slot = usedSlots.pop();
                        slotIndex = slot.i;
                        y = slot.y;
                        (naturalY > y && null !== slots[slotIndex + 1] || y > naturalY && null !== slots[slotIndex - 1]) && (y = naturalY);
                    } else y = naturalY;
                    x = options.justify ? seriesCenter[0] + (i ? -1 : 1) * (radius + distanceOption) : series.getX(0 === slotIndex || slotIndex === slots.length - 1 ? naturalY : y, i);
                    dataLabel._attr = {
                        visibility: visibility,
                        align: labelPos[6]
                    };
                    dataLabel._pos = {
                        x: x + options.x + ({
                            left: connectorPadding,
                            right: -connectorPadding
                        }[labelPos[6]] || 0),
                        y: y + options.y - 10
                    };
                    dataLabel.connX = x;
                    dataLabel.connY = y;
                    if (null === this.options.size) {
                        dataLabelWidth = dataLabel.width;
                        connectorPadding > x - dataLabelWidth ? overflow[3] = mathMax(mathRound(dataLabelWidth - x + connectorPadding), overflow[3]) : x + dataLabelWidth > plotWidth - connectorPadding && (overflow[1] = mathMax(mathRound(x + dataLabelWidth - plotWidth + connectorPadding), overflow[1]));
                        0 > y - labelHeight / 2 ? overflow[0] = mathMax(mathRound(-y + labelHeight / 2), overflow[0]) : y + labelHeight / 2 > plotHeight && (overflow[2] = mathMax(mathRound(y + labelHeight / 2 - plotHeight), overflow[2]));
                    }
                }
            }
            if (0 === arrayMax(overflow) || this.verifyDataLabelOverflow(overflow)) {
                this.placeDataLabels();
                outside && connectorWidth && each(this.points, function(point) {
                    connector = point.connector;
                    labelPos = point.labelPos;
                    dataLabel = point.dataLabel;
                    if (dataLabel && dataLabel._pos) {
                        visibility = dataLabel._attr.visibility;
                        x = dataLabel.connX;
                        y = dataLabel.connY;
                        connectorPath = softConnector ? [ M, x + ("left" === labelPos[6] ? 5 : -5), y, "C", x, y, 2 * labelPos[2] - labelPos[4], 2 * labelPos[3] - labelPos[5], labelPos[2], labelPos[3], L, labelPos[4], labelPos[5] ] : [ M, x + ("left" === labelPos[6] ? 5 : -5), y, L, labelPos[2], labelPos[3], L, labelPos[4], labelPos[5] ];
                        if (connector) {
                            connector.animate({
                                d: connectorPath
                            });
                            connector.attr("visibility", visibility);
                        } else point.connector = connector = series.chart.renderer.path(connectorPath).attr({
                            "stroke-width": connectorWidth,
                            stroke: options.connectorColor || point.color || "#606060",
                            visibility: visibility
                        }).add(series.dataLabelsGroup);
                    } else connector && (point.connector = connector.destroy());
                });
            }
        };
        seriesTypes.pie.prototype.placeDataLabels = function() {
            each(this.points, function(point) {
                var _pos, dataLabel = point.dataLabel;
                if (dataLabel) {
                    _pos = dataLabel._pos;
                    if (_pos) {
                        dataLabel.attr(dataLabel._attr);
                        dataLabel[dataLabel.moved ? "animate" : "attr"](_pos);
                        dataLabel.moved = true;
                    } else dataLabel && dataLabel.attr({
                        y: -999
                    });
                }
            });
        };
        seriesTypes.pie.prototype.alignDataLabel = noop;
        seriesTypes.pie.prototype.verifyDataLabelOverflow = function(overflow) {
            var ret, center = this.center, options = this.options, centerOption = options.center, minSize = options.minSize || 80, newSize = minSize;
            if (null !== centerOption[0]) newSize = mathMax(center[2] - mathMax(overflow[1], overflow[3]), minSize); else {
                newSize = mathMax(center[2] - overflow[1] - overflow[3], minSize);
                center[0] += (overflow[3] - overflow[1]) / 2;
            }
            if (null !== centerOption[1]) newSize = mathMax(mathMin(newSize, center[2] - mathMax(overflow[0], overflow[2])), minSize); else {
                newSize = mathMax(mathMin(newSize, center[2] - overflow[0] - overflow[2]), minSize);
                center[1] += (overflow[0] - overflow[2]) / 2;
            }
            if (center[2] > newSize) {
                center[2] = newSize;
                this.translate(center);
                each(this.points, function(point) {
                    point.dataLabel && (point.dataLabel._pos = null);
                });
                this.drawDataLabels && this.drawDataLabels();
            } else ret = true;
            return ret;
        };
    }
    seriesTypes.column && (seriesTypes.column.prototype.alignDataLabel = function(point, dataLabel, options, alignTo, isNew) {
        var chart = this.chart, inverted = chart.inverted, dlBox = point.dlBox || point.shapeArgs, below = point.below || point.plotY > pick(this.translatedThreshold, chart.plotSizeY), inside = pick(options.inside, !!this.options.stacking);
        if (dlBox) {
            alignTo = merge(dlBox);
            inverted && (alignTo = {
                x: chart.plotWidth - alignTo.y - alignTo.height,
                y: chart.plotHeight - alignTo.x - alignTo.width,
                width: alignTo.height,
                height: alignTo.width
            });
            if (!inside) if (inverted) {
                alignTo.x += below ? 0 : alignTo.width;
                alignTo.width = 0;
            } else {
                alignTo.y += below ? alignTo.height : 0;
                alignTo.height = 0;
            }
        }
        options.align = pick(options.align, !inverted || inside ? "center" : below ? "right" : "left");
        options.verticalAlign = pick(options.verticalAlign, inverted || inside ? "middle" : below ? "top" : "bottom");
        Series.prototype.alignDataLabel.call(this, point, dataLabel, options, alignTo, isNew);
    });
    var TrackerMixin = Highcharts.TrackerMixin = {
        drawTrackerPoint: function() {
            var series = this, chart = series.chart, pointer = chart.pointer, cursor = series.options.cursor, css = cursor && {
                cursor: cursor
            }, onMouseOver = function(e) {
                var point, target = e.target;
                chart.hoverSeries !== series && series.onMouseOver();
                while (target && !point) {
                    point = target.point;
                    target = target.parentNode;
                }
                point !== UNDEFINED && point !== chart.hoverPoint && point.onMouseOver(e);
            };
            each(series.points, function(point) {
                point.graphic && (point.graphic.element.point = point);
                point.dataLabel && (point.dataLabel.element.point = point);
            });
            if (!series._hasTracking) {
                each(series.trackerGroups, function(key) {
                    if (series[key]) {
                        series[key].addClass(PREFIX + "tracker").on("mouseover", onMouseOver).on("mouseout", function(e) {
                            pointer.onTrackerMouseOut(e);
                        }).css(css);
                        hasTouch && series[key].on("touchstart", onMouseOver);
                    }
                });
                series._hasTracking = true;
            }
        },
        drawTrackerGraph: function() {
            var singlePoint, i, series = this, options = series.options, trackByArea = options.trackByArea, trackerPath = [].concat(trackByArea ? series.areaPath : series.graphPath), trackerPathLength = trackerPath.length, chart = series.chart, pointer = chart.pointer, renderer = chart.renderer, snap = chart.options.tooltip.snap, tracker = series.tracker, cursor = options.cursor, css = cursor && {
                cursor: cursor
            }, singlePoints = series.singlePoints, onMouseOver = function() {
                chart.hoverSeries !== series && series.onMouseOver();
            }, TRACKER_FILL = "rgba(192,192,192," + (hasSVG ? 1e-4 : .002) + ")";
            if (trackerPathLength && !trackByArea) {
                i = trackerPathLength + 1;
                while (i--) {
                    trackerPath[i] === M && trackerPath.splice(i + 1, 0, trackerPath[i + 1] - snap, trackerPath[i + 2], L);
                    (i && trackerPath[i] === M || i === trackerPathLength) && trackerPath.splice(i, 0, L, trackerPath[i - 2] + snap, trackerPath[i - 1]);
                }
            }
            for (i = 0; singlePoints.length > i; i++) {
                singlePoint = singlePoints[i];
                trackerPath.push(M, singlePoint.plotX - snap, singlePoint.plotY, L, singlePoint.plotX + snap, singlePoint.plotY);
            }
            if (tracker) tracker.attr({
                d: trackerPath
            }); else {
                series.tracker = renderer.path(trackerPath).attr({
                    "stroke-linejoin": "round",
                    visibility: series.visible ? VISIBLE : HIDDEN,
                    stroke: TRACKER_FILL,
                    fill: trackByArea ? TRACKER_FILL : NONE,
                    "stroke-width": options.lineWidth + (trackByArea ? 0 : 2 * snap),
                    zIndex: 2
                }).add(series.group);
                each([ series.tracker, series.markerGroup ], function(tracker) {
                    tracker.addClass(PREFIX + "tracker").on("mouseover", onMouseOver).on("mouseout", function(e) {
                        pointer.onTrackerMouseOut(e);
                    }).css(css);
                    hasTouch && tracker.on("touchstart", onMouseOver);
                });
            }
        }
    };
    seriesTypes.column && (ColumnSeries.prototype.drawTracker = TrackerMixin.drawTrackerPoint);
    seriesTypes.pie && (seriesTypes.pie.prototype.drawTracker = TrackerMixin.drawTrackerPoint);
    seriesTypes.scatter && (ScatterSeries.prototype.drawTracker = TrackerMixin.drawTrackerPoint);
    extend(Legend.prototype, {
        setItemEvents: function(item, legendItem, useHTML, itemStyle, itemHiddenStyle) {
            var legend = this;
            (useHTML ? legendItem : item.legendGroup).on("mouseover", function() {
                item.setState(HOVER_STATE);
                legendItem.css(legend.options.itemHoverStyle);
            }).on("mouseout", function() {
                legendItem.css(item.visible ? itemStyle : itemHiddenStyle);
                item.setState();
            }).on("click", function(event) {
                var strLegendItemClick = "legendItemClick", fnLegendItemClick = function() {
                    item.setVisible();
                };
                event = {
                    browserEvent: event
                };
                item.firePointEvent ? item.firePointEvent(strLegendItemClick, event, fnLegendItemClick) : fireEvent(item, strLegendItemClick, event, fnLegendItemClick);
            });
        },
        createCheckboxForItem: function(item) {
            var legend = this;
            item.checkbox = createElement("input", {
                type: "checkbox",
                checked: item.selected,
                defaultChecked: item.selected
            }, legend.options.itemCheckboxStyle, legend.chart.container);
            addEvent(item.checkbox, "click", function(event) {
                var target = event.target;
                fireEvent(item, "checkboxClick", {
                    checked: target.checked
                }, function() {
                    item.select();
                });
            });
        }
    });
    defaultOptions.legend.itemStyle.cursor = "pointer";
    extend(Chart.prototype, {
        showResetZoom: function() {
            var chart = this, lang = defaultOptions.lang, btnOptions = chart.options.chart.resetZoomButton, theme = btnOptions.theme, states = theme.states, alignTo = "chart" === btnOptions.relativeTo ? null : "plotBox";
            this.resetZoomButton = chart.renderer.button(lang.resetZoom, null, null, function() {
                chart.zoomOut();
            }, theme, states && states.hover).attr({
                align: btnOptions.position.align,
                title: lang.resetZoomTitle
            }).add().align(btnOptions.position, false, alignTo);
        },
        zoomOut: function() {
            var chart = this;
            fireEvent(chart, "selection", {
                resetSelection: true
            }, function() {
                chart.zoom();
            });
        },
        zoom: function(event) {
            var hasZoomed, resetZoomButton, chart = this, pointer = chart.pointer, displayButton = false;
            !event || event.resetSelection ? each(chart.axes, function(axis) {
                hasZoomed = axis.zoom();
            }) : each(event.xAxis.concat(event.yAxis), function(axisData) {
                var axis = axisData.axis, isXAxis = axis.isXAxis;
                if (pointer[isXAxis ? "zoomX" : "zoomY"] || pointer[isXAxis ? "pinchX" : "pinchY"]) {
                    hasZoomed = axis.zoom(axisData.min, axisData.max);
                    axis.displayBtn && (displayButton = true);
                }
            });
            resetZoomButton = chart.resetZoomButton;
            displayButton && !resetZoomButton ? chart.showResetZoom() : !displayButton && isObject(resetZoomButton) && (chart.resetZoomButton = resetZoomButton.destroy());
            hasZoomed && chart.redraw(pick(chart.options.chart.animation, event && event.animation, 100 > chart.pointCount));
        },
        pan: function(e, panning) {
            var doRedraw, chart = this, hoverPoints = chart.hoverPoints;
            hoverPoints && each(hoverPoints, function(point) {
                point.setState();
            });
            each("xy" === panning ? [ 1, 0 ] : [ 1 ], function(isX) {
                var mousePos = e[isX ? "chartX" : "chartY"], axis = chart[isX ? "xAxis" : "yAxis"][0], startPos = chart[isX ? "mouseDownX" : "mouseDownY"], halfPointRange = (axis.pointRange || 0) / 2, extremes = axis.getExtremes(), newMin = axis.toValue(startPos - mousePos, true) + halfPointRange, newMax = axis.toValue(startPos + chart[isX ? "plotWidth" : "plotHeight"] - mousePos, true) - halfPointRange;
                if (axis.series.length && newMin > mathMin(extremes.dataMin, extremes.min) && mathMax(extremes.dataMax, extremes.max) > newMax) {
                    axis.setExtremes(newMin, newMax, false, false, {
                        trigger: "pan"
                    });
                    doRedraw = true;
                }
                chart[isX ? "mouseDownX" : "mouseDownY"] = mousePos;
            });
            doRedraw && chart.redraw(false);
            css(chart.container, {
                cursor: "move"
            });
        }
    });
    extend(Point.prototype, {
        select: function(selected, accumulate) {
            var point = this, series = point.series, chart = series.chart;
            selected = pick(selected, !point.selected);
            point.firePointEvent(selected ? "select" : "unselect", {
                accumulate: accumulate
            }, function() {
                point.selected = point.options.selected = selected;
                series.options.data[inArray(point, series.data)] = point.options;
                point.setState(selected && SELECT_STATE);
                accumulate || each(chart.getSelectedPoints(), function(loopPoint) {
                    if (loopPoint.selected && loopPoint !== point) {
                        loopPoint.selected = loopPoint.options.selected = false;
                        series.options.data[inArray(loopPoint, series.data)] = loopPoint.options;
                        loopPoint.setState(NORMAL_STATE);
                        loopPoint.firePointEvent("unselect");
                    }
                });
            });
        },
        onMouseOver: function(e) {
            var point = this, series = point.series, chart = series.chart, tooltip = chart.tooltip, hoverPoint = chart.hoverPoint;
            hoverPoint && hoverPoint !== point && hoverPoint.onMouseOut();
            point.firePointEvent("mouseOver");
            !tooltip || tooltip.shared && !series.noSharedTooltip || tooltip.refresh(point, e);
            point.setState(HOVER_STATE);
            chart.hoverPoint = point;
        },
        onMouseOut: function() {
            var chart = this.series.chart, hoverPoints = chart.hoverPoints;
            if (!hoverPoints || -1 === inArray(this, hoverPoints)) {
                this.firePointEvent("mouseOut");
                this.setState();
                chart.hoverPoint = null;
            }
        },
        importEvents: function() {
            if (!this.hasImportedEvents) {
                var eventType, point = this, options = merge(point.series.options.point, point.options), events = options.events;
                point.events = events;
                for (eventType in events) addEvent(point, eventType, events[eventType]);
                this.hasImportedEvents = true;
            }
        },
        setState: function(state, move) {
            var radius, haloOptions, newSymbol, pointAttr, point = this, plotX = point.plotX, plotY = point.plotY, series = point.series, stateOptions = series.options.states, markerOptions = defaultPlotOptions[series.type].marker && series.options.marker, normalDisabled = markerOptions && !markerOptions.enabled, markerStateOptions = markerOptions && markerOptions.states[state], stateDisabled = markerStateOptions && false === markerStateOptions.enabled, stateMarkerGraphic = series.stateMarkerGraphic, pointMarker = point.marker || {}, chart = series.chart, halo = series.halo;
            state = state || NORMAL_STATE;
            pointAttr = point.pointAttr[state] || series.pointAttr[state];
            if (state === point.state && !move || point.selected && state !== SELECT_STATE || stateOptions[state] && false === stateOptions[state].enabled || state && (stateDisabled || normalDisabled && false === markerStateOptions.enabled) || state && pointMarker.states && pointMarker.states[state] && false === pointMarker.states[state].enabled) return;
            if (point.graphic) {
                radius = markerOptions && point.graphic.symbolName && pointAttr.r;
                point.graphic.attr(merge(pointAttr, radius ? {
                    x: plotX - radius,
                    y: plotY - radius,
                    width: 2 * radius,
                    height: 2 * radius
                } : {}));
                stateMarkerGraphic && stateMarkerGraphic.hide();
            } else {
                if (state && markerStateOptions) {
                    radius = markerStateOptions.radius;
                    newSymbol = pointMarker.symbol || series.symbol;
                    stateMarkerGraphic && stateMarkerGraphic.currentSymbol !== newSymbol && (stateMarkerGraphic = stateMarkerGraphic.destroy());
                    if (stateMarkerGraphic) stateMarkerGraphic[move ? "animate" : "attr"]({
                        x: plotX - radius,
                        y: plotY - radius
                    }); else if (newSymbol) {
                        series.stateMarkerGraphic = stateMarkerGraphic = chart.renderer.symbol(newSymbol, plotX - radius, plotY - radius, 2 * radius, 2 * radius).attr(pointAttr).add(series.markerGroup);
                        stateMarkerGraphic.currentSymbol = newSymbol;
                    }
                }
                stateMarkerGraphic && stateMarkerGraphic[state && chart.isInsidePlot(plotX, plotY, chart.inverted) ? "show" : "hide"]();
            }
            haloOptions = stateOptions[state] && stateOptions[state].halo;
            if (haloOptions && haloOptions.size) {
                halo || (series.halo = halo = chart.renderer.path().add(series.seriesGroup));
                halo.attr(extend({
                    fill: Color(point.color || series.color).setOpacity(haloOptions.opacity).get()
                }, haloOptions.attributes))[move ? "animate" : "attr"]({
                    d: point.haloPath(haloOptions.size)
                });
            } else halo && halo.attr({
                d: []
            });
            point.state = state;
        },
        haloPath: function(size) {
            var series = this.series, chart = series.chart, plotBox = series.getPlotBox(), inverted = chart.inverted;
            return chart.renderer.symbols.circle(plotBox.translateX + (inverted ? series.yAxis.len - this.plotY : this.plotX) - size, plotBox.translateY + (inverted ? series.xAxis.len - this.plotX : this.plotY) - size, 2 * size, 2 * size);
        }
    });
    extend(Series.prototype, {
        onMouseOver: function() {
            var series = this, chart = series.chart, hoverSeries = chart.hoverSeries;
            hoverSeries && hoverSeries !== series && hoverSeries.onMouseOut();
            series.options.events.mouseOver && fireEvent(series, "mouseOver");
            series.setState(HOVER_STATE);
            chart.hoverSeries = series;
        },
        onMouseOut: function() {
            var series = this, options = series.options, chart = series.chart, tooltip = chart.tooltip, hoverPoint = chart.hoverPoint;
            hoverPoint && hoverPoint.onMouseOut();
            series && options.events.mouseOut && fireEvent(series, "mouseOut");
            !tooltip || options.stickyTracking || tooltip.shared && !series.noSharedTooltip || tooltip.hide();
            series.setState();
            chart.hoverSeries = null;
        },
        setState: function(state) {
            var attribs, series = this, options = series.options, graph = series.graph, graphNeg = series.graphNeg, stateOptions = options.states, lineWidth = options.lineWidth;
            state = state || NORMAL_STATE;
            if (series.state !== state) {
                series.state = state;
                if (stateOptions[state] && false === stateOptions[state].enabled) return;
                state && (lineWidth = stateOptions[state].lineWidth || lineWidth + 1);
                if (graph && !graph.dashstyle) {
                    attribs = {
                        "stroke-width": lineWidth
                    };
                    graph.attr(attribs);
                    graphNeg && graphNeg.attr(attribs);
                }
            }
        },
        setVisible: function(vis, redraw) {
            var showOrHide, series = this, chart = series.chart, legendItem = series.legendItem, ignoreHiddenSeries = chart.options.chart.ignoreHiddenSeries, oldVisibility = series.visible;
            series.visible = vis = series.userOptions.visible = vis === UNDEFINED ? !oldVisibility : vis;
            showOrHide = vis ? "show" : "hide";
            each([ "group", "dataLabelsGroup", "markerGroup", "tracker" ], function(key) {
                series[key] && series[key][showOrHide]();
            });
            chart.hoverSeries === series && series.onMouseOut();
            legendItem && chart.legend.colorizeItem(series, vis);
            series.isDirty = true;
            series.options.stacking && each(chart.series, function(otherSeries) {
                otherSeries.options.stacking && otherSeries.visible && (otherSeries.isDirty = true);
            });
            each(series.linkedSeries, function(otherSeries) {
                otherSeries.setVisible(vis, false);
            });
            ignoreHiddenSeries && (chart.isDirtyBox = true);
            false !== redraw && chart.redraw();
            fireEvent(series, showOrHide);
        },
        setTooltipPoints: function(renew) {
            var pointsLength, low, high, point, pointX, nextPoint, i, series = this, points = [], xAxis = series.xAxis, xExtremes = xAxis && xAxis.getExtremes(), axisLength = xAxis ? xAxis.tooltipLen || xAxis.len : series.chart.plotSizeX, tooltipPoints = [];
            if (false === series.options.enableMouseTracking || series.singularTooltips) return;
            renew && (series.tooltipPoints = null);
            each(series.segments || series.points, function(segment) {
                points = points.concat(segment);
            });
            xAxis && xAxis.reversed && (points = points.reverse());
            series.orderTooltipPoints && series.orderTooltipPoints(points);
            pointsLength = points.length;
            for (i = 0; pointsLength > i; i++) {
                point = points[i];
                pointX = point.x;
                if (pointX >= xExtremes.min && xExtremes.max >= pointX) {
                    nextPoint = points[i + 1];
                    low = high === UNDEFINED ? 0 : high + 1;
                    high = points[i + 1] ? mathMin(mathMax(0, mathFloor((point.clientX + (nextPoint ? nextPoint.wrappedClientX || nextPoint.clientX : axisLength)) / 2)), axisLength) : axisLength;
                    while (low >= 0 && high >= low) tooltipPoints[low++] = point;
                }
            }
            series.tooltipPoints = tooltipPoints;
        },
        show: function() {
            this.setVisible(true);
        },
        hide: function() {
            this.setVisible(false);
        },
        select: function(selected) {
            var series = this;
            series.selected = selected = selected === UNDEFINED ? !series.selected : selected;
            series.checkbox && (series.checkbox.checked = selected);
            fireEvent(series, selected ? "select" : "unselect");
        },
        drawTracker: TrackerMixin.drawTrackerGraph
    });
    wrap(Series.prototype, "init", function(proceed) {
        var xAxis, series = this;
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));
        xAxis = series.xAxis;
        xAxis && xAxis.options.ordinal && addEvent(series, "updatedData", function() {
            delete xAxis.ordinalIndex;
        });
    });
    wrap(Axis.prototype, "getTimeTicks", function(proceed, normalizedInterval, min, max, startOfWeek, positions, closestDistance, findHigherRanks) {
        var segmentPositions, hasCrossedHigherRank, info, posLength, outsideMax, start = 0, end = 0, higherRanks = {}, groupPositions = [], lastGroupPosition = -Number.MAX_VALUE, tickPixelIntervalOption = this.options.tickPixelInterval;
        if (!this.options.ordinal || !positions || 3 > positions.length || min === UNDEFINED) return proceed.call(this, normalizedInterval, min, max, startOfWeek);
        posLength = positions.length;
        for (;posLength > end; end++) {
            outsideMax = end && positions[end - 1] > max;
            min > positions[end] && (start = end);
            if (end === posLength - 1 || positions[end + 1] - positions[end] > 5 * closestDistance || outsideMax) {
                if (positions[end] > lastGroupPosition) {
                    segmentPositions = proceed.call(this, normalizedInterval, positions[start], positions[end], startOfWeek);
                    while (segmentPositions.length && lastGroupPosition >= segmentPositions[0]) segmentPositions.shift();
                    segmentPositions.length && (lastGroupPosition = segmentPositions[segmentPositions.length - 1]);
                    groupPositions = groupPositions.concat(segmentPositions);
                }
                start = end + 1;
            }
            if (outsideMax) break;
        }
        info = segmentPositions.info;
        if (findHigherRanks && info.unitRange <= timeUnits[HOUR]) {
            end = groupPositions.length - 1;
            for (start = 1; end > start; start++) if (new Date(groupPositions[start] - timezoneOffset)[getDate]() !== new Date(groupPositions[start - 1] - timezoneOffset)[getDate]()) {
                higherRanks[groupPositions[start]] = DAY;
                hasCrossedHigherRank = true;
            }
            hasCrossedHigherRank && (higherRanks[groupPositions[0]] = DAY);
            info.higherRanks = higherRanks;
        }
        groupPositions.info = info;
        if (findHigherRanks && defined(tickPixelIntervalOption)) {
            var itemToRemove, translated, lastTranslated, medianDistance, distance, length = groupPositions.length, i = length, translatedArr = [], distances = [];
            while (i--) {
                translated = this.translate(groupPositions[i]);
                lastTranslated && (distances[i] = lastTranslated - translated);
                translatedArr[i] = lastTranslated = translated;
            }
            distances.sort();
            medianDistance = distances[mathFloor(distances.length / 2)];
            .6 * tickPixelIntervalOption > medianDistance && (medianDistance = null);
            i = groupPositions[length - 1] > max ? length - 1 : length;
            lastTranslated = void 0;
            while (i--) {
                translated = translatedArr[i];
                distance = lastTranslated - translated;
                if (lastTranslated && .8 * tickPixelIntervalOption > distance && (null === medianDistance || .8 * medianDistance > distance)) {
                    if (higherRanks[groupPositions[i]] && !higherRanks[groupPositions[i + 1]]) {
                        itemToRemove = i + 1;
                        lastTranslated = translated;
                    } else itemToRemove = i;
                    groupPositions.splice(itemToRemove, 1);
                } else lastTranslated = translated;
            }
        }
        return groupPositions;
    });
    extend(Axis.prototype, {
        beforeSetTickPositions: function() {
            var len, dist, minIndex, maxIndex, slope, i, axis = this, ordinalPositions = [], useOrdinal = false, extremes = axis.getExtremes(), min = extremes.min, max = extremes.max;
            if (axis.options.ordinal) {
                each(axis.series, function(series, i) {
                    if (false !== series.visible && false !== series.takeOrdinalPosition) {
                        ordinalPositions = ordinalPositions.concat(series.processedXData);
                        len = ordinalPositions.length;
                        ordinalPositions.sort(function(a, b) {
                            return a - b;
                        });
                        if (len) {
                            i = len - 1;
                            while (i--) ordinalPositions[i] === ordinalPositions[i + 1] && ordinalPositions.splice(i, 1);
                        }
                    }
                });
                len = ordinalPositions.length;
                if (len > 2) {
                    dist = ordinalPositions[1] - ordinalPositions[0];
                    i = len - 1;
                    while (i-- && !useOrdinal) ordinalPositions[i + 1] - ordinalPositions[i] !== dist && (useOrdinal = true);
                    !axis.options.keepOrdinalPadding && (ordinalPositions[0] - min > dist || max - ordinalPositions[ordinalPositions.length - 1] > dist) && (useOrdinal = true);
                }
                if (useOrdinal) {
                    axis.ordinalPositions = ordinalPositions;
                    minIndex = axis.val2lin(mathMax(min, ordinalPositions[0]), true);
                    maxIndex = axis.val2lin(mathMin(max, ordinalPositions[ordinalPositions.length - 1]), true);
                    axis.ordinalSlope = slope = (max - min) / (maxIndex - minIndex);
                    axis.ordinalOffset = min - minIndex * slope;
                } else axis.ordinalPositions = axis.ordinalSlope = axis.ordinalOffset = UNDEFINED;
            }
            axis.groupIntervalFactor = null;
        },
        val2lin: function(val, toIndex) {
            var axis = this, ordinalPositions = axis.ordinalPositions;
            if (ordinalPositions) {
                var i, distance, ordinalIndex, ordinalLength = ordinalPositions.length;
                i = ordinalLength;
                while (i--) if (ordinalPositions[i] === val) {
                    ordinalIndex = i;
                    break;
                }
                i = ordinalLength - 1;
                while (i--) if (val > ordinalPositions[i] || 0 === i) {
                    distance = (val - ordinalPositions[i]) / (ordinalPositions[i + 1] - ordinalPositions[i]);
                    ordinalIndex = i + distance;
                    break;
                }
                return toIndex ? ordinalIndex : axis.ordinalSlope * (ordinalIndex || 0) + axis.ordinalOffset;
            }
            return val;
        },
        lin2val: function(val, fromIndex) {
            var axis = this, ordinalPositions = axis.ordinalPositions;
            if (ordinalPositions) {
                var linearEquivalentLeft, linearEquivalentRight, distance, ordinalSlope = axis.ordinalSlope, ordinalOffset = axis.ordinalOffset, i = ordinalPositions.length - 1;
                if (fromIndex) if (0 > val) val = ordinalPositions[0]; else if (val > i) val = ordinalPositions[i]; else {
                    i = mathFloor(val);
                    distance = val - i;
                } else while (i--) {
                    linearEquivalentLeft = ordinalSlope * i + ordinalOffset;
                    if (val >= linearEquivalentLeft) {
                        linearEquivalentRight = ordinalSlope * (i + 1) + ordinalOffset;
                        distance = (val - linearEquivalentLeft) / (linearEquivalentRight - linearEquivalentLeft);
                        break;
                    }
                }
                return distance !== UNDEFINED && ordinalPositions[i] !== UNDEFINED ? ordinalPositions[i] + (distance ? distance * (ordinalPositions[i + 1] - ordinalPositions[i]) : 0) : val;
            }
            return val;
        },
        getExtendedPositions: function() {
            var fakeAxis, fakeSeries, axis = this, chart = axis.chart, grouping = axis.series[0].currentDataGrouping, ordinalIndex = axis.ordinalIndex, key = grouping ? grouping.count + grouping.unitName : "raw", extremes = axis.getExtremes();
            ordinalIndex || (ordinalIndex = axis.ordinalIndex = {});
            if (!ordinalIndex[key]) {
                fakeAxis = {
                    series: [],
                    getExtremes: function() {
                        return {
                            min: extremes.dataMin,
                            max: extremes.dataMax
                        };
                    },
                    options: {
                        ordinal: true
                    },
                    val2lin: Axis.prototype.val2lin
                };
                each(axis.series, function(series) {
                    fakeSeries = {
                        xAxis: fakeAxis,
                        xData: series.xData,
                        chart: chart,
                        destroyGroupedData: noop
                    };
                    fakeSeries.options = {
                        dataGrouping: grouping ? {
                            enabled: true,
                            forced: true,
                            approximation: "open",
                            units: [ [ grouping.unitName, [ grouping.count ] ] ]
                        } : {
                            enabled: false
                        }
                    };
                    series.processData.apply(fakeSeries);
                    fakeAxis.series.push(fakeSeries);
                });
                axis.beforeSetTickPositions.apply(fakeAxis);
                ordinalIndex[key] = fakeAxis.ordinalPositions;
            }
            return ordinalIndex[key];
        },
        getGroupIntervalFactor: function(xMin, xMax, series) {
            var median, i = 0, processedXData = series.processedXData, len = processedXData.length, distances = [], groupIntervalFactor = this.groupIntervalFactor;
            if (!groupIntervalFactor) {
                for (;len - 1 > i; i++) distances[i] = processedXData[i + 1] - processedXData[i];
                distances.sort(function(a, b) {
                    return a - b;
                });
                median = distances[mathFloor(len / 2)];
                xMin = mathMax(xMin, processedXData[0]);
                xMax = mathMin(xMax, processedXData[len - 1]);
                this.groupIntervalFactor = groupIntervalFactor = len * median / (xMax - xMin);
            }
            return groupIntervalFactor;
        },
        postProcessTickInterval: function(tickInterval) {
            var ordinalSlope = this.ordinalSlope;
            return ordinalSlope ? tickInterval / (ordinalSlope / this.closestPointRange) : tickInterval;
        }
    });
    wrap(Chart.prototype, "pan", function(proceed, e) {
        var chart = this, xAxis = chart.xAxis[0], chartX = e.chartX, runBase = false;
        if (xAxis.options.ordinal && xAxis.series.length) {
            var trimmedRange, ordinalPositions, searchAxisLeft, searchAxisRight, mouseDownX = chart.mouseDownX, extremes = xAxis.getExtremes(), dataMax = extremes.dataMax, min = extremes.min, max = extremes.max, hoverPoints = chart.hoverPoints, closestPointRange = xAxis.closestPointRange, pointPixelWidth = xAxis.translationSlope * (xAxis.ordinalSlope || closestPointRange), movedUnits = (mouseDownX - chartX) / pointPixelWidth, extendedAxis = {
                ordinalPositions: xAxis.getExtendedPositions()
            }, lin2val = xAxis.lin2val, val2lin = xAxis.val2lin;
            if (extendedAxis.ordinalPositions) {
                if (mathAbs(movedUnits) > 1) {
                    hoverPoints && each(hoverPoints, function(point) {
                        point.setState();
                    });
                    if (0 > movedUnits) {
                        searchAxisLeft = extendedAxis;
                        searchAxisRight = xAxis.ordinalPositions ? xAxis : extendedAxis;
                    } else {
                        searchAxisLeft = xAxis.ordinalPositions ? xAxis : extendedAxis;
                        searchAxisRight = extendedAxis;
                    }
                    ordinalPositions = searchAxisRight.ordinalPositions;
                    dataMax > ordinalPositions[ordinalPositions.length - 1] && ordinalPositions.push(dataMax);
                    chart.fixedRange = max - min;
                    trimmedRange = xAxis.toFixedRange(null, null, lin2val.apply(searchAxisLeft, [ val2lin.apply(searchAxisLeft, [ min, true ]) + movedUnits, true ]), lin2val.apply(searchAxisRight, [ val2lin.apply(searchAxisRight, [ max, true ]) + movedUnits, true ]));
                    trimmedRange.min >= mathMin(extremes.dataMin, min) && trimmedRange.max <= mathMax(dataMax, max) && xAxis.setExtremes(trimmedRange.min, trimmedRange.max, true, false, {
                        trigger: "pan"
                    });
                    chart.mouseDownX = chartX;
                    css(chart.container, {
                        cursor: "move"
                    });
                }
            } else runBase = true;
        } else runBase = true;
        runBase && proceed.apply(this, Array.prototype.slice.call(arguments, 1));
    });
    wrap(Series.prototype, "getSegments", function(proceed) {
        var segments, series = this, gapSize = series.options.gapSize, xAxis = series.xAxis;
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));
        if (gapSize) {
            segments = series.segments;
            each(segments, function(segment, no) {
                var i = segment.length - 1;
                while (i--) segment[i + 1].x - segment[i].x > xAxis.closestPointRange * gapSize && segments.splice(no + 1, 0, segment.splice(i + 1, segment.length - i));
            });
        }
    });
    var DATA_GROUPING = "dataGrouping", seriesProto = Series.prototype, tooltipProto = Tooltip.prototype, baseProcessData = seriesProto.processData, baseGeneratePoints = seriesProto.generatePoints, baseDestroy = seriesProto.destroy, baseTooltipHeaderFormatter = tooltipProto.tooltipHeaderFormatter, NUMBER = "number", commonOptions = {
        approximation: "average",
        groupPixelWidth: 2,
        dateTimeLabelFormats: hash(MILLISECOND, [ "%A, %b %e, %H:%M:%S.%L", "%A, %b %e, %H:%M:%S.%L", "-%H:%M:%S.%L" ], SECOND, [ "%A, %b %e, %H:%M:%S", "%A, %b %e, %H:%M:%S", "-%H:%M:%S" ], MINUTE, [ "%A, %b %e, %H:%M", "%A, %b %e, %H:%M", "-%H:%M" ], HOUR, [ "%A, %b %e, %H:%M", "%A, %b %e, %H:%M", "-%H:%M" ], DAY, [ "%A, %b %e, %Y", "%A, %b %e", "-%A, %b %e, %Y" ], WEEK, [ "Week from %A, %b %e, %Y", "%A, %b %e", "-%A, %b %e, %Y" ], MONTH, [ "%B %Y", "%B", "-%B %Y" ], YEAR, [ "%Y", "%Y", "-%Y" ])
    }, specificOptions = {
        line: {},
        spline: {},
        area: {},
        areaspline: {},
        column: {
            approximation: "sum",
            groupPixelWidth: 10
        },
        arearange: {
            approximation: "range"
        },
        areasplinerange: {
            approximation: "range"
        },
        columnrange: {
            approximation: "range",
            groupPixelWidth: 10
        },
        candlestick: {
            approximation: "ohlc",
            groupPixelWidth: 10
        },
        ohlc: {
            approximation: "ohlc",
            groupPixelWidth: 5
        }
    }, defaultDataGroupingUnits = [ [ MILLISECOND, [ 1, 2, 5, 10, 20, 25, 50, 100, 200, 500 ] ], [ SECOND, [ 1, 2, 5, 10, 15, 30 ] ], [ MINUTE, [ 1, 2, 5, 10, 15, 30 ] ], [ HOUR, [ 1, 2, 3, 4, 6, 8, 12 ] ], [ DAY, [ 1 ] ], [ WEEK, [ 1 ] ], [ MONTH, [ 1, 3, 6 ] ], [ YEAR, null ] ], approximations = {
        sum: function(arr) {
            var ret, len = arr.length;
            if (!len && arr.hasNulls) ret = null; else if (len) {
                ret = 0;
                while (len--) ret += arr[len];
            }
            return ret;
        },
        average: function(arr) {
            var len = arr.length, ret = approximations.sum(arr);
            typeof ret === NUMBER && len && (ret /= len);
            return ret;
        },
        open: function(arr) {
            return arr.length ? arr[0] : arr.hasNulls ? null : UNDEFINED;
        },
        high: function(arr) {
            return arr.length ? arrayMax(arr) : arr.hasNulls ? null : UNDEFINED;
        },
        low: function(arr) {
            return arr.length ? arrayMin(arr) : arr.hasNulls ? null : UNDEFINED;
        },
        close: function(arr) {
            return arr.length ? arr[arr.length - 1] : arr.hasNulls ? null : UNDEFINED;
        },
        ohlc: function(open, high, low, close) {
            open = approximations.open(open);
            high = approximations.high(high);
            low = approximations.low(low);
            close = approximations.close(close);
            if (typeof open === NUMBER || typeof high === NUMBER || typeof low === NUMBER || typeof close === NUMBER) return [ open, high, low, close ];
        },
        range: function(low, high) {
            low = approximations.low(low);
            high = approximations.high(high);
            if (typeof low === NUMBER || typeof high === NUMBER) return [ low, high ];
        }
    };
    seriesProto.groupData = function(xData, yData, groupPositions, approximation) {
        var pointX, pointY, groupedY, i, series = this, data = series.data, dataOptions = series.options.data, groupedXData = [], groupedYData = [], dataLength = xData.length, handleYData = !!yData, values = [ [], [], [], [] ], approximationFn = "function" == typeof approximation ? approximation : approximations[approximation], pointArrayMap = series.pointArrayMap, pointArrayMapLength = pointArrayMap && pointArrayMap.length;
        for (i = 0; dataLength >= i; i++) if (xData[i] >= groupPositions[0]) break;
        for (;dataLength >= i; i++) {
            while (groupPositions[1] !== UNDEFINED && xData[i] >= groupPositions[1] || i === dataLength) {
                pointX = groupPositions.shift();
                groupedY = approximationFn.apply(0, values);
                if (groupedY !== UNDEFINED) {
                    groupedXData.push(pointX);
                    groupedYData.push(groupedY);
                }
                values[0] = [];
                values[1] = [];
                values[2] = [];
                values[3] = [];
                if (i === dataLength) break;
            }
            if (i === dataLength) break;
            if (pointArrayMap) {
                var j, val, index = series.cropStart + i, point = data && data[index] || series.pointClass.prototype.applyOptions.apply({
                    series: series
                }, [ dataOptions[index] ]);
                for (j = 0; pointArrayMapLength > j; j++) {
                    val = point[pointArrayMap[j]];
                    typeof val === NUMBER ? values[j].push(val) : null === val && (values[j].hasNulls = true);
                }
            } else {
                pointY = handleYData ? yData[i] : null;
                typeof pointY === NUMBER ? values[0].push(pointY) : null === pointY && (values[0].hasNulls = true);
            }
        }
        return [ groupedXData, groupedYData ];
    };
    seriesProto.processData = function() {
        var hasGroupedData, series = this, chart = series.chart, options = series.options, dataGroupingOptions = options[DATA_GROUPING], groupingEnabled = dataGroupingOptions && pick(dataGroupingOptions.enabled, chart.options._stock);
        series.forceCrop = groupingEnabled;
        series.groupPixelWidth = null;
        series.hasProcessed = true;
        if (false === baseProcessData.apply(series, arguments) || !groupingEnabled) return;
        series.destroyGroupedData();
        var i, processedXData = series.processedXData, processedYData = series.processedYData, plotSizeX = chart.plotSizeX, xAxis = series.xAxis, ordinal = xAxis.options.ordinal, groupPixelWidth = series.groupPixelWidth = xAxis.getGroupPixelWidth && xAxis.getGroupPixelWidth(), nonGroupedPointRange = series.pointRange;
        if (groupPixelWidth) {
            hasGroupedData = true;
            series.points = null;
            var extremes = xAxis.getExtremes(), xMin = extremes.min, xMax = extremes.max, groupIntervalFactor = ordinal && xAxis.getGroupIntervalFactor(xMin, xMax, series) || 1, interval = groupPixelWidth * (xMax - xMin) / plotSizeX * groupIntervalFactor, groupPositions = xAxis.getTimeTicks(xAxis.normalizeTimeTickInterval(interval, dataGroupingOptions.units || defaultDataGroupingUnits), xMin, xMax, null, processedXData, series.closestPointRange), groupedXandY = seriesProto.groupData.apply(series, [ processedXData, processedYData, groupPositions, dataGroupingOptions.approximation ]), groupedXData = groupedXandY[0], groupedYData = groupedXandY[1];
            if (dataGroupingOptions.smoothed) {
                i = groupedXData.length - 1;
                groupedXData[i] = xMax;
                while (i-- && i > 0) groupedXData[i] += interval / 2;
                groupedXData[0] = xMin;
            }
            series.currentDataGrouping = groupPositions.info;
            null === options.pointRange && (series.pointRange = groupPositions.info.totalRange);
            series.closestPointRange = groupPositions.info.totalRange;
            defined(groupedXData[0]) && groupedXData[0] < xAxis.dataMin && (xAxis.dataMin = groupedXData[0]);
            series.processedXData = groupedXData;
            series.processedYData = groupedYData;
        } else {
            series.currentDataGrouping = null;
            series.pointRange = nonGroupedPointRange;
        }
        series.hasGroupedData = hasGroupedData;
    };
    seriesProto.destroyGroupedData = function() {
        var groupedData = this.groupedData;
        each(groupedData || [], function(point, i) {
            point && (groupedData[i] = point.destroy ? point.destroy() : null);
        });
        this.groupedData = null;
    };
    seriesProto.generatePoints = function() {
        baseGeneratePoints.apply(this);
        this.destroyGroupedData();
        this.groupedData = this.hasGroupedData ? this.points : null;
    };
    tooltipProto.tooltipHeaderFormatter = function(point) {
        var xDateFormatEnd, currentDataGrouping, dateTimeLabelFormats, labelFormats, formattedKey, n, ret, tooltip = this, series = point.series, options = series.options, tooltipOptions = series.tooltipOptions, dataGroupingOptions = options.dataGrouping, xDateFormat = tooltipOptions.xDateFormat, xAxis = series.xAxis;
        if (xAxis && "datetime" === xAxis.options.type && dataGroupingOptions && isNumber(point.key)) {
            currentDataGrouping = series.currentDataGrouping;
            dateTimeLabelFormats = dataGroupingOptions.dateTimeLabelFormats;
            if (currentDataGrouping) {
                labelFormats = dateTimeLabelFormats[currentDataGrouping.unitName];
                if (1 === currentDataGrouping.count) xDateFormat = labelFormats[0]; else {
                    xDateFormat = labelFormats[1];
                    xDateFormatEnd = labelFormats[2];
                }
            } else if (!xDateFormat && dateTimeLabelFormats) for (n in timeUnits) if (timeUnits[n] >= xAxis.closestPointRange || timeUnits[n] <= timeUnits[DAY] && point.key % timeUnits[n] > 0) {
                xDateFormat = dateTimeLabelFormats[n][0];
                break;
            }
            formattedKey = dateFormat(xDateFormat, point.key);
            xDateFormatEnd && (formattedKey += dateFormat(xDateFormatEnd, point.key + currentDataGrouping.totalRange - 1));
            ret = tooltipOptions.headerFormat.replace("{point.key}", formattedKey);
        } else ret = baseTooltipHeaderFormatter.call(tooltip, point);
        return ret;
    };
    seriesProto.destroy = function() {
        var series = this, groupedData = series.groupedData || [], i = groupedData.length;
        while (i--) groupedData[i] && groupedData[i].destroy();
        baseDestroy.apply(series);
    };
    wrap(seriesProto, "setOptions", function(proceed, itemOptions) {
        var options = proceed.call(this, itemOptions), type = this.type, plotOptions = this.chart.options.plotOptions, defaultOptions = defaultPlotOptions[type].dataGrouping;
        if (specificOptions[type]) {
            defaultOptions || (defaultOptions = merge(commonOptions, specificOptions[type]));
            options.dataGrouping = merge(defaultOptions, plotOptions.series && plotOptions.series.dataGrouping, plotOptions[type].dataGrouping, itemOptions.dataGrouping);
        }
        this.chart.options._stock && (this.requireSorting = true);
        return options;
    });
    wrap(Axis.prototype, "setScale", function(proceed) {
        proceed.call(this);
        each(this.series, function(series) {
            series.hasProcessed = false;
        });
    });
    Axis.prototype.getGroupPixelWidth = function() {
        var i, dataLength, dgOptions, series = this.series, len = series.length, groupPixelWidth = 0, doGrouping = false;
        i = len;
        while (i--) {
            dgOptions = series[i].options.dataGrouping;
            dgOptions && (groupPixelWidth = mathMax(groupPixelWidth, dgOptions.groupPixelWidth));
        }
        i = len;
        while (i--) {
            dgOptions = series[i].options.dataGrouping;
            if (dgOptions && series[i].hasProcessed) {
                dataLength = (series[i].processedXData || series[i].data).length;
                (series[i].groupPixelWidth || dataLength > this.chart.plotSizeX / groupPixelWidth || dataLength && dgOptions.forced) && (doGrouping = true);
            }
        }
        return doGrouping ? groupPixelWidth : 0;
    };
    defaultPlotOptions.ohlc = merge(defaultPlotOptions.column, {
        lineWidth: 1,
        tooltip: {
            pointFormat: '<span style="color:{series.color}">●</span> <b> {series.name}</b><br/>Open: {point.open}<br/>High: {point.high}<br/>Low: {point.low}<br/>Close: {point.close}<br/>'
        },
        states: {
            hover: {
                lineWidth: 3
            }
        },
        threshold: null
    });
    var OHLCSeries = extendClass(seriesTypes.column, {
        type: "ohlc",
        pointArrayMap: [ "open", "high", "low", "close" ],
        toYData: function(point) {
            return [ point.open, point.high, point.low, point.close ];
        },
        pointValKey: "high",
        pointAttrToOptions: {
            stroke: "color",
            "stroke-width": "lineWidth"
        },
        upColorProp: "stroke",
        getAttribs: function() {
            seriesTypes.column.prototype.getAttribs.apply(this, arguments);
            var series = this, options = series.options, stateOptions = options.states, upColor = options.upColor || series.color, seriesDownPointAttr = merge(series.pointAttr), upColorProp = series.upColorProp;
            seriesDownPointAttr[""][upColorProp] = upColor;
            seriesDownPointAttr.hover[upColorProp] = stateOptions.hover.upColor || upColor;
            seriesDownPointAttr.select[upColorProp] = stateOptions.select.upColor || upColor;
            each(series.points, function(point) {
                point.open < point.close && (point.pointAttr = seriesDownPointAttr);
            });
        },
        translate: function() {
            var series = this, yAxis = series.yAxis;
            seriesTypes.column.prototype.translate.apply(series);
            each(series.points, function(point) {
                null !== point.open && (point.plotOpen = yAxis.translate(point.open, 0, 1, 0, 1));
                null !== point.close && (point.plotClose = yAxis.translate(point.close, 0, 1, 0, 1));
            });
        },
        drawPoints: function() {
            var pointAttr, plotOpen, plotClose, crispCorr, halfWidth, path, graphic, crispX, series = this, points = series.points, chart = series.chart;
            each(points, function(point) {
                if (point.plotY !== UNDEFINED) {
                    graphic = point.graphic;
                    pointAttr = point.pointAttr[point.selected ? "selected" : ""] || series.pointAttr[NORMAL_STATE];
                    crispCorr = pointAttr["stroke-width"] % 2 / 2;
                    crispX = mathRound(point.plotX) - crispCorr;
                    halfWidth = mathRound(point.shapeArgs.width / 2);
                    path = [ "M", crispX, mathRound(point.yBottom), "L", crispX, mathRound(point.plotY) ];
                    if (null !== point.open) {
                        plotOpen = mathRound(point.plotOpen) + crispCorr;
                        path.push("M", crispX, plotOpen, "L", crispX - halfWidth, plotOpen);
                    }
                    if (null !== point.close) {
                        plotClose = mathRound(point.plotClose) + crispCorr;
                        path.push("M", crispX, plotClose, "L", crispX + halfWidth, plotClose);
                    }
                    graphic ? graphic.animate({
                        d: path
                    }) : point.graphic = chart.renderer.path(path).attr(pointAttr).add(series.group);
                }
            });
        },
        animate: null
    });
    seriesTypes.ohlc = OHLCSeries;
    defaultPlotOptions.candlestick = merge(defaultPlotOptions.column, {
        lineColor: "black",
        lineWidth: 1,
        states: {
            hover: {
                lineWidth: 2
            }
        },
        tooltip: defaultPlotOptions.ohlc.tooltip,
        threshold: null,
        upColor: "white"
    });
    var CandlestickSeries = extendClass(OHLCSeries, {
        type: "candlestick",
        pointAttrToOptions: {
            fill: "color",
            stroke: "lineColor",
            "stroke-width": "lineWidth"
        },
        upColorProp: "fill",
        getAttribs: function() {
            seriesTypes.ohlc.prototype.getAttribs.apply(this, arguments);
            var series = this, options = series.options, stateOptions = options.states, upLineColor = options.upLineColor || options.lineColor, hoverStroke = stateOptions.hover.upLineColor || upLineColor, selectStroke = stateOptions.select.upLineColor || upLineColor;
            each(series.points, function(point) {
                if (point.open < point.close) {
                    point.pointAttr[""].stroke = upLineColor;
                    point.pointAttr.hover.stroke = hoverStroke;
                    point.pointAttr.select.stroke = selectStroke;
                }
            });
        },
        drawPoints: function() {
            var pointAttr, plotOpen, plotClose, topBox, bottomBox, hasTopWhisker, hasBottomWhisker, crispCorr, crispX, graphic, path, halfWidth, series = this, points = series.points, chart = series.chart, seriesPointAttr = series.pointAttr[""];
            each(points, function(point) {
                graphic = point.graphic;
                if (point.plotY !== UNDEFINED) {
                    pointAttr = point.pointAttr[point.selected ? "selected" : ""] || seriesPointAttr;
                    crispCorr = pointAttr["stroke-width"] % 2 / 2;
                    crispX = mathRound(point.plotX) - crispCorr;
                    plotOpen = point.plotOpen;
                    plotClose = point.plotClose;
                    topBox = math.min(plotOpen, plotClose);
                    bottomBox = math.max(plotOpen, plotClose);
                    halfWidth = mathRound(point.shapeArgs.width / 2);
                    hasTopWhisker = mathRound(topBox) !== mathRound(point.plotY);
                    hasBottomWhisker = bottomBox !== point.yBottom;
                    topBox = mathRound(topBox) + crispCorr;
                    bottomBox = mathRound(bottomBox) + crispCorr;
                    path = [ "M", crispX - halfWidth, bottomBox, "L", crispX - halfWidth, topBox, "L", crispX + halfWidth, topBox, "L", crispX + halfWidth, bottomBox, "Z", "M", crispX, topBox, "L", crispX, hasTopWhisker ? mathRound(point.plotY) : topBox, "M", crispX, bottomBox, "L", crispX, hasBottomWhisker ? mathRound(point.yBottom) : bottomBox, "Z" ];
                    graphic ? graphic.animate({
                        d: path
                    }) : point.graphic = chart.renderer.path(path).attr(pointAttr).add(series.group).shadow(series.options.shadow);
                }
            });
        }
    });
    seriesTypes.candlestick = CandlestickSeries;
    var symbols = SVGRenderer.prototype.symbols;
    defaultPlotOptions.flags = merge(defaultPlotOptions.column, {
        dataGrouping: null,
        fillColor: "white",
        lineWidth: 1,
        pointRange: 0,
        shape: "flag",
        stackDistance: 12,
        states: {
            hover: {
                lineColor: "black",
                fillColor: "#FCFFC5"
            }
        },
        style: {
            fontSize: "11px",
            fontWeight: "bold",
            textAlign: "center"
        },
        tooltip: {
            pointFormat: "{point.text}<br/>"
        },
        threshold: null,
        y: -30
    });
    seriesTypes.flags = extendClass(seriesTypes.column, {
        type: "flags",
        sorted: false,
        noSharedTooltip: true,
        takeOrdinalPosition: false,
        trackerGroups: [ "markerGroup" ],
        forceCrop: true,
        init: Series.prototype.init,
        pointAttrToOptions: {
            fill: "fillColor",
            stroke: "color",
            "stroke-width": "lineWidth",
            r: "radius"
        },
        translate: function() {
            seriesTypes.column.prototype.translate.apply(this);
            var point, lastPoint, leftPoint, lastX, rightPoint, currentDataGrouping, series = this, options = series.options, chart = series.chart, points = series.points, cursor = points.length - 1, optionsOnSeries = options.onSeries, onSeries = optionsOnSeries && chart.get(optionsOnSeries), step = onSeries && onSeries.options.step, onData = onSeries && onSeries.points, i = onData && onData.length, xAxis = series.xAxis, xAxisExt = xAxis.getExtremes();
            if (onSeries && onSeries.visible && i) {
                currentDataGrouping = onSeries.currentDataGrouping;
                lastX = onData[i - 1].x + (currentDataGrouping ? currentDataGrouping.totalRange : 0);
                points.sort(function(a, b) {
                    return a.x - b.x;
                });
                while (i-- && points[cursor]) {
                    point = points[cursor];
                    leftPoint = onData[i];
                    if (leftPoint.x <= point.x && leftPoint.plotY !== UNDEFINED) {
                        if (lastX >= point.x) {
                            point.plotY = leftPoint.plotY;
                            if (leftPoint.x < point.x && !step) {
                                rightPoint = onData[i + 1];
                                rightPoint && rightPoint.plotY !== UNDEFINED && (point.plotY += (point.x - leftPoint.x) / (rightPoint.x - leftPoint.x) * (rightPoint.plotY - leftPoint.plotY));
                            }
                        }
                        cursor--;
                        i++;
                        if (0 > cursor) break;
                    }
                }
            }
            each(points, function(point, i) {
                point.plotY === UNDEFINED && (point.x >= xAxisExt.min && point.x <= xAxisExt.max ? point.plotY = chart.chartHeight - xAxis.bottom - (xAxis.opposite ? xAxis.height : 0) + xAxis.offset - chart.plotTop : point.shapeArgs = {});
                lastPoint = points[i - 1];
                if (lastPoint && lastPoint.plotX === point.plotX) {
                    lastPoint.stackIndex === UNDEFINED && (lastPoint.stackIndex = 0);
                    point.stackIndex = lastPoint.stackIndex + 1;
                }
            });
        },
        drawPoints: function() {
            var pointAttr, plotX, plotY, shape, i, point, graphic, stackIndex, anchorX, anchorY, outsideRight, series = this, seriesPointAttr = series.pointAttr[""], points = series.points, chart = series.chart, renderer = chart.renderer, options = series.options, optionsY = options.y, crisp = options.lineWidth % 2 / 2;
            i = points.length;
            while (i--) {
                point = points[i];
                outsideRight = point.plotX > series.xAxis.len;
                plotX = point.plotX + (outsideRight ? crisp : -crisp);
                stackIndex = point.stackIndex;
                shape = point.options.shape || options.shape;
                plotY = point.plotY;
                plotY !== UNDEFINED && (plotY = point.plotY + optionsY + crisp - (stackIndex !== UNDEFINED && stackIndex * options.stackDistance));
                anchorX = stackIndex ? UNDEFINED : point.plotX + crisp;
                anchorY = stackIndex ? UNDEFINED : point.plotY;
                graphic = point.graphic;
                if (plotY !== UNDEFINED && plotX >= 0 && !outsideRight) {
                    pointAttr = point.pointAttr[point.selected ? "select" : ""] || seriesPointAttr;
                    graphic ? graphic.attr({
                        x: plotX,
                        y: plotY,
                        r: pointAttr.r,
                        anchorX: anchorX,
                        anchorY: anchorY
                    }) : graphic = point.graphic = renderer.label(point.options.title || options.title || "A", plotX, plotY, shape, anchorX, anchorY, options.useHTML).css(merge(options.style, point.style)).attr(pointAttr).attr({
                        align: "flag" === shape ? "left" : "center",
                        width: options.width,
                        height: options.height
                    }).add(series.markerGroup).shadow(options.shadow);
                    point.tooltipPos = [ plotX, plotY ];
                } else graphic && (point.graphic = graphic.destroy());
            }
        },
        drawTracker: function() {
            var series = this, points = series.points;
            TrackerMixin.drawTrackerPoint.apply(this);
            each(points, function(point) {
                var graphic = point.graphic;
                graphic && addEvent(graphic.element, "mouseover", function() {
                    if (point.stackIndex > 0 && !point.raised) {
                        point._y = graphic.y;
                        graphic.attr({
                            y: point._y - 8
                        });
                        point.raised = true;
                    }
                    each(points, function(otherPoint) {
                        if (otherPoint !== point && otherPoint.raised && otherPoint.graphic) {
                            otherPoint.graphic.attr({
                                y: otherPoint._y
                            });
                            otherPoint.raised = false;
                        }
                    });
                });
            });
        },
        animate: noop
    });
    symbols.flag = function(x, y, w, h, options) {
        var anchorX = options && options.anchorX || x, anchorY = options && options.anchorY || y;
        return [ "M", anchorX, anchorY, "L", x, y + h, x, y, x + w, y, x + w, y + h, x, y + h, "M", anchorX, anchorY, "Z" ];
    };
    each([ "circle", "square" ], function(shape) {
        symbols[shape + "pin"] = function(x, y, w, h, options) {
            var labelTopOrBottomY, anchorX = options && options.anchorX, anchorY = options && options.anchorY, path = symbols[shape](x, y, w, h);
            if (anchorX && anchorY) {
                labelTopOrBottomY = y > anchorY ? y : y + h;
                path.push("M", anchorX, labelTopOrBottomY, "L", anchorX, anchorY);
            }
            return path;
        };
    });
    Renderer === Highcharts.VMLRenderer && each([ "flag", "circlepin", "squarepin" ], function(shape) {
        VMLRenderer.prototype.symbols[shape] = symbols[shape];
    });
    var defaultSeriesType, units = [].concat(defaultDataGroupingUnits);
    units[4] = [ DAY, [ 1, 2, 3, 4 ] ];
    units[5] = [ WEEK, [ 1, 2, 3 ] ];
    defaultSeriesType = seriesTypes.areaspline === UNDEFINED ? "line" : "areaspline";
    extend(defaultOptions, {
        navigator: {
            handles: {
                backgroundColor: "#ebe7e8",
                borderColor: "#b2b1b6"
            },
            height: 40,
            margin: 25,
            maskFill: "rgba(128,179,236,0.3)",
            maskInside: true,
            outlineColor: "#b2b1b6",
            outlineWidth: 1,
            series: {
                type: defaultSeriesType,
                color: "#4572A7",
                compare: null,
                fillOpacity: .05,
                dataGrouping: {
                    approximation: "average",
                    enabled: true,
                    groupPixelWidth: 2,
                    smoothed: true,
                    units: units
                },
                dataLabels: {
                    enabled: false,
                    zIndex: 2
                },
                id: PREFIX + "navigator-series",
                lineColor: "#4572A7",
                lineWidth: 1,
                marker: {
                    enabled: false
                },
                pointRange: 0,
                shadow: false,
                threshold: null
            },
            xAxis: {
                tickWidth: 0,
                lineWidth: 0,
                gridLineColor: "#EEE",
                gridLineWidth: 1,
                tickPixelInterval: 200,
                labels: {
                    align: "left",
                    style: {
                        color: "#888"
                    },
                    x: 3,
                    y: -4
                },
                crosshair: false
            },
            yAxis: {
                gridLineWidth: 0,
                startOnTick: false,
                endOnTick: false,
                minPadding: .1,
                maxPadding: .1,
                labels: {
                    enabled: false
                },
                crosshair: false,
                title: {
                    text: null
                },
                tickWidth: 0
            }
        },
        scrollbar: {
            height: isTouchDevice ? 20 : 14,
            barBackgroundColor: "#bfc8d1",
            barBorderRadius: 0,
            barBorderWidth: 1,
            barBorderColor: "#bfc8d1",
            buttonArrowColor: "#666",
            buttonBackgroundColor: "#ebe7e8",
            buttonBorderColor: "#bbb",
            buttonBorderRadius: 0,
            buttonBorderWidth: 1,
            minWidth: 6,
            rifleColor: "#666",
            trackBackgroundColor: "#eeeeee",
            trackBorderColor: "#eeeeee",
            trackBorderWidth: 1,
            liveRedraw: hasSVG && !isTouchDevice
        }
    });
    Scroller.prototype = {
        drawHandle: function(x, index) {
            var tempElem, scroller = this, chart = scroller.chart, renderer = chart.renderer, elementsToDestroy = scroller.elementsToDestroy, handles = scroller.handles, handlesOptions = scroller.navigatorOptions.handles, attr = {
                fill: handlesOptions.backgroundColor,
                stroke: handlesOptions.borderColor,
                "stroke-width": 1
            };
            if (!scroller.rendered) {
                handles[index] = renderer.g("navigator-handle-" + [ "left", "right" ][index]).css({
                    cursor: "e-resize"
                }).attr({
                    zIndex: 4 - index
                }).add();
                tempElem = renderer.rect(-4.5, 0, 9, 16, 0, 1).attr(attr).add(handles[index]);
                elementsToDestroy.push(tempElem);
                tempElem = renderer.path([ "M", -1.5, 4, "L", -1.5, 12, "M", .5, 4, "L", .5, 12 ]).attr(attr).add(handles[index]);
                elementsToDestroy.push(tempElem);
            }
            handles[index][chart.isResizing ? "animate" : "attr"]({
                translateX: scroller.scrollerLeft + scroller.scrollbarHeight + parseInt(x, 10),
                translateY: scroller.top + scroller.height / 2 - 8
            });
        },
        drawScrollbarButton: function(index) {
            var tempElem, scroller = this, chart = scroller.chart, renderer = chart.renderer, elementsToDestroy = scroller.elementsToDestroy, scrollbarButtons = scroller.scrollbarButtons, scrollbarHeight = scroller.scrollbarHeight, scrollbarOptions = scroller.scrollbarOptions;
            if (!scroller.rendered) {
                scrollbarButtons[index] = renderer.g().add(scroller.scrollbarGroup);
                tempElem = renderer.rect(-.5, -.5, scrollbarHeight + 1, scrollbarHeight + 1, scrollbarOptions.buttonBorderRadius, scrollbarOptions.buttonBorderWidth).attr({
                    stroke: scrollbarOptions.buttonBorderColor,
                    "stroke-width": scrollbarOptions.buttonBorderWidth,
                    fill: scrollbarOptions.buttonBackgroundColor
                }).add(scrollbarButtons[index]);
                elementsToDestroy.push(tempElem);
                tempElem = renderer.path([ "M", scrollbarHeight / 2 + (index ? -1 : 1), scrollbarHeight / 2 - 3, "L", scrollbarHeight / 2 + (index ? -1 : 1), scrollbarHeight / 2 + 3, scrollbarHeight / 2 + (index ? 2 : -2), scrollbarHeight / 2 ]).attr({
                    fill: scrollbarOptions.buttonArrowColor
                }).add(scrollbarButtons[index]);
                elementsToDestroy.push(tempElem);
            }
            index && scrollbarButtons[index].attr({
                translateX: scroller.scrollerWidth - scrollbarHeight
            });
        },
        render: function(min, max, pxMin, pxMax) {
            var navigatorLeft, navigatorWidth, scrollerLeft, scrollerWidth, zoomedMin, zoomedMax, range, scrX, scrWidth, strokeWidth, centerBarX, verb, unionExtremes, scroller = this, chart = scroller.chart, renderer = chart.renderer, scrollbarGroup = scroller.scrollbarGroup, navigatorGroup = scroller.navigatorGroup, scrollbar = scroller.scrollbar, xAxis = scroller.xAxis, scrollbarTrack = scroller.scrollbarTrack, scrollbarHeight = scroller.scrollbarHeight, scrollbarEnabled = scroller.scrollbarEnabled, navigatorOptions = scroller.navigatorOptions, scrollbarOptions = scroller.scrollbarOptions, scrollbarMinWidth = scrollbarOptions.minWidth, height = scroller.height, top = scroller.top, navigatorEnabled = scroller.navigatorEnabled, outlineWidth = navigatorOptions.outlineWidth, halfOutline = outlineWidth / 2, scrollbarPad = 0, outlineHeight = scroller.outlineHeight, barBorderRadius = scrollbarOptions.barBorderRadius, scrollbarStrokeWidth = scrollbarOptions.barBorderWidth, outlineTop = top + halfOutline;
            if (isNaN(min)) return;
            scroller.navigatorLeft = navigatorLeft = pick(xAxis.left, chart.plotLeft + scrollbarHeight);
            scroller.navigatorWidth = navigatorWidth = pick(xAxis.len, chart.plotWidth - 2 * scrollbarHeight);
            scroller.scrollerLeft = scrollerLeft = navigatorLeft - scrollbarHeight;
            scroller.scrollerWidth = scrollerWidth = scrollerWidth = navigatorWidth + 2 * scrollbarHeight;
            if (xAxis.getExtremes) {
                unionExtremes = scroller.getUnionExtremes(true);
                !unionExtremes || unionExtremes.dataMin === xAxis.min && unionExtremes.dataMax === xAxis.max || xAxis.setExtremes(unionExtremes.dataMin, unionExtremes.dataMax, true, false);
            }
            pxMin = pick(pxMin, xAxis.translate(min));
            pxMax = pick(pxMax, xAxis.translate(max));
            if (isNaN(pxMin) || 1/0 === mathAbs(pxMin)) {
                pxMin = 0;
                pxMax = scrollerWidth;
            }
            if (xAxis.translate(pxMax, true) - xAxis.translate(pxMin, true) < chart.xAxis[0].minRange) return;
            scroller.zoomedMax = mathMin(mathMax(pxMin, pxMax), navigatorWidth);
            scroller.zoomedMin = mathMax(scroller.fixedWidth ? scroller.zoomedMax - scroller.fixedWidth : mathMin(pxMin, pxMax), 0);
            scroller.range = scroller.zoomedMax - scroller.zoomedMin;
            zoomedMax = mathRound(scroller.zoomedMax);
            zoomedMin = mathRound(scroller.zoomedMin);
            range = zoomedMax - zoomedMin;
            if (!scroller.rendered) {
                if (navigatorEnabled) {
                    scroller.navigatorGroup = navigatorGroup = renderer.g("navigator").attr({
                        zIndex: 3
                    }).add();
                    scroller.leftShade = renderer.rect().attr({
                        fill: navigatorOptions.maskFill
                    }).add(navigatorGroup);
                    navigatorOptions.maskInside || (scroller.rightShade = renderer.rect().attr({
                        fill: navigatorOptions.maskFill
                    }).add(navigatorGroup));
                    scroller.outline = renderer.path().attr({
                        "stroke-width": outlineWidth,
                        stroke: navigatorOptions.outlineColor
                    }).add(navigatorGroup);
                }
                if (scrollbarEnabled) {
                    scroller.scrollbarGroup = scrollbarGroup = renderer.g("scrollbar").add();
                    strokeWidth = scrollbarOptions.trackBorderWidth;
                    scroller.scrollbarTrack = scrollbarTrack = renderer.rect().attr({
                        x: 0,
                        y: -strokeWidth % 2 / 2,
                        fill: scrollbarOptions.trackBackgroundColor,
                        stroke: scrollbarOptions.trackBorderColor,
                        "stroke-width": strokeWidth,
                        r: scrollbarOptions.trackBorderRadius || 0,
                        height: scrollbarHeight
                    }).add(scrollbarGroup);
                    scroller.scrollbar = scrollbar = renderer.rect().attr({
                        y: -scrollbarStrokeWidth % 2 / 2,
                        height: scrollbarHeight,
                        fill: scrollbarOptions.barBackgroundColor,
                        stroke: scrollbarOptions.barBorderColor,
                        "stroke-width": scrollbarStrokeWidth,
                        r: barBorderRadius
                    }).add(scrollbarGroup);
                    scroller.scrollbarRifles = renderer.path().attr({
                        stroke: scrollbarOptions.rifleColor,
                        "stroke-width": 1
                    }).add(scrollbarGroup);
                }
            }
            verb = chart.isResizing ? "animate" : "attr";
            if (navigatorEnabled) {
                scroller.leftShade[verb](navigatorOptions.maskInside ? {
                    x: navigatorLeft + zoomedMin,
                    y: top,
                    width: zoomedMax - zoomedMin,
                    height: height
                } : {
                    x: navigatorLeft,
                    y: top,
                    width: zoomedMin,
                    height: height
                });
                scroller.rightShade && scroller.rightShade[verb]({
                    x: navigatorLeft + zoomedMax,
                    y: top,
                    width: navigatorWidth - zoomedMax,
                    height: height
                });
                scroller.outline[verb]({
                    d: [ M, scrollerLeft, outlineTop, L, navigatorLeft + zoomedMin + halfOutline, outlineTop, navigatorLeft + zoomedMin + halfOutline, outlineTop + outlineHeight, L, navigatorLeft + zoomedMax - halfOutline, outlineTop + outlineHeight, L, navigatorLeft + zoomedMax - halfOutline, outlineTop, scrollerLeft + scrollerWidth, outlineTop ].concat(navigatorOptions.maskInside ? [ M, navigatorLeft + zoomedMin + halfOutline, outlineTop, L, navigatorLeft + zoomedMax - halfOutline, outlineTop ] : [])
                });
                scroller.drawHandle(zoomedMin + halfOutline, 0);
                scroller.drawHandle(zoomedMax + halfOutline, 1);
            }
            if (scrollbarEnabled && scrollbarGroup) {
                scroller.drawScrollbarButton(0);
                scroller.drawScrollbarButton(1);
                scrollbarGroup[verb]({
                    translateX: scrollerLeft,
                    translateY: mathRound(outlineTop + height)
                });
                scrollbarTrack[verb]({
                    width: scrollerWidth
                });
                scrX = scrollbarHeight + zoomedMin;
                scrWidth = range - scrollbarStrokeWidth;
                if (scrollbarMinWidth > scrWidth) {
                    scrollbarPad = (scrollbarMinWidth - scrWidth) / 2;
                    scrWidth = scrollbarMinWidth;
                    scrX -= scrollbarPad;
                }
                scroller.scrollbarPad = scrollbarPad;
                scrollbar[verb]({
                    x: mathFloor(scrX) + scrollbarStrokeWidth % 2 / 2,
                    width: scrWidth
                });
                centerBarX = scrollbarHeight + zoomedMin + range / 2 - .5;
                scroller.scrollbarRifles.attr({
                    visibility: range > 12 ? VISIBLE : HIDDEN
                })[verb]({
                    d: [ M, centerBarX - 3, scrollbarHeight / 4, L, centerBarX - 3, 2 * scrollbarHeight / 3, M, centerBarX, scrollbarHeight / 4, L, centerBarX, 2 * scrollbarHeight / 3, M, centerBarX + 3, scrollbarHeight / 4, L, centerBarX + 3, 2 * scrollbarHeight / 3 ]
                });
            }
            scroller.scrollbarPad = scrollbarPad;
            scroller.rendered = true;
        },
        addEvents: function() {
            var _events, container = this.chart.container, mouseDownHandler = this.mouseDownHandler, mouseMoveHandler = this.mouseMoveHandler, mouseUpHandler = this.mouseUpHandler;
            _events = [ [ container, "mousedown", mouseDownHandler ], [ container, "mousemove", mouseMoveHandler ], [ document, "mouseup", mouseUpHandler ] ];
            hasTouch && _events.push([ container, "touchstart", mouseDownHandler ], [ container, "touchmove", mouseMoveHandler ], [ document, "touchend", mouseUpHandler ]);
            each(_events, function(args) {
                addEvent.apply(null, args);
            });
            this._events = _events;
        },
        removeEvents: function() {
            each(this._events, function(args) {
                removeEvent.apply(null, args);
            });
            this._events = UNDEFINED;
            this.navigatorEnabled && this.baseSeries && removeEvent(this.baseSeries, "updatedData", this.updatedDataHandler);
        },
        init: function() {
            var xAxis, yAxis, dragOffset, hasDragged, defaultBodyCursor, scroller = this, chart = scroller.chart, scrollbarHeight = scroller.scrollbarHeight, navigatorOptions = scroller.navigatorOptions, height = scroller.height, top = scroller.top, bodyStyle = document.body.style, baseSeries = scroller.baseSeries;
            scroller.mouseDownHandler = function(e) {
                e = chart.pointer.normalize(e);
                var fixedMax, ext, left, isOnNavigator, zoomedMin = scroller.zoomedMin, zoomedMax = scroller.zoomedMax, top = scroller.top, scrollbarHeight = scroller.scrollbarHeight, scrollerLeft = scroller.scrollerLeft, scrollerWidth = scroller.scrollerWidth, navigatorLeft = scroller.navigatorLeft, navigatorWidth = scroller.navigatorWidth, scrollbarPad = scroller.scrollbarPad, range = scroller.range, chartX = e.chartX, chartY = e.chartY, baseXAxis = chart.xAxis[0], handleSensitivity = isTouchDevice ? 10 : 7;
                if (chartY > top && top + height + scrollbarHeight > chartY) {
                    isOnNavigator = !scroller.scrollbarEnabled || top + height > chartY;
                    if (isOnNavigator && handleSensitivity > math.abs(chartX - zoomedMin - navigatorLeft)) {
                        scroller.grabbedLeft = true;
                        scroller.otherHandlePos = zoomedMax;
                        scroller.fixedExtreme = baseXAxis.max;
                        chart.fixedRange = null;
                    } else if (isOnNavigator && handleSensitivity > math.abs(chartX - zoomedMax - navigatorLeft)) {
                        scroller.grabbedRight = true;
                        scroller.otherHandlePos = zoomedMin;
                        scroller.fixedExtreme = baseXAxis.min;
                        chart.fixedRange = null;
                    } else if (chartX > navigatorLeft + zoomedMin - scrollbarPad && navigatorLeft + zoomedMax + scrollbarPad > chartX) {
                        scroller.grabbedCenter = chartX;
                        scroller.fixedWidth = range;
                        if (chart.renderer.isSVG) {
                            defaultBodyCursor = bodyStyle.cursor;
                            bodyStyle.cursor = "ew-resize";
                        }
                        dragOffset = chartX - zoomedMin;
                    } else if (chartX > scrollerLeft && scrollerLeft + scrollerWidth > chartX) {
                        left = isOnNavigator ? chartX - navigatorLeft - range / 2 : navigatorLeft > chartX ? zoomedMin - .2 * range : chartX > scrollerLeft + scrollerWidth - scrollbarHeight ? zoomedMin + .2 * range : navigatorLeft + zoomedMin > chartX ? zoomedMin - range : zoomedMax;
                        if (0 > left) left = 0; else if (left + range >= navigatorWidth) {
                            left = navigatorWidth - range;
                            fixedMax = xAxis.dataMax;
                        }
                        if (left !== zoomedMin) {
                            scroller.fixedWidth = range;
                            ext = xAxis.toFixedRange(left, left + range, null, fixedMax);
                            baseXAxis.setExtremes(ext.min, ext.max, true, false, {
                                trigger: "navigator"
                            });
                        }
                    }
                }
            };
            scroller.mouseMoveHandler = function(e) {
                var chartX, scrollbarHeight = scroller.scrollbarHeight, navigatorLeft = scroller.navigatorLeft, navigatorWidth = scroller.navigatorWidth, scrollerLeft = scroller.scrollerLeft, scrollerWidth = scroller.scrollerWidth, range = scroller.range;
                if (0 !== e.pageX) {
                    e = chart.pointer.normalize(e);
                    chartX = e.chartX;
                    navigatorLeft > chartX ? chartX = navigatorLeft : chartX > scrollerLeft + scrollerWidth - scrollbarHeight && (chartX = scrollerLeft + scrollerWidth - scrollbarHeight);
                    if (scroller.grabbedLeft) {
                        hasDragged = true;
                        scroller.render(0, 0, chartX - navigatorLeft, scroller.otherHandlePos);
                    } else if (scroller.grabbedRight) {
                        hasDragged = true;
                        scroller.render(0, 0, scroller.otherHandlePos, chartX - navigatorLeft);
                    } else if (scroller.grabbedCenter) {
                        hasDragged = true;
                        dragOffset > chartX ? chartX = dragOffset : chartX > navigatorWidth + dragOffset - range && (chartX = navigatorWidth + dragOffset - range);
                        scroller.render(0, 0, chartX - dragOffset, chartX - dragOffset + range);
                    }
                    hasDragged && scroller.scrollbarOptions.liveRedraw && setTimeout(function() {
                        scroller.mouseUpHandler(e);
                    }, 0);
                }
            };
            scroller.mouseUpHandler = function(e) {
                var ext, fixedMin, fixedMax;
                if (hasDragged) {
                    scroller.zoomedMin === scroller.otherHandlePos ? fixedMin = scroller.fixedExtreme : scroller.zoomedMax === scroller.otherHandlePos && (fixedMax = scroller.fixedExtreme);
                    ext = xAxis.toFixedRange(scroller.zoomedMin, scroller.zoomedMax, fixedMin, fixedMax);
                    chart.xAxis[0].setExtremes(ext.min, ext.max, true, false, {
                        trigger: "navigator",
                        triggerOp: "navigator-drag",
                        DOMEvent: e
                    });
                }
                if ("mousemove" !== e.type) {
                    scroller.grabbedLeft = scroller.grabbedRight = scroller.grabbedCenter = scroller.fixedWidth = scroller.fixedExtreme = scroller.otherHandlePos = hasDragged = dragOffset = null;
                    bodyStyle.cursor = defaultBodyCursor || "";
                }
            };
            var xAxisIndex = chart.xAxis.length, yAxisIndex = chart.yAxis.length;
            chart.extraBottomMargin = scroller.outlineHeight + navigatorOptions.margin;
            if (scroller.navigatorEnabled) {
                scroller.xAxis = xAxis = new Axis(chart, merge({
                    ordinal: baseSeries && baseSeries.xAxis.options.ordinal
                }, navigatorOptions.xAxis, {
                    id: "navigator-x-axis",
                    isX: true,
                    type: "datetime",
                    index: xAxisIndex,
                    height: height,
                    offset: 0,
                    offsetLeft: scrollbarHeight,
                    offsetRight: -scrollbarHeight,
                    keepOrdinalPadding: true,
                    startOnTick: false,
                    endOnTick: false,
                    minPadding: 0,
                    maxPadding: 0,
                    zoomEnabled: false
                }));
                scroller.yAxis = yAxis = new Axis(chart, merge(navigatorOptions.yAxis, {
                    id: "navigator-y-axis",
                    alignTicks: false,
                    height: height,
                    offset: 0,
                    index: yAxisIndex,
                    zoomEnabled: false
                }));
                baseSeries || navigatorOptions.series.data ? scroller.addBaseSeries() : 0 === chart.series.length && wrap(chart, "redraw", function(proceed, animation) {
                    if (chart.series.length > 0 && !scroller.series) {
                        scroller.setBaseSeries();
                        chart.redraw = proceed;
                    }
                    proceed.call(chart, animation);
                });
            } else scroller.xAxis = xAxis = {
                translate: function(value, reverse) {
                    var ext = chart.xAxis[0].getExtremes(), scrollTrackWidth = chart.plotWidth - 2 * scrollbarHeight, dataMin = ext.dataMin, valueRange = ext.dataMax - dataMin;
                    return reverse ? value * valueRange / scrollTrackWidth + dataMin : scrollTrackWidth * (value - dataMin) / valueRange;
                },
                toFixedRange: Axis.prototype.toFixedRange
            };
            wrap(chart, "getMargins", function(proceed) {
                var legend = this.legend, legendOptions = legend.options;
                proceed.call(this);
                scroller.top = top = scroller.navigatorOptions.top || this.chartHeight - scroller.height - scroller.scrollbarHeight - this.spacing[2] - ("bottom" === legendOptions.verticalAlign && legendOptions.enabled && !legendOptions.floating ? legend.legendHeight + pick(legendOptions.margin, 10) : 0);
                if (xAxis && yAxis) {
                    xAxis.options.top = yAxis.options.top = top;
                    xAxis.setAxisSize();
                    yAxis.setAxisSize();
                }
            });
            scroller.addEvents();
        },
        getUnionExtremes: function(returnFalseOnNoBaseSeries) {
            var baseAxis = this.chart.xAxis[0], navAxis = this.xAxis, navAxisOptions = navAxis.options;
            if (!returnFalseOnNoBaseSeries || null !== baseAxis.dataMin) return {
                dataMin: pick(navAxisOptions && navAxisOptions.min, (defined(baseAxis.dataMin) && defined(navAxis.dataMin) ? mathMin : pick)(baseAxis.dataMin, navAxis.dataMin)),
                dataMax: pick(navAxisOptions && navAxisOptions.max, (defined(baseAxis.dataMax) && defined(navAxis.dataMax) ? mathMax : pick)(baseAxis.dataMax, navAxis.dataMax))
            };
        },
        setBaseSeries: function(baseSeriesOption) {
            var chart = this.chart;
            baseSeriesOption = baseSeriesOption || chart.options.navigator.baseSeries;
            this.series && this.series.remove();
            this.baseSeries = chart.series[baseSeriesOption] || "string" == typeof baseSeriesOption && chart.get(baseSeriesOption) || chart.series[0];
            this.xAxis && this.addBaseSeries();
        },
        addBaseSeries: function() {
            var mergedNavSeriesOptions, navigatorData, baseSeries = this.baseSeries, baseOptions = baseSeries ? baseSeries.options : {}, baseData = baseOptions.data, navigatorSeriesOptions = this.navigatorOptions.series;
            navigatorData = navigatorSeriesOptions.data;
            this.hasNavigatorData = !!navigatorData;
            mergedNavSeriesOptions = merge(baseOptions, navigatorSeriesOptions, {
                enableMouseTracking: false,
                group: "nav",
                padXAxis: false,
                xAxis: "navigator-x-axis",
                yAxis: "navigator-y-axis",
                name: "Navigator",
                showInLegend: false,
                isInternal: true,
                visible: true
            });
            mergedNavSeriesOptions.data = navigatorData || baseData;
            this.series = this.chart.initSeries(mergedNavSeriesOptions);
            if (baseSeries && false !== this.navigatorOptions.adaptToUpdatedData) {
                addEvent(baseSeries, "updatedData", this.updatedDataHandler);
                baseSeries.userOptions.events = extend(baseSeries.userOptions.event, {
                    updatedData: this.updatedDataHandler
                });
            }
        },
        updatedDataHandler: function() {
            var stickToMin, stickToMax, newMax, newMin, doRedraw, scroller = this.chart.scroller, baseSeries = scroller.baseSeries, baseXAxis = baseSeries.xAxis, baseExtremes = baseXAxis.getExtremes(), baseMin = baseExtremes.min, baseMax = baseExtremes.max, baseDataMin = baseExtremes.dataMin, baseDataMax = baseExtremes.dataMax, range = baseMax - baseMin, navigatorSeries = scroller.series, navXData = navigatorSeries.xData, hasSetExtremes = !!baseXAxis.setExtremes;
            stickToMax = baseMax >= navXData[navXData.length - 1] - (this.closestPointRange || 0);
            stickToMin = baseDataMin >= baseMin;
            if (!scroller.hasNavigatorData) {
                navigatorSeries.options.pointStart = baseSeries.xData[0];
                navigatorSeries.setData(baseSeries.options.data, false);
                doRedraw = true;
            }
            if (stickToMin) {
                newMin = baseDataMin;
                newMax = newMin + range;
            }
            if (stickToMax) {
                newMax = baseDataMax;
                stickToMin || (newMin = mathMax(newMax - range, navigatorSeries.xData[0]));
            }
            if (hasSetExtremes && (stickToMin || stickToMax)) isNaN(newMin) || baseXAxis.setExtremes(newMin, newMax, true, false, {
                trigger: "updatedData"
            }); else {
                doRedraw && this.chart.redraw(false);
                scroller.render(mathMax(baseMin, baseDataMin), mathMin(baseMax, baseDataMax));
            }
        },
        destroy: function() {
            var scroller = this;
            scroller.removeEvents();
            each([ scroller.xAxis, scroller.yAxis, scroller.leftShade, scroller.rightShade, scroller.outline, scroller.scrollbarTrack, scroller.scrollbarRifles, scroller.scrollbarGroup, scroller.scrollbar ], function(prop) {
                prop && prop.destroy && prop.destroy();
            });
            scroller.xAxis = scroller.yAxis = scroller.leftShade = scroller.rightShade = scroller.outline = scroller.scrollbarTrack = scroller.scrollbarRifles = scroller.scrollbarGroup = scroller.scrollbar = null;
            each([ scroller.scrollbarButtons, scroller.handles, scroller.elementsToDestroy ], function(coll) {
                destroyObjectProperties(coll);
            });
        }
    };
    Highcharts.Scroller = Scroller;
    wrap(Axis.prototype, "zoom", function(proceed, newMin, newMax) {
        var previousZoom, ret, chart = this.chart, chartOptions = chart.options, zoomType = chartOptions.chart.zoomType, navigator = chartOptions.navigator, rangeSelector = chartOptions.rangeSelector;
        if (this.isXAxis && (navigator && navigator.enabled || rangeSelector && rangeSelector.enabled)) if ("x" === zoomType) chart.resetZoomButton = "blocked"; else if ("y" === zoomType) ret = false; else if ("xy" === zoomType) {
            previousZoom = this.previousZoom;
            if (defined(newMin)) this.previousZoom = [ this.min, this.max ]; else if (previousZoom) {
                newMin = previousZoom[0];
                newMax = previousZoom[1];
                delete this.previousZoom;
            }
        }
        return ret !== UNDEFINED ? ret : proceed.call(this, newMin, newMax);
    });
    wrap(Chart.prototype, "init", function(proceed, options, callback) {
        addEvent(this, "beforeRender", function() {
            var options = this.options;
            (options.navigator.enabled || options.scrollbar.enabled) && (this.scroller = new Scroller(this));
        });
        proceed.call(this, options, callback);
    });
    wrap(Series.prototype, "addPoint", function(proceed, options, redraw, shift, animation) {
        var turboThreshold = this.options.turboThreshold;
        turboThreshold && this.xData.length > turboThreshold && isObject(options) && !isArray(options) && this.chart.scroller && error(20, true);
        proceed.call(this, options, redraw, shift, animation);
    });
    extend(defaultOptions, {
        rangeSelector: {
            buttonTheme: {
                width: 28,
                height: 18,
                fill: "#f7f7f7",
                padding: 2,
                r: 0,
                "stroke-width": 0,
                style: {
                    color: "#444",
                    cursor: "pointer",
                    fontWeight: "normal"
                },
                zIndex: 7,
                states: {
                    hover: {
                        fill: "#e7e7e7"
                    },
                    select: {
                        fill: "#e7f0f9",
                        style: {
                            color: "black",
                            fontWeight: "bold"
                        }
                    }
                }
            },
            inputPosition: {
                align: "right"
            },
            labelStyle: {
                color: "#666"
            }
        }
    });
    defaultOptions.lang = merge(defaultOptions.lang, {
        rangeSelectorZoom: "Zoom",
        rangeSelectorFrom: "From",
        rangeSelectorTo: "To"
    });
    RangeSelector.prototype = {
        clickButton: function(i, redraw) {
            var newMin, now, baseXAxisOptions, rangeMin, year, timeName, rangeSelector = this, selected = rangeSelector.selected, chart = rangeSelector.chart, buttons = rangeSelector.buttons, rangeOptions = rangeSelector.buttonOptions[i], baseAxis = chart.xAxis[0], unionExtremes = chart.scroller && chart.scroller.getUnionExtremes() || baseAxis || {}, dataMin = unionExtremes.dataMin, dataMax = unionExtremes.dataMax, newMax = baseAxis && mathRound(mathMin(baseAxis.max, pick(dataMax, baseAxis.max))), date = new Date(newMax), type = rangeOptions.type, count = rangeOptions.count, range = rangeOptions._range;
            if (null === dataMin || null === dataMax || i === rangeSelector.selected) return;
            if ("month" === type || "year" === type) {
                timeName = {
                    month: "Month",
                    year: "FullYear"
                }[type];
                date["set" + timeName](date["get" + timeName]() - count);
                newMin = date.getTime();
                dataMin = pick(dataMin, Number.MIN_VALUE);
                if (isNaN(newMin) || dataMin > newMin) {
                    newMin = dataMin;
                    newMax = mathMin(newMin + range, dataMax);
                } else range = newMax - newMin;
            } else if (range) {
                newMin = mathMax(newMax - range, dataMin);
                newMax = mathMin(newMin + range, dataMax);
            } else if ("ytd" === type) {
                if (!baseAxis) {
                    addEvent(chart, "beforeRender", function() {
                        rangeSelector.clickButton(i);
                    });
                    return;
                }
                if (dataMax === UNDEFINED) {
                    dataMin = Number.MAX_VALUE;
                    dataMax = Number.MIN_VALUE;
                    each(chart.series, function(series) {
                        var xData = series.xData;
                        dataMin = mathMin(xData[0], dataMin);
                        dataMax = mathMax(xData[xData.length - 1], dataMax);
                    });
                    redraw = false;
                }
                now = new Date(dataMax);
                year = now.getFullYear();
                newMin = rangeMin = mathMax(dataMin || 0, Date.UTC(year, 0, 1));
                now = now.getTime();
                newMax = mathMin(dataMax || now, now);
            } else if ("all" === type && baseAxis) {
                newMin = dataMin;
                newMax = dataMax;
            }
            buttons[selected] && buttons[selected].setState(0);
            buttons[i] && buttons[i].setState(2);
            chart.fixedRange = range;
            if (baseAxis) {
                baseAxis.setExtremes(newMin, newMax, pick(redraw, 1), 0, {
                    trigger: "rangeSelectorButton",
                    rangeSelectorButton: rangeOptions
                });
                rangeSelector.setSelected(i);
            } else {
                baseXAxisOptions = chart.options.xAxis;
                baseXAxisOptions[0] = merge(baseXAxisOptions[0], {
                    range: range,
                    min: rangeMin
                });
                rangeSelector.setSelected(i);
            }
        },
        setSelected: function(selected) {
            this.selected = this.options.selected = selected;
        },
        defaultButtons: [ {
            type: "month",
            count: 1,
            text: "1m"
        }, {
            type: "month",
            count: 3,
            text: "3m"
        }, {
            type: "month",
            count: 6,
            text: "6m"
        }, {
            type: "ytd",
            text: "YTD"
        }, {
            type: "year",
            count: 1,
            text: "1y"
        }, {
            type: "all",
            text: "All"
        } ],
        init: function(chart) {
            var rangeSelector = this, options = chart.options.rangeSelector, buttonOptions = options.buttons || [].concat(rangeSelector.defaultButtons), selectedOption = options.selected, blurInputs = rangeSelector.blurInputs = function() {
                var minInput = rangeSelector.minInput, maxInput = rangeSelector.maxInput;
                minInput && minInput.blur();
                maxInput && maxInput.blur();
            };
            rangeSelector.chart = chart;
            rangeSelector.options = options;
            rangeSelector.buttons = [];
            chart.extraTopMargin = 35;
            rangeSelector.buttonOptions = buttonOptions;
            addEvent(chart.container, "mousedown", blurInputs);
            addEvent(chart, "resize", blurInputs);
            each(buttonOptions, rangeSelector.computeButtonRange);
            selectedOption !== UNDEFINED && buttonOptions[selectedOption] && this.clickButton(selectedOption, false);
            addEvent(chart, "load", function() {
                addEvent(chart.xAxis[0], "afterSetExtremes", function() {
                    rangeSelector.updateButtonStates(true);
                });
            });
        },
        updateButtonStates: function(updating) {
            var rangeSelector = this, chart = this.chart, baseAxis = chart.xAxis[0], unionExtremes = chart.scroller && chart.scroller.getUnionExtremes() || baseAxis, dataMin = unionExtremes.dataMin, dataMax = unionExtremes.dataMax, selected = rangeSelector.selected, buttons = rangeSelector.buttons;
            if (updating && chart.fixedRange !== mathRound(baseAxis.max - baseAxis.min)) {
                buttons[selected] && buttons[selected].setState(0);
                rangeSelector.setSelected(null);
            }
            each(rangeSelector.buttonOptions, function(rangeOptions, i) {
                var range = rangeOptions._range, isTooGreatRange = range > dataMax - dataMin, isTooSmallRange = baseAxis.minRange > range, isAllButAlreadyShowingAll = "all" === rangeOptions.type && baseAxis.max - baseAxis.min >= dataMax - dataMin && 2 !== buttons[i].state, isYTDButNotAvailable = "ytd" === rangeOptions.type && dateFormat("%Y", dataMin) === dateFormat("%Y", dataMax);
                if (range === mathRound(baseAxis.max - baseAxis.min) && i !== selected) {
                    rangeSelector.setSelected(i);
                    buttons[i].setState(2);
                } else isTooGreatRange || isTooSmallRange || isAllButAlreadyShowingAll || isYTDButNotAvailable ? buttons[i].setState(3) : 3 === buttons[i].state && buttons[i].setState(0);
            });
        },
        computeButtonRange: function(rangeOptions) {
            var type = rangeOptions.type, count = rangeOptions.count || 1, fixedTimes = {
                millisecond: 1,
                second: 1e3,
                minute: 6e4,
                hour: 36e5,
                day: 864e5,
                week: 6048e5
            };
            fixedTimes[type] ? rangeOptions._range = fixedTimes[type] * count : ("month" === type || "year" === type) && (rangeOptions._range = 36e5 * 24 * {
                month: 30,
                year: 365
            }[type] * count);
        },
        setInputValue: function(name, time) {
            var options = this.chart.options.rangeSelector;
            defined(time) && (this[name + "Input"].HCTime = time);
            this[name + "Input"].value = dateFormat(options.inputEditDateFormat || "%Y-%m-%d", this[name + "Input"].HCTime);
            this[name + "DateBox"].attr({
                text: dateFormat(options.inputDateFormat || "%b %e, %Y", this[name + "Input"].HCTime)
            });
        },
        drawInput: function(name) {
            var input, label, dateBox, rangeSelector = this, chart = rangeSelector.chart, chartStyle = chart.renderer.style, renderer = chart.renderer, options = chart.options.rangeSelector, lang = defaultOptions.lang, div = rangeSelector.div, isMin = "min" === name, inputGroup = this.inputGroup;
            this[name + "Label"] = label = renderer.label(lang[isMin ? "rangeSelectorFrom" : "rangeSelectorTo"], this.inputGroup.offset).attr({
                padding: 2
            }).css(merge(chartStyle, options.labelStyle)).add(inputGroup);
            inputGroup.offset += label.width + 5;
            this[name + "DateBox"] = dateBox = renderer.label("", inputGroup.offset).attr({
                padding: 2,
                width: options.inputBoxWidth || 90,
                height: options.inputBoxHeight || 17,
                stroke: options.inputBoxBorderColor || "silver",
                "stroke-width": 1
            }).css(merge({
                textAlign: "center",
                color: "#444"
            }, chartStyle, options.inputStyle)).on("click", function() {
                rangeSelector[name + "Input"].focus();
            }).add(inputGroup);
            inputGroup.offset += dateBox.width + (isMin ? 10 : 0);
            this[name + "Input"] = input = createElement("input", {
                name: name,
                className: PREFIX + "range-selector",
                type: "text"
            }, extend({
                position: ABSOLUTE,
                border: 0,
                width: "1px",
                height: "1px",
                padding: 0,
                textAlign: "center",
                fontSize: chartStyle.fontSize,
                fontFamily: chartStyle.fontFamily,
                top: chart.plotTop + PX
            }, options.inputStyle), div);
            input.onfocus = function() {
                css(this, {
                    left: inputGroup.translateX + dateBox.x + PX,
                    top: inputGroup.translateY + PX,
                    width: dateBox.width - 2 + PX,
                    height: dateBox.height - 2 + PX,
                    border: "2px solid silver"
                });
            };
            input.onblur = function() {
                css(this, {
                    border: 0,
                    width: "1px",
                    height: "1px"
                });
                rangeSelector.setInputValue(name);
            };
            input.onchange = function() {
                var inputValue = input.value, value = (options.inputDateParser || Date.parse)(inputValue), xAxis = chart.xAxis[0], dataMin = xAxis.dataMin, dataMax = xAxis.dataMax;
                if (isNaN(value)) {
                    value = inputValue.split("-");
                    value = Date.UTC(pInt(value[0]), pInt(value[1]) - 1, pInt(value[2]));
                }
                if (!isNaN(value)) {
                    defaultOptions.global.useUTC || (value += 1e3 * 60 * new Date().getTimezoneOffset());
                    isMin ? value > rangeSelector.maxInput.HCTime ? value = UNDEFINED : dataMin > value && (value = dataMin) : rangeSelector.minInput.HCTime > value ? value = UNDEFINED : value > dataMax && (value = dataMax);
                    value !== UNDEFINED && chart.xAxis[0].setExtremes(isMin ? value : xAxis.min, isMin ? xAxis.max : value, UNDEFINED, UNDEFINED, {
                        trigger: "rangeSelectorInput"
                    });
                }
            };
        },
        render: function(min, max) {
            var yAlign, buttonLeft, rangeSelector = this, chart = rangeSelector.chart, renderer = chart.renderer, container = chart.container, chartOptions = chart.options, navButtonOptions = chartOptions.exporting && chartOptions.navigation && chartOptions.navigation.buttonOptions, options = chartOptions.rangeSelector, buttons = rangeSelector.buttons, lang = defaultOptions.lang, div = rangeSelector.div, inputGroup = rangeSelector.inputGroup, buttonTheme = options.buttonTheme, inputEnabled = false !== options.inputEnabled, states = buttonTheme && buttonTheme.states, plotLeft = chart.plotLeft;
            if (!rangeSelector.rendered) {
                rangeSelector.zoomText = renderer.text(lang.rangeSelectorZoom, plotLeft, chart.plotTop - 20).css(options.labelStyle).add();
                buttonLeft = plotLeft + rangeSelector.zoomText.getBBox().width + 5;
                each(rangeSelector.buttonOptions, function(rangeOptions, i) {
                    buttons[i] = renderer.button(rangeOptions.text, buttonLeft, chart.plotTop - 35, function() {
                        rangeSelector.clickButton(i);
                        rangeSelector.isActive = true;
                    }, buttonTheme, states && states.hover, states && states.select).css({
                        textAlign: "center"
                    }).add();
                    buttonLeft += buttons[i].width + pick(options.buttonSpacing, 5);
                    rangeSelector.selected === i && buttons[i].setState(2);
                });
                rangeSelector.updateButtonStates();
                if (inputEnabled) {
                    rangeSelector.div = div = createElement("div", null, {
                        position: "relative",
                        height: 0,
                        zIndex: 1
                    });
                    container.parentNode.insertBefore(div, container);
                    rangeSelector.inputGroup = inputGroup = renderer.g("input-group").add();
                    inputGroup.offset = 0;
                    rangeSelector.drawInput("min");
                    rangeSelector.drawInput("max");
                }
            }
            if (inputEnabled) {
                yAlign = chart.plotTop - 45;
                inputGroup.align(extend({
                    y: yAlign,
                    width: inputGroup.offset,
                    x: navButtonOptions && (navButtonOptions.y || 0) + navButtonOptions.height - chart.spacing[0] > yAlign ? -40 : 0
                }, options.inputPosition), true, chart.spacingBox);
                rangeSelector.setInputValue("min", min);
                rangeSelector.setInputValue("max", max);
            }
            rangeSelector.rendered = true;
        },
        destroy: function() {
            var key, minInput = this.minInput, maxInput = this.maxInput, chart = this.chart, blurInputs = this.blurInputs;
            removeEvent(chart.container, "mousedown", blurInputs);
            removeEvent(chart, "resize", blurInputs);
            destroyObjectProperties(this.buttons);
            minInput && (minInput.onfocus = minInput.onblur = minInput.onchange = null);
            maxInput && (maxInput.onfocus = maxInput.onblur = maxInput.onchange = null);
            for (key in this) {
                this[key] && "chart" !== key && (this[key].destroy ? this[key].destroy() : this[key].nodeType && discardElement(this[key]));
                this[key] = null;
            }
        }
    };
    Axis.prototype.toFixedRange = function(pxMin, pxMax, fixedMin, fixedMax) {
        var fixedRange = this.chart && this.chart.fixedRange, newMin = pick(fixedMin, this.translate(pxMin, true)), newMax = pick(fixedMax, this.translate(pxMax, true)), changeRatio = fixedRange && (newMax - newMin) / fixedRange;
        changeRatio > .7 && 1.3 > changeRatio && (fixedMax ? newMin = newMax - fixedRange : newMax = newMin + fixedRange);
        return {
            min: newMin,
            max: newMax
        };
    };
    wrap(Chart.prototype, "init", function(proceed, options, callback) {
        addEvent(this, "init", function() {
            this.options.rangeSelector.enabled && (this.rangeSelector = new RangeSelector(this));
        });
        proceed.call(this, options, callback);
    });
    Highcharts.RangeSelector = RangeSelector;
    Chart.prototype.callbacks.push(function(chart) {
        function renderScroller() {
            extremes = chart.xAxis[0].getExtremes();
            scroller.render(extremes.min, extremes.max);
        }
        function renderRangeSelector() {
            extremes = chart.xAxis[0].getExtremes();
            isNaN(extremes.min) || rangeSelector.render(extremes.min, extremes.max);
        }
        function afterSetExtremesHandlerScroller(e) {
            "navigator-drag" !== e.triggerOp && scroller.render(e.min, e.max);
        }
        function afterSetExtremesHandlerRangeSelector(e) {
            rangeSelector.render(e.min, e.max);
        }
        function destroyEvents() {
            scroller && removeEvent(chart.xAxis[0], "afterSetExtremes", afterSetExtremesHandlerScroller);
            if (rangeSelector) {
                removeEvent(chart, "resize", renderRangeSelector);
                removeEvent(chart.xAxis[0], "afterSetExtremes", afterSetExtremesHandlerRangeSelector);
            }
        }
        var extremes, scroller = chart.scroller, rangeSelector = chart.rangeSelector;
        if (scroller) {
            addEvent(chart.xAxis[0], "afterSetExtremes", afterSetExtremesHandlerScroller);
            wrap(chart, "drawChartBox", function(proceed) {
                var isDirtyBox = this.isDirtyBox;
                proceed.call(this);
                isDirtyBox && renderScroller();
            });
            renderScroller();
        }
        if (rangeSelector) {
            addEvent(chart.xAxis[0], "afterSetExtremes", afterSetExtremesHandlerRangeSelector);
            addEvent(chart, "resize", renderRangeSelector);
            renderRangeSelector();
        }
        addEvent(chart, "destroy", destroyEvents);
    });
    Highcharts.StockChart = function(options, callback) {
        var opposite, seriesOptions = options.series, navigatorEnabled = pick(options.navigator && options.navigator.enabled, true), disableStartOnTick = navigatorEnabled ? {
            startOnTick: false,
            endOnTick: false
        } : null, lineOptions = {
            marker: {
                enabled: false,
                radius: 2
            },
            states: {
                hover: {
                    lineWidth: 2
                }
            }
        }, columnOptions = {
            shadow: false,
            borderWidth: 0
        };
        options.xAxis = map(splat(options.xAxis || {}), function(xAxisOptions) {
            return merge({
                minPadding: 0,
                maxPadding: 0,
                ordinal: true,
                title: {
                    text: null
                },
                labels: {
                    overflow: "justify"
                },
                showLastLabel: true
            }, xAxisOptions, {
                type: "datetime",
                categories: null
            }, disableStartOnTick);
        });
        options.yAxis = map(splat(options.yAxis || {}), function(yAxisOptions) {
            opposite = pick(yAxisOptions.opposite, true);
            return merge({
                labels: {
                    y: -2
                },
                opposite: opposite,
                showLastLabel: false,
                title: {
                    text: null
                }
            }, yAxisOptions);
        });
        options.series = null;
        options = merge({
            chart: {
                panning: true,
                pinchType: "x"
            },
            navigator: {
                enabled: true
            },
            scrollbar: {
                enabled: true
            },
            rangeSelector: {
                enabled: true
            },
            title: {
                text: null,
                style: {
                    fontSize: "16px"
                }
            },
            tooltip: {
                shared: true,
                crosshairs: true
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                line: lineOptions,
                spline: lineOptions,
                area: lineOptions,
                areaspline: lineOptions,
                arearange: lineOptions,
                areasplinerange: lineOptions,
                column: columnOptions,
                columnrange: columnOptions,
                candlestick: columnOptions,
                ohlc: columnOptions
            }
        }, options, {
            _stock: true,
            chart: {
                inverted: false
            }
        });
        options.series = seriesOptions;
        return new Chart(options, callback);
    };
    wrap(Pointer.prototype, "init", function(proceed, chart, options) {
        var pinchType = options.chart.pinchType || "";
        proceed.call(this, chart, options);
        this.pinchX = this.pinchHor = -1 !== pinchType.indexOf("x");
        this.pinchY = this.pinchVert = -1 !== pinchType.indexOf("y");
        this.hasZoom = this.hasZoom || this.pinchHor || this.pinchVert;
    });
    wrap(Axis.prototype, "autoLabelAlign", function(proceed) {
        if (this.chart.options._stock && "yAxis" === this.coll && 0 === inArray(this, this.chart.yAxis)) {
            15 === this.options.labels.x && (this.options.labels.x = 0);
            return "right";
        }
        return proceed.call(this);
    });
    Axis.prototype.getPlotLinePath = function(value, lineWidth, old, force, translatedValue) {
        var x1, y1, x2, y2, axes, axes2, uniqueAxes, axis = this, series = this.isLinked && !this.series ? this.linkedParent.series : this.series, chart = axis.chart, renderer = chart.renderer, axisLeft = axis.left, axisTop = axis.top, result = [];
        axes = axis.isXAxis ? defined(axis.options.yAxis) ? [ chart.yAxis[axis.options.yAxis] ] : map(series, function(S) {
            return S.yAxis;
        }) : defined(axis.options.xAxis) ? [ chart.xAxis[axis.options.xAxis] ] : map(series, function(S) {
            return S.xAxis;
        });
        axes2 = axis.isXAxis ? chart.yAxis : chart.xAxis;
        each(axes2, function(A) {
            if (defined(A.options.id) ? -1 === A.options.id.indexOf("navigator") : true) {
                var a = A.isXAxis ? "yAxis" : "xAxis", rax = defined(A.options[a]) ? chart[a][A.options[a]] : chart[a][0];
                axis === rax && axes.push(A);
            }
        });
        uniqueAxes = axes.length ? [] : [ axis ];
        each(axes, function(axis2) {
            -1 === inArray(axis2, uniqueAxes) && uniqueAxes.push(axis2);
        });
        translatedValue = pick(translatedValue, axis.translate(value, null, null, old));
        isNaN(translatedValue) || (axis.horiz ? each(uniqueAxes, function(axis2) {
            y1 = axis2.top;
            y2 = y1 + axis2.len;
            x1 = x2 = mathRound(translatedValue + axis.transB);
            (x1 >= axisLeft && axisLeft + axis.width >= x1 || force) && result.push("M", x1, y1, "L", x2, y2);
        }) : each(uniqueAxes, function(axis2) {
            x1 = axis2.left;
            x2 = x1 + axis2.width;
            y1 = y2 = mathRound(axisTop + axis.height - translatedValue);
            (y1 >= axisTop && axisTop + axis.height >= y1 || force) && result.push("M", x1, y1, "L", x2, y2);
        }));
        if (result.length > 0) return renderer.crispPolyLine(result, lineWidth || 1);
    };
    Axis.prototype.getPlotBandPath = function(from, to) {
        var i, toPath = this.getPlotLinePath(to), path = this.getPlotLinePath(from), result = [];
        if (path && toPath) for (i = 0; path.length > i; i += 6) result.push("M", path[i + 1], path[i + 2], "L", path[i + 4], path[i + 5], toPath[i + 4], toPath[i + 5], toPath[i + 1], toPath[i + 2]); else result = null;
        return result;
    };
    SVGRenderer.prototype.crispPolyLine = function(points, width) {
        var i;
        for (i = 0; points.length > i; i += 6) {
            points[i + 1] === points[i + 4] && (points[i + 1] = points[i + 4] = mathRound(points[i + 1]) - width % 2 / 2);
            points[i + 2] === points[i + 5] && (points[i + 2] = points[i + 5] = mathRound(points[i + 2]) + width % 2 / 2);
        }
        return points;
    };
    Renderer === Highcharts.VMLRenderer && (VMLRenderer.prototype.crispPolyLine = SVGRenderer.prototype.crispPolyLine);
    wrap(Axis.prototype, "hideCrosshair", function(proceed, i) {
        proceed.call(this, i);
        if (!defined(this.crossLabelArray)) return;
        defined(i) ? this.crossLabelArray[i] && this.crossLabelArray[i].hide() : each(this.crossLabelArray, function(crosslabel) {
            crosslabel.hide();
        });
    });
    wrap(Axis.prototype, "drawCrosshair", function(proceed, e, point) {
        proceed.call(this, e, point);
        if (!defined(this.crosshair.label) || !this.crosshair.label.enabled || !defined(point)) return;
        var posx, posy, crossBox, limit, chart = this.chart, options = this.options.crosshair.label, axis = this.isXAxis ? "x" : "y", horiz = this.horiz, opposite = this.opposite, left = this.left, top = this.top, crossLabel = this.crossLabel, formatOption = options.format, formatFormat = "";
        crossLabel || (crossLabel = this.crossLabel = chart.renderer.label().attr({
            align: options.align || (horiz ? "center" : opposite ? "right" === this.labelAlign ? "right" : "left" : "left" === this.labelAlign ? "left" : "center"),
            zIndex: 12,
            height: horiz ? 16 : UNDEFINED,
            fill: options.backgroundColor || this.series[0] && this.series[0].color || "gray",
            padding: pick(options.padding, 2),
            stroke: options.borderColor || null,
            "stroke-width": options.borderWidth || 0
        }).css(extend({
            color: "white",
            fontWeight: "normal",
            fontSize: "11px",
            textAlign: "center"
        }, options.style)).add());
        if (horiz) {
            posx = point.plotX + left;
            posy = top + (opposite ? 0 : this.height);
        } else {
            posx = opposite ? this.width + left : 0;
            posy = point.plotY + top;
        }
        if (top > posy || posy > top + this.height) {
            this.hideCrosshair();
            return;
        }
        if (!formatOption && !options.formatter) {
            this.isDatetimeAxis && (formatFormat = "%b %d, %Y");
            formatOption = "{value" + (formatFormat ? ":" + formatFormat : "") + "}";
        }
        crossLabel.attr({
            text: formatOption ? format(formatOption, {
                value: point[axis]
            }) : options.formatter.call(this, point[axis]),
            x: posx,
            y: posy,
            visibility: VISIBLE
        });
        crossBox = crossLabel.getBBox();
        horiz ? ("inside" === this.options.tickPosition && !opposite || "inside" !== this.options.tickPosition && opposite) && (posy = crossLabel.y - crossBox.height) : posy = crossLabel.y - crossBox.height / 2;
        limit = horiz ? {
            left: left - crossBox.x,
            right: left + this.width - crossBox.x
        } : {
            left: "left" === this.labelAlign ? left : 0,
            right: "right" === this.labelAlign ? left + this.width : chart.chartWidth
        };
        crossLabel.translateX < limit.left && (posx += limit.left - crossLabel.translateX);
        crossLabel.translateX + crossBox.width >= limit.right && (posx -= crossLabel.translateX + crossBox.width - limit.right);
        crossLabel.attr({
            x: posx,
            y: posy,
            visibility: VISIBLE
        });
    });
    var seriesInit = seriesProto.init, seriesProcessData = seriesProto.processData, pointTooltipFormatter = Point.prototype.tooltipFormatter;
    seriesProto.init = function() {
        seriesInit.apply(this, arguments);
        this.setCompare(this.options.compare);
    };
    seriesProto.setCompare = function(compare) {
        this.modifyValue = "value" === compare || "percent" === compare ? function(value, point) {
            var compareValue = this.compareValue;
            if (value !== UNDEFINED) {
                value = "value" === compare ? value - compareValue : value = 100 * (value / compareValue) - 100;
                point && (point.change = value);
            }
            return value;
        } : null;
        this.chart.hasRendered && (this.isDirty = true);
    };
    seriesProto.processData = function() {
        var processedXData, processedYData, length, series = this, i = 0;
        seriesProcessData.apply(this, arguments);
        if (series.xAxis && series.processedYData) {
            processedXData = series.processedXData;
            processedYData = series.processedYData;
            length = processedYData.length;
            for (;length > i; i++) if (typeof processedYData[i] === NUMBER && processedXData[i] >= series.xAxis.min) {
                series.compareValue = processedYData[i];
                break;
            }
        }
    };
    wrap(seriesProto, "getExtremes", function(proceed) {
        proceed.call(this);
        if (this.modifyValue) {
            this.dataMax = this.modifyValue(this.dataMax);
            this.dataMin = this.modifyValue(this.dataMin);
        }
    });
    Axis.prototype.setCompare = function(compare, redraw) {
        if (!this.isXAxis) {
            each(this.series, function(series) {
                series.setCompare(compare);
            });
            pick(redraw, true) && this.chart.redraw();
        }
    };
    Point.prototype.tooltipFormatter = function(pointFormat) {
        var point = this;
        pointFormat = pointFormat.replace("{point.change}", (point.change > 0 ? "+" : "") + numberFormat(point.change, pick(point.series.tooltipOptions.changeDecimals, 2)));
        return pointTooltipFormatter.apply(this, [ pointFormat ]);
    };
    wrap(Series.prototype, "render", function(proceed) {
        if (this.isCartesian && this.chart.options._stock) if (this.clipBox) this.chart[this.sharedClipKey] && this.chart[this.sharedClipKey].attr({
            width: this.xAxis.len,
            height: this.yAxis.len
        }); else {
            this.clipBox = merge(this.chart.clipBox);
            this.clipBox.width = this.xAxis.len;
            this.clipBox.height = this.yAxis.len;
        }
        proceed.call(this);
    });
    extend(Highcharts, {
        Axis: Axis,
        Chart: Chart,
        Color: Color,
        Point: Point,
        Tick: Tick,
        Renderer: Renderer,
        Series: Series,
        SVGElement: SVGElement,
        SVGRenderer: SVGRenderer,
        arrayMin: arrayMin,
        arrayMax: arrayMax,
        charts: charts,
        dateFormat: dateFormat,
        format: format,
        pathAnim: pathAnim,
        getOptions: getOptions,
        hasBidiBug: hasBidiBug,
        isTouchDevice: isTouchDevice,
        numberFormat: numberFormat,
        seriesTypes: seriesTypes,
        setOptions: setOptions,
        addEvent: addEvent,
        removeEvent: removeEvent,
        createElement: createElement,
        discardElement: discardElement,
        css: css,
        each: each,
        extend: extend,
        map: map,
        merge: merge,
        pick: pick,
        splat: splat,
        extendClass: extendClass,
        pInt: pInt,
        wrap: wrap,
        svg: hasSVG,
        canvas: useCanVG,
        vml: !hasSVG && !useCanVG,
        product: PRODUCT,
        version: VERSION
    });
})();