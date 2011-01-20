function LocationEvent(location,status) {
	this.type = "location"
	this.status = status
	this.location = location
}
LocationEvent.PENDING = 0
LocationEvent.SUCCESS = 1
LocationEvent.TIMEOUT = 2
LocationEvent.UNAVAILABLE = 3
LocationEvent.PERMISSION_DENIED = 4
