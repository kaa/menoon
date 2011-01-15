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
