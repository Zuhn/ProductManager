var args = arguments[0] || {};
var DB = Alloy.Globals.DB;
var datas = args.datas;
var img = datas.photo;
var cat = datas.category;
var timeStamp;
$.win.addEventListener('open', function(){
	if(img != undefined && img != 'undefined')
		$.thumb.image = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, datas.photo+ ".jpeg");
	else
	{
		img = 'logo.png';
		$.thumb.image = 'logo.png';
	}
	
	$.ref.value = datas.ref;
	$.nom.value = datas.nom;
	$.prix.value = datas.price;
	$.description.value = datas.description;
});
$.ref.addEventListener('focus', function f(e){
    $.ref.blur();
    $.ref.removeEventListener('focus', f);
});
function deleteProduct()
{
	Alloy.Globals.DB.delete('charlotte', 'DELETE FROM jewelry WHERE id='+ datas.id);
	Ti.App.fireEvent('reloadList');
	$.win.close({modal:true});
}

function openGallery()
{
	$.ind.show();
	timeStamp = new Date().getTime();
	
	$.thumb.image = Alloy.Globals.IMGG.openAndSave(timeStamp, displayImage);
}

function displayImage(_img, _big)
{
	$.ind.hide();
	if(_big != null)
	{
		$.thumb.image = _big;
		img = timeStamp;
	}
	else
	{
		
		$.thumb.image =  Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, img+ ".jpeg");
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

function addProduct()
{
	console.log('UPDATE jewelry SET ref="'+$.ref.value+'", nom="'+$.nom.value+'", description"'+$.description.value+'", photo="'+img+'", price="'+$.prix.value+'", category="'+cat+'" WHERE id='+datas.id);
	DB.insert('charlotte','UPDATE jewelry SET ref="'+$.ref.value+'", nom="'+$.nom.value+'", description="'+$.description.value+'", photo="'+img+'", price="'+$.prix.value+'", category="'+cat+'" WHERE id='+datas.id);
	Ti.App.fireEvent('reloadList');
	$.win.close({modal:true});
}