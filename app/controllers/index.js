var current_page;
var last_category;
var sectionVeg;

//Initialisation de l'app
var IMGG = require("PMXImageGallery");
Alloy.Globals.IMGG = IMGG;
var DB = require("PMXDatabase");
Alloy.Globals.DB = DB;




$.index.addEventListener('open', function(){
	if(!DB.dbExists('charlotte'))
	{
		//alert('Initialize database');
		DB.install("charlotte.sql","charlotte");
	}
	var revision = require('PMXRevision');
	setCategory();
	displayProduct();
});



//DB.remove('charlotte');

function openDetails(e)
{
	current_page = Alloy.createController("detailsProduct",{datas:e});
	current_page_view = current_page.getView();
	current_page_view.open({modal:true});
}

function openAddProduct()
{
	current_page = Alloy.createController("addProduct");
	current_page_view = current_page.getView();
	current_page_view.open({modal:true});
}

function openAddCategory()
{
	current_page = Alloy.createController("addCategory");
	current_page_view = current_page.getView();
	current_page_view.open({modal:true});
}

function setCategory()
{
	Alloy.Globals.cats =  DB.select('charlotte','SELECT * FROM jewelry_cat');
	var tab = Alloy.Globals.cats;
	var t = "";
	for(var i=0; i<tab.length;i++)
	{
		t += "\n"+tab[i].title;
	}
	//alert(t);
}

function getCategory(_id)
{
	var tab_data = Alloy.Globals.cats;
	
	for(var i=0; i<tab_data.length; i++)
	{
		console.log("comparaison tab "+tab_data[i].id +"  "+ _id);
		if(tab_data[i].id == _id)
		{
			return tab_data[i].title;
		}
	}
}

function displayProduct()
{
	$.tableview.scrollToTop(0);
	last_category = 'hrtzph4324FFDStrte777';
	if(OS_IOS)
		Alloy.createController('PMXLoader').getView().open();
	var rows = [];
	var c_cat = 0;
	var headerTitle;

	var tab_data = DB.select('charlotte','SELECT * FROM jewelry ORDER by category');
	
	for(var i=0; i<tab_data.length; i++)
	{
		if(last_category != tab_data[i].category )
		{
			c_cat = 1;
			last_category = tab_data[i].category;
			
			var headerView = Ti.UI.createView({
				height: '50dp',
				backgroundColor:'#222222',
				head:getCategory(tab_data[i].category)
			});
			
			var header_icon = Ti.UI.createImageView({
				top:'1dp',
				left:'10dp',
				image:'icons/down.png',
				height:'25dp',
			});
			
			
			headerTitle = Ti.UI.createLabel({
				text: getCategory(tab_data[i].category),
				classes:'voucher_row_header_title',
				color:'#EEEEEE',
				left:'15dp',
				font:{fontSize:12,fontFamily:'Comfortaa-Bold'},
				touchEnabled:false,
				bottom:'8dp'
			});
			
			var separatorView = Ti.UI.createView({
				backgroundColor: 'transparent',
				height: '1dp',
				backgroundColor:'#DDD',
				bottom:'0dp',
				touchEnabled:false
			});

			headerView.add(header_icon);
			headerView.add(headerTitle);
			//headerView.add(separatorView);
			
			sectionVeg = Ti.UI.createTableViewSection({ headerView: headerView });
	    	rows.push(sectionVeg);
		}
		else
		{
			c_cat ++;
		}
		
		if(c_cat >1)
			headerTitle.text = getCategory(tab_data[i].category)+". "+c_cat+" objets.";
		else
			headerTitle.text = getCategory(tab_data[i].category)+". "+c_cat+" objet.";
		var row_c = Alloy.createController('RowProduct');
		
		row_c.ini(tab_data[i]);
		row = row_c.getView();
		row.datas = tab_data[i];
		row.header = getCategory(tab_data[i].category);
		//row_c.myData = tab_data[i];
		sectionVeg.add(row);
	}
	$.tableview.data =rows;
	$.tableview.footerView = Ti.UI.createView({
	    height: 1,
	    backgroundColor: 'transparent'
	});

	
	Ti.App.fireEvent('PMXLoaderClose');
	var animation = Titanium.UI.createAnimation();
	animation.opacity = 0;
	animation.duration = 1000;
	animation.delay=1000;
	var animationHandler = function() {
	  animation.removeEventListener('complete',animationHandler);
	  $.v_loader.visible = false;
	};
	animation.addEventListener('complete',animationHandler);
	$.v_loader.animate(animation);
	
}

$.tableview.addEventListener('click', function(e)
{
    openDetails(e.row.datas);
});

Ti.App.addEventListener("reloadList", displayProduct);
Ti.App.addEventListener("reloadCategory", setCategory);
$.index.open();
