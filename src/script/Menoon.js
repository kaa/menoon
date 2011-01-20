$(document).ready(function(){

	var queryString = new QueryString(window.location.search)
	new Log(queryString["v"])

	var pages = {}
	pages.main = $("#main")

	var i = 0
	var locator = new Locator()
	locator.addEventListener("location",function(e){
		var display = $("h2 .t")
		switch(e.status) {
			case LocationEvent.PENDING:
				display.text("Locating"+"...".substring(0,(i++)%4))
				break;
			case LocationEvent.SUCCESS:
				display.text(e.location.toReadableString())
				schedules.showStops(e.location,200)
				if(map) map.setLocation(e.location)
				break;
			case LocationEvent.TIMEOUT:
				display.text("Unable to find position")
				break;
			case LocationEvent.UNAVAILABLE:
				display.text("Positioning not available")
				break;
			case LocationEvent.PERMISSION_DENIED:
				display.text("Positioning not allowed")
				break;
		}
	});

	if(Locator.available) {
		pages.main.find(".btnFind")
			.click(function(){ 
				var that = $(this)
				if(that.attr("data-theme")=="a") {
					$(this)
						.removeClass("ui-btn-up-a")
						.removeClass("ui-btn-hover-b")
						.attr("data-theme","b")
				} else {
					$(this)
						.removeClass("ui-btn-up-b")
						.removeClass("ui-btn-hover-b")
						.attr("data-theme","a")
				}
				locator.locate() 
			})
	} else {
		pages.main.find(".btnFind").hide()
	}

	pages.map = $("#map").fixHeight()
	if(Map.available) {
		var map = $.extend(pages.map.find(".map"),Map).initialize()
			.bind("location",function(e) { locator.setLocation(e.location) })

		pages.main.find("h2")
			.click(function(){ $.mobile.changePage("#map","slidedown",false,false) })

		pages.map.find("[data-role=header] a")
			.click(function(){ console.log("boo"); $.mobile.changePage("#main","slide",true,false) })
	} else {
		pages.main.find(".btnMap").hide()
	}

	pages.main.page()
	$(document.body).append(pages.main,pages.map)

	var api = (queryString["d"]||"").indexOf("a")>-1?
		new DummyApi():new ReittiopasApi("api/")
		
	window.schedules = new Schedules(api,$("#stops"))
	locator.locate()

	var blink = 0
	setInterval(function(){
		$(".blink").toggleClass("on",(blink++)%2==0)
	},500)

	setInterval(function(){ 
		var now = new Date()
		$(".c").text(now.toTimeString().substring(0,9))
		if(now.getSeconds()==0) {
			$(".tick").trigger("tick")
		}
	},1000);

});