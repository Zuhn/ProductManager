function Controller() {
    function addProduct() {
        DB.insert("charlotte", 'INSERT INTO jewelry (ref,nom,description,photo,price,category) VALUES ("' + $.ref.value + '","' + $.nom.value + '","' + $.description.value + '","' + img + '","' + $.prix.value + '","' + cat + '")');
        Ti.App.fireEvent("reloadList");
        $.win.close({
            modal: true
        });
    }
    function openGallery() {
        $.ind.show();
        timeStamp = new Date().getTime();
        $.thumb.image = Alloy.Globals.IMGG.openAndSave(timeStamp, displayImage);
    }
    function displayImage(_img) {
        $.ind.hide();
        if (null != _img) {
            img = timeStamp;
            $.thumb.image = _img;
        }
    }
    function closePage() {
        $.win.close({
            modal: true
        });
    }
    function openCategory() {
        var option = Alloy.createController("PMXOptionList", {
            data: Alloy.Globals.cats,
            ini_value: null,
            title: "Sélection de la catégorie",
            has_row_all: false,
            short_answer: false,
            cb: changeCategory
        });
        option.getView().open({
            modal: true
        });
    }
    function changeCategory(_cat, _id) {
        $.bt_cat.title = "Catégorie :" + _cat;
        cat = _id;
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "addProduct";
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
    $.__views.__alloyId7 = Ti.UI.createScrollView({
        backgroundColor: "#DDD",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        navBarHidden: true,
        layout: "vertical",
        id: "__alloyId7"
    });
    $.__views.win.add($.__views.__alloyId7);
    $.__views.__alloyId8 = Ti.UI.createView({
        backgroundColor: "#000",
        height: "40dp",
        bottom: "30dp",
        id: "__alloyId8"
    });
    $.__views.__alloyId7.add($.__views.__alloyId8);
    $.__views.__alloyId9 = Ti.UI.createLabel({
        text: "Ajouter un produit",
        color: "#FFF",
        id: "__alloyId9"
    });
    $.__views.__alloyId8.add($.__views.__alloyId9);
    $.__views.__alloyId10 = Ti.UI.createButton({
        image: "bt_close.png",
        width: "20dp",
        height: "20dp",
        right: "5dp",
        color: "#FFF",
        tintColor: "#FFF",
        id: "__alloyId10"
    });
    $.__views.__alloyId8.add($.__views.__alloyId10);
    closePage ? $.__views.__alloyId10.addEventListener("click", closePage) : __defers["$.__views.__alloyId10!click!closePage"] = true;
    $.__views.__alloyId11 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: "100dp",
        left: "20dp",
        id: "__alloyId11"
    });
    $.__views.__alloyId7.add($.__views.__alloyId11);
    $.__views.thumb = Ti.UI.createImageView({
        id: "thumb",
        left: "0dp",
        width: "100dp",
        height: "100dp",
        backgroundColor: "#FFF",
        borderRadius: "4"
    });
    $.__views.__alloyId11.add($.__views.thumb);
    openGallery ? $.__views.thumb.addEventListener("click", openGallery) : __defers["$.__views.thumb!click!openGallery"] = true;
    $.__views.ind = Ti.UI.createActivityIndicator({
        id: "ind",
        left: "0dp",
        width: "100dp",
        height: "100dp",
        style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
        backgroundColor: "transparent"
    });
    $.__views.__alloyId11.add($.__views.ind);
    $.__views.__alloyId12 = Ti.UI.createView({
        layout: "vertical",
        left: "100dp",
        right: "0dp",
        id: "__alloyId12"
    });
    $.__views.__alloyId11.add($.__views.__alloyId12);
    $.__views.ref = Ti.UI.createTextField({
        left: "20dp",
        right: "20dp",
        borderRadius: 4,
        height: "30dp",
        backgroundColor: "#EEE",
        top: "0dp",
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        paddingLeft: "10dp",
        paddingRight: "10dp",
        font: {
            fontSize: 12
        },
        id: "ref",
        hintText: "Entrer la référence"
    });
    $.__views.__alloyId12.add($.__views.ref);
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
    $.__views.__alloyId12.add($.__views.nom);
    $.__views.prix = Ti.UI.createTextField({
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
        id: "prix",
        hintText: "Entrer le prix"
    });
    $.__views.__alloyId12.add($.__views.prix);
    $.__views.description = Ti.UI.createTextArea({
        left: "20dp",
        right: "20dp",
        borderRadius: 4,
        height: "200dp",
        backgroundColor: "#EEE",
        top: "20dp",
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        paddingLeft: "10dp",
        paddingRight: "10dp",
        font: {
            fontSize: 12
        },
        id: "description",
        suppressReturn: "false"
    });
    $.__views.__alloyId7.add($.__views.description);
    $.__views.bt_cat = Ti.UI.createButton({
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
        id: "bt_cat",
        title: "Choisir la catégorie",
        color: "#000",
        bottom: "20dp"
    });
    $.__views.__alloyId7.add($.__views.bt_cat);
    openCategory ? $.__views.bt_cat.addEventListener("click", openCategory) : __defers["$.__views.bt_cat!click!openCategory"] = true;
    $.__views.__alloyId13 = Ti.UI.createButton({
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
        id: "__alloyId13"
    });
    $.__views.__alloyId7.add($.__views.__alloyId13);
    addProduct ? $.__views.__alloyId13.addEventListener("click", addProduct) : __defers["$.__views.__alloyId13!click!addProduct"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    var DB = Alloy.Globals.DB;
    var img;
    var cat = "0";
    var timeStamp;
    $.ref.addEventListener("focus", function f() {
        $.ref.blur();
        $.ref.removeEventListener("focus", f);
    });
    __defers["$.__views.__alloyId10!click!closePage"] && $.__views.__alloyId10.addEventListener("click", closePage);
    __defers["$.__views.thumb!click!openGallery"] && $.__views.thumb.addEventListener("click", openGallery);
    __defers["$.__views.bt_cat!click!openCategory"] && $.__views.bt_cat.addEventListener("click", openCategory);
    __defers["$.__views.__alloyId13!click!addProduct"] && $.__views.__alloyId13.addEventListener("click", addProduct);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;