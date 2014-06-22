var HighchartsAdapter = function() {
    function augment(obj) {
        function removeOneEvent(el, type, fn) {
            el.removeEventListener(type, fn, false);
        }
        function IERemoveOneEvent(el, type, fn) {
            fn = el.HCProxiedMethods[fn.toString()];
            el.detachEvent("on" + type, fn);
        }
        function removeAllEvents(el, type) {
            var remove, types, len, n, events = el.HCEvents;
            if (el.removeEventListener) remove = removeOneEvent; else {
                if (!el.attachEvent) return;
                remove = IERemoveOneEvent;
            }
            if (type) {
                types = {};
                types[type] = true;
            } else types = events;
            for (n in types) if (events[n]) {
                len = events[n].length;
                while (len--) remove(el, n, events[n][len]);
            }
        }
        obj.HCExtended || Highcharts.extend(obj, {
            HCExtended: true,
            HCEvents: {},
            bind: function(name, fn) {
                var wrappedFn, el = this, events = this.HCEvents;
                if (el.addEventListener) el.addEventListener(name, fn, false); else if (el.attachEvent) {
                    wrappedFn = function(e) {
                        e.target = e.srcElement || window;
                        fn.call(el, e);
                    };
                    el.HCProxiedMethods || (el.HCProxiedMethods = {});
                    el.HCProxiedMethods[fn.toString()] = wrappedFn;
                    el.attachEvent("on" + name, wrappedFn);
                }
                events[name] === UNDEFINED && (events[name] = []);
                events[name].push(fn);
            },
            unbind: function(name, fn) {
                var events, index;
                if (name) {
                    events = this.HCEvents[name] || [];
                    if (fn) {
                        index = HighchartsAdapter.inArray(fn, events);
                        if (index > -1) {
                            events.splice(index, 1);
                            this.HCEvents[name] = events;
                        }
                        this.removeEventListener ? removeOneEvent(this, name, fn) : this.attachEvent && IERemoveOneEvent(this, name, fn);
                    } else {
                        removeAllEvents(this, name);
                        this.HCEvents[name] = [];
                    }
                } else {
                    removeAllEvents(this);
                    this.HCEvents = {};
                }
            },
            trigger: function(name, args) {
                var i, preventDefault, fn, events = this.HCEvents[name] || [], target = this, len = events.length;
                preventDefault = function() {
                    args.defaultPrevented = true;
                };
                for (i = 0; len > i; i++) {
                    fn = events[i];
                    if (args.stopped) return;
                    args.preventDefault = preventDefault;
                    args.target = target;
                    args.type || (args.type = name);
                    false === fn.call(this, args) && args.preventDefault();
                }
            }
        });
        return obj;
    }
    var UNDEFINED, timerId, Fx, doc = document, emptyArray = [], timers = [];
    Math.easeInOutSine = function(t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    };
    return {
        init: function(pathAnim) {
            if (!doc.defaultView) {
                this._getStyle = function(el, prop) {
                    var val;
                    if (el.style[prop]) return el.style[prop];
                    "opacity" === prop && (prop = "filter");
                    val = el.currentStyle[prop.replace(/\-(\w)/g, function(a, b) {
                        return b.toUpperCase();
                    })];
                    "filter" === prop && (val = val.replace(/alpha\(opacity=([0-9]+)\)/, function(a, b) {
                        return b / 100;
                    }));
                    return "" === val ? 1 : val;
                };
                this.adapterRun = function(elem, method) {
                    var alias = {
                        width: "clientWidth",
                        height: "clientHeight"
                    }[method];
                    if (alias) {
                        elem.style.zoom = 1;
                        return elem[alias] - 2 * parseInt(HighchartsAdapter._getStyle(elem, "padding"), 10);
                    }
                };
            }
            Array.prototype.forEach || (this.each = function(arr, fn) {
                var i = 0, len = arr.length;
                for (;len > i; i++) if (false === fn.call(arr[i], arr[i], i, arr)) return i;
            });
            Array.prototype.indexOf || (this.inArray = function(item, arr) {
                var len, i = 0;
                if (arr) {
                    len = arr.length;
                    for (;len > i; i++) if (arr[i] === item) return i;
                }
                return -1;
            });
            Array.prototype.filter || (this.grep = function(elements, callback) {
                var ret = [], i = 0, length = elements.length;
                for (;length > i; i++) !callback(elements[i], i) || ret.push(elements[i]);
                return ret;
            });
            Fx = function(elem, options, prop) {
                this.options = options;
                this.elem = elem;
                this.prop = prop;
            };
            Fx.prototype = {
                update: function() {
                    var styles, paths = this.paths, elem = this.elem, elemelem = elem.element;
                    if (paths && elemelem) elem.attr("d", pathAnim.step(paths[0], paths[1], this.now, this.toD)); else if (elem.attr) elemelem && elem.attr(this.prop, this.now); else {
                        styles = {};
                        styles[this.prop] = this.now + this.unit;
                        Highcharts.css(elem, styles);
                    }
                    this.options.step && this.options.step.call(this.elem, this.now, this);
                },
                custom: function(from, to, unit) {
                    var i, self = this, t = function(gotoEnd) {
                        return self.step(gotoEnd);
                    };
                    this.startTime = +new Date();
                    this.start = from;
                    this.end = to;
                    this.unit = unit;
                    this.now = this.start;
                    this.pos = this.state = 0;
                    t.elem = this.elem;
                    t() && 1 === timers.push(t) && (timerId = setInterval(function() {
                        for (i = 0; timers.length > i; i++) timers[i]() || timers.splice(i--, 1);
                        timers.length || clearInterval(timerId);
                    }, 13));
                },
                step: function(gotoEnd) {
                    var ret, done, i, t = +new Date(), options = this.options, elem = this.elem;
                    if (elem.stopAnimation || elem.attr && !elem.element) ret = false; else if (gotoEnd || t >= options.duration + this.startTime) {
                        this.now = this.end;
                        this.pos = this.state = 1;
                        this.update();
                        this.options.curAnim[this.prop] = true;
                        done = true;
                        for (i in options.curAnim) true !== options.curAnim[i] && (done = false);
                        done && options.complete && options.complete.call(elem);
                        ret = false;
                    } else {
                        var n = t - this.startTime;
                        this.state = n / options.duration;
                        this.pos = options.easing(n, 0, 1, options.duration);
                        this.now = this.start + (this.end - this.start) * this.pos;
                        this.update();
                        ret = true;
                    }
                    return ret;
                }
            };
            this.animate = function(el, prop, opt) {
                var start, end, fx, args, name, unit = "";
                el.stopAnimation = false;
                if ("object" != typeof opt || null === opt) {
                    args = arguments;
                    opt = {
                        duration: args[2],
                        easing: args[3],
                        complete: args[4]
                    };
                }
                "number" != typeof opt.duration && (opt.duration = 400);
                opt.easing = Math[opt.easing] || Math.easeInOutSine;
                opt.curAnim = Highcharts.extend({}, prop);
                for (name in prop) {
                    fx = new Fx(el, opt, name);
                    end = null;
                    if ("d" === name) {
                        fx.paths = pathAnim.init(el, el.d, prop.d);
                        fx.toD = prop.d;
                        start = 0;
                        end = 1;
                    } else if (el.attr) start = el.attr(name); else {
                        start = parseFloat(HighchartsAdapter._getStyle(el, name)) || 0;
                        "opacity" !== name && (unit = "px");
                    }
                    end || (end = parseFloat(prop[name]));
                    fx.custom(start, end, unit);
                }
            };
        },
        _getStyle: function(el, prop) {
            return window.getComputedStyle(el, void 0).getPropertyValue(prop);
        },
        getScript: function(scriptLocation, callback) {
            var head = doc.getElementsByTagName("head")[0], script = doc.createElement("script");
            script.type = "text/javascript";
            script.src = scriptLocation;
            script.onload = callback;
            head.appendChild(script);
        },
        inArray: function(item, arr) {
            return arr.indexOf ? arr.indexOf(item) : emptyArray.indexOf.call(arr, item);
        },
        adapterRun: function(elem, method) {
            return parseInt(HighchartsAdapter._getStyle(elem, method), 10);
        },
        grep: function(elements, callback) {
            return emptyArray.filter.call(elements, callback);
        },
        map: function(arr, fn) {
            var results = [], i = 0, len = arr.length;
            for (;len > i; i++) results[i] = fn.call(arr[i], arr[i], i, arr);
            return results;
        },
        offset: function(el) {
            var docElem = document.documentElement, box = el.getBoundingClientRect();
            return {
                top: box.top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
                left: box.left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
            };
        },
        addEvent: function(el, type, fn) {
            augment(el).bind(type, fn);
        },
        removeEvent: function(el, type, fn) {
            augment(el).unbind(type, fn);
        },
        fireEvent: function(el, type, eventArguments, defaultFunction) {
            var e;
            if (doc.createEvent && (el.dispatchEvent || el.fireEvent)) {
                e = doc.createEvent("Events");
                e.initEvent(type, true, true);
                e.target = el;
                Highcharts.extend(e, eventArguments);
                el.dispatchEvent ? el.dispatchEvent(e) : el.fireEvent(type, e);
            } else if (true === el.HCExtended) {
                eventArguments = eventArguments || {};
                el.trigger(type, eventArguments);
            }
            eventArguments && eventArguments.defaultPrevented && (defaultFunction = null);
            defaultFunction && defaultFunction(eventArguments);
        },
        washMouseEvent: function(e) {
            return e;
        },
        stop: function(el) {
            el.stopAnimation = true;
        },
        each: function(arr, fn) {
            return Array.prototype.forEach.call(arr, fn);
        }
    };
}();