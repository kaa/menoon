function ReittiopasApi(apiUrl,apiUser,apiPass) {
	this.apiUrl = apiUrl
}
ReittiopasApi.prototype.findStops = function(position,radius,success,error) {
	$.ajax({ 
		url: this.apiUrl,
		data: {
			"closest_stops": "1",
			"lat": position.latitude,
			"lon": position.longitude, 
			"radius": radius
		}, 
		success: function(data) {
			success($.makeArray($(data)
				.find("[code]")
				.map(function(i,e){ 
					return {
						code: e.getAttribute("code"),
						lat: Number(e.getAttribute("lat")),
						lng: Number(e.getAttribute("lon")),
						distance: Number(e.getAttribute("dist"))
					}
				})
			))
		},
		error: function(request,status) {
			Log.error("Unable to retrieve stops, "+request.responseText);
			console.log("Details", status, request.responseText)
		}
	});
}
ReittiopasApi.prototype.getSchedule = function(stop,success,error) {
	$.ajax({
		url: this.apiUrl, 
		data: { "stop": stop.code }, 
		success: function(data) {
			var lines = data.split("\n")
			var header = lines[0].split("|")
			stop.name = header[1]
			stop.address = header[2]
			stop.city = header[3]
			stop.schedule = lines
				.slice(1,lines.length-1)
				.map(ReittiopasApi.parseScheduleLine)
			success(stop)
		},
		error: function(request,status) {
			Log.error("Unable to retrieve schedule for stop "+code);
			console.log("Details", status, request.responseText)
		}
	})
}
ReittiopasApi.parseScheduleLine = function(line) {
	line = line.split("|")
	return {
		time: ReittiopasApi.parseTime(line[0]),
		line: line[1], code: line[3],
		destination: line[2].replace(/(\w)?\(/, function($0,$1){return $1?$1+" (":$0})
	}
}
ReittiopasApi.parseTime = function(time) {
	var ms = new Date().getTime()-new Date().getTimezoneOffset()*60*1000
	ms = ms-ms%86400000;
	if(time.length==3) {
		ms += parseInt(time.substring(0,1))*60*60*1000 +
					parseInt(time.substring(1,3))*60*1000
	} else {
		ms += parseInt(time.substring(0,2))*60*60*1000 +
					parseInt(time.substring(2,4))*60*1000
	}
	return new Date(ms+new Date().getTimezoneOffset()*60*1000)
}
