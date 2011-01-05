function Schedules(api,options) {
	this.api = api
	this.element = $("#results")
	this.elements = {}
	this.options = $.extend(options,this.defaults)
}
$.extend( Schedules.prototype, {
	defaults: {
		positionRetries: 0,
		positionTimeout: 1000,
		searchRadius: 200
	},
	show: function(fallbackPosition) {
		var that = this
		var positionRetries = this.options.positionRetries;
		var gl = navigator.geolocation
		if(!gl) {
			Log.warn("Geolocation service unavailable, using fallback")
			that.positionUpdated(fallbackPosition)
			return
		}
		Log.message("Requesting position");
		request();
		function request() {
			gl.getCurrentPosition(
				that.positionUpdated,
				error,{timeout:that.options.positionTimeout}
			)
		}
		function error(e) {
			if(e.code==e.TIMEOUT && --positionRetries>0) {
				Log.verbose("Retrying position request")
				request()
			} else if(fallbackPosition) {
				Log.message("Using fallback position")
				that.positionUpdated(fallbackPosition)
			} else {
				Log.error("Unable to get position")
			}
		}
	},
	positionUpdated: function(position) {
		$("#results").empty()
		this.elements = {}

		Log.message("At ",position.coords.latitude,"(lat)",position.coords.longitude+"(lng)")
		Log.verbose("Requesting stops");
		var that = this
		this.api.findStops(position,this.options.searchRadius,function(stops){
			that.receivedStops(stops)
		})
	},
	receivedStops: function(stops) {
		if(stops.length==0) {
			Log.message("No stops found within a",radius,"meter radius")
			return
		}
		Log.verbose("Requesting schedule(s) for",stops.length,"stop(s)")
		var that = this
		stops.map(function(stop){ 
			this.api.getSchedule(stop,function(){
				that.displayStop(stop)
			})
		})
	},
	displayStop: function(stop) {
		Log.verbose("Update for stop",stop.code," with ",stop.schedule.length,"entries")

		var element = this.getDisplayForStop(stop)

		// Hide stop if no scheudled departures
		if(stop.schedule.length==0) {
			element.remove()
			delete elements[stop.code]
			return
		}

		// Add class for each transport type
		var that = this
		stop.schedule.map(function(entry){ 
			element.addClass(that.typeFromLine(entry.line)) 
		})
		this.displayDetails(stop,element);
		this.displayDestinations(stop.schedule,element)
		this.displayImminent(stop.schedule,element)
		this.displaySchedule(stop.schedule,element)
	},
	getDisplayForStop: function(stop) {
		var element = this.elements[stop.code]
		if(!element) {
			element = this.createDisplayTemplate()
			this.elements[stop.code] = element
			this.element.append(element)
		}
		return element
	},
	displayDetails: function(stop,element) {
		var displayName = stop.name||"Unknown"
		var displayAddress = (stop.address||"?")+" in "+(stop.city||"?")
		var displayDistance = (stop.distance||"?")+"m"
		element.find("h3 .name").text(displayName)
		element.find("h3 .address").text(displayAddress)
		element.find("h3 .dir").text(displayDistance)
	},
	displayDestinations: function(schedule,element) {
		var destinations = {}
		schedule.map(function(entry){
			var d = destinations[entry.destination]||{}
			d[entry.line] = true
			destinations[entry.destination] = d
		})
		var list = element.find(".lines span").empty()
		var destinationSpacer = "";
		$.each(destinations,function(destination,lines){
			list.append(destinationSpacer)
			destinationSpacer = ", "
			var lineSpacer = "";
			var e = $("<strong>")
			e.append(destination+" (")
			$.each(lines,function(line){
				e.append(lineSpacer)
				lineSpacer = ", "
				e.append($("<span>").text(line))
			})
			e.append(")")
			list.append(e)
		})
	},
	displaySchedule: function(schedule,element) {
		var that = this
		var list = element.find(".schedule ul").empty()
		schedule
			.filter(function(e){return e.time.getTime()>new Date().getTime()})
			.slice(0,10)
			.map(function(entry) {
				list.append($("<li>").append(
					$("<strong>").text(entry.time.toTimeString().substring(0,5)),
					" "+that.typeFromLine(entry.line)+" ",
					$("<strong>").text(entry.line),
					" to ",
					$("<strong>").text(entry.destination)
				))
		})
	},
	displayImminent: function(schedule,element) {
		var that = this
		var list = element.find("ul.imminent").empty()
		schedule
			.filter(function(e){return e.time>new Date()})
			.slice(0,2)
			.map(function(entry){
				var delta = that.timeDiff(entry.time)
				delta = delta.getHours()*60+delta.getMinutes()
				list.append($(
					"<li><div>"+
						"<span class=\"time "+(delta>99?"long":"")+"\"><strong>"+delta+" min</strong></span> "+
						"<span class=\"departure\">No. "+entry.line+" at <em>"+entry.time.toTimeString().substring(0,5)+"</em></span>"+
						"<span class=\"line\">to "+entry.destination+"</span> "+
					"</div></li>"
				))
			})
	},
	createDisplayTemplate: function() {
		var template = $(
				"<div class=\"stop\">"+
					"<h3><span class=\"name\">Unknown</span> <small>"+
						"<span class=\"address\"></span> "+
						"<span class=\"dir\"></span>"+
					"</small></h3>"+
					"<p class=\"lines\">Lines: <span>?</span></p>"+
					"<ul class=\"imminent\"></ul>"+
					"<div class=\"schedule\"><ul></ul></div>"+
				"</div>")
			template.find(".schedule ul").hide()
			template.find(".imminent").click(function(){template.find(".schedule ul").slideToggle("fast")});
			return template;
	},
	typeFromLine: function(line) {
		if(line=="metro") {
			return "metro"
		} else if(line=="lautta") {
			return "ferry"
		} else if(line.match(/^[a-zA-Z]$/)) {
			return "train"
		} else if(line.match(/^\d$/)) {
			return "tram"
		} else {
			return "bus"
		}
	},
	timeDiff: function(a,b) {
		var delta = a.getTime()-(b||new Date()).getTime()
		return new Date(0,0,0,delta/1000/60/60,(delta/1000/60)%60,(delta/1000)%60)
	}
})

