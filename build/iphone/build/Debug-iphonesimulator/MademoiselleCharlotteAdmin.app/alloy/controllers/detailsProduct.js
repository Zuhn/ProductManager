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
        $.thumb.addEventListener("load", displayContent);
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
    function displayContent() {
        if (false == ini_record) {
            ini_record = true;
            $.thumb.removeEventListener("load", displayContent);
            $.v_nom.top = $.thumb.toImage().height;
            var v1 = $.thumb.toImage().height + $.v_nom.toImage().height;
            var v1h = $.v_info.toImage().height;
            var v2h = $.v_stock.toImage().height;
            $.v_info.top = v1;
            $.v_info.height = "40dp";
            var v2 = $.thumb.toImage().height + $.v_nom.toImage().height + $.v_info.toImage().height;
            $.v_stock.top = v2;
            $.v_stock.height = "40dp";
            recordMenu($.v_info, v1h, $.thumb.toImage().height, v1);
            recordMenu($.v_stock, v2h, $.thumb.toImage().height, v2);
        }
    }
    function recordMenu(_v, _height, _close_height, _ini_top) {
        _v.addEventListener("click", openOnglet);
        var h = _height;
        tab_onglet.push(_v);
        tab_ini_top.push(_ini_top);
        tab_v_height.push(h);
        tab_close_height = _close_height;
    }
    function openOnglet(e) {
        var _id = e.source.myid;
        for (var i = 0; tab_onglet.length > i; i++) {
            var view_action = tab_onglet[i];
            if (c_menu == _id) if (_id == i) {
                var h = "40dp";
                var animation1 = Titanium.UI.createAnimation();
                animation1.height = h;
                animation1.duration = menu_speed;
                animation1.delay = 20;
                view_action.animate(animation1);
            } else {
                var h = tab_ini_top[i];
                var animation = Titanium.UI.createAnimation();
                animation.top = h;
                animation.duration = menu_speed;
                animation.delay = 0;
                view_action.animate(animation);
            } else {
                if (_id >= i) {
                    var h = tab_ini_top[i];
                    var animation = Titanium.UI.createAnimation();
                    animation.top = h;
                    animation.duration = menu_speed;
                    animation.delay = 0;
                    view_action.animate(animation);
                }
                if (i > _id) {
                    var h = tab_ini_top[i] + tab_v_height[_id];
                    var animation = Titanium.UI.createAnimation();
                    animation.top = h;
                    animation.duration = menu_speed;
                    animation.delay = 10;
                    view_action.animate(animation);
                }
                if (_id == i) {
                    var h = tab_v_height[i];
                    var animation = Titanium.UI.createAnimation();
                    animation.height = h;
                    animation.duration = menu_speed;
                    animation.delay = 0;
                    view_action.animate(animation);
                } else {
                    var h = "40dp";
                    var animation = Titanium.UI.createAnimation();
                    animation.height = h;
                    animation.duration = menu_speed;
                    animation.delay = 0;
                    view_action.animate(animation);
                }
            }
        }
        c_menu = c_menu == _id ? null : _id;
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
        backgroundImage: "bg1.jpg",
        backgroundColor: "#FFF",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        id: "win"
    });
    $.__views.win && $.addTopLevelView($.__views.win);
    $.__views.scroll = Ti.UI.createScrollView({
        backgroundImage: "bg1.jpg",
        backgroundColor: "transparent",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        id: "scroll"
    });
    $.__views.win.add($.__views.scroll);
    $.__views.__alloyId15 = Ti.UI.createView({
        backgroundColor: "#222",
        height: "40dp",
        top: "0dp",
        id: "__alloyId15"
    });
    $.__views.scroll.add($.__views.__alloyId15);
    $.__views.__alloyId16 = Ti.UI.createLabel({
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        text: "Modifier un produit",
        height: Ti.UI.SIZE,
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
        top: "40dp",
        id: "__alloyId18"
    });
    $.__views.scroll.add($.__views.__alloyId18);
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
    $.__views.v_nom = Ti.UI.createView({
        height: "30dp",
        left: "0dp",
        right: "0dp",
        layout: "horizontal",
        id: "v_nom",
        borderRadius: "0",
        backgroundColor: "#222222",
        top: "0dp"
    });
    $.__views.scroll.add($.__views.v_nom);
    $.__views.__alloyId19 = Ti.UI.createLabel({
        font: {
            fontSize: 13,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        width: "75dp",
        left: "10dp",
        color: "#FFF",
        paddingLeft: "20dp",
        text: "Nom: ",
        id: "__alloyId19"
    });
    $.__views.v_nom.add($.__views.__alloyId19);
    $.__views.nom = Ti.UI.createTextField({
        top: "2dp",
        left: "20dp",
        right: "0dp",
        height: "30dp",
        backgroundColor: "transparent",
        paddingLeft: "0dp",
        paddingRight: "0dp",
        font: {
            fontSize: 13,
            fontFamily: "Comfortaa"
        },
        color: "#FFF",
        id: "nom",
        hintText: "Entrer le nom"
    });
    $.__views.v_nom.add($.__views.nom);
    $.__views.v_info = Ti.UI.createView({
        id: "v_info",
        height: Ti.UI.SIZE,
        layout: "vertical",
        top: "0dp"
    });
    $.__views.scroll.add($.__views.v_info);
    $.__views.__alloyId20 = Ti.UI.createView({
        backgroundColor: "#222",
        height: "40dp",
        top: "0dp",
        myid: "0",
        id: "__alloyId20"
    });
    $.__views.v_info.add($.__views.__alloyId20);
    $.__views.__alloyId21 = Ti.UI.createLabel({
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        text: "Infos",
        height: Ti.UI.SIZE,
        color: "#FFF",
        touchEnabled: "false",
        id: "__alloyId21"
    });
    $.__views.__alloyId20.add($.__views.__alloyId21);
    $.__views.__alloyId22 = Ti.UI.createView({
        height: "30dp",
        left: "0dp",
        right: "0dp",
        layout: "horizontal",
        borderRadius: "0",
        backgroundColor: "#222222",
        top: "0dp",
        id: "__alloyId22"
    });
    $.__views.v_info.add($.__views.__alloyId22);
    $.__views.__alloyId23 = Ti.UI.createLabel({
        font: {
            fontSize: 13,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        width: "75dp",
        left: "10dp",
        color: "#FFF",
        paddingLeft: "20dp",
        text: "Référence: ",
        id: "__alloyId23"
    });
    $.__views.__alloyId22.add($.__views.__alloyId23);
    $.__views.ref = Ti.UI.createTextField({
        top: "2dp",
        left: "20dp",
        right: "0dp",
        height: "30dp",
        backgroundColor: "transparent",
        paddingLeft: "0dp",
        paddingRight: "0dp",
        font: {
            fontSize: 13,
            fontFamily: "Comfortaa"
        },
        color: "#FFF",
        id: "ref",
        hintText: "Entrer la référence"
    });
    $.__views.__alloyId22.add($.__views.ref);
    $.__views.__alloyId24 = Ti.UI.createView({
        height: "30dp",
        left: "0dp",
        right: "0dp",
        layout: "horizontal",
        borderRadius: "0",
        backgroundColor: "#222222",
        top: "0dp",
        id: "__alloyId24"
    });
    $.__views.v_info.add($.__views.__alloyId24);
    $.__views.__alloyId25 = Ti.UI.createLabel({
        font: {
            fontSize: 13,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        width: "75dp",
        left: "10dp",
        color: "#FFF",
        paddingLeft: "20dp",
        text: "Prix: ",
        id: "__alloyId25"
    });
    $.__views.__alloyId24.add($.__views.__alloyId25);
    $.__views.prix = Ti.UI.createTextField({
        top: "2dp",
        left: "20dp",
        right: "0dp",
        height: "30dp",
        backgroundColor: "transparent",
        paddingLeft: "0dp",
        paddingRight: "0dp",
        font: {
            fontSize: 13,
            fontFamily: "Comfortaa"
        },
        color: "#FFF",
        id: "prix",
        hintText: "Entrer le prix"
    });
    $.__views.__alloyId24.add($.__views.prix);
    $.__views.__alloyId26 = Ti.UI.createView({
        height: Ti.UI.SIZE,
        left: "0dp",
        right: "0dp",
        layout: "horizontal",
        borderRadius: "0",
        backgroundColor: "#222222",
        top: "0dp",
        id: "__alloyId26"
    });
    $.__views.v_info.add($.__views.__alloyId26);
    $.__views.description = Ti.UI.createTextArea({
        top: "0dp",
        left: "4dp",
        right: "0dp",
        height: Ti.UI.SIZE,
        backgroundColor: "transparent",
        paddingLeft: "0dp",
        paddingRight: "0dp",
        font: {
            fontSize: 13,
            fontFamily: "Comfortaa"
        },
        color: "#FFF",
        id: "description",
        suppressReturn: "false"
    });
    $.__views.__alloyId26.add($.__views.description);
    $.__views.bt_cat = Ti.UI.createButton({
        color: "#FFF",
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
        id: "bt_cat",
        title: "Choisir la catégorie"
    });
    $.__views.v_info.add($.__views.bt_cat);
    openCategory ? $.__views.bt_cat.addEventListener("click", openCategory) : __defers["$.__views.bt_cat!click!openCategory"] = true;
    $.__views.__alloyId27 = Ti.UI.createButton({
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
        title: "Modifier",
        id: "__alloyId27"
    });
    $.__views.v_info.add($.__views.__alloyId27);
    addProduct ? $.__views.__alloyId27.addEventListener("click", addProduct) : __defers["$.__views.__alloyId27!click!addProduct"] = true;
    $.__views.__alloyId28 = Ti.UI.createButton({
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
        title: "Supprimer",
        bottom: "30dp",
        id: "__alloyId28"
    });
    $.__views.v_info.add($.__views.__alloyId28);
    deleteProduct ? $.__views.__alloyId28.addEventListener("click", deleteProduct) : __defers["$.__views.__alloyId28!click!deleteProduct"] = true;
    $.__views.v_stock = Ti.UI.createView({
        id: "v_stock",
        height: Ti.UI.SIZE,
        layout: "vertical",
        top: "0dp"
    });
    $.__views.scroll.add($.__views.v_stock);
    $.__views.__alloyId29 = Ti.UI.createView({
        backgroundColor: "#222",
        height: "40dp",
        top: "0dp",
        myid: "1",
        id: "__alloyId29"
    });
    $.__views.v_stock.add($.__views.__alloyId29);
    $.__views.__alloyId30 = Ti.UI.createLabel({
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        text: "Stock",
        height: Ti.UI.SIZE,
        color: "#FFF",
        touchEnabled: "false",
        id: "__alloyId30"
    });
    $.__views.__alloyId29.add($.__views.__alloyId30);
    $.__views.__alloyId31 = Ti.UI.createView({
        backgroundColor: "#F0f",
        height: "300dp",
        top: "0",
        id: "__alloyId31"
    });
    $.__views.v_stock.add($.__views.__alloyId31);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    var DB = Alloy.Globals.DB;
    var datas = args.datas;
    var img = datas.photo;
    var cat = datas.category;
    var timeStamp;
    $.win.addEventListener("click", function() {
        $.ref.blur();
        $.nom.blur();
        $.prix.blur();
        $.description.blur();
    });
    if (void 0 != img && "undefined" != img) $.thumb.image = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, datas.photo + ".jpeg"); else {
        img = "logo.png";
        $.thumb.image = "logo.png";
    }
    $.nom.value = datas.nom;
    $.prix.value = datas.price;
    $.description.value = datas.description;
    $.ref.addEventListener("focus", function f() {
        $.ref.blur();
        $.ref.removeEventListener("focus", f);
    });
    $.thumb.addEventListener("load", displayContent);
    var ini_record = false;
    var tab_ini_top = [];
    var tab_onglet = [];
    var tab_v_height = [];
    var tab_close_height = [];
    var menu_speed = 500;
    var c_menu = null;
    __defers["$.__views.__alloyId17!click!closePage"] && $.__views.__alloyId17.addEventListener("click", closePage);
    __defers["$.__views.thumb!click!openGallery"] && $.__views.thumb.addEventListener("click", openGallery);
    __defers["$.__views.bt_cat!click!openCategory"] && $.__views.bt_cat.addEventListener("click", openCategory);
    __defers["$.__views.__alloyId27!click!addProduct"] && $.__views.__alloyId27.addEventListener("click", addProduct);
    __defers["$.__views.__alloyId28!click!deleteProduct"] && $.__views.__alloyId28.addEventListener("click", deleteProduct);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;