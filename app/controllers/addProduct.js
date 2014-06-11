var args = arguments[0] || {};
var DB = Alloy.Globals.DB;
var img;
var cat = '0';
var timeStamp;
$.ref.addEventListener('focus', function f(e){
    $.ref.blur();
    $.ref.removeEventListener('focus', f);
});
function addProduct()
{
	DB.insert('charlotte','INSERT INTO jewelry (ref,nom,description,photo,price,category) VALUES ("'+$.ref.value+'","'+$.nom.value+'","'+$.description.value+'","'+img+'","'+$.prix.value+'","'+cat+'")');
	Ti.App.fireEvent('reloadList');
	$.win.close({modal:true});
}

function openGallery()
{
	$.ind.show();
	timeStamp = new Date().getTime();
	
	$.thumb.image = Alloy.Globals.IMGG.openAndSave(timeStamp, displayImage);
}

function displayImage(_img)
{
	$.ind.hide();
	if(_img != null)
	{
		img = timeStamp;
		$.thumb.image = _img;
	}
	
}
function closePage()
{
	$.win.close({modal:true});
}

function openCategory()
{

	//removeListener();
	var option = Alloy.createController('PMXOptionList',{data:Alloy.Globals.cats, ini_value:null, title:"Sélection de la catégorie", has_row_all:false, short_answer:false, cb:changeCategory});
	option.getView().open({modal:true});
	//Ti.App.addEventListener('listValueChange', changeCategory);
}
function changeCategory(_cat, _id)
{
	$.bt_cat.title ="Catégorie :"+ _cat;
	cat = _id;
}
