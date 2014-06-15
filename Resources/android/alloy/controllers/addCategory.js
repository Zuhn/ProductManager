function Controller() {
    function addProduct() {
        DB.insert("charlotte", 'INSERT INTO jewelry_cat (title) VALUES ("' + $.nom.value + '")');
        Ti.App.fireEvent("reloadCategory");
        $.win.close({
            modal: true
        });
    }
    function closePage() {
        $.win.close({
            modal: true
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "addCategory";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.win = Ti.UI.createWindow({
        backgroundColor: "#FFF",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        navBarHidden: true,
        id: "win"
    });
    $.__views.win && $.addTopLevelView($.__views.win);
    $.__views.__alloyId2 = Ti.UI.createScrollView({
        backgroundColor: "#DDD",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        navBarHidden: true,
        layout: "vertical",
        id: "__alloyId2"
    });
    $.__views.win.add($.__views.__alloyId2);
    $.__views.__alloyId3 = Ti.UI.createView({
        backgroundColor: "#000",
        height: "40dp",
        bottom: "30dp",
        id: "__alloyId3"
    });
    $.__views.__alloyId2.add($.__views.__alloyId3);
    $.__views.__alloyId4 = Ti.UI.createLabel({
        text: "Ajouter un produit",
        color: "#FFF",
        id: "__alloyId4"
    });
    $.__views.__alloyId3.add($.__views.__alloyId4);
    $.__views.__alloyId5 = Ti.UI.createButton({
        image: "bt_close.png",
        width: "20dp",
        height: "20dp",
        right: "5dp",
        color: "#FFF",
        tintColor: "#FFF",
        id: "__alloyId5"
    });
    $.__views.__alloyId3.add($.__views.__alloyId5);
    closePage ? $.__views.__alloyId5.addEventListener("click", closePage) : __defers["$.__views.__alloyId5!click!closePage"] = true;
    $.__views.nom = Ti.UI.createTextField({
        left: "20dp",
        right: "20dp",
        borderRadius: 4,
        height: "30dp",
        backgroundColor: "#EEE",
        top: "5dp",
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        paddingLeft: "10dp",
        paddingRight: "10dp",
        font: {
            fontSize: 12
        },
        id: "nom",
        hintText: "Entrer le nom"
    });
    $.__views.__alloyId2.add($.__views.nom);
    $.__views.__alloyId6 = Ti.UI.createButton({
        left: "20dp",
        right: "20dp",
        borderRadius: 4,
        height: "30dp",
        backgroundColor: "#BBB",
        top: "20dp",
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        paddingLeft: "10dp",
        paddingRight: "10dp",
        font: {
            fontSize: 16
        },
        title: "Ajouter",
        color: "#000",
        bottom: "20dp",
        id: "__alloyId6"
    });
    $.__views.__alloyId2.add($.__views.__alloyId6);
    addProduct ? $.__views.__alloyId6.addEventListener("click", addProduct) : __defers["$.__views.__alloyId6!click!addProduct"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    var DB = Alloy.Globals.DB;
    __defers["$.__views.__alloyId5!click!closePage"] && $.__views.__alloyId5.addEventListener("click", closePage);
    __defers["$.__views.__alloyId6!click!addProduct"] && $.__views.__alloyId6.addEventListener("click", addProduct);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;