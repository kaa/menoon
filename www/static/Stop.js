function Stop() {
	this.element = $(
		"<div class=\"stop\">"+
			"<h3><span class=\"name\">Unknown</span> <small>"+
				"<span class=\"address\"></span> "+
				"<span class=\"dir\"></span>"+
			"</small></h3>"+
			"<p class=\"lines\">Lines: <span>?</span></p>"+
			"<ul class=\"imminent\"></ul>"+
			"<div class=\"schedule\"><ul></ul></div>"+
		"</div>"
	)
	var that = this;
	this.element
		.find(".imminent")
		.click(function(){
			that.element.find(".schedule").toggleClass("open")
		});
}
$.extend(Stop.prototype,{
	show: function(stop) {
		// Hide stop if no scheudled departures
		if(stop.schedule.length==0) {
			this.element.hide()
			return
		}
		// Add class for each transport type
		this.displayDetails(stop);
		this.displayDestinations(stop.schedule)
		this.displayImminent(stop.schedule)
		this.displaySchedule(stop.schedule)
	},
	displayDetails: function(stop) {
		var that = this
		this.element.removeClass()
		this.element.addClass("stop")
		stop.schedule.map(function(entry){ 
			that.element.addClass(Stop.typeFromLine(entry.line)) 
		})
		this.element.find("h3 .name")
			.text(stop.name||"Unknown")
		this.element.find("h3 .address")
			.text((stop.address||"?")+" in "+(stop.city||"?"))
		this.element.find("h3 .dir")
			.text((stop.distance||"?")+"m")
	},
	displayDestinations: function(schedule) {
		var destinations = {}
		schedule.map(function(entry){
			var d = destinations[entry.destination]||{}
			d[entry.line] = true
			destinations[entry.destination] = d
		})
		var list = this.element.find(".lines span").empty()
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
	displaySchedule: function(schedule) {
		var that = this
		var list = this.element.find(".schedule ul").empty()
		schedule
			.filter(function(e){return e.time.getTime()>new Date().getTime()})
			.slice(0,10)
			.map(function(entry) {
				list.append($("<li>").append(
					$("<strong>").text(entry.time.toTimeString().substring(0,5)),
					" "+Stop.typeFromLine(entry.line)+" ",
					$("<strong>").text(entry.line),
					" to ",
					$("<strong>").text(entry.destination)
				))
		})
	},
	displayImminent: function(schedule) {
		var that = this
		var list = this.element.find("ul.imminent").empty()
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
	timeDiff: function(a,b) {
		var delta = a.getTime()-(b||new Date()).getTime()
		return new Date(0,0,0,delta/1000/60/60,(delta/1000/60)%60,(delta/1000)%60)
	}
})
Stop.typeFromLine = function(line) {
	if(line=="metro") {
		return "metro"
	} else if(line=="lautta") {
		return "ferry"
	} else if(line.match(/^[a-zA-Z]$/)) {
		return "train"
	} else if(line.match(/^(\d[A-Z]?|10)$/)) {
		return "tram"
	} else {
		return "bus"
	}
}
