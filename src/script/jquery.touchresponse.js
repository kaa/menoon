(function($){
	$.fn.touchResponsive = function() {
		this
			.bind("touchstart mousedown",function(){ $(this).addClass("active") })
			.bind("touchend mouseup mouseout",function(){ $(this).removeClass("active") })
		return this
	}
})(jQuery);
