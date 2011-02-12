var Stop = {
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
			'<a href="#">'+
				'<h3>'+
					'<span class="name"></span> '+
					'<small>'+
						'<span class="address"></span> '+
						'<span class="dir"></span>'+
					'</small>'+
					'<span class="favorite"><span>Favorite</span></span>'+
				'</h3>'+
				'<div class="lines"></div>'+
				'<div class="imminent"></div>'+
			'</a>'
		)
		this.bind("tock",$.proxy(this._onTock,this))
		this.click($.proxy(this._titleClicked,this))
		this.find(".favorite")
			.toggleClass("selected",!!Preferences.items.favorites[this.stop.code])
			.click($.proxy(this._favoriteClicked,this))
		this.refresh()
		this.update()
	},
	_favoriteClicked: function(e) {
		e.preventDefault()
		e.stopPropagation()
		if(!!Preferences.items.favorites[this.stop.code]) {
			delete Preferences.items.favorites[this.stop.code]
			this.find(".favorite").removeClass("selected")
		} else {
			Preferences.items.favorites[this.stop.code] = true
			this.find(".favorite").addClass("selected")
		}
		Preferences.save()
		this.parent.refresh()
	},	
	_titleClicked: function(e) {
		e.preventDefault()
		e.stopPropagation()
		return
	},
	_onTock: function() {
		this._refreshImminent()
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
		Log.verbose("Update",this.stop,"for stop",this.stop.code,"with",(this.stop.schedule||[]).length,"entries")
		this.refresh()
	},
	_onScheduleError: function() {
		Log.error("Unable to retrieve schedule for stop",this.stop.code);
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
		this.parent.refresh()
	},

	_refreshImminent: function() {
		var rows = (this.stop.schedule||[])
			.filter(function(e){return e.time.getTime()>new Date().getTime()})
			.slice(0,2).map(function(entry){
				var time = entry.time.subtractNow()
				return (
					"<div>"+
						"<span class=\"time "+(time.totalMinutes()<2?"soon blink":(time.totalMinutes()>60?"long":""))+"\"><strong>"+time.toReadableTime()+"</strong></span> "+
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
