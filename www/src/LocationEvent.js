function LocationEvent(location,status) {
	this.type = "location"
	this.status = status||this.SUCCESS
	this.location = location
}
$.extend(LocationEvent.prototype,{
	SUCCESS: 1,
	TIMEOUT: 2,
	UNAVAILABLE: 3,
	PERMISSION_DENIED: 4
});
