(function(H) {
    function hasDataPie() {
        return !!this.points.length;
    }
    function handleNoData() {
        var chart = this;
        chart.hasData() ? chart.hideNoData() : chart.showNoData();
    }
    var seriesTypes = H.seriesTypes, chartPrototype = H.Chart.prototype, defaultOptions = H.getOptions(), extend = H.extend;
    extend(defaultOptions.lang, {
        noData: "No data to display"
    });
    defaultOptions.noData = {
        position: {
            x: 0,
            y: 0,
            align: "center",
            verticalAlign: "middle"
        },
        attr: {},
        style: {
            fontWeight: "bold",
            fontSize: "12px",
            color: "#60606a"
        }
    };
    seriesTypes.pie && (seriesTypes.pie.prototype.hasData = hasDataPie);
    seriesTypes.gauge && (seriesTypes.gauge.prototype.hasData = hasDataPie);
    seriesTypes.waterfall && (seriesTypes.waterfall.prototype.hasData = hasDataPie);
    H.Series.prototype.hasData = function() {
        return void 0 !== this.dataMax && void 0 !== this.dataMin;
    };
    chartPrototype.showNoData = function(str) {
        var chart = this, options = chart.options, text = str || options.lang.noData, noDataOptions = options.noData;
        if (!chart.noDataLabel) {
            chart.noDataLabel = chart.renderer.label(text, 0, 0, null, null, null, null, null, "no-data").attr(noDataOptions.attr).css(noDataOptions.style).add();
            chart.noDataLabel.align(extend(chart.noDataLabel.getBBox(), noDataOptions.position), false, "plotBox");
        }
    };
    chartPrototype.hideNoData = function() {
        var chart = this;
        chart.noDataLabel && (chart.noDataLabel = chart.noDataLabel.destroy());
    };
    chartPrototype.hasData = function() {
        var chart = this, series = chart.series, i = series.length;
        while (i--) if (series[i].hasData() && !series[i].options.isInternal) return true;
        return false;
    };
    chartPrototype.callbacks.push(function(chart) {
        H.addEvent(chart, "load", handleNoData);
        H.addEvent(chart, "redraw", handleNoData);
    });
})(Highcharts);