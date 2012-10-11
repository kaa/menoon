function Log() {
}
Log.initialize = function(level) {
	$.jGrowl.defaults.closer = false
	$.jGrowl.defaults.closeTemplate = ""
	Log.level = level||1;
}
Log.error = function() {
	var message = Array.prototype.slice.call(arguments).join(" ")
	console.log(message)
	if(Log.level<1) return
	$.jGrowl(message,{theme:"error"})
}
Log.warn = function() {
	var message = Array.prototype.slice.call(arguments).join(" ")
	console.log(message)
	if(Log.level<2) return
	$.jGrowl(message,{theme:"warn"})
}
Log.message = function() {
	var message = Array.prototype.slice.call(arguments).join(" ")
	console.log(message)
	if(Log.level<3) return
	$.jGrowl(message,{theme:"message"})
}
Log.verbose = function() {
	var message = Array.prototype.slice.call(arguments).join(" ")
	console.log(message)
	if(Log.level<4) return
	$.jGrowl(message,{theme:"verbose"})
}
