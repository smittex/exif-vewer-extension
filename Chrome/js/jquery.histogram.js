var histograms = {};
(function( $ ){
  var colors = {
        'r':   ['#000', '#ff0000'],
        'g':   ['#000', '#00ff00'],
        'b':   ['#000', '#0000ff']
	};
  function drawHist(ctx, type, vals, maxCount, canvas) {
    var ctxStyle,
		discreetWidth = Math.round(canvas.width / 255),
    ctxStyle = 'fillStyle';
	ctx.globalAlpha = .9;
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
		
	
	function drawBoard(context, bw, bh){
		for (var x = 0; x <= bw; x += 20) {
			context.moveTo(0.5 + x, 0);
			context.lineTo(0.5 + x, bh);
		}


		for (var x = 0; x <= bh; x += 20) {
			context.moveTo(0, 0.5 + x);
			context.lineTo(bw, 0.5 + x);
		}

		context.strokeStyle = "#eee";
		context.stroke();
	}
	
	function drawHistogram(ctx, bins, canvas, colors) {
		$.each(colors, function(i, c){
			drawHist(ctx, c, bins[c], bins.max, canvas);
		});
		//ctx.globalCompositeOperation = 'darker';
		//drawBoard(ctx, canvas.width, canvas.height)
	}
	
	function proceedHistogram(node, data, colors){
		return node.each(function(){
				var ctxHistogram = this.getContext('2d');
				ctxHistogram.clearRect(0, 0, this.width, this.height);
				ctxHistogram.strokeStyle = '#000';
				ctxHistogram.globalCompositeOperation = 'lighter';
				drawHistogram(ctxHistogram, data, this, colors);
				ctxHistogram.globalCompositeOperation = 'source-over';
		});	
	}
		
	var methods = {
		init : function( data ) {
			var node = this;
			if(histograms[data['src']]){
				proceedHistogram(node, histograms[data['src']], data['colors']||["r","g","b"]);
			} else {
				chrome.extension.sendRequest({
					'action' : 'getHistogramData',
					'src': data['src']
				}, function(hist){
					histograms[data['src']] = hist;
					return node.each(function(){
						proceedHistogram(node, hist, data['colors']||["r","g","b"]);
					});
				});
			}
			return node;
		}
	};

	$['fn']['histogram'] = function( method ) {
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || typeof method === 'string' || ! method ) {
			return methods.init.apply( this, arguments );
		} 
	}; 
})( jQuery );
