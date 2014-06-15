exports.install = function(_filePath, _db_name) {
    var db = Ti.Database.open(_db_name);
    db.remove();
    Ti.Database.install(_filePath, _db_name);
};

exports.dbExists = function(_name) {
    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory + "../Library/Private%20Documents/", _name + ".sql");
    return file.exists() ? true : false;
};

exports.remove = function(_name) {
    var db = Ti.Database.open(_name);
    db.remove();
};

exports.insert = function(_db, _request) {
    try {
        var db = Ti.Database.open(_db);
        db.execute(_request);
        db.close();
        return true;
    } catch (e) {
        return e;
    }
};

exports.delete = function(_db, _request) {
    try {
        var db = Ti.Database.open(_db);
        db.execute(_request);
        db.close();
        return true;
    } catch (e) {
        return e;
    }
};

exports.select = function(_db, _request) {
    var tab_data = [];
    var obj;
    var db = Ti.Database.open(_db);
    var product = db.execute(_request);
    while (product.isValidRow()) {
        obj = {};
        var count;
        count = product.fieldCount();
        for (var i = 0; count > i; i++) obj[product.fieldName(i)] = product.field(i);
        tab_data.push(obj);
        product.next();
    }
    db.close();
    return tab_data;
};

exports.addColumn = function(_db, _table, _column, _type) {
    var db = Ti.Database.open(_db);
    db.execute("ALTER TABLE " + _table + " ADD COLUMN " + _column + " " + _type);
};