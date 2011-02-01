var Schedules = {
	create: function() {
		return $.extend($('<ul class="schedules">'),this)
	},
	initialize: function(api) {
		this.api = api
	},
	clearStops: function() {
		this.empty()
	},
	showStops: function(position,radius) {
		Log.message("Requesting stops for",position.latitude,position.longitude)
		this.addClass("loading")
		this.clearStops()
		this.api.findStops(position,radius,$.proxy(this._onStopsLoaded,this))
	},
	_onStopsLoaded: function(stops) {
		this.removeClass("loading")
		if(stops.length==0) {
			Log.message("No stops found")
			return
		}

		var toAdd = stops.slice(0,10)
		Log.verbose("Adding",toAdd.length,"stop(s)")
		toAdd.map($.proxy(function(stop){ 
			this.append(StopView.create(stop,this,this.api))
		},this))
		if(stops.length>10) {
			Log.verbose("Keeping",stops.length-10,"in bundle")
			this.append(StopBundle.create(stops.slice(10),this,this.api))
		}
	},
	refresh: function() {
		function sort(a,b){ 
			a = $(a); b = $(b)
			var type =
				(a.hasClass("hidden")?1:a.hasClass("bundle")?2:-1)-
				(b.hasClass("hidden")?1:b.hasClass("bundle")?2:-1)
			if(type!=0) {
				return type
			}
			var distance = 
				a.data("stop").distance-
				b.data("stop").distance
			return distance
		}
		//if(this.refreshDelay) {
		//	clearTimeout(this.refreshDelay)
		//}
		//this.refreshDelay = setTimeout($.proxy(function(){
			var sorted = this.children().detach().sort(sort)
			this.append(sorted)
		//},this),500)
	}
};