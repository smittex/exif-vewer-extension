function EXIFInjection(){
	var dialog, 
		exifSettings;
		
	function constructor(){
		chrome.extension.onRequest.addListener(	function (request, sender, callback) {
			if(request['action'] == 'showExif'){
				exif_inject(request['data']);
			} else if(request['action'] == 'startExifProcessing'){
				$("img[src='"+request['data']+"']")['ajaxLoader']();
			}
		});
		
		chrome.extension.sendRequest({
			'action' : 'getSettings'
		}, function(settings){
			exifSettings = settings;
			if(exifSettings['overlayEnabled']){
				if (re.PHOTO_PAGE.test(location.href)){
					chrome.extension.sendRequest({
						'action': 'checkFlikrExif',
						'id': page.getPhotoId()
					}, function(data){
						var d = $.extend(data, {'src': page.getPhotoUrl()});
						injectOverlay($("div.photo-div img"), d);
					})
				} else {
					$("img:visible").each(function(){
						var img = $(this);
						if(img.height() >= 75 && img.width() >= 75){
							chrome.extension.sendRequest({
								'action': 'checkExif',
								'src': this.src
							}, function(data){
								if(Object['keys'](data['data']).length)
									injectOverlay(img, data);
							})
						}
					});
				}
			}
		});
		
	}
	
	
	function exif_inject(data){
		$("img[src='"+data.src+"']")['ajaxLoaderRemove']();
		var content, titlebar;
		
		function closeExif(){
			$("body").removeClass("ExifViewerBlur");
			$(".ExifViewer").css({
				'opacity': 0.5,
				'right': '-350px'
			});
			window.setTimeout(function(){
				$(".ExifViewer").remove();
				$(document.body).unbind("click", closeExif);
			}, 300);

		}
		
		if($(".ExifViewer").length){
			content = $(".ExifViewer > div.ExifVewerTabData").empty().exif(data, exifSettings);
		} else {
			content = $("<div />").appendTo(document.documentElement).addClass("ExifViewer").attr("img", data['src']).append(
				$("<div />").addClass("ExifViewer-titlebar").append(
					$("<img />").attr("src", chrome.extension.getURL("camera_blue-16.png")).css({
						"padding-right": "5px"
					})
				).append(
					$("<span />").append(chrome.i18n.getMessage("title"))
				).append(
					titlebar = $("<span />").addClass("exif-dialog-titlebar").css({
						"float": "right",
						"white-space": "nowrap"
					})
				)
			).append(
				$("<div />").addClass("ExifVewerTabData").exif(data, exifSettings)
			)
			
			$(".ExifViewer").css({
				'opacity': 0.95,
				'right': '0px'
			});
			$(document.body).bind("click", closeExif).addClass("ExifViewerBlur");
			
			titlebar.append(
				 $('<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YHWF9X2ETGJ4W" target="_tab"/>')
					.addClass("exif-dialog-titlebar-heart")
					.attr("role", "button")
					.append(
						$("<span />").addClass("exif-icon exif-icon-heart")
					)
			).append(
				$('<a href="'+chrome.extension.getURL("options.html")+'" target="_tab"/>')
					.addClass("exif-dialog-titlebar-wrench")
					.attr("role",	"button")
					.append(
						$("<span />").addClass("exif-icon exif-icon-wrench")
				)
			).append(
				$('<a href="#"/>')
					.addClass("exif-dialog-titlebar-alert")
					.attr("role", "button").click(function () {
						window.open("http://code.google.com/p/exif-vewer-extension/issues/entry?comment=" + 
							escape("Page URL: " + location.href + "\r\n" + 
							"Image URL: "+data['src'] + "\r\n")
							, "_tab");
						return false
					}).append(
						$("<span />").addClass("exif-icon exif-icon-alert")
					)
			).append(
				$('<a href="#"/>')
					.addClass("exif-dialog-titlebar-close")
					.attr("role","button")
					.click(function () {
						closeExif();
						return false
					}).append(
						$("<span />").addClass("exif-icon exif-icon-close")
					)
			)
		}
	}
	
	function injectOverlay(img, data, gps){
		var position = img.offset(),
			size = {
				"width": img.outerWidth(),
				"height": img.outerHeight()
			};
		$("<span />")
			.addClass('overlayContainer')
			.click(function(e){
				exif_inject(data);
				e.stopPropagation();
				e.preventDefault();
			})
			.css({
				'top': position['top'] + size['height'] - 22,
				'left': position['left'] + size['width'] - 22
			})
			.appendTo(document.documentElement)
			.hover(function(){
				$(this).animate({'opacity': 1}, 300)
			}, function(){
				$(this).animate({'opacity': .5}, 300)
			});
		img.mouseover(function(e){
			if(e['ctrlKey'] && $(".ExifViewer").length && (img['src'] != $(".ExifViewer").attr("img"))){
				exif_inject(data);
			}
		});
	}
	
	constructor();
}
var exif = new EXIFInjection();