/*** disable backspace N right click***/
function disableKeys(){	
		
	document.oncontextmenu = document.body.oncontextmenu = function() {return false;}
	
	$(document).on('keydown',function(e){
	
	/*  if(e.keyCode == 32 ||e.keyCode == 116 || e.keyCode == 9 || e.keyCode == 13 || e.keyCode == 18 || e.keyCode == 37){
		e.preventDefault();
	} */
	});		
}
function disableOptionalKeys(){
	
}
function toBool(_val){
	if(_val==true || _val=='true')
		return true;
	else
		return false;
}
//disableKeys();

/* history.pushState(null, null, document.title);
window.addEventListener('popstate', function () {
    history.pushState(null, null, document.title);
});
 */