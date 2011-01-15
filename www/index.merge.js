/**
 * jGrowl 1.2.5
 *
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Written by Stan Lemon <stosh1985@gmail.com>
 * Last updated: 2009.12.15
 *
 * jGrowl is a jQuery plugin implementing unobtrusive userland notifications.  These 
 * notifications function similarly to the Growl Framework available for
 * Mac OS X (http://growl.info).
 *
 * To Do:
 * - Move library settings to containers and allow them to be changed per container
 *
 * Changes in 1.2.5
 * - Changed wrapper jGrowl's options usage to "o" instead of $.jGrowl.defaults
 * - Added themeState option to control 'highlight' or 'error' for jQuery UI
 * - Ammended some CSS to provide default positioning for nested usage.
 * - Changed some CSS to be prefixed with jGrowl- to prevent namespacing issues
 * - Added two new options - openDuration and closeDuration to allow 
 *   better control of notification open and close speeds, respectively 
 *   Patch contributed by Jesse Vincet.
 * - Added afterOpen callback.  Patch contributed by Russel Branca.
 *
 * Changes in 1.2.4
 * - Fixed IE bug with the close-all button
 * - Fixed IE bug with the filter CSS attribute (special thanks to gotwic)
 * - Update IE opacity CSS
 * - Changed font sizes to use "em", and only set the base style
 *
 * Changes in 1.2.3
 * - The callbacks no longer use the container as context, instead they use the actual notification
 * - The callbacks now receive the container as a parameter after the options parameter
 * - beforeOpen and beforeClose now check the return value, if it's false - the notification does
 *   not continue.  The open callback will also halt execution if it returns false.
 * - Fixed bug where containers would get confused
 * - Expanded the pause functionality to pause an entire container.
 *
 * Changes in 1.2.2
 * - Notification can now be theme rolled for jQuery UI, special thanks to Jeff Chan!
 *
 * Changes in 1.2.1
 * - Fixed instance where the interval would fire the close method multiple times.
 * - Added CSS to hide from print media
 * - Fixed issue with closer button when div { position: relative } is set
 * - Fixed leaking issue with multiple containers.  Special thanks to Matthew Hanlon!
 *
 * Changes in 1.2.0
 * - Added message pooling to limit the number of messages appearing at a given time.
 * - Closing a notification is now bound to the notification object and triggered by the close button.
 *
 * Changes in 1.1.2
 * - Added iPhone styled example
 * - Fixed possible IE7 bug when determining if the ie6 class shoudl be applied.
 * - Added template for the close button, so that it's content could be customized.
 *
 * Changes in 1.1.1
 * - Fixed CSS styling bug for ie6 caused by a mispelling
 * - Changes height restriction on default notifications to min-height
 * - Added skinned examples using a variety of images
 * - Added the ability to customize the content of the [close all] box
 * - Added jTweet, an example of using jGrowl + Twitter
 *
 * Changes in 1.1.0
 * - Multiple container and instances.
 * - Standard $.jGrowl() now wraps $.fn.jGrowl() by first establishing a generic jGrowl container.
 * - Instance methods of a jGrowl container can be called by $.fn.jGrowl(methodName)
 * - Added glue preferenced, which allows notifications to be inserted before or after nodes in the container
 * - Added new log callback which is called before anything is done for the notification
 * - Corner's attribute are now applied on an individual notification basis.
 *
 * Changes in 1.0.4
 * - Various CSS fixes so that jGrowl renders correctly in IE6.
 *
 * Changes in 1.0.3
 * - Fixed bug with options persisting across notifications
 * - Fixed theme application bug
 * - Simplified some selectors and manipulations.
 * - Added beforeOpen and beforeClose callbacks
 * - Reorganized some lines of code to be more readable
 * - Removed unnecessary this.defaults context
 * - If corners plugin is present, it's now customizable.
 * - Customizable open animation.
 * - Customizable close animation.
 * - Customizable animation easing.
 * - Added customizable positioning (top-left, top-right, bottom-left, bottom-right, center)
 *
 * Changes in 1.0.2
 * - All CSS styling is now external.
 * - Added a theme parameter which specifies a secondary class for styling, such
 *   that notifications can be customized in appearance on a per message basis.
 * - Notification life span is now customizable on a per message basis.
 * - Added the ability to disable the global closer, enabled by default.
 * - Added callbacks for when a notification is opened or closed.
 * - Added callback for the global closer.
 * - Customizable animation speed.
 * - jGrowl now set itself up and tears itself down.
 *
 * Changes in 1.0.1:
 * - Removed dependency on metadata plugin in favor of .data()
 * - Namespaced all events
 */
(function($) {

	/** jGrowl Wrapper - Establish a base jGrowl Container for compatibility with older releases. **/
	$.jGrowl = function( m , o ) {
		// To maintain compatibility with older version that only supported one instance we'll create the base container.
		if ( $('#jGrowl').size() == 0 ) 
			$('<div id="jGrowl"></div>').addClass( (o && o.position) ? o.position : $.jGrowl.defaults.position ).appendTo('body');

		// Create a notification on the container.
		$('#jGrowl').jGrowl(m,o);
	};


	/** Raise jGrowl Notification on a jGrowl Container **/
	$.fn.jGrowl = function( m , o ) {
		if ( $.isFunction(this.each) ) {
			var args = arguments;

			return this.each(function() {
				var self = this;

				/** Create a jGrowl Instance on the Container if it does not exist **/
				if ( $(this).data('jGrowl.instance') == undefined ) {
					$(this).data('jGrowl.instance', $.extend( new $.fn.jGrowl(), { notifications: [], element: null, interval: null } ));
					$(this).data('jGrowl.instance').startup( this );
				}

				/** Optionally call jGrowl instance methods, or just raise a normal notification **/
				if ( $.isFunction($(this).data('jGrowl.instance')[m]) ) {
					$(this).data('jGrowl.instance')[m].apply( $(this).data('jGrowl.instance') , $.makeArray(args).slice(1) );
				} else {
					$(this).data('jGrowl.instance').create( m , o );
				}
			});
		};
	};

	$.extend( $.fn.jGrowl.prototype , {

		/** Default JGrowl Settings **/
		defaults: {
			pool: 			0,
			header: 		'',
			group: 			'',
			sticky: 		false,
			position: 		'top-right',
			glue: 			'after',
			theme: 			'default',
			themeState: 	'highlight',
			corners: 		'10px',
			check: 			250,
			life: 			3000,
			closeDuration:  'normal',
			openDuration:   'normal',
			easing: 		'swing',
			closer: 		true,
			closeTemplate: '&times;',
			closerTemplate: '<div>[ close all ]</div>',
			log: 			function(e,m,o) {},
			beforeOpen: 	function(e,m,o) {},
			afterOpen: 		function(e,m,o) {},
			open: 			function(e,m,o) {},
			beforeClose: 	function(e,m,o) {},
			close: 			function(e,m,o) {},
			animateOpen: 	{
				opacity: 	'show'
			},
			animateClose: 	{
				opacity: 	'hide'
			}
		},
		
		notifications: [],
		
		/** jGrowl Container Node **/
		element: 	null,
	
		/** Interval Function **/
		interval:   null,
		
		/** Create a Notification **/
		create: 	function( message , o ) {
			var o = $.extend({}, this.defaults, o);

			/* To keep backward compatibility with 1.24 and earlier, honor 'speed' if the user has set it */
			if (typeof o.speed !== 'undefined') {
				o.openDuration = o.speed;
				o.closeDuration = o.speed;
			}

			this.notifications.push({ message: message , options: o });
			
			o.log.apply( this.element , [this.element,message,o] );
			this.update();
		},
		
		render: 		function( notification ) {
			var self = this;
			var message = notification.message;
			var o = notification.options;

			var notification = $(
				'<div class="jGrowl-notification ' + o.themeState + ' ui-corner-all' + 
				((o.group != undefined && o.group != '') ? ' ' + o.group : '') + '">' +
				'<div class="jGrowl-close">' + o.closeTemplate + '</div>' +
				'<div class="jGrowl-header">' + o.header + '</div>' +
				'<div class="jGrowl-message">' + message + '</div></div>'
			).data("jGrowl", o).addClass(o.theme).children('div.jGrowl-close').bind("click.jGrowl", function() {
				$(this).parent().trigger('jGrowl.close');
			}).parent();


			/** Notification Actions **/
			$(notification).bind("mouseover.jGrowl", function() {
				$('div.jGrowl-notification', self.element).data("jGrowl.pause", true);
			}).bind("mouseout.jGrowl", function() {
				$('div.jGrowl-notification', self.element).data("jGrowl.pause", false);
			}).bind('jGrowl.beforeOpen', function() {
				if ( o.beforeOpen.apply( notification , [notification,message,o,self.element] ) != false ) {
					$(this).trigger('jGrowl.open');
				}
			}).bind('jGrowl.open', function() {
				if ( o.open.apply( notification , [notification,message,o,self.element] ) != false ) {
					if ( o.glue == 'after' ) {
						$('div.jGrowl-notification:last', self.element).after(notification);
					} else {
						$('div.jGrowl-notification:first', self.element).before(notification);
					}
					
					$(this).animate(o.animateOpen, o.openDuration, o.easing, function() {
						// Fixes some anti-aliasing issues with IE filters.
						if ($.browser.msie && (parseInt($(this).css('opacity'), 10) === 1 || parseInt($(this).css('opacity'), 10) === 0))
							this.style.removeAttribute('filter');

						$(this).data("jGrowl").created = new Date();
						
						$(this).trigger('jGrowl.afterOpen');
					});
				}
			}).bind('jGrowl.afterOpen', function() {
				o.afterOpen.apply( notification , [notification,message,o,self.element] );
			}).bind('jGrowl.beforeClose', function() {
				if ( o.beforeClose.apply( notification , [notification,message,o,self.element] ) != false )
					$(this).trigger('jGrowl.close');
			}).bind('jGrowl.close', function() {
				// Pause the notification, lest during the course of animation another close event gets called.
				$(this).data('jGrowl.pause', true);
				$(this).animate(o.animateClose, o.closeDuration, o.easing, function() {
					$(this).remove();
					var close = o.close.apply( notification , [notification,message,o,self.element] );

					if ( $.isFunction(close) )
						close.apply( notification , [notification,message,o,self.element] );
				});
			}).trigger('jGrowl.beforeOpen');
		
			/** Optional Corners Plugin **/
			if ( o.corners != '' && $.fn.corner != undefined ) $(notification).corner( o.corners );

			/** Add a Global Closer if more than one notification exists **/
			if ( $('div.jGrowl-notification:parent', self.element).size() > 1 && 
				 $('div.jGrowl-closer', self.element).size() == 0 && this.defaults.closer != false ) {
				$(this.defaults.closerTemplate).addClass('jGrowl-closer ui-state-highlight ui-corner-all').addClass(this.defaults.theme)
					.appendTo(self.element).animate(this.defaults.animateOpen, this.defaults.speed, this.defaults.easing)
					.bind("click.jGrowl", function() {
						$(this).siblings().trigger("jGrowl.beforeClose");

						if ( $.isFunction( self.defaults.closer ) ) {
							self.defaults.closer.apply( $(this).parent()[0] , [$(this).parent()[0]] );
						}
					});
			};
		},

		/** Update the jGrowl Container, removing old jGrowl notifications **/
		update:	 function() {
			$(this.element).find('div.jGrowl-notification:parent').each( function() {
				if ( $(this).data("jGrowl") != undefined && $(this).data("jGrowl").created != undefined && 
					 ($(this).data("jGrowl").created.getTime() + parseInt($(this).data("jGrowl").life))  < (new Date()).getTime() && 
					 $(this).data("jGrowl").sticky != true && 
					 ($(this).data("jGrowl.pause") == undefined || $(this).data("jGrowl.pause") != true) ) {

					// Pause the notification, lest during the course of animation another close event gets called.
					$(this).trigger('jGrowl.beforeClose');
				}
			});

			if ( this.notifications.length > 0 && 
				 (this.defaults.pool == 0 || $(this.element).find('div.jGrowl-notification:parent').size() < this.defaults.pool) )
				this.render( this.notifications.shift() );

			if ( $(this.element).find('div.jGrowl-notification:parent').size() < 2 ) {
				$(this.element).find('div.jGrowl-closer').animate(this.defaults.animateClose, this.defaults.speed, this.defaults.easing, function() {
					$(this).remove();
				});
			}
		},

		/** Setup the jGrowl Notification Container **/
		startup:	function(e) {
			this.element = $(e).addClass('jGrowl').append('<div class="jGrowl-notification"></div>');
			this.interval = setInterval( function() { 
				$(e).data('jGrowl.instance').update(); 
			}, parseInt(this.defaults.check));
			
			if ($.browser.msie && parseInt($.browser.version) < 7 && !window["XMLHttpRequest"]) {
				$(this.element).addClass('ie6');
			}
		},

		/** Shutdown jGrowl, removing it and clearing the interval **/
		shutdown:   function() {
			$(this.element).removeClass('jGrowl').find('div.jGrowl-notification').remove();
			clearInterval( this.interval );
		},
		
		close: 	function() {
			$(this.element).find('div.jGrowl-notification').each(function(){
				$(this).trigger('jGrowl.beforeClose');
			});
		}
	});
	
	/** Reference the Defaults Object for compatibility with older versions of jGrowl **/
	$.jGrowl.defaults = $.fn.jGrowl.prototype.defaults;

})(jQuery);
(function($){
	$.fn.fixHeight = function() {
		this.bind("orientationchange resize pageshow ready", function(){
			scroll(0, 0);
			var content = $(this).find(".ui-content");
			var height = $(this).height() - 
				$(this).find(".ui-header").outerHeight() -
				$(this).find(".ui-footer").outerHeight() -
				(content.outerHeight()-content.height())
			content.height(height)
			var evt = jQuery.Event("resize")
			evt.stopPropagation()
			content.trigger(evt)
		})
		return this
	}
})(jQuery);

function QueryString(queryString) {
	var self = this
	queryString
		.replace(/^\?/,"")
		.split("&")
		.map(function(p){ 
			var pair =  p.split("=")
			self[pair[0]] = pair[1] })
}
var EventTarget = {
	addEventListener: function( type, listener, useCapture) {
		this.listeners = this.listeners||{}
		this.listeners[type] = this.listeners[type]||[]
		this.listeners[type].push(listener)
	},
	removeEventListener: function( type, listener, useCapture) {
		var listeners = this.listeners[type]
		if(!listeners) return
		for(var i=0; i<listeners.length; i++) {
			if(listeners[i]!=listener) continue
			delete listeners[i]
		}
	},
	dispatchEvent: function(evt) {
		evt.currentTarget = this;
		var listeners = (this.listeners||{})[evt.type];
		if(!listeners) return
		listeners.map(function(listener){listener(evt)})
	}
};

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
			Log.error("Unable to retrieve stops");
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
	var ms = new Date().getTime()
	ms = ms-(ms%86400000-new Date().getTimezoneOffset()*60*1000);
	if(time.length==3) {
		ms += parseInt(time.substring(0,1))*60*60*1000 +
					parseInt(time.substring(1,3))*60*1000
	} else {
		ms += parseInt(time.substring(0,2))*60*60*1000 +
					parseInt(time.substring(2,4))*60*1000
	}
	return new Date(ms)
}

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

function Location(latitude,longitude) {
	this.latitude = latitude
	this.longitude = longitude
}
$.extend(Location.prototype,{
	addGeocodingResult: function(result) {
		if($.isArray(result)) {
			for(var i=0;i<result.length;i++) {
				this.addGeocodingResult(result[i])
			}
		} else if(result.address_components) {
			this.addGeocodingResult(result.address_components)
		} else if($.inArray("street_number",result.types)>=0) {
			this.number = this.number||result.short_name
		} else if($.inArray("route",result.types)>=0) {
			this.street = this.steet||result.long_name
		} else if($.inArray("locality",result.types)>=0) {
			this.city = this.city||result.long_name
		} else if($.inArray("administrative_area_level_2",result.types)>=0) {
			this.area = this.area||result.long_name
		} else if($.inArray("country",result.types)>=0) {
			this.country = this.country||result.long_name
		}
	},
	toReadableString: function() {
		if(this.street) {
			return this.street+(this.number?" "+this.number:"")
		}
		if(this.city) {
			return this.city
		}	
		return this.latitude+" "+this.longitude
	}
});

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

function Log(level) {
	console.log(level)
	Log.level = level||1;
	$.jGrowl.defaults.closer = false
	$.jGrowl.defaults.closeTemplate = ""
}
Log.error = function() {
	if(Log.level<1) return
	console.log(arguments)
	$.jGrowl(Array.prototype.slice.call(arguments).join(" "),{theme:"error"})
}
Log.warn = function() {
	if(Log.level<2) return
	console.log(arguments)
	$.jGrowl(Array.prototype.slice.call(arguments).join(" "),{theme:"warn"})
}
Log.message = function() {
	if(Log.level<3) return
	console.log(arguments)
	$.jGrowl(Array.prototype.slice.call(arguments).join(" "),{theme:"message"})
}
Log.verbose = function() {
	if(Log.level<4) return
	console.log(arguments)
	$.jGrowl(Array.prototype.slice.call(arguments).join(" "),{theme:"verbose"})
}

function Stop() {
	this.element = $(
		'<li class="stop">'+
			'<h3><span class="name">Unknown</span> <small>'+
				'<span class="address"></span> '+
				'<span class="dir"></span>'+
			'</small></h3>'+
			'<p class="lines">Lines: <span><em>None</em></span></p>'+
			'<div class="imminent"></div>'+
			'<div class="schedule"></div>'+
		'</div>'
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
		var list = this.element.find(".imminent").empty()
		schedule
			.filter(function(e){return e.time>new Date()})
			.slice(0,2)
			.map(function(entry){
				var delta = that.timeDiff(entry.time)
				delta = delta.getHours()*60+delta.getMinutes()
				list.append($(
					"<div>"+
						"<span class=\"time "+(delta>99?"long":"")+"\"><strong>"+delta+" min</strong></span> "+
						"<span class=\"departure\">"+Stop.readableLine(entry.line)+" at <strong>"+entry.time.toTimeString().substring(0,5)+"</strong></span>"+
						"<span class=\"line\">to "+entry.destination+"</span> "+
					"</div>"
				))
			})
	},
	timeDiff: function(a,b) {
		var delta = a.getTime()-(b||new Date()).getTime()
		return new Date(0,0,0,delta/1000/60/60,(delta/1000/60)%60,(delta/1000)%60)
	}
})
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

var Map =	$.extend({},EventTarget,{

	// Public 
	initialize: function(options) {
		this.options = $.extend({
			position: { latitude: 60.1630215, longitude: 24.9283883 },
			radius: 200
		},options)
		// TODO: Do this prettier?
		var self = this
		this.parent().bind("resize",function(){
			console.log("resize")
			google.maps.event.trigger(self.map,"resize")
			if(self.circle) {
				self.map.setCenter(self.circle.getCenter())
			}
		})
		this._initializeMap()
		return this
	},
	setLocation: function(p) {
		this._focus(new google.maps.LatLng(p.latitude,p.longitude))
	},

	// Event handlers
	_mapClicked: function(e) {
		this._focus(e.latLng)
		this.trigger(
			new LocationEvent(new Location(e.latLng.lat(),e.latLng.lng()))
		)
	},

	// Private
	_focus: function(position) {
		var circle = this.circle
		if(!circle) {
			this.circle = circle = new google.maps.Circle({ 
				map: this.map, strokeWeight: 1, strokeOpacity: 0.5 
			})
		}
		circle.setCenter(position)
		circle.setRadius(this.options.radius)
		this.map.panTo(position)
	},
	_initializeMap: function() {
		this.map = new google.maps.Map(this.get(0),{
			disableDoubleClickZoom: true,
			scaleControl: false, zoomControl: true,
			mapTypeControl: false,
			streetViewControl: false,
			zoom: 15, panControl: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: new google.maps.LatLng(
				this.options.position.latitude,
				this.options.position.longitude
			)
		})
		var self = this
		google.maps.event.addListener(this.map,"click",function(e){
			self._mapClicked(e)
		})
	}
});


function Schedules(api,element,options) {
	this.api = api
	this.element = element||$('<div class="schedules">')
	this.displays = {}
	this.options = $.extend(options,this.defaults)
}
$.extend( Schedules.prototype, {
	defaults: {
		displayClass: Stop
	},
	showStops: function(position,radius) {
		Log.message("At ",position.latitude,"(lat)",position.longitude+"(lng)")
		Log.verbose("Requesting stops");
		this.element.empty()
		this.displays = {}
		var that = this
		this.api.findStops(
			position, radius,
			function(stops){
				that.updateStops(stops)
			}
		)
	},
	updateStops: function(stops) {
		if(stops.length==0) {
			Log.message("No stops found within a",this.options.searchRadius,"meter radius")
			return
		}
		Log.verbose("Requesting schedule(s) for",stops.length,"stop(s)")
		var that = this
		stops.map(function(stop){ 
			this.api.getSchedule(stop,function(){
				that.updateStop(stop)
				that.element.listview("refresh")
			})
		})
	},
	updateStop: function(stop) {
		Log.verbose("Update for stop",stop.code," with ",stop.schedule.length,"entries")
		var display = this.displays[stop.code]
		if(!display) {
			display = new this.options.displayClass()
			this.displays[stop.code] = display
			this.element.append(display.element)
		}
		display.show(stop)
	}
})
function Locator(display,options) {
	this.options = $.extend(options||{},this.defaults)
	this.display = display
}
$.extend(Locator.prototype, EventTarget, {
	defaults: {
		positionRetries: 12,
		positionTimeout: 500
	},
	locate: function(retries) {
		if(typeof(retries)=="undefined") {
			retries = this.options.positionRetries
		}
		if(!navigator.geolocation) {
			Log.warn("Geolocation service unavailable")
			this.display.text("Location not selected")
			return
		}
		if(retries<0) {
			Log.warn("Timeout while locating")
			this.display.text("Position not found")
			return;
		}
		Log.message("Locating ("+retries+") retries left)");
		this.display.text("Locating "+"...".substring(0,3-retries%3));
		var self = this
		navigator.geolocation.getCurrentPosition( 
			function(p) { self._located(p.coords) },
			function(e) { self._error(retries,e) },
			{ timeout:this.options.positionTimeout }
		)
	},
	setLocation: function(location,wasGeocoded) {
		this.dispatchEvent(new LocationEvent(location))
		if(wasGeocoded || !(google&&google.maps)) {
			this.display.text(location.toReadableString())
			return
		}
		var self = this
		new google.maps.Geocoder().geocode(
			{ location: new google.maps.LatLng(location.latitude,location.longitude) },
			function(result,status){ 
				if(!result) return
				location.addGeocodingResult(result) 
				self.setLocation(location,true)
			}
		)
	},
	_error: function(retries,e) {
		switch(e.code) {
			case e.TIMEOUT:
				Log.verbose("Positioning timeout, retrying")
				this.locate(retries-1)
				break;
			case e.POSITION_UNAVAILABLE:
				Log.error("Positioning unavailable")
				this.display.text("Select location")
				break;
			case e.PERMISSION_DENIED:
				Log.error("Positioning not allowed")
				this.display.text("Positioning not allowed")
				break;
		}
	},
	_located: function(p) {
		Log.verbose("Location received at "+p.latitude+","+p.longitude)
		var location = new Location(p.latitude,p.longitude)
		this.setLocation(location)
	}
});

