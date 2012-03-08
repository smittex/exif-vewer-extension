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
    this.convertColor(this.type);
    var len = this.data.length;
    for(var i=0; i<len; i+=4*10) {
      this.bins.r[this.data[i]]++;
      this.bins.g[this.data[i + 1]]++;
      this.bins.b[this.data[i + 2]]++;
    }
  },
  getMax : function() {
    var max = 0;
    for(var ch in this.bins) {
      for(var i=0; i<256; i++) {
        max = this.bins[ch][i] > max ? this.bins[ch][i] : max;
      }
    }
    return max;
  },
  normalize : function(factor) {
    for(var ch in this.bins) {
      for(var i=0; i<256; i++) {
        this.bins[ch][i] /= factor;
      }
    }
  },
  backProject : function() {
    // TODO
  },
  compare : function(hist, method) {
    // TODO
    switch(method) {
    case 'correl':
      break;
    case 'chisqr':
      break;
    case 'intersect':
      break;
    case 'bhattacharyya':
      break;
    default:
      break;
    }
  },
  convertColor : function(type) {
    // TODO
    switch(type) {
    case 'rgb':
      break;
    case 'gray':
      break;
    case 'hsv':
      break;
    default:
      break;
    }
  }
});

self.addEventListener('message', function(e) {
  //var imageData = JSON.parse(e.data);
  var hist = new Histogram(e.data.image[0]);
  hist.calculate();
  hist.bins.max = hist.getMax();
  postMessage(hist.bins);
}, false);

self.addEventListener('error', function(e) {
  postMessage(e);
}, false);