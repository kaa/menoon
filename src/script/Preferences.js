function Preferences() {
}
Preferences.items = {}
Preferences.items.favorites = {}
Preferences.save = function() {
	$.each(Preferences.items,function(name,value){
		if(name=="favorites") {
			var t = []
			$.each(value,function(k,v){t.push(k)})
			value = t.join(" ")
		}
		if(!value) return
		document.cookie = "me."+name+"="+encodeURIComponent(value)+"; "+new Date(2020,1,1).toGMTString();
	})
}
Preferences.load = function() {
	console.log("bo",document.cookie)
	document.cookie.split("; ")
		.filter(function(c){ return c.substring(0,3)=="me."})
		.map(function(c){
			var name = c.substring(3,c.indexOf("="))
			var value = decodeURIComponent(c.substring(c.indexOf("=")+1))
			if(name=="favorites") {
				Preferences.items.favorites = {}
				value.split(" ").map(function(s){
					Preferences.items.favorites[s]=true
				})
			} else {
				Preferences.items[name] = value
			}
		})
}