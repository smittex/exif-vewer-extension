var Class = {
  create : function() {
    var properties = arguments[0];
    function self() {
      this.initialize.apply(this, arguments);
    }
    for(var i in properties) {
      self.prototype[i] = properties[i];
    }
    if(!self.prototype.initialize) {
      self.prototype.initialize = function() {};
    }
    return self;
  }
};

var Histogram = Class.create({
  initialize : function(imageData, type) {
    this.width = imageData.width;
    this.height = imageData.height;
    this.data = imageData.data;
    this.bins = {r:[], g:[], b:[]};
    this.type = type || 'rgb';
    this.fillBins(256, 0);
  },
  fillBins : function(length, value) {
    for(var i=0; i<length; i++) {
      this.bins.r[i] = value;
      this.bins.g[i] = value;
      this.bins.b[i] = value;
    }
  },
  calculate : function() {
   // this.convertColor(this.type);
    var len = this.data.length;
	var k = Math.floor(len / 40000);
	k = (k>1)?k:1;
    for(var i=0; i<len; i+=4*k) {
      this.bins.r[this.data[i]]++;
      this.bins.g[this.data[i + 1]]++;
      this.bins.b[this.data[i + 2]]++;
    }
  },
  getMax : function() {
	
	function StdDev(ca){
		var i = 0, sum = 0,
			m = Mean(ca);
		for (i in ca){
			sum += Math.pow(ca[i]-m, 2)
		}
		return Math.floor( Math.sqrt(sum/ca.length) );
	}
	
	function Mean(ca){
		var sum=0, i=0;
		for (i=0; i<ca.length; i++){
			sum += ca[i];
		}
		return Math.round(sum/ca.length);
	}
	function Median(ca){
		var tmp = ca.sort(function(a,b){return a-b;});
		for(var i in tmp){
			if(!tmp[i]){
				tmp.splice(i, 1);
			}
		}
		return Math.round((tmp[Math.round(tmp.length/2)] + tmp[Math.round(tmp.length/2)+1])/2) || Mean(tmp);
	}
	var ca = [];
	for(var i=0; i<256; i++)
		ca[i] = Math.round((this.bins.r[i]+ this.bins.g[i] + this.bins.b[i])/3);
	//postMessage([Mean(ca), Median(ca), (1+  Mean(ca)/Median(ca))*StdDev(ca)]);
	var max = Mean(ca) + Median(ca) + (1+  Mean(ca)/Median(ca))*StdDev(ca);
    return max;
  },
  normalize : function() {
    for(var ch in this.bins) {
      for(var i=0; i<256; i++) {
        this.bins[ch][i] = Math.round((
			((i>0)? this.bins[ch][i-1] :  this.bins[ch][i]) + 
			this.bins[ch][i] + 
			((i<255)? this.bins[ch][i+1] :  this.bins[ch][i])
		)/3);
      }
    }
  }
});

self.addEventListener('message', function(e) {
  //var imageData = JSON.parse(e.data);
  var hist = new Histogram(e.data.image[0]);
  hist.calculate();
  hist.bins.max = hist.getMax();
  hist.normalize();
  postMessage(hist.bins);
}, false);

self.addEventListener('error', function(e) {
  postMessage(e);
}, false);