var Map =	$.extend({},EventTarget,{

	// Public 
	initialize: function(options) {
		this.options = $.extend({
			position: { latitude: 60.1630215, longitude: 24.9283883 },
			radius: 200
		},options)
		// TODO: Do this prettier?
		var self = this
		this.parent().bind("resize",function(){
			console.log("resize")
			google.maps.event.trigger(self.map,"resize")
			if(self.circle) {
				self.map.setCenter(self.circle.getCenter())
			}
		})
		this._initializeMap()
		return this
	},
	setLocation: function(p) {
		this._focus(new google.maps.LatLng(p.latitude,p.longitude))
	},

	// Event handlers
	_mapClicked: function(e) {
		this._focus(e.latLng)
		this.trigger(
			new LocationEvent(new Location(e.latLng.lat(),e.latLng.lng()))
		)
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
	},
	_initializeMap: function() {
		this.map = new google.maps.Map(this.get(0),{
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
		var self = this
		google.maps.event.addListener(this.map,"click",function(e){
			self._mapClicked(e)
		})
	}
});

