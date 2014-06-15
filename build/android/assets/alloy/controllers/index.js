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
        var rows = [];
        var c_cat = 0;
        var headerTitle;
        var tab_data = DB.select("charlotte", "SELECT * FROM jewelry ORDER by category");
        for (var i = 0; tab_data.length > i; i++) {
            if (last_category != tab_data[i].category) {
                c_cat = 1;
                last_category = tab_data[i].category;
                var headerView = Ti.UI.createView({
                    height: "30dp",
                    backgroundColor: "#FFF",
                    head: getCategory(tab_data[i].category)
                });
                headerTitle = Ti.UI.createLabel({
                    text: getCategory(tab_data[i].category),
                    classes: "voucher_row_header_title",
                    color: "#666666",
                    left: "20dp",
                    font: {
                        fontSize: 18,
                        fontFamily: "HelveticaNeue-Light"
                    },
                    touchEnabled: false
                });
                var separatorView = Ti.UI.createView({
                    backgroundColor: "transparent",
                    height: "1dp",
                    backgroundColor: "#DDD",
                    bottom: "0dp",
                    touchEnabled: false
                });
                headerView.add(headerTitle);
                headerView.add(separatorView);
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
        backgroundColor: "#FFF",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        navBarHidden: true,
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    $.__views.__alloyId27 = Ti.UI.createImageView({
        image: "logo.png",
        id: "__alloyId27"
    });
    $.__views.index.add($.__views.__alloyId27);
    $.__views.__alloyId28 = Ti.UI.createView({
        layout: "vertical",
        id: "__alloyId28"
    });
    $.__views.index.add($.__views.__alloyId28);
    $.__views.__alloyId29 = Ti.UI.createView({
        height: "40dp",
        top: "0dp",
        left: "0dp",
        right: "0dp",
        layout: "horizontal",
        backgroundColor: "#666666",
        id: "__alloyId29"
    });
    $.__views.__alloyId28.add($.__views.__alloyId29);
    $.__views.__alloyId30 = Ti.UI.createButton({
        backgroundColor: "transparent",
        font: {
            fontSize: 16
        },
        title: "+ Ajouter un produit",
        height: Ti.UI.SIZE,
        left: "5dp",
        top: "5dp",
        color: "#FFF",
        id: "__alloyId30"
    });
    $.__views.__alloyId29.add($.__views.__alloyId30);
    openAddProduct ? $.__views.__alloyId30.addEventListener("click", openAddProduct) : __defers["$.__views.__alloyId30!click!openAddProduct"] = true;
    $.__views.__alloyId31 = Ti.UI.createView({
        height: "40dp",
        top: "0dp",
        left: "0dp",
        right: "0dp",
        layout: "horizontal",
        backgroundColor: "#666666",
        id: "__alloyId31"
    });
    $.__views.__alloyId28.add($.__views.__alloyId31);
    $.__views.__alloyId32 = Ti.UI.createButton({
        backgroundColor: "transparent",
        font: {
            fontSize: 16
        },
        title: "+ Ajouter une catégorie",
        height: Ti.UI.SIZE,
        left: "5dp",
        top: "5dp",
        color: "#FFF",
        id: "__alloyId32"
    });
    $.__views.__alloyId31.add($.__views.__alloyId32);
    openAddCategory ? $.__views.__alloyId32.addEventListener("click", openAddCategory) : __defers["$.__views.__alloyId32!click!openAddCategory"] = true;
    $.__views.tableview = Ti.UI.createTableView({
        id: "tableview",
        top: "5dp",
        bottom: "0dp",
        left: "0dp",
        right: "0dp",
        backgroundColor: "transparent"
    });
    $.__views.__alloyId28.add($.__views.tableview);
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
    __defers["$.__views.__alloyId30!click!openAddProduct"] && $.__views.__alloyId30.addEventListener("click", openAddProduct);
    __defers["$.__views.__alloyId32!click!openAddCategory"] && $.__views.__alloyId32.addEventListener("click", openAddCategory);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;