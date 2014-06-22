(function(Highcharts) {
    var each = Highcharts.each;
    var Data = function(dataOptions, chartOptions) {
        this.init(dataOptions, chartOptions);
    };
    Highcharts.extend(Data.prototype, {
        init: function(options, chartOptions) {
            this.options = options;
            this.chartOptions = chartOptions;
            this.columns = options.columns || this.rowsToColumns(options.rows) || [];
            if (this.columns.length) this.dataFound(); else {
                this.parseCSV();
                this.parseTable();
                this.parseGoogleSpreadsheet();
            }
        },
        getColumnDistribution: function() {
            var chartOptions = this.chartOptions, getValueCount = function(type) {
                return (Highcharts.seriesTypes[type || "line"].prototype.pointArrayMap || [ 0 ]).length;
            }, globalType = chartOptions && chartOptions.chart && chartOptions.chart.type, individualCounts = [];
            each(chartOptions && chartOptions.series || [], function(series) {
                individualCounts.push(getValueCount(series.type || globalType));
            });
            this.valueCount = {
                global: getValueCount(globalType),
                individual: individualCounts
            };
        },
        dataFound: function() {
            this.options.switchRowsAndColumns && (this.columns = this.rowsToColumns(this.columns));
            this.parseTypes();
            this.findHeaderRow();
            this.parsed();
            this.complete();
        },
        parseCSV: function() {
            var itemDelimiter, lines, self = this, options = this.options, csv = options.csv, columns = this.columns, startRow = options.startRow || 0, endRow = options.endRow || Number.MAX_VALUE, startColumn = options.startColumn || 0, endColumn = options.endColumn || Number.MAX_VALUE, activeRowNo = 0;
            if (csv) {
                lines = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split(options.lineDelimiter || "\n");
                itemDelimiter = options.itemDelimiter || (-1 !== csv.indexOf("	") ? "	" : ",");
                each(lines, function(line, rowNo) {
                    var items, trimmed = self.trim(line), isComment = 0 === trimmed.indexOf("#"), isBlank = "" === trimmed;
                    if (rowNo >= startRow && endRow >= rowNo && !isComment && !isBlank) {
                        items = line.split(itemDelimiter);
                        each(items, function(item, colNo) {
                            if (colNo >= startColumn && endColumn >= colNo) {
                                columns[colNo - startColumn] || (columns[colNo - startColumn] = []);
                                columns[colNo - startColumn][activeRowNo] = item;
                            }
                        });
                        activeRowNo += 1;
                    }
                });
                this.dataFound();
            }
        },
        parseTable: function() {
            var options = this.options, table = options.table, columns = this.columns, startRow = options.startRow || 0, endRow = options.endRow || Number.MAX_VALUE, startColumn = options.startColumn || 0, endColumn = options.endColumn || Number.MAX_VALUE;
            if (table) {
                "string" == typeof table && (table = document.getElementById(table));
                each(table.getElementsByTagName("tr"), function(tr, rowNo) {
                    rowNo >= startRow && endRow >= rowNo && each(tr.children, function(item, colNo) {
                        if (("TD" === item.tagName || "TH" === item.tagName) && colNo >= startColumn && endColumn >= colNo) {
                            columns[colNo - startColumn] || (columns[colNo - startColumn] = []);
                            columns[colNo - startColumn][rowNo - startRow] = item.innerHTML;
                        }
                    });
                });
                this.dataFound();
            }
        },
        parseGoogleSpreadsheet: function() {
            var gr, gc, self = this, options = this.options, googleSpreadsheetKey = options.googleSpreadsheetKey, columns = this.columns, startRow = options.startRow || 0, endRow = options.endRow || Number.MAX_VALUE, startColumn = options.startColumn || 0, endColumn = options.endColumn || Number.MAX_VALUE;
            googleSpreadsheetKey && jQuery.ajax({
                dataType: "json",
                url: "https://spreadsheets.google.com/feeds/cells/" + googleSpreadsheetKey + "/" + (options.googleSpreadsheetWorksheet || "od6") + "/public/values?alt=json-in-script&callback=?",
                error: options.error,
                success: function(json) {
                    var cell, i, cells = json.feed.entry, cellCount = cells.length, colCount = 0, rowCount = 0;
                    for (i = 0; cellCount > i; i++) {
                        cell = cells[i];
                        colCount = Math.max(colCount, cell.gs$cell.col);
                        rowCount = Math.max(rowCount, cell.gs$cell.row);
                    }
                    for (i = 0; colCount > i; i++) if (i >= startColumn && endColumn >= i) {
                        columns[i - startColumn] = [];
                        columns[i - startColumn].length = Math.min(rowCount, endRow - startRow);
                    }
                    for (i = 0; cellCount > i; i++) {
                        cell = cells[i];
                        gr = cell.gs$cell.row - 1;
                        gc = cell.gs$cell.col - 1;
                        gc >= startColumn && endColumn >= gc && gr >= startRow && endRow >= gr && (columns[gc - startColumn][gr - startRow] = cell.content.$t);
                    }
                    self.dataFound();
                }
            });
        },
        findHeaderRow: function() {
            var headerRow = 0;
            each(this.columns, function(column) {
                "string" != typeof column[0] && (headerRow = null);
            });
            this.headerRow = 0;
        },
        trim: function(str) {
            return "string" == typeof str ? str.replace(/^\s+|\s+$/g, "") : str;
        },
        parseTypes: function() {
            var row, val, floatVal, trimVal, dateVal, columns = this.columns, col = columns.length;
            while (col--) {
                row = columns[col].length;
                while (row--) {
                    val = columns[col][row];
                    floatVal = parseFloat(val);
                    trimVal = this.trim(val);
                    if (trimVal == floatVal) {
                        columns[col][row] = floatVal;
                        floatVal > 31536e6 ? columns[col].isDatetime = true : columns[col].isNumeric = true;
                    } else {
                        dateVal = this.parseDate(val);
                        if (0 !== col || "number" != typeof dateVal || isNaN(dateVal)) columns[col][row] = "" === trimVal ? null : trimVal; else {
                            columns[col][row] = dateVal;
                            columns[col].isDatetime = true;
                        }
                    }
                }
            }
        },
        dateFormats: {
            "YYYY-mm-dd": {
                regex: "^([0-9]{4})-([0-9]{2})-([0-9]{2})$",
                parser: function(match) {
                    return Date.UTC(+match[1], match[2] - 1, +match[3]);
                }
            }
        },
        parseDate: function(val) {
            var ret, key, format, match, parseDate = this.options.parseDate;
            parseDate && (ret = parseDate(val));
            if ("string" == typeof val) for (key in this.dateFormats) {
                format = this.dateFormats[key];
                match = val.match(format.regex);
                match && (ret = format.parser(match));
            }
            return ret;
        },
        rowsToColumns: function(rows) {
            var row, rowsLength, col, colsLength, columns;
            if (rows) {
                columns = [];
                rowsLength = rows.length;
                for (row = 0; rowsLength > row; row++) {
                    colsLength = rows[row].length;
                    for (col = 0; colsLength > col; col++) {
                        columns[col] || (columns[col] = []);
                        columns[col][row] = rows[row][col];
                    }
                }
            }
            return columns;
        },
        parsed: function() {
            this.options.parsed && this.options.parsed.call(this, this.columns);
        },
        complete: function() {
            var firstCol, type, valueCount, series, data, i, j, seriesIndex, columns = this.columns, options = this.options;
            if (options.complete) {
                this.getColumnDistribution();
                if (columns.length > 1) {
                    firstCol = columns.shift();
                    0 === this.headerRow && firstCol.shift();
                    firstCol.isDatetime ? type = "datetime" : firstCol.isNumeric || (type = "category");
                }
                for (i = 0; columns.length > i; i++) 0 === this.headerRow && (columns[i].name = columns[i].shift());
                series = [];
                for (i = 0, seriesIndex = 0; columns.length > i; seriesIndex++) {
                    valueCount = Highcharts.pick(this.valueCount.individual[seriesIndex], this.valueCount.global);
                    data = [];
                    if (columns.length >= i + valueCount) for (j = 0; columns[i].length > j; j++) {
                        data[j] = [ firstCol[j], void 0 !== columns[i][j] ? columns[i][j] : null ];
                        valueCount > 1 && data[j].push(void 0 !== columns[i + 1][j] ? columns[i + 1][j] : null);
                        valueCount > 2 && data[j].push(void 0 !== columns[i + 2][j] ? columns[i + 2][j] : null);
                        valueCount > 3 && data[j].push(void 0 !== columns[i + 3][j] ? columns[i + 3][j] : null);
                        valueCount > 4 && data[j].push(void 0 !== columns[i + 4][j] ? columns[i + 4][j] : null);
                    }
                    series[seriesIndex] = {
                        name: columns[i].name,
                        data: data
                    };
                    i += valueCount;
                }
                options.complete({
                    xAxis: {
                        type: type
                    },
                    series: series
                });
            }
        }
    });
    Highcharts.Data = Data;
    Highcharts.data = function(options, chartOptions) {
        return new Data(options, chartOptions);
    };
    Highcharts.wrap(Highcharts.Chart.prototype, "init", function(proceed, userOptions, callback) {
        var chart = this;
        userOptions && userOptions.data ? Highcharts.data(Highcharts.extend(userOptions.data, {
            complete: function(dataOptions) {
                userOptions.hasOwnProperty("series") && ("object" == typeof userOptions.series ? each(userOptions.series, function(series, i) {
                    userOptions.series[i] = Highcharts.merge(series, dataOptions.series[i]);
                }) : delete userOptions.series);
                userOptions = Highcharts.merge(dataOptions, userOptions);
                proceed.call(chart, userOptions, callback);
            }
        }), userOptions) : proceed.call(chart, userOptions, callback);
    });
})(Highcharts);