function QueryString(queryString) {
	var self = this
	queryString
		.replace(/^\?/,"")
		.split("&")
		.map(function(p){ 
			var pair =  p.split("=")
			self[pair[0]] = pair[1] })
}