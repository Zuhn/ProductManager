var args = arguments[0] || {};
var DB = Alloy.Globals.DB;


function addProduct()
{
	DB.insert('charlotte','INSERT INTO jewelry_cat (title) VALUES ("'+$.nom.value+'")');
	Ti.App.fireEvent('reloadCategory');
	$.win.close({modal:true});
}

function closePage()
{
	$.win.close({modal:true});
}
