(function(e){
	setInterval(function(){ 
		var now = new Date()
		$(".clock").text(now.toTimeString().substring(0,9))
		$(".tick").trigger("tick")
		if(now.getSeconds()==0) {
			$(".tick").trigger("tock")
		}
	},1000);
})(jQuery);