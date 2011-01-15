function Locator(display,options) {
	this.options = $.extend(options||{},this.defaults)
	this.display = display
}
$.extend(Locator.prototype, EventTarget, {
	defaults: {
		positionRetries: 12,
		positionTimeout: 500
	},
	locate: function(retries) {
		if(typeof(retries)=="undefined") {
			retries = this.options.positionRetries
		}
		if(!navigator.geolocation) {
			Log.warn("Geolocation service unavailable")
			this.display.text("Location not selected")
			return
		}
		if(retries<0) {
			Log.warn("Timeout while locating")
			this.display.text("Position not found")
			return;
		}
		Log.message("Locating ("+retries+") retries left)");
		this.display.text("Locating "+"...".substring(0,3-retries%3));
		var self = this
		navigator.geolocation.getCurrentPosition( 
			function(p) { self._located(p.coords) },
			function(e) { self._error(retries,e) },
			{ timeout:this.options.positionTimeout }
		)
	},
	setLocation: function(location,wasGeocoded) {
		this.dispatchEvent(new LocationEvent(location))
		if(wasGeocoded || !(google&&google.maps)) {
			this.display.text(location.toReadableString())
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
				this.display.text("Select location")
				break;
			case e.PERMISSION_DENIED:
				Log.error("Positioning not allowed")
				this.display.text("Positioning not allowed")
				break;
		}
	},
	_located: function(p) {
		Log.verbose("Location received at "+p.latitude+","+p.longitude)
		var location = new Location(p.latitude,p.longitude)
		this.setLocation(location)
	}
});
