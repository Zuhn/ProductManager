function Controller() {
    function deleteProduct() {
        Alloy.Globals.DB.delete("charlotte", "DELETE FROM jewelry WHERE id=" + datas.id);
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
    function displayImage(_img, _big) {
        $.ind.hide();
        if (null != _big) {
            $.thumb.image = _big;
            img = timeStamp;
        } else $.thumb.image = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, img + ".jpeg");
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
    function addProduct() {
        console.log('UPDATE jewelry SET ref="' + $.ref.value + '", nom="' + $.nom.value + '", description"' + $.description.value + '", photo="' + img + '", price="' + $.prix.value + '", category="' + cat + '" WHERE id=' + datas.id);
        DB.insert("charlotte", 'UPDATE jewelry SET ref="' + $.ref.value + '", nom="' + $.nom.value + '", description="' + $.description.value + '", photo="' + img + '", price="' + $.prix.value + '", category="' + cat + '" WHERE id=' + datas.id);
        Ti.App.fireEvent("reloadList");
        $.win.close({
            modal: true
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "detailsProduct";
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
    $.__views.__alloyId14 = Ti.UI.createScrollView({
        backgroundColor: "transparent",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        navBarHidden: true,
        layout: "vertical",
        id: "__alloyId14"
    });
    $.__views.win.add($.__views.__alloyId14);
    $.__views.__alloyId15 = Ti.UI.createView({
        backgroundColor: "#000",
        height: "40dp",
        bottom: "0dp",
        id: "__alloyId15"
    });
    $.__views.__alloyId14.add($.__views.__alloyId15);
    $.__views.__alloyId16 = Ti.UI.createLabel({
        text: "Modifier un produit",
        color: "#FFF",
        id: "__alloyId16"
    });
    $.__views.__alloyId15.add($.__views.__alloyId16);
    $.__views.__alloyId17 = Ti.UI.createButton({
        image: "bt_close.png",
        width: "20dp",
        height: "20dp",
        right: "5dp",
        color: "#FFF",
        tintColor: "#FFF",
        id: "__alloyId17"
    });
    $.__views.__alloyId15.add($.__views.__alloyId17);
    closePage ? $.__views.__alloyId17.addEventListener("click", closePage) : __defers["$.__views.__alloyId17!click!closePage"] = true;
    $.__views.__alloyId18 = Ti.UI.createView({
        height: Ti.UI.SIZE,
        top: "0dp",
        id: "__alloyId18"
    });
    $.__views.__alloyId14.add($.__views.__alloyId18);
    $.__views.thumb = Ti.UI.createImageView({
        id: "thumb",
        left: "0dp",
        right: "0dp",
        top: "0dp",
        backgroundColor: "#FFF",
        defaultImage: "logo.png"
    });
    $.__views.__alloyId18.add($.__views.thumb);
    openGallery ? $.__views.thumb.addEventListener("click", openGallery) : __defers["$.__views.thumb!click!openGallery"] = true;
    $.__views.ind = Ti.UI.createActivityIndicator({
        id: "ind",
        top: "0dp",
        left: "0dp",
        right: "0dp",
        height: "100",
        style: Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
        backgroundColor: "transparent"
    });
    $.__views.__alloyId18.add($.__views.ind);
    $.__views.__alloyId19 = Ti.UI.createView({
        height: "30dp",
        left: "20dp",
        right: "20dp",
        layout: "horizontal",
        id: "__alloyId19"
    });
    $.__views.__alloyId14.add($.__views.__alloyId19);
    $.__views.__alloyId20 = Ti.UI.createLabel({
        text: "Référence : ",
        id: "__alloyId20"
    });
    $.__views.__alloyId19.add($.__views.__alloyId20);
    $.__views.ref = Ti.UI.createTextField({
        left: "10dp",
        right: "20dp",
        height: "40dp",
        backgroundColor: "transparent",
        top: "0dp",
        paddingLeft: "0dp",
        paddingRight: "0dp",
        font: {
            fontSize: "16sp"
        },
        id: "ref",
        hintText: "Entrer la référence"
    });
    $.__views.__alloyId19.add($.__views.ref);
    $.__views.__alloyId21 = Ti.UI.createView({
        height: "30dp",
        left: "20dp",
        right: "20dp",
        layout: "horizontal",
        id: "__alloyId21"
    });
    $.__views.__alloyId14.add($.__views.__alloyId21);
    $.__views.__alloyId22 = Ti.UI.createLabel({
        text: "Nom : ",
        id: "__alloyId22"
    });
    $.__views.__alloyId21.add($.__views.__alloyId22);
    $.__views.nom = Ti.UI.createTextField({
        left: "10dp",
        right: "20dp",
        height: "40dp",
        backgroundColor: "transparent",
        top: "0dp",
        paddingLeft: "0dp",
        paddingRight: "0dp",
        font: {
            fontSize: "16sp"
        },
        id: "nom",
        hintText: "Entrer le nom"
    });
    $.__views.__alloyId21.add($.__views.nom);
    $.__views.__alloyId23 = Ti.UI.createView({
        height: "30dp",
        left: "20dp",
        right: "20dp",
        layout: "horizontal",
        id: "__alloyId23"
    });
    $.__views.__alloyId14.add($.__views.__alloyId23);
    $.__views.__alloyId24 = Ti.UI.createLabel({
        text: "Prix : ",
        id: "__alloyId24"
    });
    $.__views.__alloyId23.add($.__views.__alloyId24);
    $.__views.prix = Ti.UI.createTextField({
        left: "10dp",
        right: "20dp",
        height: "40dp",
        backgroundColor: "transparent",
        top: "0dp",
        paddingLeft: "0dp",
        paddingRight: "0dp",
        font: {
            fontSize: "16sp"
        },
        id: "prix",
        hintText: "Entrer le prix"
    });
    $.__views.__alloyId23.add($.__views.prix);
    $.__views.description = Ti.UI.createTextArea({
        left: "10dp",
        right: "20dp",
        height: Ti.UI.SIZE,
        backgroundColor: "transparent",
        top: "0dp",
        paddingLeft: "0dp",
        paddingRight: "0dp",
        font: {
            fontSize: "16sp"
        },
        id: "description",
        suppressReturn: "false"
    });
    $.__views.__alloyId14.add($.__views.description);
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
        bottom: "10dp"
    });
    $.__views.__alloyId14.add($.__views.bt_cat);
    openCategory ? $.__views.bt_cat.addEventListener("click", openCategory) : __defers["$.__views.bt_cat!click!openCategory"] = true;
    $.__views.__alloyId25 = Ti.UI.createButton({
        left: "20dp",
        right: "20dp",
        borderRadius: 4,
        height: "30dp",
        backgroundColor: "#BBB",
        top: "10dp",
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        paddingLeft: "10dp",
        paddingRight: "10dp",
        font: {
            fontSize: 16
        },
        title: "Modifier",
        color: "#000",
        bottom: "10dp",
        id: "__alloyId25"
    });
    $.__views.__alloyId14.add($.__views.__alloyId25);
    addProduct ? $.__views.__alloyId25.addEventListener("click", addProduct) : __defers["$.__views.__alloyId25!click!addProduct"] = true;
    $.__views.__alloyId26 = Ti.UI.createButton({
        left: "20dp",
        right: "20dp",
        borderRadius: 4,
        height: "30dp",
        backgroundColor: "#BBB",
        top: "10dp",
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
        paddingLeft: "10dp",
        paddingRight: "10dp",
        font: {
            fontSize: 16
        },
        title: "Supprimer",
        color: "#000",
        bottom: "10dp",
        id: "__alloyId26"
    });
    $.__views.__alloyId14.add($.__views.__alloyId26);
    deleteProduct ? $.__views.__alloyId26.addEventListener("click", deleteProduct) : __defers["$.__views.__alloyId26!click!deleteProduct"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var DB = Alloy.Globals.DB;
    var datas = args.datas;
    var img = datas.photo;
    var cat = datas.category;
    var timeStamp;
    $.win.addEventListener("open", function() {
        if (void 0 != img && "undefined" != img) $.thumb.image = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, datas.photo + ".jpeg"); else {
            img = "logo.png";
            $.thumb.image = "logo.png";
        }
        $.ref.value = datas.ref;
        $.nom.value = datas.nom;
        $.prix.value = datas.price;
        $.description.value = datas.description;
    });
    $.ref.addEventListener("focus", function f() {
        $.ref.blur();
        $.ref.removeEventListener("focus", f);
    });
    __defers["$.__views.__alloyId17!click!closePage"] && $.__views.__alloyId17.addEventListener("click", closePage);
    __defers["$.__views.thumb!click!openGallery"] && $.__views.thumb.addEventListener("click", openGallery);
    __defers["$.__views.bt_cat!click!openCategory"] && $.__views.bt_cat.addEventListener("click", openCategory);
    __defers["$.__views.__alloyId25!click!addProduct"] && $.__views.__alloyId25.addEventListener("click", addProduct);
    __defers["$.__views.__alloyId26!click!deleteProduct"] && $.__views.__alloyId26.addEventListener("click", deleteProduct);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;