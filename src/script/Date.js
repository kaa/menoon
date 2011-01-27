Date.prototype.subtract = function(b) {
	var delta = this.getTime()-b.getTime()
	return new Date(0,0,0,delta/1000/60/60,(delta/1000/60)%60,(delta/1000)%60)
}
Date.prototype.subtractNow = function(b) { return this.subtract(new Date()) }
Date.prototype.totalMinutes = function(){
	return this.getHours()*60+this.getMinutes()
}
Date.prototype.toReadableTime = function() {
	if(this.getHours()>0) {
		return this.getHours()+"h "+this.getMinutes()+"min"
	} else {
		return this.getMinutes()+"min"
	}
}
