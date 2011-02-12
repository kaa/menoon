var StopBundle = {
	create: function(stops,parent,api) {
		var e = $.extend($('<li class="stop bundle">'),this)
		e.initialize(stops,parent,api)
		return e
	},
	initialize: function(stops,parent,api) {
		this.api = api
		this.parent = parent
		this.stops = stops
		this.append('<h3>'+this.stops.length+' more...</h3>')
		this.bind("tap",$.proxy(this._onClicked,this))
	},
	_onClicked: function() {
		var unfold = this.stops.slice(0,10)
		Log.verbose("Unfolding",unfold.length,"bundled stops")
		unfold.map($.proxy(function(s){
			var stop = Stop.create(s,this.parent,this.api)
			this.before(stop)
		},this))
		this.stops = this.stops.slice(10)
		if(this.stops.length==0) {
			Log.verbose("Unfolded the last stop in bundle, dissolving")
			this.remove()
		}
		Log.verbose(this.stops.length," stops remain in bundle")
		this.find("h3").text(this.stops.length+' more...')
		this.parent.refresh()
	}
}