exports.openAndSave = function(_name, _cb) {
    Titanium.Media.openPhotoGallery({
        mediaTypes: [ Ti.Media.MEDIA_TYPE_PHOTO ],
        success: function(e) {
            var image = e.media;
            e.thumbnail;
            filename = _name;
            var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, filename + ".jpeg");
            f.write(image);
            var fc = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "thumb_" + filename + ".jpeg");
            fc.write(image.imageAsThumbnail(300));
            file = fc.getNativePath();
            big = f.getNativePath();
            _cb(file, big);
        },
        cancel: function() {
            _cb(null, null);
        }
    });
};

exports.open = function() {
    Titanium.Media.openPhotoGallery({
        mediaTypes: [ Ti.Media.MEDIA_TYPE_PHOTO ],
        success: function(e) {
            e.media;
            e.thumbnail;
            return e.media;
        }
    });
};