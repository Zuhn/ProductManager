var revision = Ti.App.Properties.getString('PMXRevision', '0');

function setRev(_id)
{
	Ti.App.Properties.setString('PMXRevision', _id);
}
/*
if(revision < '1')
{
	Alloy.Globals.DB.addColumn('charlotte','jewelry', 'quantity', 'INTEGER');
	setRev('1');
}
*/
