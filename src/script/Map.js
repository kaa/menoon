var Map = {
	available: window.google && window.google.maps,
	create: function(options) {
		var html = 		
			'<div data-role="page" id="map">'+
				'<div data-role="header">'+
					'<a href="#" data-icon="arrow-l">Return</a>'+
					'<span class="clock"></span>'+
					'<h2><span class="t">Menoon</span></h2>'+
				'</div>'+
				'<div data-role="content">'+
				'</div>'+
			'</div>'
		return $.extend($(html),this)
	},
	initialize: function(options) {
		this.options = $.extend({
			position: { latitude: 60.1630215, longitude: 24.9283883 },
			radius: 200
		},options)

		this.page()
		this.bind("fixheight",$.proxy(this._onResize,this))
		this.fixHeight()

		this.find("[data-role=header] a")
			.click($.proxy(this._onCloseClick,this))

		this.map = new google.maps.Map(this.find("[data-role=content]").get(0),{
			disableDoubleClickZoom: true,
			scaleControl: false, zoomControl: true,
			mapTypeControl: false,
			streetViewControl: false,
			zoom: 15, panControl: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: new google.maps.LatLng(
				this.options.position.latitude,
				this.options.position.longitude
			)
		})
		google.maps.event.addListener(this.map,"dblclick",$.proxy(this._onMapDblClick,this))
		google.maps.event.addListener(this.map,"click",$.proxy(this._onMapClick,this))
	},	
	_onCloseClick: function() {
		$.mobile.changePage("#stops","slide",true,false)
	},
	_onResize: function(){
		google.maps.event.trigger(this.map,"resize")
		if(this.circle) {
			this.map.setCenter(this.circle.getCenter())
		}
	},
	_onMapClick: function(e) {
		this._focus(e.latLng)
		this.trigger(
			new LocationEvent(new Location(e.latLng.lat(),e.latLng.lng()),Location.SUCCESS)
		)
	},
	_onMapDblClick: function(e) {
		this._focus(e.latLng)
		this.trigger(
			new LocationEvent(new Location(e.latLng.lat(),e.latLng.lng()),Location.SUCCESS)
		)
		$.mobile.changePage("#schedules","slide",true,false)
	},

	setLocation: function(p) {
		this._focus(new google.maps.LatLng(p.latitude,p.longitude))
	},

	// Private
	_focus: function(position) {
		var circle = this.circle
		if(!circle) {
			this.circle = circle = new google.maps.Circle({ 
				map: this.map, strokeWeight: 1, strokeOpacity: 0.5 
			})
		}
		circle.setCenter(position)
		circle.setRadius(this.options.radius)
		this.map.panTo(position)
	}
};
