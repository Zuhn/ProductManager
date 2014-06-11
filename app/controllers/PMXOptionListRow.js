exports.ini = function(_title)
{
	$.mytitle.text = _title;
};

exports.setOptionText = function(_t, _num_char)
{
	if(_num_char == null)
	{
		_num_char = 15;
	}
	//$.info.text= Alloy.Globals.webservice.stringNum(_t,_num_char,true);
};

exports.getTitle = function()
{
	return $.title.text;
};

//
