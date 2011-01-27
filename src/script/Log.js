function Log() {
}
Log.initialize = function(level) {
	$.jGrowl.defaults.closer = false
	$.jGrowl.defaults.closeTemplate = ""
	Log.level = level||1;
}
Log.error = function() {
	console.log(arguments)
	if(Log.level<1) return
	$.jGrowl(Array.prototype.slice.call(arguments).join(" "),{theme:"error"})
}
Log.warn = function() {
	console.log(arguments)
	if(Log.level<2) return
	$.jGrowl(Array.prototype.slice.call(arguments).join(" "),{theme:"warn"})
}
Log.message = function() {
	console.log(arguments)
	if(Log.level<3) return
	$.jGrowl(Array.prototype.slice.call(arguments).join(" "),{theme:"message"})
}
Log.verbose = function() {
	console.log(arguments)
	if(Log.level<4) return
	$.jGrowl(Array.prototype.slice.call(arguments).join(" "),{theme:"verbose"})
}
