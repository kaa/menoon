function DummyApi() {
}
DummyApi.prototype.findStops = function(position,radius,success) {
	Log.verbose("Pretending to find stops near "+position.latitude+","+position.longitude+" in "+radius+" m radius")
	success([
		{ code: "1", distance: 100, lat: "21.2", lng: "63.4" },
		{ code: "2", distance: 120, lat: "21.3", lng: "63.2" },
		{ code: "3", distance: 150, lat: "21.3", lng: "63.2" },
		{ code: "4", distance: 175, lat: "21.3", lng: "63.2" },
		{ code: "5", distance: 176, lat: "21.3", lng: "63.2" }
	])
}
DummyApi.prototype.getSchedule = function(stop,success) {
	Log.verbose("Pretending to find schedule for stop "+stop.code)
	var time = new Date().getTime()
	var stops = {
		"1": {
			"code": "1",
			"name": "Dummy metro",
			"address": "Metro street 1",
			"city": "Helsinki",
			"schedule": [
				{ time: new Date(time+1*60*1000), line: "metro", destination: "Dummy ville", code: "1006  2" },
				{ time: new Date(time+4*60*1000), line: "metro", destination: "Dummy town", code: "1006  2" },
				{ time: new Date(time+7*60*1000), line: "metro", destination: "Dummy ville", code: "1006  2" },
				{ time: new Date(time+9*60*1000), line: "metro", destination: "Dummy town", code: "1006  2" }
			]
		},
		"2": {
			"code": "2",
			"name": "Dummy tram stop",
			"address": "Tram street 1",
			"city": "Helsinki",
			"schedule": [
				{ time: new Date(time+4*60*1000), line: "6", destination: "Dummy street", code: "1006  2" },
				{ time: new Date(time+14*60*1000), line: "6", destination: "Dummy street", code: "1006  2" },
				{ time: new Date(time+24*60*1000), line: "6", destination: "Dummy street", code: "1006  2" }
			]
		},
		"3": {
			"code": "3",
			"name": "Dummy bus",
			"address": "Bus street 1",
			"city": "Helsinki",
			"schedule": [
				{ time: new Date(time+4*60*1000), line: "20", destination: "Dummy ville", code: "1006  2" },
				{ time: new Date(time+5*60*1000), line: "20T", destination: "Dummy ville", code: "1006  2" }
			]
		},
		"4": {
			"code": "4",
			"name": "Dummy train",
			"address": "Trainstation street 2",
			"city": "Helsinki",
			"schedule": [
				{ time: new Date(time+4*60*1000), line: "A", destination: "Dummy ville", code: "1006  2" },
				{ time: new Date(time+5*60*1000), line: "B", destination: "Dummy ville", code: "1006  2" }
			]
		},
		"5": {
			"code": "5",
			"name": "Dummy ferry",
			"address": "Ferryterminal",
			"city": "Helsinki",
			"schedule": [
				{ time: new Date(time+3*60*1000), line: "lautta", destination: "Dummy ville", code: "1006  2" },
				{ time: new Date(time+15*60*1000), line: "lautta", destination: "Dummy ville", code: "1006  2" }
			]
		}
	}
	success($.extend(stop,stops[stop.code]))
}
