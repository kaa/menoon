function Stop() {
	this.element = $(
		'<li class="stop loading">'+
		'</li>')
	var that = this
	this.element
		.find(".imminent")
		.bind("click",function(){ that.element.find(".schedule").toggleClass("open") })
		.bind("tick",function(){ that.display(this.stop) })
}
$.extend(Stop.prototype,{
	show: function(stop) {
		this.stop = stop
		this.display(this.stop)
	},
	display: function(stop) {
		if(!stop.schedule) {
			this.displayLoading(stop)
		} else if(stop.schedule.length==0) {
			this.displayNoService(stop)
		} else {
			this.displayActive(stop)
		}
	},
	displayLoading: function(stop) {
		this.element.attr("class","stop loading")
		this.element.empty().append('<h3>Loading...</h3>')
	},
	displayNoService: function(stop) {
		this.element.attr("class","stop no-service")
		this.element.empty().append('<h3>No service</h3>')
	},
	displayActive: function(stop) {
		this.element
			.attr("class","stop tick")
			.empty()
			.append(
				'<h3><a href="#">'+
					'<span class="name">'+stop.name+'</span> '+
					'<small>'+
						'<span class="address">'+stop.address+
						' <span class="dir">'+stop.distance+'m</span>'+
					'</small>'+
				'</a> <span class="toggle"><span>Hide</span></span></h3>'+
				this.renderDestinations(stop.schedule)+
				this.renderImminent(stop.schedule)+
				this.renderSchedule(stop.schedule))
		var that = this
		this.element.find(".toggle").click(function(e){
			e.preventDefault()
			e.stopPropagation()
			that.element.addClass("hidden")
			that.parent.refresh()
		})
		this.element.bind("tick",function() {
			that.element.find(".imminent").replaceWith(that.renderImminent(that.stop.schedule))
		})
		this.element.find("a").click(function(){
			if(that.element.hasClass("hidden")) {
				that.element.removeClass("hidden")
				that.parent.refresh()
				return
			}
			return
			var page
			$(document.body).append(page=$(
			'<div data-role="page" id="#stop">'+
				'<div data-role="header">'+
					'<a href="#" data-icon="arrow-l" data-back="true">Return</a>'+
					'<h2>Stop</h2>'+
				'</div>'+
				'<div data-role="content">'+
				'</div>'+
			'</div>').page())
			page.find("a").click(function(){
				$.mobile.changePage("#main","slide",true,false)
			})
			$.mobile.changePage(page,"slide",false)
		})

		var that = this
		stop.schedule.map(function(e){
			that.element.addClass(Stop.typeFromLine(e.line))
		})
	},
	renderDestinations: function(schedule) {
		var list = []
		var destinations = {}
		schedule.map(function(entry){
			var d = destinations[entry.destination]||{}
			d[entry.line] = true
			destinations[entry.destination] = d
		})
		$.each(destinations, function(destination,lines){
			var t = []
			$.each(lines,function(line){t.push("<span>"+line+"</span>") })
			list.push("<strong>"+destination+" ("+t.join(", ")+")</strong>")
		})
		return '<p class="lines">Lines: <span>'+list.join(", ")+'</span></p>'
	},
	renderImminent: function(schedule) {
		var rows = schedule
			.filter(function(e){return e.time>new Date()})
			.slice(0,2).map(function(entry){
				var delta = Stop.timeDiff(entry.time)
				delta = delta.getHours()*60+delta.getMinutes()
				return (
					"<div>"+
						"<span class=\"time "+(delta<2?"soon blink":(delta>99?"long":""))+"\"><strong>"+delta+" min</strong></span> "+
						"<span class=\"departure\">"+Stop.readableLine(entry.line)+" at <strong>"+entry.time.toTimeString().substring(0,5)+"</strong></span>"+
						"<span class=\"line\">to "+entry.destination+"</span> "+
					"</div>"
				)
			})
		return '<div class="imminent">'+rows.join("")+'</div>'
	},	
	renderSchedule: function(schedule) {
		var rows = schedule
			.filter(function(e){return e.time.getTime()>new Date().getTime()})
			.slice(0,10).map(function(entry) { 
				return (
					'<p>'+
						'<strong>'+
							entry.time.toTimeString().substring(0,5)+' '+
							Stop.typeFromLine(entry.line)+
						'</strong> '+
						'<strong>'+entry.line+'</strong> to '+
						'<strong>'+entry.destination+'</strong>'+
					'</p>')
			})
		return '<div class="schedule">'+rows.join(" ")+'</div>'
	}
})
Stop.timeDiff = function(a,b) {
	var delta = a.getTime()-(b||new Date()).getTime()
	return new Date(0,0,0,delta/1000/60/60,(delta/1000/60)%60,(delta/1000)%60)
}
Stop.readableLine = function(line) {
	switch(Stop.typeFromLine(line)) {
		case "metro":
			return "Metro"
		case "ferry":
			return "Ferry"
		case "train":
			return line+"-train"
		case "tram":
			return "Tram "+line
		case "bus":
			return "Bus "+line
		default:
			return line
	}
}
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
