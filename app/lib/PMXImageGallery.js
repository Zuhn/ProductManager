exports.openAndSave = function(_name, _cb)
{
	Titanium.Media.openPhotoGallery({
	    mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO],
	 
	    success:function(e) {
	    	//alert(e.cropRect);
	          var image = e.media;
	          var thumb = e.thumbnail;

	          filename = _name;
	          var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, filename+ ".jpeg");
	          f.write(image);
	        
	          var fc = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, "thumb_"+filename+ ".jpeg");
	          fc.write(image.imageAsThumbnail(300));
	          file = fc.getNativePath();
	          big = f.getNativePath();

	 		  _cb(file, big);
	      },
	      cancel:function(e)
	       {
	       	 _cb(null, null);
	       }
	       
	});
};

exports.open = function()
{
	Titanium.Media.openPhotoGallery({
	    mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO],
	 
	    success:function(e) {
	    	
	          var image = e.media;
	          var thumb = e.thumbnail;
	          //alert(e.media);
	          return e.media;
	        }
	});
};
