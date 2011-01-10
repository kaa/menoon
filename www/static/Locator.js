function Locator(options) {
	this.options = $.extend(options||{},this.defaults)
	this.element = $(
		'<div class="locator">'+
			'<h3><span></span> <button>Locate</button></h3>'+
			'<div><a href="#">Select location</a>'+
				'<div class="map"></div>'+
			'</div>'+
		'</div>'
	);
	this.elements = {
		display: this.element.find("h3 span"),
		refreshButton: this.element.find("h3 button"),
		map: this.element.find(".map"),
		selectFromMapButton: this.element.find("a")
	}
	var that = this
	this.elements.selectFromMapButton.click(function(e){
		that.selectLocationClicked()
		e.preventDefault()
	})
	if(!navigator.geolocation) {
		Log.warn("Geolocation service unavailable, manual operation only")
		this.elements.display.text("Location not selected")
		this.elements.refreshButton.hide()
	} else {
		Log.verbose("Getting initial position")
		this.elements.refreshButton.click(function() {
			that.locate(that.options.positionRetries)
		})
		this.locate(this.options.positionRetries)
	}
}
$.extend(Locator.prototype,{
	defaults: {
		positionRetries: 6,
		positionTimeout: 500
	},
	selectLocationClicked: function() {
		this.located({latitude: 60.1630215, longitude: 24.9283883 })
		return
		
		this.elements.map.css("height",300)
		if(!this.map && google) {
			this.map = new google.maps.Map(this.elements.map.get(0),{
				zoom: 15,
				center: new google.maps.LatLng(60.1630215,24.9283883),
				mapTypeId: google.maps.MapTypeId.ROADMAP
			})
			var that = this;
			var timeout;
			google.maps.event.addListener(this.map,"center_changed",function(){
				if(timeout) clearTimeout(timeout)
				timeout = setTimeout(function() {
					var position = that.map.getCenter()
					if(!that.circle) {
						that.circle = new google.maps.Circle({ map: that.map, strokeWeight: 1, strokeOpacity: 0.5 })
					}
					that.circle.setCenter(position)
					that.circle.setRadius(200)
					that.located({latitude:position.lat(),longitude:position.lng()})
				},1000)
			})
		}
	},

	locate: function(retries) {
		if(retries<0) {
			Log.warn("Timeout while locating")
			this.elements.display.text("Position not found")
			return;
		}
		Log.message("Locating ("+retries+") retries left)");
		this.elements.display.text("Locating "+"...".substring(0,3-retries%3));
		var that = this
		navigator.geolocation.getCurrentPosition( 
			function(p) { that.located(p.coords) },
			function(e) { 
				switch(e.code) {
					case e.TIMEOUT:
						that.locate(retries-1)
						break;
					case e.POSITION_UNAVAILABLE:
						Log.error("Position unavailable")
						that.elements.display.text("Position unavailable")
						break;
					case e.PERMISSION_DENIED:
						Log.error("Positioning not allowed")
						that.elements.display.text("Positioning not allowed")
						break;
				}
			}, 
			{ timeout:that.options.positionTimeout }
		)
	},
	located: function(p) {
		Log.verbose("Located at "+p.latitude+","+p.longitude)
		this.elements.display.text("At "+p.latitude+","+p.longitude)
		this.dispatchEvent({type:"location",details:p})
		if(google&&google.maps) {
			var that = this
			var coder = new google.maps.Geocoder()
			coder.geocode({
				location: new google.maps.LatLng(p.latitude,p.longitude)
			},function(result){
				console.log(result)
			})
		}
	},

	addEventListener: function( type, listener, useCapture) {
		this.listeners = this.listeners||{}
		this.listeners[type] = this.listeners[type]||[]
		this.listeners[type].push(listener)
	},
	removeEventListener: function( type, listener, useCapture) {
		var listeners = this.listeners[type]
		if(!listeners) return
		for(var i=0; i<listeners.length; i++) {
			if(listeners[i]!=listener) continue
			delete listeners[i]
		}
	},
	dispatchEvent: function(evt) {
		evt.currentTarget = this;
		var listeners = (this.listeners||{})[evt.type];
		if(!listeners) return
		listeners.map(function(listener){listener(evt)})
	}
});
