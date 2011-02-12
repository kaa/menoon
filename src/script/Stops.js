var Stops = {
	create: function() {
		return $.extend($('<ul class="stops">'),this)
	},
	initialize: function(api) {
		this.api = api
	},
	clearStops: function() {
		this.empty()
	},
	showStops: function(position,radius) {
		Log.message("Requesting stops for",position.latitude,position.longitude)
		this.clearStops()
		this.api.findStops(position,radius,$.proxy(this._onStopsLoaded,this))
	},
	_onStopsLoaded: function(stops) {
		if(stops.length==0) {
			Log.message("No stops found")
			return
		}
		stops = stops.sort(this._stopSort)
		var toAdd = stops.slice(0,10)
		Log.verbose("Adding",toAdd.length,"stop(s)")
		toAdd.map($.proxy(function(stop){ 
			this.append(Stop.create(stop,this,this.api))
		},this))
		if(stops.length>10) {
			Log.verbose("Keeping",stops.length-10,"in bundle")
			this.append(StopBundle.create(stops.slice(10),this,this.api))
		}
	},
	refresh: function() {
		var sorted = this.children().detach().sort($.proxy(this._sort,this))
		this.append(sorted)
	},
	_sort: function(a,b){
		var a = $(a), b = $(b),
			a_stop = a.data("stop"), 
			b_stop = b.data("stop")
		if(a.hasClass("bundle")) return 1;
		if(b.hasClass("bundle")) return -1;
		return this._stopSort(a_stop,b_stop)
	},
	_stopSort: function(a_stop,b_stop) {
		var a_fav = !!Preferences.items.favorites[a_stop.code],
		    b_fav = !!Preferences.items.favorites[b_stop.code]

		return a_fav&&!b_fav ? -1 : b_fav&&!a_fav ? 1 : a_stop.distance-b_stop.distance
	}
};