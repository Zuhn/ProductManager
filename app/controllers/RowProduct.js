var datas;
exports.ini = function(data)
{
	datas = data;
	var f = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, data.photo+ ".jpeg");

	$.pic.image = f.getNativePath();
	
	if(datas.ref == "" && datas.price == '')
	{
		$.v_prix.height='0dp';
	}

	if(datas.ref != '')
	{
		$.ref.text = 'Réf: '+data.ref;
	}
	else
	{
		$.ref.width='0dp';
	}
	if(datas.price != '')
	{
		$.prix.text = 'Prix: '+data.price;
		$.v_prix.height='30dp';
	}

	if(datas.description != '')
	{
		$.date.text = data.description;
	}
	else{
		$.v_desc.height='0dp';
	}
	$.title.text = data.nom;
	
	$.row.height=Ti.UI.SIZE;

};

exports.getDatas = function()
{
	alert('yo');
	return 'datas';
};

