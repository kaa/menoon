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
