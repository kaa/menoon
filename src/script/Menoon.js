var Menoon = {
	create: function() {
		var html = 		
			'<div data-role="page" id="stops">'+
				'<div data-role="header">'+
					'<span class="clock"></span>'+
					'<a href="#" class="btnFind" data-icon="grid" data-iconpos="notext">Locate</a>'+
					'<h2><span class="t">Menoon</span></h2>'+
				'</div>'+
				'<div data-role="content">'+
				'</div>'+
			'</div>'
		return $.extend($(html),this)
	},
	initialize: function(options) {
		this.api = options.d=="a"?
			new DummyApi():
			new ReittiopasApi("api/")

		this.stops = Stops.create()
		this.find("[data-role=content]").append(this.stops)
		this.stops.initialize(this.api)

		if(Locator.available) {
			this.locator = new Locator()
			this.locator.addEventListener("location",$.proxy(this._onLocationEvent,this))
			this.locator.locate()
			this.find(".btnFind")
				.click($.proxy(this._onLocateClick,this))
		} else {
			this.find(".btnFind").hide()
		}

		if(Map.available) {
			this.map = Map.create()
			this.after(this.map)
			this.map.initialize()
			this.map.bind("location",$.proxy(function(e){
				this.locator.setLocation(e.location)
			},this))
			this.find("h2")
//				.bind("touchstart touchend mouseup mousedown",function(){ $(this).parent().toggleClass("ui-bar-a").toggleClass("ui-bar-b") })
//				.click($.proxy(this._onMapClick,this))
		}

		this.page()
	},
	_onLocateClick: function(e) {
		this.find(".btnFind").toggleClass("ui-btn-active")
		this.locator.locate()
	},
	_onMapClick: function(e) {
		e.preventDefault()
		e.stopPropagation()
		$.mobile.changePage("#map","slide",false,false)
	},
	_onLocationEvent: function(e) {
		var display = $("h2 .t")
		switch(e.status) {
			case LocationEvent.PENDING:
				this.stops.clearStops()
				this.addClass("locating")
				display.text("Locating"+"...".substring(0,3-(e.retries)%4))
				break;
			case LocationEvent.SUCCESS:
				this.removeClass("locating")
				display.text(e.location.toReadableString())

				if(e.location.stamp==this.lastLocationStamp) return
				this.lastLocationStamp = e.location.stamp

				this.stops.showStops(e.location,200)
				if(this.map) this.map.setLocation(e.location)
				break;
			case LocationEvent.TIMEOUT:
				display.text("Unable to find position")
				break;
			case LocationEvent.UNAVAILABLE:
				display.text("Positioning not available")
				break;
			case LocationEvent.PERMISSION_DENIED:
				display.text("Positioning not allowed")
				break;
		}
	}
}
