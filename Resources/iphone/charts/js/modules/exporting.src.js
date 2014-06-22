(function(Highcharts) {
    var UNDEFINED, buttonOffset, Chart = Highcharts.Chart, addEvent = Highcharts.addEvent, removeEvent = Highcharts.removeEvent, createElement = Highcharts.createElement, discardElement = Highcharts.discardElement, css = Highcharts.css, merge = Highcharts.merge, each = Highcharts.each, extend = Highcharts.extend, math = Math, mathMax = math.max, doc = document, win = window, isTouchDevice = Highcharts.isTouchDevice, M = "M", L = "L", DIV = "div", HIDDEN = "hidden", NONE = "none", PREFIX = "highcharts-", ABSOLUTE = "absolute", PX = "px", symbols = Highcharts.Renderer.prototype.symbols, defaultOptions = Highcharts.getOptions();
    extend(defaultOptions.lang, {
        printChart: "Print chart",
        downloadPNG: "Download PNG image",
        downloadJPEG: "Download JPEG image",
        downloadPDF: "Download PDF document",
        downloadSVG: "Download SVG vector image",
        contextButtonTitle: "Chart context menu"
    });
    defaultOptions.navigation = {
        menuStyle: {
            border: "1px solid #A0A0A0",
            background: "#FFFFFF",
            padding: "5px 0"
        },
        menuItemStyle: {
            padding: "0 10px",
            background: NONE,
            color: "#303030",
            fontSize: isTouchDevice ? "14px" : "11px"
        },
        menuItemHoverStyle: {
            background: "#4572A5",
            color: "#FFFFFF"
        },
        buttonOptions: {
            symbolFill: "#E0E0E0",
            symbolSize: 14,
            symbolStroke: "#666",
            symbolStrokeWidth: 3,
            symbolX: 12.5,
            symbolY: 10.5,
            align: "right",
            buttonSpacing: 3,
            height: 22,
            theme: {
                fill: "white",
                stroke: "none"
            },
            verticalAlign: "top",
            width: 24
        }
    };
    defaultOptions.exporting = {
        type: "image/png",
        url: "http://export.highcharts.com/",
        buttons: {
            contextButton: {
                menuClassName: PREFIX + "contextmenu",
                symbol: "menu",
                _titleKey: "contextButtonTitle",
                menuItems: [ {
                    textKey: "printChart",
                    onclick: function() {
                        this.print();
                    }
                }, {
                    separator: true
                }, {
                    textKey: "downloadPNG",
                    onclick: function() {
                        this.exportChart();
                    }
                }, {
                    textKey: "downloadJPEG",
                    onclick: function() {
                        this.exportChart({
                            type: "image/jpeg"
                        });
                    }
                }, {
                    textKey: "downloadPDF",
                    onclick: function() {
                        this.exportChart({
                            type: "application/pdf"
                        });
                    }
                }, {
                    textKey: "downloadSVG",
                    onclick: function() {
                        this.exportChart({
                            type: "image/svg+xml"
                        });
                    }
                } ]
            }
        }
    };
    Highcharts.post = function(url, data, formAttributes) {
        var name, form;
        form = createElement("form", merge({
            method: "post",
            action: url,
            enctype: "multipart/form-data"
        }, formAttributes), {
            display: NONE
        }, doc.body);
        for (name in data) createElement("input", {
            type: HIDDEN,
            name: name,
            value: data[name]
        }, null, form);
        form.submit();
        discardElement(form);
    };
    extend(Chart.prototype, {
        getSVG: function(additionalOptions) {
            var chartCopy, sandbox, svg, seriesOptions, sourceWidth, sourceHeight, cssWidth, cssHeight, chart = this, options = merge(chart.options, additionalOptions);
            doc.createElementNS || (doc.createElementNS = function(ns, tagName) {
                return doc.createElement(tagName);
            });
            sandbox = createElement(DIV, null, {
                position: ABSOLUTE,
                top: "-9999em",
                width: chart.chartWidth + PX,
                height: chart.chartHeight + PX
            }, doc.body);
            cssWidth = chart.renderTo.style.width;
            cssHeight = chart.renderTo.style.height;
            sourceWidth = options.exporting.sourceWidth || options.chart.width || /px$/.test(cssWidth) && parseInt(cssWidth, 10) || 600;
            sourceHeight = options.exporting.sourceHeight || options.chart.height || /px$/.test(cssHeight) && parseInt(cssHeight, 10) || 400;
            extend(options.chart, {
                animation: false,
                renderTo: sandbox,
                forExport: true,
                width: sourceWidth,
                height: sourceHeight
            });
            options.exporting.enabled = false;
            options.series = [];
            each(chart.series, function(serie) {
                seriesOptions = merge(serie.options, {
                    animation: false,
                    showCheckbox: false,
                    visible: serie.visible
                });
                seriesOptions.isInternal || options.series.push(seriesOptions);
            });
            chartCopy = new Highcharts.Chart(options, chart.callback);
            each([ "xAxis", "yAxis" ], function(axisType) {
                each(chart[axisType], function(axis, i) {
                    var axisCopy = chartCopy[axisType][i], extremes = axis.getExtremes(), userMin = extremes.userMin, userMax = extremes.userMax;
                    !axisCopy || userMin === UNDEFINED && userMax === UNDEFINED || axisCopy.setExtremes(userMin, userMax, true, false);
                });
            });
            svg = chartCopy.container.innerHTML;
            options = null;
            chartCopy.destroy();
            discardElement(sandbox);
            svg = svg.replace(/zIndex="[^"]+"/g, "").replace(/isShadow="[^"]+"/g, "").replace(/symbolName="[^"]+"/g, "").replace(/jQuery[0-9]+="[^"]+"/g, "").replace(/url\([^#]+#/g, "url(#").replace(/<svg /, '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ').replace(/ href=/g, " xlink:href=").replace(/\n/, " ").replace(/<\/svg>.*?$/, "</svg>").replace(/&nbsp;/g, " ").replace(/&shy;/g, "­").replace(/<IMG /g, "<image ").replace(/height=([^" ]+)/g, 'height="$1"').replace(/width=([^" ]+)/g, 'width="$1"').replace(/hc-svg-href="([^"]+)">/g, 'xlink:href="$1"/>').replace(/id=([^" >]+)/g, 'id="$1"').replace(/class=([^" >]+)/g, 'class="$1"').replace(/ transform /g, " ").replace(/:(path|rect)/g, "$1").replace(/style="([^"]+)"/g, function(s) {
                return s.toLowerCase();
            });
            svg = svg.replace(/(url\(#highcharts-[0-9]+)&quot;/g, "$1").replace(/&quot;/g, "'");
            return svg;
        },
        exportChart: function(options, chartOptions) {
            options = options || {};
            var chart = this, chartExportingOptions = chart.options.exporting, svg = chart.getSVG(merge({
                chart: {
                    borderRadius: 0
                }
            }, chartExportingOptions.chartOptions, chartOptions, {
                exporting: {
                    sourceWidth: options.sourceWidth || chartExportingOptions.sourceWidth,
                    sourceHeight: options.sourceHeight || chartExportingOptions.sourceHeight
                }
            }));
            options = merge(chart.options.exporting, options);
            Highcharts.post(options.url, {
                filename: options.filename || "chart",
                type: options.type,
                width: options.width || 0,
                scale: options.scale || 2,
                svg: svg
            }, options.formAttributes);
        },
        print: function() {
            var chart = this, container = chart.container, origDisplay = [], origParent = container.parentNode, body = doc.body, childNodes = body.childNodes;
            if (chart.isPrinting) return;
            chart.isPrinting = true;
            each(childNodes, function(node, i) {
                if (1 === node.nodeType) {
                    origDisplay[i] = node.style.display;
                    node.style.display = NONE;
                }
            });
            body.appendChild(container);
            win.focus();
            win.print();
            setTimeout(function() {
                origParent.appendChild(container);
                each(childNodes, function(node, i) {
                    1 === node.nodeType && (node.style.display = origDisplay[i]);
                });
                chart.isPrinting = false;
            }, 1e3);
        },
        contextMenu: function(className, items, x, y, width, height, button) {
            var innerMenu, hide, hideTimer, menuStyle, chart = this, navOptions = chart.options.navigation, menuItemStyle = navOptions.menuItemStyle, chartWidth = chart.chartWidth, chartHeight = chart.chartHeight, cacheName = "cache-" + className, menu = chart[cacheName], menuPadding = mathMax(width, height), boxShadow = "3px 3px 10px #888", docMouseUpHandler = function(e) {
                chart.pointer.inClass(e.target, className) || hide();
            };
            if (!menu) {
                chart[cacheName] = menu = createElement(DIV, {
                    className: className
                }, {
                    position: ABSOLUTE,
                    zIndex: 1e3,
                    padding: menuPadding + PX
                }, chart.container);
                innerMenu = createElement(DIV, null, extend({
                    MozBoxShadow: boxShadow,
                    WebkitBoxShadow: boxShadow,
                    boxShadow: boxShadow
                }, navOptions.menuStyle), menu);
                hide = function() {
                    css(menu, {
                        display: NONE
                    });
                    button && button.setState(0);
                    chart.openMenu = false;
                };
                addEvent(menu, "mouseleave", function() {
                    hideTimer = setTimeout(hide, 500);
                });
                addEvent(menu, "mouseenter", function() {
                    clearTimeout(hideTimer);
                });
                addEvent(document, "mouseup", docMouseUpHandler);
                addEvent(chart, "destroy", function() {
                    removeEvent(document, "mouseup", docMouseUpHandler);
                });
                each(items, function(item) {
                    if (item) {
                        var element = item.separator ? createElement("hr", null, null, innerMenu) : createElement(DIV, {
                            onmouseover: function() {
                                css(this, navOptions.menuItemHoverStyle);
                            },
                            onmouseout: function() {
                                css(this, menuItemStyle);
                            },
                            onclick: function() {
                                hide();
                                item.onclick.apply(chart, arguments);
                            },
                            innerHTML: item.text || chart.options.lang[item.textKey]
                        }, extend({
                            cursor: "pointer"
                        }, menuItemStyle), innerMenu);
                        chart.exportDivElements.push(element);
                    }
                });
                chart.exportDivElements.push(innerMenu, menu);
                chart.exportMenuWidth = menu.offsetWidth;
                chart.exportMenuHeight = menu.offsetHeight;
            }
            menuStyle = {
                display: "block"
            };
            x + chart.exportMenuWidth > chartWidth ? menuStyle.right = chartWidth - x - width - menuPadding + PX : menuStyle.left = x - menuPadding + PX;
            y + height + chart.exportMenuHeight > chartHeight && "top" !== button.alignOptions.verticalAlign ? menuStyle.bottom = chartHeight - y - menuPadding + PX : menuStyle.top = y + height - menuPadding + PX;
            css(menu, menuStyle);
            chart.openMenu = true;
        },
        addButton: function(options) {
            var symbol, button, chart = this, renderer = chart.renderer, btnOptions = merge(chart.options.navigation.buttonOptions, options), onclick = btnOptions.onclick, menuItems = btnOptions.menuItems, symbolAttr = {
                stroke: btnOptions.symbolStroke,
                fill: btnOptions.symbolFill
            }, symbolSize = btnOptions.symbolSize || 12;
            chart.btnCount || (chart.btnCount = 0);
            if (!chart.exportDivElements) {
                chart.exportDivElements = [];
                chart.exportSVGElements = [];
            }
            if (false === btnOptions.enabled) return;
            var callback, attr = btnOptions.theme, states = attr.states, hover = states && states.hover, select = states && states.select;
            delete attr.states;
            onclick ? callback = function() {
                onclick.apply(chart, arguments);
            } : menuItems && (callback = function() {
                chart.contextMenu(button.menuClassName, menuItems, button.translateX, button.translateY, button.width, button.height, button);
                button.setState(2);
            });
            btnOptions.text && btnOptions.symbol ? attr.paddingLeft = Highcharts.pick(attr.paddingLeft, 25) : btnOptions.text || extend(attr, {
                width: btnOptions.width,
                height: btnOptions.height,
                padding: 0
            });
            button = renderer.button(btnOptions.text, 0, 0, callback, attr, hover, select).attr({
                title: chart.options.lang[btnOptions._titleKey],
                "stroke-linecap": "round"
            });
            button.menuClassName = options.menuClassName || PREFIX + "menu-" + chart.btnCount++;
            btnOptions.symbol && (symbol = renderer.symbol(btnOptions.symbol, btnOptions.symbolX - symbolSize / 2, btnOptions.symbolY - symbolSize / 2, symbolSize, symbolSize).attr(extend(symbolAttr, {
                "stroke-width": btnOptions.symbolStrokeWidth || 1,
                zIndex: 1
            })).add(button));
            button.add().align(extend(btnOptions, {
                width: button.width,
                x: Highcharts.pick(btnOptions.x, buttonOffset)
            }), true, "spacingBox");
            buttonOffset += (button.width + btnOptions.buttonSpacing) * ("right" === btnOptions.align ? -1 : 1);
            chart.exportSVGElements.push(button, symbol);
        },
        destroyExport: function(e) {
            var i, elem, chart = e.target;
            for (i = 0; chart.exportSVGElements.length > i; i++) {
                elem = chart.exportSVGElements[i];
                if (elem) {
                    elem.onclick = elem.ontouchstart = null;
                    chart.exportSVGElements[i] = elem.destroy();
                }
            }
            for (i = 0; chart.exportDivElements.length > i; i++) {
                elem = chart.exportDivElements[i];
                removeEvent(elem, "mouseleave");
                chart.exportDivElements[i] = elem.onmouseout = elem.onmouseover = elem.ontouchstart = elem.onclick = null;
                discardElement(elem);
            }
        }
    });
    symbols.menu = function(x, y, width, height) {
        var arr = [ M, x, y + 2.5, L, x + width, y + 2.5, M, x, y + height / 2 + .5, L, x + width, y + height / 2 + .5, M, x, y + height - 1.5, L, x + width, y + height - 1.5 ];
        return arr;
    };
    Chart.prototype.callbacks.push(function(chart) {
        var n, exportingOptions = chart.options.exporting, buttons = exportingOptions.buttons;
        buttonOffset = 0;
        if (false !== exportingOptions.enabled) {
            for (n in buttons) chart.addButton(buttons[n]);
            addEvent(chart, "destroy", chart.destroyExport);
        }
    });
})(Highcharts);