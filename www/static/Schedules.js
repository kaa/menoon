function Schedules(api,options) {
	this.api = api
	this.element = $("#results")
	this.displays = {}
	this.options = $.extend(options,this.defaults)
}
$.extend( Schedules.prototype, {
	defaults: {
		positionRetries: 0,
		positionTimeout: 1000,
		searchRadius: 200
	},
	show: function(fallbackPosition) {
		var that = this
		var positionRetries = this.options.positionRetries;
		var gl = navigator.geolocation
		if(!gl) {
			Log.warn("Geolocation service unavailable, using fallback")
			that.positionUpdated(fallbackPosition)
			return
		}
		Log.message("Requesting position");
		request();
		function request() {
			gl.getCurrentPosition( 
				that.positionUpdated, error, 
				{ timeout:that.options.positionTimeout }
			)
		}
		function error(e) {
			if(e.code==e.TIMEOUT && --positionRetries>0) {
				Log.verbose("Retrying position request")
				request()
			} else if(fallbackPosition) {
				Log.message("Using fallback position")
				that.positionUpdated(fallbackPosition)
			} else {
				Log.error("Unable to get position")
			}
		}
	},
	positionUpdated: function(position) {
		Log.message("At ",position.coords.latitude,"(lat)",position.coords.longitude+"(lng)")
		Log.verbose("Requesting stops");
		var that = this
		this.api.findStops(
			position, this.options.searchRadius,
			function(stops){that.updateStops(stops)}
		)
	},
	updateStops: function(stops) {
		if(stops.length==0) {
			Log.message("No stops found within a",radius,"meter radius")
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