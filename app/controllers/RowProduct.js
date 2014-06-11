var datas;
exports.ini = function(data)
{
	datas = data;
	var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, 'thumb_'+data.photo+ ".jpeg");
	$.pic.image = f.getNativePath();
	$.ref.text = 'réf: '+data.ref;
	$.prix.text = 'prix: '+data.price+".- CHF";
	$.title.text = data.nom;
	$.date.text = data.description;
};

exports.getDatas = function()
{
	alert('yo');
	return 'datas';
};

