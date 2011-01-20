function Location(latitude,longitude,stamp) {
	this.latitude = latitude
	this.longitude = longitude
	if(stamp) {
		this.stamp = stamp
	} else {
		this.stamp = Location.counter++
	}
}
Location.counter = 0
$.extend(Location.prototype,{
	addGeocodingResult: function(result) {
		if($.isArray(result)) {
			for(var i=0;i<result.length;i++) {
				this.addGeocodingResult(result[i])
			}
		} else if(result.address_components) {
			this.addGeocodingResult(result.address_components)
		} else if($.inArray("street_number",result.types)>=0) {
			this.number = this.number||result.short_name
		} else if($.inArray("route",result.types)>=0) {
			this.street = this.steet||result.long_name
		} else if($.inArray("locality",result.types)>=0) {
			this.city = this.city||result.long_name
		} else if($.inArray("administrative_area_level_2",result.types)>=0) {
			this.area = this.area||result.long_name
		} else if($.inArray("country",result.types)>=0) {
			this.country = this.country||result.long_name
		}
	},
	toReadableString: function() {
		if(this.street) {
			return this.street+(this.number?" "+this.number:"")
		}
		if(this.city) {
			return this.city
		}	
		return this.latitude+" "+this.longitude
	}
});
