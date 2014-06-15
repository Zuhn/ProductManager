function Controller() {
    function closeMe() {
        var animation = Titanium.UI.createAnimation();
        animation.opacity = 0;
        animation.duration = 500;
        var animationHandler = function() {
            animation.removeEventListener("complete", animationHandler);
            $.window.close();
        };
        animation.addEventListener("complete", animationHandler);
        $.window.animate(animation);
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "PMXLoader";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.window = Ti.UI.createWindow({
        backgroundColor: "#90000000",
        height: Ti.UI.FILL,
        width: Ti.UI.FILL,
        fullscreen: true,
        top: 0,
        navBarHidden: true,
        id: "window"
    });
    $.__views.window && $.addTopLevelView($.__views.window);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    var indicator = Ti.UI.createActivityIndicator();
    indicator.style = Alloy.Globals.IndicatorStyle;
    indicator.show();
    $.window.add(indicator);
    $.window.open();
    $.window.addEventListener("close", function() {
        Ti.App.removeEventListener("PMXLoaderClose", closeMe);
    });
    Ti.App.addEventListener("PMXLoaderClose", closeMe);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;