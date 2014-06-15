function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "RowProduct";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.row = Ti.UI.createTableViewRow({
        borderColor: "#FFF",
        borderWidth: "0dp",
        height: "80dp",
        hasChild: "false",
        className: "rowvoucher",
        backgroundColor: "transparent",
        selectedBackgroundColor: "#666666",
        id: "row",
        hasCheck: "false",
        layout: "horizontal"
    });
    $.__views.row && $.addTopLevelView($.__views.row);
    $.__views.pic_img = Ti.UI.createView({
        id: "pic_img",
        left: "15dp",
        width: Ti.UI.SIZE,
        layout: "vertical",
        right: "10dp",
        backgroundColor: "transparent",
        touchEnabled: "false"
    });
    $.__views.row.add($.__views.pic_img);
    $.__views.pic = Ti.UI.createImageView({
        height: "65dp",
        id: "pic",
        top: "6dp",
        left: "0dp",
        width: "65dp",
        borderRadius: "4",
        backgroundColor: "transparent",
        touchEnabled: "false"
    });
    $.__views.pic_img.add($.__views.pic);
    $.__views.__alloyId0 = Ti.UI.createView({
        layout: "vertical",
        width: Ti.UI.FILL,
        backgroundColor: "transparent",
        top: "0dp",
        touchEnabled: "false",
        id: "__alloyId0"
    });
    $.__views.row.add($.__views.__alloyId0);
    $.__views.__alloyId1 = Ti.UI.createView({
        layout: "horizontal",
        top: "0dp",
        height: "20dp",
        backgroundColor: "transparent",
        touchEnabled: "false",
        id: "__alloyId1"
    });
    $.__views.__alloyId0.add($.__views.__alloyId1);
    $.__views.ref = Ti.UI.createLabel({
        color: "orange",
        left: "0dp",
        right: "0dp",
        top: "2dp",
        width: "80dp",
        height: "20dp",
        touchEnabled: "false",
        font: {
            fontSize: 12
        },
        backgroundColor: "transparent",
        id: "ref"
    });
    $.__views.__alloyId1.add($.__views.ref);
    $.__views.prix = Ti.UI.createLabel({
        color: "orange",
        left: "5dp",
        right: "0dp",
        backgroundColor: "transparent",
        height: "20dp",
        touchEnabled: "false",
        font: {
            fontSize: 12
        },
        id: "prix"
    });
    $.__views.__alloyId1.add($.__views.prix);
    $.__views.title = Ti.UI.createLabel({
        left: "0dp",
        right: "20dp",
        top: "12dp",
        touchEnabled: "false",
        font: {
            fontSize: 18,
            fontFamily: "HelveticaNeue-Light"
        },
        color: "#000",
        height: "25dp",
        backgroundColor: "transparent",
        id: "title"
    });
    $.__views.__alloyId0.add($.__views.title);
    $.__views.date = Ti.UI.createLabel({
        color: "#575757",
        left: "0dp",
        right: "25dp",
        top: "-3dp",
        touchEnabled: "false",
        font: {
            fontSize: 10,
            fontFamily: "HelveticaNeue-Light"
        },
        height: "20dp",
        backgroundColor: "transparent",
        id: "date"
    });
    $.__views.__alloyId0.add($.__views.date);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var datas;
    exports.ini = function(data) {
        datas = data;
        var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "thumb_" + data.photo + ".jpeg");
        $.pic.image = f.getNativePath();
        $.ref.text = "réf: " + data.ref;
        $.prix.text = "prix: " + data.price + ".- CHF";
        $.title.text = data.nom;
        $.date.text = data.description;
    };
    exports.getDatas = function() {
        alert("yo");
        return "datas";
    };
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;