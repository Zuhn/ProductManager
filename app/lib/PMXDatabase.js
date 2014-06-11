//Installation de la base de données
exports.install = function(_filePath, _db_name)
{
	var db = Ti.Database.open(_db_name);
    db.remove();
	//Installation de la nouvelle base
	var dbInstall = Ti.Database.install(_filePath, _db_name);
};

//Controle si la base de données existe ou non
exports.dbExists = function(_name)
{
	if(OS_IOS)
	{
	var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory+'../Library/Private%20Documents/',_name+".sql");
	if(file.exists())
		return true;
	else
		return false;
	}
	else
	{
		var fname=Ti.Filesystem.getFile("file://data/data/"+ Ti.App.getId()+"/databases/"+ _name); //alert(fname.nativePath+":"+ fname.size);
		if(fname.exists())
		return true;
		else
			return false;
		}
};

exports.remove = function(_name)
{
	var db = Ti.Database.open(_name);
    db.remove();
};

exports.insert = function(_db, _request)
{
	try
	{
		var db=Ti.Database.open(_db);
		var product = db.execute(_request);
		db.close();
		return true;
	}
	catch(e)
	{
		return e;
	}
};

exports.delete = function(_db, _request)
{
	try
	{
		var db=Ti.Database.open(_db);
		var product = db.execute(_request);
		db.close();
		return true;
	}
	catch(e)
	{
		return e;
	}
};

exports.select = function(_db, _request)
{
	var tab_data = [];
	var obj;
	var db=Ti.Database.open(_db);
	var num = 0;
	var product = db.execute(_request);
	while (product.isValidRow())
	{
		//Création de l'objet retourné
		obj = {};
		
		var count;
		if(OS_IOS)
			count=product.fieldCount();
		else
			count=product.getFieldCount();
		
		for(var i=0; i<count; i++)
		{
			
			obj[product.fieldName(i)] = product.field(i);
			//Le nom du champ
			//console.log(product.fieldName(i));
			//sa valeur
			//console.log(product.field(i));
		};

		tab_data.push(obj);

		product.next();
	};
	
	db.close();
	return tab_data;
};

exports.addColumn = function(_db,_table, _column, _type)
{
	var db=Ti.Database.open(_db);
	var product = db.execute('ALTER TABLE '+_table+' ADD COLUMN '+_column+' '+_type);
	
};
