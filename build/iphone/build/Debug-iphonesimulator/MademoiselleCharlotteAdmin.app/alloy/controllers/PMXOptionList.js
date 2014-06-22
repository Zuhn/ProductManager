function Controller() {
    function closePage() {
        $.window.close({
            modal: true
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "PMXOptionList";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.window = Ti.UI.createWindow({
        backgroundImage: "bg1.jpg",
        backgroundColor: "#FFF",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        id: "window",
        layout: "vertical"
    });
    $.__views.window && $.addTopLevelView($.__views.window);
    $.__views.__alloyId0 = Ti.UI.createView({
        backgroundColor: "#222",
        height: "40dp",
        top: "0dp",
        id: "__alloyId0"
    });
    $.__views.window.add($.__views.__alloyId0);
    $.__views.__alloyId1 = Ti.UI.createLabel({
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        text: "Sélection de la catégorie",
        height: Ti.UI.SIZE,
        color: "#FFF",
        id: "__alloyId1"
    });
    $.__views.__alloyId0.add($.__views.__alloyId1);
    $.__views.__alloyId2 = Ti.UI.createButton({
        image: "bt_close.png",
        width: "20dp",
        height: "20dp",
        right: "5dp",
        color: "#FFF",
        tintColor: "#FFF",
        id: "__alloyId2"
    });
    $.__views.__alloyId0.add($.__views.__alloyId2);
    closePage ? $.__views.__alloyId2.addEventListener("click", closePage) : __defers["$.__views.__alloyId2!click!closePage"] = true;
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
    $.tableview.opacity = 0;
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
        $.tableview.footerView = Ti.UI.createView({
            height: 1,
            backgroundColor: "transparent"
        });
        $.tableview.data = tableData;
        var animation1 = Titanium.UI.createAnimation();
        animation1.opacity = 1;
        animation1.duration = 500;
        animation1.delay = 200;
        $.tableview.animate(animation1);
    });
    $.tableview.addEventListener("click", function(e) {
        args.cb(e.row.title, e.row.rowIndex);
        $.window.close();
    });
    __defers["$.__views.__alloyId2!click!closePage"] && $.__views.__alloyId2.addEventListener("click", closePage);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;