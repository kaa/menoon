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
		that.elements.map.css("height",300)
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
	locate: function(retries) {
		if(retries<0) {
			Log.warn("Timeout while locating")
			this.elements.display.text("Location not found")
			return;
		}
		Log.message("Locating ("+retries+") retries left)");
		this.elements.display.text("Locating "+"...".substring(0,3-retries%3));
		var that = this
		navigator.geolocation.getCurrentPosition( 
			function(p) { that.located(p.coords) },
			function(e) { 
				if(e.code==e.TIMEOUT) {
					that.locate(retries-1)
				} else {
					console.log(that.elements)
					that.elements.display.text("Location unavailable")
				}
			}, 
			{ timeout:that.options.positionTimeout }
		)
	},
	located: function(p) {
		Log.verbose("Located at "+p.latitude+","+p.longitude)
		this.elements.display.text("At "+p.latitude+","+p.longitude)
		this.dispatchEvent({type:"location",details:p})
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
