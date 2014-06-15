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
        backgroundImage: "bg1.jpg",
        backgroundColor: "#FFF",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        id: "win"
    });
    $.__views.win && $.addTopLevelView($.__views.win);
    $.__views.__alloyId3 = Ti.UI.createScrollView({
        backgroundImage: "bg1.jpg",
        backgroundColor: "#DDD",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        layout: "vertical",
        id: "__alloyId3"
    });
    $.__views.win.add($.__views.__alloyId3);
    $.__views.__alloyId4 = Ti.UI.createView({
        backgroundColor: "#000",
        height: "40dp",
        bottom: "30dp",
        id: "__alloyId4"
    });
    $.__views.__alloyId3.add($.__views.__alloyId4);
    $.__views.__alloyId5 = Ti.UI.createLabel({
        text: "Ajouter un produit",
        color: "#FFF",
        id: "__alloyId5"
    });
    $.__views.__alloyId4.add($.__views.__alloyId5);
    $.__views.__alloyId6 = Ti.UI.createButton({
        image: "bt_close.png",
        width: "20dp",
        height: "20dp",
        right: "5dp",
        color: "#FFF",
        tintColor: "#FFF",
        id: "__alloyId6"
    });
    $.__views.__alloyId4.add($.__views.__alloyId6);
    closePage ? $.__views.__alloyId6.addEventListener("click", closePage) : __defers["$.__views.__alloyId6!click!closePage"] = true;
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
            fontSize: 12,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        id: "nom",
        hintText: "Entrer le nom"
    });
    $.__views.__alloyId3.add($.__views.nom);
    $.__views.__alloyId7 = Ti.UI.createButton({
        color: "#000",
        left: "20dp",
        right: "20dp",
        borderRadius: 4,
        height: "40dp",
        backgroundColor: "#222",
        top: "20dp",
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        paddingLeft: "10dp",
        paddingRight: "10dp",
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa"
        },
        title: "Ajouter",
        bottom: "20dp",
        id: "__alloyId7"
    });
    $.__views.__alloyId3.add($.__views.__alloyId7);
    addProduct ? $.__views.__alloyId7.addEventListener("click", addProduct) : __defers["$.__views.__alloyId7!click!addProduct"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    var DB = Alloy.Globals.DB;
    __defers["$.__views.__alloyId6!click!closePage"] && $.__views.__alloyId6.addEventListener("click", closePage);
    __defers["$.__views.__alloyId7!click!addProduct"] && $.__views.__alloyId7.addEventListener("click", addProduct);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;