(function($){
	$.fn.fixHeight = function() {		
		function fix(){
			scroll(0, 0);
			var target = $(this)
			var content = target.find(".ui-content");
			var height = target.height() - 
				target.find(".ui-header").outerHeight() -
				target.find(".ui-footer").outerHeight() -
				(content.outerHeight()-content.height())
			content.height(height)
			var evt = jQuery.Event("fixheight")
			evt.stopPropagation()
			target.trigger(evt)
		}
		this.bind("orientationchange resize pageshow ready", fix)
		this.trigger("resize")
		return this
	}
})(jQuery);
