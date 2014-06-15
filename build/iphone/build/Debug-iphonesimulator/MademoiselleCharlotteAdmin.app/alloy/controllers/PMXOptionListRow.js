function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "PMXOptionListRow";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.row = Ti.UI.createTableViewRow({
        id: "row"
    });
    $.__views.row && $.addTopLevelView($.__views.row);
    $.__views.mytitle = Ti.UI.createLabel({
        id: "mytitle"
    });
    $.__views.row.add($.__views.mytitle);
    $.__views.info = Ti.UI.createLabel({
        id: "info"
    });
    $.__views.row.add($.__views.info);
    exports.destroy = function() {};
    _.extend($, $.__views);
    exports.ini = function(_title) {
        $.mytitle.text = _title;
    };
    exports.setOptionText = function(_t, _num_char) {
        null == _num_char && (_num_char = 15);
    };
    exports.getTitle = function() {
        return $.title.text;
    };
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;