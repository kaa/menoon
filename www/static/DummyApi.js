function DummyApi() {
}
DummyApi.prototype.findStops = function(position,radius,success) {
	Log.verbose("Pretending to find stops near "+position.coords.latitude+","+position.coords.longitude+" in "+radius+" m radius")
	success([
		{ code: "1", distance: 100, lat: "21.2", lng: "63.4" },
		{ code: "2", distance: 120, lat: "21.3", lng: "63.2" }
	])
}
DummyApi.prototype.getSchedule = function(stop,success) {
	Log.verbose("Pretending to find schedule for stop "+stop.code)
	var time = new Date().getTime()
	stop.name = "Dummy "+stop.code
	stop.address = "Dummy street"
	stop.city = "Helsinki"
	stop.schedule = [
		{ time: new Date(time+2*60*1000), line: "metro", destination: "Dummy ville", code: "1006  2" },
		{ time: new Date(time+4*60*1000), line: "6", destination: "Dummy ville", code: "1006  2" },
		{ time: new Date(time+6*60*1000), line: "6", destination: "Dummy ville", code: "1006  2" }
	]
	success(stop)
}
