(function($){
	var blink = 0
	setInterval(function(){
		$(".blink").toggleClass("on",(blink++)%2==0)
	},500)
})(jQuery);