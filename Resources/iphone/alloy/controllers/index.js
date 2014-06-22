function Controller() {
    function openDetails(e) {
        current_page = Alloy.createController("detailsProduct", {
            datas: e
        });
        current_page_view = current_page.getView();
        current_page_view.open({
            modal: true
        });
    }
    function openAddProduct() {
        current_page = Alloy.createController("addProduct");
        current_page_view = current_page.getView();
        current_page_view.open({
            modal: true
        });
    }
    function openAddCategory() {
        current_page = Alloy.createController("addCategory");
        current_page_view = current_page.getView();
        current_page_view.open({
            modal: true
        });
    }
    function setCategory() {
        Alloy.Globals.cats = DB.select("charlotte", "SELECT * FROM jewelry_cat");
        var tab = Alloy.Globals.cats;
        var t = "";
        for (var i = 0; tab.length > i; i++) t += "\n" + tab[i].title;
    }
    function getCategory(_id) {
        var tab_data = Alloy.Globals.cats;
        for (var i = 0; tab_data.length > i; i++) {
            console.log("comparaison tab " + tab_data[i].id + "  " + _id);
            if (tab_data[i].id == _id) return tab_data[i].title;
        }
    }
    function displayProduct() {
        $.tableview.scrollToTop(0);
        last_category = "hrtzph4324FFDStrte777";
        Alloy.createController("PMXLoader").getView().open();
        var rows = [];
        var c_cat = 0;
        var headerTitle;
        var tab_data = DB.select("charlotte", "SELECT * FROM jewelry ORDER by category");
        for (var i = 0; tab_data.length > i; i++) {
            if (last_category != tab_data[i].category) {
                c_cat = 1;
                last_category = tab_data[i].category;
                var headerView = Ti.UI.createView({
                    height: "50dp",
                    backgroundColor: "#000",
                    head: getCategory(tab_data[i].category)
                });
                var header_icon = Ti.UI.createImageView({
                    top: "1dp",
                    left: "10dp",
                    image: "icons/down.png",
                    height: "25dp"
                });
                headerTitle = Ti.UI.createLabel({
                    text: getCategory(tab_data[i].category),
                    classes: "voucher_row_header_title",
                    color: "#EEEEEE",
                    left: "15dp",
                    font: {
                        fontSize: 12,
                        fontFamily: "Comfortaa-Bold"
                    },
                    touchEnabled: false,
                    bottom: "8dp"
                });
                Ti.UI.createView({
                    backgroundColor: "transparent",
                    height: "1dp",
                    backgroundColor: "#DDD",
                    bottom: "0dp",
                    touchEnabled: false
                });
                headerView.add(header_icon);
                headerView.add(headerTitle);
                sectionVeg = Ti.UI.createTableViewSection({
                    headerView: headerView
                });
                rows.push(sectionVeg);
            } else c_cat++;
            headerTitle.text = c_cat > 1 ? getCategory(tab_data[i].category) + ". " + c_cat + " objets." : getCategory(tab_data[i].category) + ". " + c_cat + " objet.";
            var row_c = Alloy.createController("RowProduct");
            row_c.ini(tab_data[i]);
            row = row_c.getView();
            row.datas = tab_data[i];
            row.header = getCategory(tab_data[i].category);
            sectionVeg.add(row);
        }
        $.tableview.data = rows;
        $.tableview.footerView = Ti.UI.createView({
            height: 1,
            backgroundColor: "transparent"
        });
        Ti.App.fireEvent("PMXLoaderClose");
        var animation = Titanium.UI.createAnimation();
        animation.opacity = 0;
        animation.duration = 1e3;
        animation.delay = 1e3;
        var animationHandler = function() {
            animation.removeEventListener("complete", animationHandler);
            $.v_loader.visible = false;
        };
        animation.addEventListener("complete", animationHandler);
        $.v_loader.animate(animation);
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.index = Ti.UI.createWindow({
        backgroundImage: "bg1.jpg",
        backgroundColor: "#FFF",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    $.__views.__alloyId37 = Ti.UI.createView({
        layout: "vertical",
        id: "__alloyId37"
    });
    $.__views.index.add($.__views.__alloyId37);
    $.__views.__alloyId38 = Ti.UI.createView({
        height: "40dp",
        backgroundColor: "#222",
        top: "0dp",
        left: "0dp",
        right: "0dp",
        id: "__alloyId38"
    });
    $.__views.__alloyId37.add($.__views.__alloyId38);
    $.__views.__alloyId39 = Ti.UI.createLabel({
        font: {
            fontSize: 12,
            fontFamily: "Comfortaa",
            fontWeight: "Bold"
        },
        text: "PMX Product Manager v1.0",
        height: Ti.UI.SIZE,
        color: "#FFF",
        id: "__alloyId39"
    });
    $.__views.__alloyId38.add($.__views.__alloyId39);
    $.__views.__alloyId40 = Ti.UI.createView({
        height: "40dp",
        top: "0dp",
        left: "0dp",
        right: "0dp",
        layout: "horizontal",
        backgroundColor: "#30666666",
        id: "__alloyId40"
    });
    $.__views.__alloyId37.add($.__views.__alloyId40);
    $.__views.__alloyId41 = Ti.UI.createImageView({
        left: "10dp",
        top: "8dp",
        width: "25dp",
        height: "25dp",
        image: "icons/add_file.png",
        id: "__alloyId41"
    });
    $.__views.__alloyId40.add($.__views.__alloyId41);
    $.__views.__alloyId42 = Ti.UI.createButton({
        font: {
            fontFamily: "Comfortaa"
        },
        title: "Ajouter un produit",
        height: Ti.UI.SIZE,
        left: "5dp",
        top: "9dp",
        color: "#FFF",
        id: "__alloyId42"
    });
    $.__views.__alloyId40.add($.__views.__alloyId42);
    openAddProduct ? $.__views.__alloyId42.addEventListener("click", openAddProduct) : __defers["$.__views.__alloyId42!click!openAddProduct"] = true;
    $.__views.__alloyId43 = Ti.UI.createView({
        height: "40dp",
        top: "0dp",
        left: "0dp",
        right: "0dp",
        layout: "horizontal",
        backgroundColor: "#30666666",
        id: "__alloyId43"
    });
    $.__views.__alloyId37.add($.__views.__alloyId43);
    $.__views.__alloyId44 = Ti.UI.createImageView({
        left: "10dp",
        top: "8dp",
        width: "25dp",
        height: "25dp",
        image: "icons/add_folder.png",
        id: "__alloyId44"
    });
    $.__views.__alloyId43.add($.__views.__alloyId44);
    $.__views.__alloyId45 = Ti.UI.createButton({
        font: {
            fontFamily: "Comfortaa"
        },
        title: "Ajouter une catégorie",
        height: Ti.UI.SIZE,
        left: "5dp",
        top: "8dp",
        color: "#FFF",
        id: "__alloyId45"
    });
    $.__views.__alloyId43.add($.__views.__alloyId45);
    openAddCategory ? $.__views.__alloyId45.addEventListener("click", openAddCategory) : __defers["$.__views.__alloyId45!click!openAddCategory"] = true;
    $.__views.tableview = Ti.UI.createTableView({
        separatorColor: "transparent",
        borderColor: "transparent",
        id: "tableview",
        top: "0dp",
        bottom: "0dp",
        left: "0dp",
        right: "0dp",
        backgroundColor: "#222"
    });
    $.__views.__alloyId37.add($.__views.tableview);
    $.__views.v_loader = Ti.UI.createImageView({
        id: "v_loader",
        left: "0dp",
        top: "0dp",
        image: "Default.png"
    });
    $.__views.index.add($.__views.v_loader);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var current_page;
    var last_category;
    var sectionVeg;
    var IMGG = require("PMXImageGallery");
    Alloy.Globals.IMGG = IMGG;
    var DB = require("PMXDatabase");
    Alloy.Globals.DB = DB;
    $.index.addEventListener("open", function() {
        DB.dbExists("charlotte") || DB.install("charlotte.sql", "charlotte");
        require("PMXRevision");
        setCategory();
        displayProduct();
    });
    $.tableview.addEventListener("click", function(e) {
        openDetails(e.row.datas);
    });
    Ti.App.addEventListener("reloadList", displayProduct);
    Ti.App.addEventListener("reloadCategory", setCategory);
    $.index.open();
    __defers["$.__views.__alloyId42!click!openAddProduct"] && $.__views.__alloyId42.addEventListener("click", openAddProduct);
    __defers["$.__views.__alloyId45!click!openAddCategory"] && $.__views.__alloyId45.addEventListener("click", openAddCategory);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;