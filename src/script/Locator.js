function Locator(options) {
	this.options = $.extend(options||{},this.defaults)
}
Locator.available = typeof(navigator.geolocation)!="undefined"
$.extend(Locator.prototype, EventTarget, {
	defaults: {
		positionRetries: 12,
		positionTimeout: 500
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
		this.dispatchEvent(new LocationEvent(null,LocationEvent.PENDING))
		var self = this
		navigator.geolocation.getCurrentPosition( 
			function(p) { self._located(p.coords) },
			function(e) { self._error(retries,e) },
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
	_error: function(retries,e) {
		switch(e.code) {
			case e.TIMEOUT:
				Log.verbose("Positioning timeout, retrying")
				this.locate(retries-1)
				break;
			case e.POSITION_UNAVAILABLE:
				Log.error("Positioning unavailable")
				this.dispatchEvent(new LocationEvent(null,LocationEvent.UNAVAILABLE))
				break;
			case e.PERMISSION_DENIED:
				Log.error("Positioning not allowed")
				this.dispatchEvent(new LocationEvent(null,LocationEvent.PERMISSION_DENIED))
				break;
		}
	},
	_located: function(p) {
		Log.verbose("Location received at "+p.latitude+","+p.longitude)
		var location = new Location(p.latitude,p.longitude)
		this.setLocation(location)
	}
});
