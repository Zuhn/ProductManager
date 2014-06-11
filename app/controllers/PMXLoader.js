var args = arguments[0] || {};

var indicator = Ti.UI.createActivityIndicator();
indicator.style =  Alloy.Globals.IndicatorStyle;
indicator.show();

$.window.add(indicator);
$.window.open();

$.window.addEventListener('close', function(){
	Ti.App.removeEventListener('PMXLoaderClose', closeMe);
});
function closeMe()
{
	var animation = Titanium.UI.createAnimation();
	animation.opacity = 0;
	animation.duration = 500;
	var animationHandler = function() {
	  animation.removeEventListener('complete',animationHandler);
	  $.window.close();
	};
	animation.addEventListener('complete',animationHandler);
	$.window.animate(animation);
	
	
}
Ti.App.addEventListener('PMXLoaderClose', closeMe);
