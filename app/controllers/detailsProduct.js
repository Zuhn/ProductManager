var args = arguments[0] || {};
var DB = Alloy.Globals.DB;
var datas = args.datas;
var img = datas.photo;
var cat = datas.category;
var timeStamp;
$.scroll.opacity = 0;
$.win.addEventListener('click',function(e){
	$.ref.blur();
	$.nom.blur();
	$.prix.blur();
	$.description.blur();
	$.c_stock.blur();
	
});

//$.win.addEventListener('open', function(){
	if(img != undefined && img != 'undefined')
		$.thumb.image = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, datas.photo+ ".jpeg");
	else
	{
		img = 'logo.png';
		$.thumb.image = 'logo.png';
	}
	
	//$.ref.value = datas.ref;
	if(datas.quantity == null)
		datas.quantity = 0;
	$.c_stock.value = datas.quantity;
	$.nom.value = datas.nom;
	$.prix.value = datas.price;
	$.description.value = datas.description;
//});
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
	$.thumb.addEventListener('load',displayContent);
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



$.thumb.addEventListener('load',displayContent);
function displayContent(){
	if(ini_record == false)
	{
		ini_record = true;
	$.thumb.removeEventListener('load',displayContent);
	$.v_nom.top=$.thumb.toImage().height;
	var v1 = $.thumb.toImage().height+$.v_nom.toImage().height;
	var v1h = $.v_info.toImage().height;
	var v2h = $.v_stock.toImage().height;
	$.v_info.top=v1;
	$.v_info.height='40dp';
	var v2 = $.thumb.toImage().height+$.v_nom.toImage().height+$.v_info.toImage().height;
	$.v_stock.top=v2;	
	$.v_stock.height='40dp';
	
		recordMenu($.bt_info,$.v_info,v1h,$.thumb.toImage().height,v1);
		recordMenu($.bt_stock,$.v_stock,v2h,$.thumb.toImage().height,v2);
	}
	
	var animation1 = Titanium.UI.createAnimation();
		animation1.opacity = 1;
	
		animation1.duration = 500;
		animation1.delay=200;
	
		$.scroll.animate(animation1);
	
}


//PMXOngletManager
var ini_record = false;
var tab_ini_top=[];	
var tab_onglet=[];
var tab_v_height=[];
var tab_close_height=[];
var menu_speed = 500;
var c_menu = null;
function recordMenu(_bt,_v,_height,_close_height,_ini_top)
{

	_bt.addEventListener('click', openOnglet);
	var h = _height;
	tab_onglet.push(_v);
	tab_ini_top.push(_ini_top);
	tab_v_height.push(h);
	tab_close_height = _close_height;
}
function openOnglet(e)
{

	var _id = e.source.myid;
	for(var i=0; i< tab_onglet.length; i++)
	{
		var view_action = tab_onglet[i];
		
		if(c_menu == _id)
		{
			
			
			if(_id==i)
			{
				var h = '40dp';
				var animation1 = Titanium.UI.createAnimation();
				animation1.height = h;

				animation1.duration = menu_speed;
				animation1.delay=20;
	
				view_action.animate(animation1);
			}
			else
			{
				var h = tab_ini_top[i];
				var animation = Titanium.UI.createAnimation();
				animation.top = h;
				animation.duration = menu_speed;
				animation.delay=0;
	
				view_action.animate(animation);
				
				}

		}
		else
		{
		
			if(_id >= i)
			{
				var h = tab_ini_top[i];
				var animation = Titanium.UI.createAnimation();
				animation.top = h;
				animation.duration = menu_speed;
				animation.delay=0;
	
				view_action.animate(animation);
			}
			if(_id < i)
			{
				var h = tab_ini_top[i]+tab_v_height[_id];
				var animation = Titanium.UI.createAnimation();
				animation.top = h;
				animation.duration = menu_speed;
				animation.delay=10;
	
				view_action.animate(animation);
			}
			if(_id==i)
			{
				var h = tab_v_height[i];
				var animation = Titanium.UI.createAnimation();
				animation.height = h;
				animation.duration = menu_speed;
				animation.delay=0;
	
				view_action.animate(animation);
			}
			else{
				var h = '40dp';
				var animation = Titanium.UI.createAnimation();
				animation.height = h;
				animation.duration = menu_speed;
				animation.delay=0;
	
				view_action.animate(animation);
			}
			
		}
		
	}
	if(c_menu == _id)
			c_menu = null;
		else
			c_menu = _id;
}

//////////////////////////////////
function addStock()
{
	var num = parseInt($.c_stock.value)+1;
	setStock(num);
}

function removeStock()
{
	if(datas.quantity != 0)
	{
		var num = parseInt($.c_stock.value)-1;
		setStock(num);
	}
}

function setStock(_num)
{
	$.bt_save.enabled = true;
	datas.quantity = _num;
	$.c_stock.value = _num;
}

function saveStock()
{
	$.bt_save.enabled = false;
	datas.quantity = parseInt($.c_stock.value);
	DB.insert('charlotte','UPDATE jewelry SET quantity='+datas.quantity+' WHERE id='+datas.id);
	Ti.App.fireEvent('reloadList');
	
}












