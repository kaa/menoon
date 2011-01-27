function Locator(options) {
	this.options = $.extend(options||{},this.defaults)
}
Locator.available = typeof(navigator.geolocation)!="undefined"
$.extend(Locator.prototype, EventTarget, {
	defaults: {
		positionRetries: 6,
		positionTimeout: 1000
	},
	start: function() {
		if(this.watchId) {
			this.stop()
		}
		this.watchId = navigator.geolocation.watchPosition(
			$.proxy(this._located,this),$.proxy(this._error,this),
			{ timeout:this.options.positionTimeout }
		)
		Log.verbose("Begun watching position, token",this.watchId);
	},
	stop: function() {
		navigator.geolocation.clearWatch(this.watchId)
		delete this.watchId
		Log.verbose("Stopped watching position");
	},
	locate: function(retries) {
		if(typeof(retries)=="undefined") {
			retries = this.options.positionRetries
		}
		if(!Locator.available) {
			Log.warn("Geolocation service unavailable")
			this.dispatchEvent(new LocationEvent(null,LocationEvent.UNAVAILABLE))
			return
		}
		if(retries<0) {
			Log.warn("Timeout while locating")
			this.dispatchEvent(new LocationEvent(null,LocationEvent.TIMEOUT))
			return;
		}
		Log.message("Locating ("+retries+" retries left)");
		var e = new LocationEvent(null,LocationEvent.PENDING);
		e.retries = retries
		this.dispatchEvent(e)
		var self = this
		navigator.geolocation.getCurrentPosition( 
			$.proxy(this._located,this),
			$.proxy(function(e) { this._error(e,retries) },this),
			{ timeout:this.options.positionTimeout }
		)
	},
	setLocation: function(location,wasGeocoded) {
		this.dispatchEvent(new LocationEvent(location,LocationEvent.SUCCESS))
		if(wasGeocoded || !(google&&google.maps)) {
			return
		}
		var self = this
		new google.maps.Geocoder().geocode(
			{ location: new google.maps.LatLng(location.latitude,location.longitude) },
			function(result,status){ 
				if(!result) return
				location.addGeocodingResult(result) 
				self.setLocation(location,true)
			}
		)
	},
	_error: function(e,retries) {
		switch(e.code) {
			case e.TIMEOUT:
				if(retries>0) {
					Log.verbose("Positioning timeout, retrying")
					this.locate(retries-1)
				} else {
					Log.verbose("Positioning timeout, retries exhausted")
					this.dispatchEvent(new LocationEvent(null,LocationEvent.TIMEOUT))
				}
				break;
			case e.POSITION_UNAVAILABLE:
				Log.error("Positioning unavailable")
				this.dispatchEvent(new LocationEvent(null,LocationEvent.UNAVAILABLE))
				break;
			case e.PERMISSION_DENIED:
				Log.error("Positioning not allowed")
				this.dispatchEvent(new LocationEvent(null,LocationEvent.PERMISSION_DENIED))
				break;
			default:
				Log.error("Unknown error occurred",e.code,e)
		}
	},
	_located: function(p) {
		if(this.timer) {
			clearTimeout(this.timer)
			delete this.timer
		}
		this.timer = setTimeout($.proxy(function(){
			Log.verbose("Location received",p.coords.latitude,p.coords.longitude,p.coords.accuracy)
			var location = new Location(p.coords.latitude,p.coords.longitude)
			this.setLocation(location)
		},this),1000)
	}
});
