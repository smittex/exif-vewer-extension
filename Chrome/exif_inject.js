function exif_inject(data){
		var content = $("<div />").append(
			$("<div />").addClass("ExifViewer").attr("img", data['src']).append(
				$("<div />").addClass("ExifVewerTabData").exif(data['data'])
			)
		);
		content.dialog({
			"minWidth" : 450,
			"position": "center",
			"resizable": false,
			"title": chrome.i18n.getMessage("dialogTitle"),
			"closeOnEscape": true,
			"closeText": 'hide',
			"buttons": [{
					text: chrome.i18n.getMessage("dialogExpand"),
					disabled: (Object['keys'](data['data']).length==0),
					click: function(){
						if($(this).find(".exifHiddenRow").is(":visible")){
							$(this).find(".exifHiddenRow").hide();
							$(this).parent(".ui-dialog").find("#ExifExpand").button("option", "label", chrome.i18n.getMessage("dialogExpand"));
						} else {
							$(this).css({'min-height': $(this).height() + "px"})
							$(this).find(".exifHiddenRow").show();
							$(this).parent(".ui-dialog").find("#ExifExpand").button("option", "label", chrome.i18n.getMessage("dialogCollapse"));
						}
					},
					id: "ExifExpand"
			}, {
				text: chrome.i18n.getMessage("dialogConfigure"),
				click: function() { window.open(chrome.extension.getURL("options.html"), "_tab"); }
			}, {
				text: chrome.i18n.getMessage("dialogClose"),
				click: function() { $(this).dialog("close");}
			}]
		}).prev("div.ui-dialog-titlebar").prepend(
			$("<img />").attr("src", "chrome-extension://lplmljfembbkocngnlkkdgabpnfokmnl/camera_blue-16.png").css({
				"float":"left",
				"padding-right": "5px"
			})
		).parent(".ui-dialog").css({
			"direction": "ltr",
			"-webkit-box-shadow": "0 0 20px 5px #444"
		}).children(".ui-dialog-buttonpane").prepend(
			$("<div style='float:left;line-height:38px;padding:8px 0 0 0;'>")
				.append('<a href="http://twitter.com/share" class="twitter-share-button" data-url="'+data.src+'" data-count="horizontal">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>')
				.append('<iframe src="http://www.facebook.com/plugins/like.php?href='+data.src+'&amp;layout=button_count&amp;show_faces=true&amp;width=50&amp;action=like&amp;font=arial&amp;colorscheme=light&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:110px; height:21px;" allowTransparency="true"></iframe>')
		);
		
		if(!content.find("tr.exifVisibleRow").length){
			content.parent(".ui-dialog").find("#ExifExpand").click();
		}
}


function exif_injectMap(data){
	$("<iframe />")
		.appendTo($(".ExifViewer[img='"+data['src']+"']"))
		.css("width", "100%")
		.css("min-height", "200px")
		.css("border", "1px solid #cccccc")
		.attr("src","http://maps.google.com/maps?f=q&source=s_q&q="+data['data']['lat']+","+data['data']['lng']+"&output=embed&type=G_NORMAL_MAP");

	
}

chrome.extension.onRequest.addListener(	function (request, sender, callback) {
	if(request['action'] == 'showExif'){
		exif_inject(request)
	} else if(request['action'] == 'showGps'){
		exif_injectMap(request);
	}
});

$("img").each(function(){
	var img = $(this);
	if(img.height() > 30 && img.width() > 30){
		chrome.extension.sendRequest({
			'action': 'checkExif',
			'src': this.src
		}, function(data){
			img.wrap($("<div />").css({
				'position': 'relative',
				'display': 'inline-block',
				'padding': '0px',
				'margin': '0px'
			})).parent().append(
					$("<img />").attr('src', chrome.extension.getURL('camera_blue-16.png')).css({
						'position': 'absolute',
						'right': '2px',
						'bottom': '2px',
						'cursor': 'pointer'
					}).click(function(){
						exif_inject(data);
					})
				)
		})
	}
});

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
		console.log(tag.data);
		if(name == "ExposureTime"){
			return float2exposure(tag.data);
		} else {
			return tag.data + (tag.dim?tag.dim:'');
		}
	}
		var table, methods = {
			init : function( data ) {
				return this.each(function(){
					if(Object['keys'](data).length){
						table= $("<tbody />").appendTo($("<table />").attr("width", "100%").appendTo(this));
						$.each(data, function(name, tag){
							table.append(
								$("<tr>").append(
									$("<td>").addClass("exifTd").text(tag['label'])
								).append(
									$("<td>").addClass("exifTd").text((typeof tag['data'] == 'object')?tag['data'].length:prettyPrint(name, tag))
								).addClass(tag['visible']?"exifVisibleRow":"exifHiddenRow")
							)
						});
					} else {

						$(this).append(
							$("<div />").css({
								'color': '#000',
								'font-size': '22px',
								'text-align': 'center'
							}).text(chrome.i18n.getMessage("noEXIF"))
						)
					}
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