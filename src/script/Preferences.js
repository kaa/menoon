function Preferences() {
}
Preferences.items = {}
Preferences.items.hidden = {}
Preferences.save = function() {
	$.each(Preferences.items,function(name,value){
		if(name=="hidden") {
			var t = []
			$.each(value,function(k,v){t.push(k)})
			value = t
		}
		if(!value) return
		document.cookie = "me."+name+"="+encodeURIComponent(value)+"; "+new Date(2020,1,1).toGMTString();
	})
}
Preferences.load = function() {
	document.cookie.split("; ")
		.filter(function(c){ c.substring(0,3)=="me."})
		.map(function(c){
			var name = c.substring(3,c.indexOf("="))
			var value = decodeURIComponent(c.substring(c.indexOf("=")+1))
			if(name=="hidden") {
				Preferences.items.hidden = {}
				value.split(" ").map(function(s){
					Preferences.items.hidden[s]=true
				})
			} else {
				Preferences.items[name] = value
			}
		})
}