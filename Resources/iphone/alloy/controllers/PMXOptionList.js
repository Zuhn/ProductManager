function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "PMXOptionList";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.window = Ti.UI.createWindow({
        backgroundImage: "bg1.jpg",
        backgroundColor: "#FFF",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        id: "window"
    });
    $.__views.window && $.addTopLevelView($.__views.window);
    $.__views.tableview = Ti.UI.createTableView({
        id: "tableview",
        backgroundColor: "transparent"
    });
    $.__views.window.add($.__views.tableview);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var tab_data = args.data;
    var ini_value = args.ini_value;
    args.short_answer;
    var tableData = [];
    $.window.addEventListener("open", function() {
        for (var i = 0; tab_data.length - 1 >= i; i++) {
            var t = tab_data[i];
            var row_c = Alloy.createController("PMXOptionListRow");
            row_c.name = t.title;
            row_c.title = t.title;
            row = row_c.getView();
            row.hasChild = false;
            row.title = t.title;
            row.rowIndex = t.id;
            t.id == ini_value && (row.hasCheck = true);
            tableData.push(row);
        }
        $.tableview.data = tableData;
    });
    $.tableview.addEventListener("click", function(e) {
        args.cb(e.row.title, e.row.rowIndex);
        $.window.close();
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;