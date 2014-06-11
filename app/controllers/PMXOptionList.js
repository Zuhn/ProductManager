var args = arguments[0] || {};

var tab_data = args.data;
var ini_value = args.ini_value;
var short_answer = args.short_answer;
/*
$.window.title = args.title;
var title_of_window = Titanium.UI.createLabel({
    color:'#FFF',
	//font:{fontSize:14,fontFamily:'Helvetica Neue',fontWight:'bold'},
    text:args.title,
    textAlign:'center',
    
});

// associate label to title
if(OS_IOS)
	$.window.setTitleControl(title_of_window);
*/
var tableData = [];
/*
if(args.has_row_all != null)
{
	
	var row_c = Alloy.createController('PMXOptionListRow');
		row_c.name = args.has_row_all;
		row_c.hasChild = false;
		
		//row_c.title = tab[0];
		//tab_option.push(row_c);
		if(OS_ANDROID)
			row_c.ini(args.has_row_all);	
	row = row_c.getView();
	row.hasChild = false;

		row.title=args.has_row_all;
	row.rowIndex = null;
	
	
	
	
	
	if(OS_ANDROID)
		row.color='#575757';
	
	if(null == ini_value)
	{
		row.hasCheck = true;
		//row.rightImage = 'hascheck.png';
	}
	  
	tableData.push(row);
}
*/
$.window.addEventListener('open', function(){
for (var i=0; i<=tab_data.length-1; i++)
{
	
	var t= tab_data[i];
	var tab = [];
	/*
	for(var p in t) 
	{
    	tab.push(t[p]);
	}
*/
	var row_c = Alloy.createController('PMXOptionListRow');
		row_c.name = t.title;
		//row_c.hasChild = false;
		row_c.title = t.title;
		//tab_option.push(row_c);
			
	row = row_c.getView();
	row.hasChild = false;

		row.title=t.title;
	row.rowIndex = t.id;
	//if(OS_ANDROID)
		//row.color='#575757';
		
		
	
	if(t.id == ini_value)
	{
		row.hasCheck = true;
		//row.rightImage = 'hascheck.png';
	}
  	if(OS_ANDROID)
			row_c.ini(t.title);
  	tableData.push(row);
}

$.tableview.data = tableData;
});	


$.tableview.addEventListener('click', function(e)
{
		/*
	var allRows = this.data[0].rows;
	_.each(allRows, function(row){
		row.hasCheck = false;
		row.row.rightImage = '';
	});
	e.row.hasCheck = true;
	//e.row.rightImage = 'hascheck.png';
	/*
	Ti.App.Properties.setInt('regionIdUser',e.row.rowIndex);
	var title;
	if(short_answer == null)
	{
		title = Alloy.Globals.webservice.stringNum(e.row.title,10,true);
	}
	else
	{
		title = e.row.title;
	}
	Ti.App.fireEvent('listValueChange',{id:e.row.rowIndex, title:title});
	*/
	args.cb(e.row.title,e.row.rowIndex);
	$.window.close();
});




