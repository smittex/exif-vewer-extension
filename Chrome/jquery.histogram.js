
(function( $ ){
  const colors = {
        'r':   ['#000', '#ff0000'],
        'g':   ['#000', '#00ff00'],
        'b':   ['#000', '#0000ff']
	};
  function drawHist(ctx, type, vals, maxCount, canvas) {
    var ctxStyle,
		discreetWidth = Math.round(canvas.width / 255),
    ctxStyle = 'fillStyle';
	ctx.globalAlpha = 0.9;
    ctx.fillStyle = colors[type][1];
    ctx.strokeStyle = colors[type][1];
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (var x, y, i = 0; i <= 255; i++) {
      if (!(i in vals)) {
        continue;
      }

      y = Math.round((vals[i]/maxCount)*canvas.height);
      x = Math.round((i/255)*canvas.width);

      ctx.lineTo(x, canvas.height - y);
    }
	  ctx.lineTo(x, canvas.height);
	  ctx.fill();
	  ctx.stroke();
	  ctx.closePath();
  };		
		
		
	function drawHistogram(ctx, bins, canvas) {
		drawHist(ctx, 'r', bins['r'], bins.max, canvas);
		drawHist(ctx, 'g', bins['g'], bins.max, canvas);
		drawHist(ctx, 'b', bins['b'], bins.max, canvas);
	}	
		
	var methods = {
		init : function( data ) {
			var node = this;
			chrome.extension.sendRequest({
				'action' : 'getHistogramData',
				'src': data.src
			}, function(data){
				return node.each(function(){
						var ctxHistogram = this.getContext('2d');
						//ctxHistogram.fillStyle = '#ffffff';
						//ctxHistogram.fillRect(0, 0, this.width, this.height);
						ctxHistogram.clearRect(0, 0, this.width, this.height);
						ctxHistogram.strokeStyle = '#000';
						ctxHistogram.globalCompositeOperation = 'lighter';
						drawHistogram(ctxHistogram, data, this);
						ctxHistogram.globalCompositeOperation = 'source-over';
				});
			});
			return node;
		}
	};

	$.fn.histogram = function( method ) {
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || typeof method === 'string' || ! method ) {
			return methods.init.apply( this, arguments );
		} 
	}; 
})( jQuery );
