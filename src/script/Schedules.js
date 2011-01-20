function Schedules(api,element,options) {
	this.api = api
	this.element = element||$('<div class="schedules">')
	this.displays = {}
	this.options = $.extend(options,this.defaults)
}
$.extend( Schedules.prototype, {
	defaults: {
		displayClass: Stop
	},
	showStops: function(position,radius) {
		Log.message("Requesting stops for",position.latitude,",",position.longitude)
		this.element.empty()
		this.displays = {}
		var that = this
		this.api.findStops(
			position, radius,
			function(stops){
				that.updateStops(stops)
				that.element.listview("refresh")
			}
		)
	},
	updateStops: function(stops) {
		if(stops.length==0) {
			Log.message("No stops found within a",this.options.searchRadius,"meter radius")
			return
		}
		Log.verbose("Requesting schedule(s) for",stops.length,"stop(s)")
		var that = this
		stops.map(function(stop){ 
			that.updateStop(stop)
			that.api.getSchedule(stop,function(){
				that.updateStop(stop)
				that.element.listview("refresh")
			})
		})
	},
	updateStop: function(stop) {
		Log.verbose("Update",stop,"for stop",stop.code,"with",(stop.schedule||[]).length,"entries")
		var display = this.displays[stop.code]
		if(!display) {
			display = new this.options.displayClass()
			this.displays[stop.code] = display
			this.element.append(display.element)
		}
		display.show(stop)
	}
})