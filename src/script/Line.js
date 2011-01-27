String.prototype.toLineString = function() {
	switch(this.toLineType) {
		case "metro":
			return "Metro"
		case "ferry":
			return "Ferry"
		case "train":
			return this+"-train"
		case "tram":
			return "Tram "+this
		case "bus":
			return "Bus "+this
		default:
			return this
	}
}
String.prototype.toLineType = function() {
	if(this=="metro") {
		return "metro"
	} else if(this=="lautta") {
		return "ferry"
	} else if(this.match(/^[a-zA-Z]$/)) {
		return "train"
	} else if(this.match(/^(\d[A-Z]?|10)$/)) {
		return "tram"
	} else {
		return "bus"
	}
}
