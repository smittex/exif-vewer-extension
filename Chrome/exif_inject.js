var dialog;
function exif_inject(data){
	var content = $("<div />").append(
			$("<div />").addClass("ExifViewer").attr("img", data['src']).append(
				$("<div />").addClass("ExifVewerTabData").exif(data['data'], data['gps'])
			)
		),dialog = content.dialog({
			"minWidth" : 450,
			"show": "fade",
			"hide": "fade",
			"position": "center",
			"resizable": false,
			"title": chrome.i18n.getMessage("dialogTitle"),
			"closeOnEscape": true,
			"closeText": 'hide',
			"buttons": [{
				text: chrome.i18n.getMessage("dialogCopyToClipboard"),
				disabled: (Object['keys'](data['data']).length==0),
				click: function(){
					chrome.extension.sendRequest({
						'action' : 'copyToClipboard',
						'value': $(this).find(".ExifVewerTabData tr:visible").map(function(){
									return this.childNodes[0].innerText + ": " + this.childNodes[1].innerText ;
								}).get().join("\n")
					});
				}
			}, {
					text: chrome.i18n.getMessage("dialogExpand"),
					disabled: (Object['keys'](data['data']).length==0),
					click: function(){
						if($(this).find(".exifHiddenRow").is(":visible")){
							$(this).find(".exifHiddenRow").hide();
							$(this).parent(".exif-dialog").find("#ExifExpand").button("option", "label", chrome.i18n.getMessage("dialogExpand"));
						} else {
							$(this).css({'min-height': $(this).height() + "px"})
							$(this).find(".exifHiddenRow").show();
							$(this).parent(".exif-dialog").find("#ExifExpand").button("option", "label", chrome.i18n.getMessage("dialogCollapse"));
						}
					},
					id: "ExifExpand"
			},/* {
				text: chrome.i18n.getMessage("dialogConfigure"),
				click: function() { window.open(chrome.extension.getURL("options.html"), "_tab"); }
			}, */{
				text: chrome.i18n.getMessage("dialogClose"),
				click: function() { $(this).dialog("close");}
			}]
		});
		
		dialog.prev("div.exif-dialog-titlebar").prepend(
			$("<img />").attr("src", "chrome-extension://lplmljfembbkocngnlkkdgabpnfokmnl/camera_blue-16.png").css({
				"float":"left",
				"padding-right": "5px"
			})
		).parent(".exif-dialog").css({
			"direction": "ltr"
		});
		
		if(document.location.protocol == 'http:'){
			dialog.parent(".exif-dialog").children(".exif-dialog-buttonpane").prepend(
				$("<div style='float:left;line-height:38px;padding:8px 0 0 0;'>")
					.append('<a href="https://twitter.com/share" class="twitter-share-button" data-url="'+data.src+'" data-count="horizontal">Tweet</a><script type="text/javascript" src="https://platform.twitter.com/widgets.js"></script>')
					.append('<iframe src="https://www.facebook.com/plugins/like.php?href='+data.src+'&amp;layout=button_count&amp;show_faces=true&amp;width=50&amp;action=like&amp;font=arial&amp;colorscheme=light&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:110px; height:21px;" allowTransparency="true"></iframe>')
			);
		}
		
		var titlebar = content.parent(".exif-dialog").find(".exif-dialog-titlebar"),
			h = $('<a href="#"/>').addClass("exif-dialog-titlebar-heart exif-corner-top").attr("role",
				"button").hover(function () {
					h.addClass("exif-state-hover")
				}, function () {
					h.removeClass("exif-state-hover")
				}).focus(function () {
					h.addClass("exif-state-focus")
				}).blur(function () {
					h.removeClass("exif-state-focus")
				}).click(function (i) {
					window.open("https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YHWF9X2ETGJ4W", "_tab");
					return false
				}).append(
					$("<span />").addClass("exif-icon exif-icon-heart")
				)
				.appendTo(titlebar),
			w =  $('<a href="#"/>').addClass("exif-dialog-titlebar-wrench exif-corner-top").attr("role",
				"button").hover(function () {
					w.addClass("exif-state-hover")
				}, function () {
					w.removeClass("exif-state-hover")
				}).focus(function () {
					w.addClass("exif-state-focus")
				}).blur(function () {
					w.removeClass("exif-state-focus")
				}).click(function (i) {
					window.open(chrome.extension.getURL("options.html"), "_tab");
					return false
				}).append(
					$("<span />").addClass("exif-icon exif-icon-wrench")
				)
				.appendTo(titlebar);
			 
		if(!content.find("tr.exifVisibleRow").length){
			content.parent(".exif-dialog").find("#ExifExpand").click();
		}
}

chrome.extension.onRequest.addListener(	function (request, sender, callback) {
	if(request['action'] == 'showExif'){
		exif_inject(request.data);
	}
});

var re = {
  PHOTO_PAGE: /^https?:\/\/[^\/]*\bflickr\.com\/photos\/[^\/]+\/(\d+)/i
};

function injectOverlay(img, data, gps){
	var position = img.offset(),
		size = {
			width: img.outerWidth(),
			height: img.outerHeight()
		};
	$("<span />")
		.addClass('overlayContainer')
		.click(function(e){
			exif_inject(data);
			e.stopPropagation();
			e.preventDefault();
		})
		.css({
			'top': position['top'] + size.height - 22,
			'left': position['left'] + size.width - 22
		})
		.appendTo(document.documentElement)
		.hover(function(){
			$(this).animate({'opacity': 1}, 300)
		}, function(){
			$(this).animate({'opacity': .5}, 300)
		});
}

if(re.PHOTO_PAGE.test(location.href)){
	chrome.extension.sendRequest({
		'action' : 'checkOverlayEnabled'
	}, function(){
		chrome.extension.sendRequest({
			'action': 'checkFlikrExif',
			'id': page.getPhotoId()
		}, function(data){
			var d = $.extend(data, {'src': page.getPhotoUrl()});
			injectOverlay($("div.photo-div img"), d);
		})
	});
} else {
	chrome.extension.sendRequest({
		'action' : 'checkOverlayEnabled'
	}, function(){
		$("img:visible").each(function(){
			var img = $(this);
			if(img.height() > 110 && img.width() > 110){
				chrome.extension.sendRequest({
					'action': 'checkExif',
					'src': this.src
				}, function(data){
					if(Object['keys'](data.data).length)
						injectOverlay(img, data);
				})
			}
		});
	});
}

(function( $ ){
		function float2exposure(ex){
			if(ex.toString().indexOf(".")>0){
				var f = ex.toString().split(".")[1];
				return "1/" + Math.floor(Math.pow(10, f.length) / parseInt(f.replace(/^0*/, ""))).toString();
			} else {
				return ex;
			}
		}
		function prettyPrint(name, tag){
			
			if(name == "ExposureTime"){
				return float2exposure(tag.data);
			} else {
				return tag.data + (tag.dim?tag.dim:'');
			}
		}
		function gpsFrame(gps){
			return $("<iframe />")
				.css("width", "100%")
				.css("min-height", "400px")
				.css("border", "1px solid #cccccc")
				.attr("src","http://maps.google.com/maps?q="+gps['lat']+","+gps['lng']+"&ll="+gps['lat']+","+gps['lng']+"&output=embed&z=8&t=h");			
		}
		
		var table, methods = {
			init : function( data, gps ) {
				return this.each(function(){
				
					var parent = null,
						table = $("<table />").attr("width", "100%").addClass("exifTable");
					if(gps && gps.lat && gps.lng) {
						parent = $("<div />").append(
							$("<ul />").append(
								$("<li />").append($("<a/>").text(chrome.i18n.getMessage("dialogTitle")).attr("href","#exifDataTab"))
							).append(
								$("<li />").append($("<a/>").text(chrome.i18n.getMessage("dialogTabGeolocation")).attr("href","#exifGpsTab"))
							)
						).append(
							$("<div />").attr('id', 'exifDataTab').append(table)
						).append(
							$("<div />").attr('id', 'exifGpsTab').append(gpsFrame(gps))
						).tabs()
					} else {
						parent = table;
					}
					
					table.append(
						$("<tr />").append(
							$("<td colspan=2 />").attr("id", "ExifViewerImages").css({
								'text-align': 'center !important'
							}).addClass("exifTd")
						).hide()
					)
					
					if(Object['keys'](data).length){
						console.log(data);
						$.each(data, function(name, tag){
							table.append(
								$("<tr>").append(
									$("<td>").addClass("exifTd").text(tag['label'])
								).append(
									$("<td>").addClass("exifTd").text((typeof tag['data'] == 'object')?tag['data'].length:prettyPrint(name, tag))
								).addClass(tag['visible']?"exifVisibleRow":"exifHiddenRow")
							);
						});
						
						var imgOpt = {
							"Model": {prefix: "photo camera: ", site: 'amazon.com' },
							"LensModel": {prefix: "photo lens: ", site: 'amazon.com' },
							"Make": {prefix: "logo: "},
						};
						chrome.extension.sendRequest({
							'action' : 'checkShowCameraImage'
						}, function(){
							$.each(imgOpt, function(name, param){
								if(data[name]){
									$.ajax({
										url: 'https://ajax.googleapis.com/ajax/services/search/images',
										data: {
											rsz: 1,
											q: param.prefix + data[name]['data'],
											imgsz: 'small',
											context: 0,
											num: 1,
											as_sitesearch: param.site?param.site:'',
											//imgtype: 'photo'
											v: '1.0'
										},
										dataType: 'json',
										success: function(resp){
											if(resp.responseData.results.length){
												$("#ExifViewerImages", table).append(
													$("<img />").attr("src", resp.responseData.results[0].tbUrl).click(function(){
														window.open(resp.responseData.results[0].originalContextUrl, "_tab");
													}).css({
														'display':'none',
														'vertical-align': 'top'
													}).attr("title", data[name]['data']).show('slow')
												).parent().show();
											}
										}
									});
								}
							});
						});						
						
					} else {

						parent.append(
							$("<div />").css({
								'color': '#000',
								'font-size': '22px',
								'text-align': 'center'
							}).text(chrome.i18n.getMessage("noEXIF"))
						)
					}

					$(this).data('exif', data).append(
						parent
					);

				});
			},
			visible: function(){
				return (table.find("tr.exifVisibleRow").length>0);
			}
		};

	$.fn.exif = function( method ) {
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || typeof method === 'string' || ! method ) {
			return methods.init.apply( this, arguments );
		} 
	}; 
})( jQuery );