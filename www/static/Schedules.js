function Schedules(api,options) {
	this.api = api
	this.element = $('<div class="schedules">')
	this.displays = {}
	this.options = $.extend(options,this.defaults)
}
$.extend( Schedules.prototype, {
	defaults: {
		searchRadius: 200
	},
	positionUpdated: function(position) {
		Log.message("At ",position.latitude,"(lat)",position.longitude+"(lng)")
		Log.verbose("Requesting stops");
		this.element.empty()
		this.displays = {}
		var that = this
		this.api.findStops(
			position, this.options.searchRadius,
			function(stops){
				that.updateStops(stops)
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
			this.api.getSchedule(stop,function(){
				that.updateStop(stop)
			})
		})
	},
	updateStop: function(stop) {
		Log.verbose("Update for stop",stop.code," with ",stop.schedule.length,"entries")
		var display = this.displays[stop.code]
		if(!display) {
			display = new Display()
			this.displays[stop.code] = display
			this.element.append(display.element)
		}
		display.show(stop)
	}
})