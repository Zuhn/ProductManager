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
        backgroundImage: "bg1.jpg",
        backgroundColor: "#FFF",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        id: "win"
    });
    $.__views.win && $.addTopLevelView($.__views.win);
    $.__views.__alloyId11 = Ti.UI.createScrollView({
        backgroundImage: "bg1.jpg",
        backgroundColor: "#DDD",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        layout: "vertical",
        id: "__alloyId11"
    });
    $.__views.win.add($.__views.__alloyId11);
    $.__views.__alloyId12 = Ti.UI.createView({
        backgroundColor: "#000",
        height: "40dp",
        bottom: "30dp",
        id: "__alloyId12"
    });
    $.__views.__alloyId11.add($.__views.__alloyId12);
    $.__views.__alloyId13 = Ti.UI.createLabel({
        text: "Ajouter un produit",
        color: "#FFF",
        id: "__alloyId13"
    });
    $.__views.__alloyId12.add($.__views.__alloyId13);
    $.__views.__alloyId14 = Ti.UI.createButton({
        image: "bt_close.png",
        width: "20dp",
        height: "20dp",
        right: "5dp",
        color: "#FFF",
        tintColor: "#FFF",
        id: "__alloyId14"
    });
    $.__views.__alloyId12.add($.__views.__alloyId14);
    closePage ? $.__views.__alloyId14.addEventListener("click", closePage) : __defers["$.__views.__alloyId14!click!closePage"] = true;
    $.__views.__alloyId15 = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: "100dp",
        left: "20dp",
        id: "__alloyId15"
    });
    $.__views.__alloyId11.add($.__views.__alloyId15);
    $.__views.thumb = Ti.UI.createImageView({
        id: "thumb",
        left: "0dp",
        width: "100dp",
        height: "100dp",
        backgroundColor: "#FFF",
        borderRadius: "4"
    });
    $.__views.__alloyId15.add($.__views.thumb);
    openGallery ? $.__views.thumb.addEventListener("click", openGallery) : __defers["$.__views.thumb!click!openGallery"] = true;
    $.__views.ind = Ti.UI.createActivityIndicator({
        id: "ind",
        left: "0dp",
        width: "100dp",
        height: "100dp",
        style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
        backgroundColor: "transparent"
    });
    $.__views.__alloyId15.add($.__views.ind);
    $.__views.__alloyId16 = Ti.UI.createView({
        layout: "vertical",
        left: "100dp",
        right: "0dp",
        id: "__alloyId16"
    });
    $.__views.__alloyId15.add($.__views.__alloyId16);
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
            fontSize: 12,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        id: "ref",
        hintText: "Entrer la référence"
    });
    $.__views.__alloyId16.add($.__views.ref);
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
    $.__views.__alloyId16.add($.__views.nom);
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
            fontSize: 12,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        id: "prix",
        hintText: "Entrer le prix"
    });
    $.__views.__alloyId16.add($.__views.prix);
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
            fontSize: 12,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        id: "description",
        suppressReturn: "false"
    });
    $.__views.__alloyId11.add($.__views.description);
    $.__views.bt_cat = Ti.UI.createButton({
        color: "#FFF",
        left: "20dp",
        right: "20dp",
        borderRadius: 4,
        height: "40dp",
        backgroundColor: "#222",
        top: "10dp",
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        paddingLeft: "10dp",
        paddingRight: "10dp",
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa"
        },
        id: "bt_cat",
        title: "Choisir la catégorie"
    });
    $.__views.__alloyId11.add($.__views.bt_cat);
    openCategory ? $.__views.bt_cat.addEventListener("click", openCategory) : __defers["$.__views.bt_cat!click!openCategory"] = true;
    $.__views.__alloyId17 = Ti.UI.createButton({
        color: "#FFF",
        left: "20dp",
        right: "20dp",
        borderRadius: 4,
        height: "40dp",
        backgroundColor: "#222",
        top: "10dp",
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        paddingLeft: "10dp",
        paddingRight: "10dp",
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa"
        },
        title: "Ajouter",
        bottom: "30dp",
        id: "__alloyId17"
    });
    $.__views.__alloyId11.add($.__views.__alloyId17);
    addProduct ? $.__views.__alloyId17.addEventListener("click", addProduct) : __defers["$.__views.__alloyId17!click!addProduct"] = true;
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
    $.win.addEventListener("click", function() {
        $.ref.blur();
        $.nom.blur();
        $.prix.blur();
        $.description.blur();
        $.ref.value = "";
    });
    __defers["$.__views.__alloyId14!click!closePage"] && $.__views.__alloyId14.addEventListener("click", closePage);
    __defers["$.__views.thumb!click!openGallery"] && $.__views.thumb.addEventListener("click", openGallery);
    __defers["$.__views.bt_cat!click!openCategory"] && $.__views.bt_cat.addEventListener("click", openCategory);
    __defers["$.__views.__alloyId17!click!addProduct"] && $.__views.__alloyId17.addEventListener("click", addProduct);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;