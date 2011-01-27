var StopBundle = {
	create: function(stops,parent,api) {
		var e = $.extend($('<li class="bundle">'),this)
		e.initialize(stops,parent,api)
		return e
	},
	initialize: function(stops,parent,api) {
		this.api = api
		this.parent = parent
		this.stops = stops
		this.append('<h3>'+this.stops.length+' more</h3>')
		this.bind("tap",$.proxy(this._onClicked,this))
	},
	_onClicked: function() {
		var unfold = this.stops.slice(0,10)
		Log.verbose("Unfolding",unfold.length,"bundled stops")
		unfold.map($.proxy(function(s){
			var stop = StopView.create(s,this.parent,this.api)
			this.before(stop)
		},this))
		this.stops = this.stops.slice(10)
		if(this.stops.length==0) {
			Log.verbose("Unfolded the last stop in bundle, dissolving")
			this.remove()
		}
		Log.verbose(this.stops.length," stops remain in bundle")
		this.find("h3").text(this.stops.length+' more')
		this.parent.refresh()
	}
}

var StopView = {
	create: function(stop,parent,api) {
		var e = $.extend($('<li class="stop">'),this)
		e.initialize(stop,parent,api)
		return e
	},
	initialize: function(stop,parent,api) {
		this.data("stop",stop)
		this.api = api
		this.parent = parent
		this.stop = stop
		this.attr("data-stopid",stop.code)
		this.append(
			'<h3>'+
				'<a href="#">'+
					'<span class="name"></span> '+
					'<small>'+
						'<span class="address"></span> '+
						'<span class="dir"></span>'+
					'</small>'+
				'</a> '+
				'<span class="hide"><span>Hide</span></span>'+
			'</h3>'+
			'<div class="lines"></div>'+
			'<div class="imminent"></div>'
		)
		this.bind("tock",$.proxy(this.refresh,this))
		this.find("h3 a").click($.proxy(this._titleClicked,this))
		this.find(".hide").click($.proxy(this._hideClicked,this))
		this.refresh()
		this.update()
	},
	_hideClicked: function(e) {
		e.preventDefault()
		e.stopPropagation()
		this.hide()
	},	
	_titleClicked: function(e) {
		e.preventDefault()
		e.stopPropagation()
		this.show()
		return
	},

	update: function(force) {
		if(!force && false) return
		this.api.getSchedule(
			this.stop,
			$.proxy(this._onScheduleLoaded,this),
			$.proxy(this._onScheduleError,this)
		)
	},
	_onScheduleLoaded: function() {
		Log.verbose("Update",stop,"for stop",stop.code,"with",(stop.schedule||[]).length,"entries")
		this.refresh()
	},
	_onScheduleError: function() {
		Log.error("Unable to retrieve schedule for stop",this.stop.code);
	},

	hide: function() {
		this.addClass("hidden")
		this.parent.refresh()
	},
	show: function() {
		this.removeClass("hidden")
		this.parent.refresh()
	},

	refresh: function() {
		this.removeClass("loading tick no-service tram metro train bus ferry")
		this.find(".name").text(this.stop.name||("#"+this.stop.code))
		this.find(".address").text(this.stop.address||"")
		this.find(".dir").text((this.stop.distance+"m")||"")
		this._refreshImminent()
		this._refreshDestinations()
		if(!this.stop.schedule) {
			this.addClass("loading")
		} else if(this.stop.schedule.length==0) {
			this.addClass("no-service")
		} else {
			this.addClass("tick")
			var that = this
			this.stop.schedule.map(function(e){
				that.addClass(e.line.toLineType())
			})
		}
	},

	_refreshImminent: function() {
		var rows = (this.stop.schedule||[])
			.filter(function(e){return e.time>new Date()})
			.slice(0,2).map(function(entry){
				var minutes = entry.time.subtractNow().totalMinutes()
				return (
					"<div>"+
						"<span class=\"time "+(minutes<2?"soon blink":(minutes>99?"long":""))+"\"><strong>"+minutes+" min</strong></span> "+
						"<span class=\"departure\">"+entry.line.toLineString()+" at <strong>"+entry.time.toTimeString().substring(0,5)+"</strong></span>"+
						"<span class=\"line\">to "+entry.destination+"</span> "+
					"</div>"
				)
			})
		this.find(".imminent").html(rows.join(""))
	},	
	_refreshDestinations: function() {
		this.find(".lines").empty()
		if(!this.stop.schedule) return
		var dests = {}
		this.stop.schedule.map(function(e){
			dests[e.destination] = dests[e.destination]||{}
			dests[e.destination][e.line] = true
		})
		var de = []
		$.each(dests,function(d,ls){
			var le = []
			$.each(ls,function(c) {
				le.push("<span>"+c.toLineString()+"</span>")
			})
			de.push("<strong>"+d+" "+le.join(", ")+"</strong>")
		})
		if(de.length>0) {
			this.find(".lines").html('Lines: '+de.join(", "))
		}
	},
	_parseDestinations: function(schedule) {
		if(!schedule) return []
		var destinations = []
		$.each(destinations, function(destination,lines){
			var l = []
			$.each(lines,function(line){l.push(line)})
			destinations.push([destination,l])
		})
		return destinations
	}
}
