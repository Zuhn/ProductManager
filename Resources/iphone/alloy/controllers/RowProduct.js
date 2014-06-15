function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "RowProduct";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.row = Ti.UI.createTableViewRow({
        separatorColor: "transparent",
        borderColor: "#FFF",
        borderWidth: "0dp",
        height: Ti.UI.SIZE,
        hasChild: "false",
        className: "rowvoucher",
        backgroundColor: "transparent",
        selectedBackgroundColor: "#666666",
        id: "row",
        hasCheck: "false",
        layout: "horizontal"
    });
    $.__views.row && $.addTopLevelView($.__views.row);
    $.__views.__alloyId0 = Ti.UI.createView({
        layout: "vertical",
        height: Ti.UI.SIZE,
        id: "__alloyId0"
    });
    $.__views.row.add($.__views.__alloyId0);
    $.__views.crop = Ti.UI.createScrollView({
        id: "crop",
        height: "140dp",
        contentWidth: Ti.UI.FILL,
        contentHeight: "auto",
        touchEnabled: "false"
    });
    $.__views.__alloyId0.add($.__views.crop);
    $.__views.pic = Ti.UI.createImageView({
        id: "pic",
        top: "-20dp",
        height: Ti.UI.SIZE
    });
    $.__views.crop.add($.__views.pic);
    $.__views.__alloyId1 = Ti.UI.createView({
        backgroundColor: "#50000000",
        height: "30dp",
        top: "110dp",
        id: "__alloyId1"
    });
    $.__views.crop.add($.__views.__alloyId1);
    $.__views.title = Ti.UI.createLabel({
        bottom: "5dp",
        left: "15dp",
        touchEnabled: "false",
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa"
        },
        id: "title",
        color: "#FFFFFF"
    });
    $.__views.__alloyId1.add($.__views.title);
    $.__views.v_prix = Ti.UI.createView({
        id: "v_prix",
        layout: "vertical",
        width: Ti.UI.FILL,
        backgroundColor: "#222",
        top: "0dp",
        touchEnabled: "false"
    });
    $.__views.__alloyId0.add($.__views.v_prix);
    $.__views.__alloyId2 = Ti.UI.createView({
        layout: "horizontal",
        left: "15dp",
        height: "20dp",
        backgroundColor: "transparent",
        touchEnabled: "false",
        top: "7dp",
        id: "__alloyId2"
    });
    $.__views.v_prix.add($.__views.__alloyId2);
    $.__views.ref = Ti.UI.createLabel({
        color: "#FFFFFF",
        left: "0dp",
        right: "0dp",
        width: "60dp",
        height: "auto",
        touchEnabled: "false",
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        id: "ref"
    });
    $.__views.__alloyId2.add($.__views.ref);
    $.__views.prix = Ti.UI.createLabel({
        color: "#FFFFFF",
        left: "0dp",
        right: "0dp",
        width: "100dp",
        height: "auto",
        touchEnabled: "false",
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa-Bold",
            fontWeight: "Bold"
        },
        id: "prix"
    });
    $.__views.__alloyId2.add($.__views.prix);
    $.__views.v_desc = Ti.UI.createView({
        id: "v_desc",
        height: Ti.UI.SIZE,
        backgroundColor: "#222"
    });
    $.__views.__alloyId0.add($.__views.v_desc);
    $.__views.date = Ti.UI.createLabel({
        verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
        height: "auto",
        color: "#FFFFFF",
        left: "15dp",
        right: "15dp",
        top: "10dp",
        touchEnabled: "false",
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa"
        },
        id: "date",
        bottom: "20dp"
    });
    $.__views.v_desc.add($.__views.date);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var datas;
    exports.ini = function(data) {
        datas = data;
        var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, data.photo + ".jpeg");
        $.pic.image = f.getNativePath();
        "" == datas.ref && "" == datas.price && ($.v_prix.height = "0dp");
        "" != datas.ref ? $.ref.text = "Réf: " + data.ref : $.ref.width = "0dp";
        if ("" != datas.price) {
            $.prix.text = "Prix: " + data.price;
            $.v_prix.height = "30dp";
        }
        "" != datas.description ? $.date.text = data.description : $.v_desc.height = "0dp";
        $.title.text = data.nom;
        $.row.height = Ti.UI.SIZE;
    };
    exports.getDatas = function() {
        alert("yo");
        return "datas";
    };
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;