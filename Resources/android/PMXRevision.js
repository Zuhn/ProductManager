function setRev(_id) {
    Ti.App.Properties.setString("PMXRevision", _id);
}

var revision = Ti.App.Properties.getString("PMXRevision", "0");