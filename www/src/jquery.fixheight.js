(function($){
	$.fn.fixHeight = function() {
		this.bind("orientationchange resize pageshow ready", function(){
			scroll(0, 0);
			var content = $(this).find(".ui-content");
			var height = $(this).height() - 
				$(this).find(".ui-header").outerHeight() -
				$(this).find(".ui-footer").outerHeight() -
				(content.outerHeight()-content.height())
			content.height(height)
			var evt = jQuery.Event("resize")
			evt.stopPropagation()
			content.trigger(evt)
		})
		return this
	}
})(jQuery);
