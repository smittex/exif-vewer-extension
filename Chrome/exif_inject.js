function exif_inject(data, url){
	var buttons = {};
	buttons[chrome.i18n.getMessage("dialogConfigure")] = function() { document.location = chrome.extension.getURL("options.html"); };
	buttons[chrome.i18n.getMessage("dialogClose")] = function() { $(this).dialog("close"); }
		$("<div />").append(
			$("<div />").attr("id", "ExifViewer").append(
				$("<div />").attr("id", "ExifVewerTabData").html(data)
			)
		).dialog({
			"minWidth" : 400,
			"position": "center",
			"resizable": false,
			"title": chrome.i18n.getMessage("dialogTitle"),
			"closeOnEscape": true,
			"closeText": 'hide',
			"buttons": buttons
		}).prev("div.ui-dialog-titlebar").prepend(
			$("<img />").attr("src", "chrome-extension://lplmljfembbkocngnlkkdgabpnfokmnl/camera_blue-16.png").css({
				"float":"left",
				"padding-right": "5px"
			})
		).parent(".ui-dialog").css({"direction": "ltr"}).children(".ui-dialog-buttonpane").prepend(
			$("<div style='float:left;line-height:38px;padding:8px 0 0 0;'>")
			.append('<a href="http://twitter.com/share" class="twitter-share-button" data-url="'+url+'" data-count="horizontal">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>')
			.append(
				$('<iframe src="http://www.facebook.com/plugins/like.php?href='+url+'&amp;layout=button_count&amp;show_faces=true&amp;width=50&amp;action=like&amp;font=arial&amp;colorscheme=light&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:110px; height:21px;" allowTransparency="true"></iframe>')
			)
		)
		
		/*.prepend(
			$('<iframe src="http://www.facebook.com/plugins/like.php?href=ya.ru&amp;layout=button_count&amp;show_faces=true&amp;width=50&amp;action=like&amp;font=arial&amp;colorscheme=light&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:50px; height:21px;" allowTransparency="true"></iframe>')
		)*/
}


function exif_injectMap(sData){
	var data = JSON.parse(unescape(sData));
	$("<iframe />")
		.appendTo($("#ExifViewer").attr("id", ""))
		.css("width", "100%")
		.css("min-height", "200px")
		.css("border", "1px solid #cccccc")
		.attr("src","http://maps.google.com/maps?f=q&source=s_q&q="+data.lat+","+data.lng+"&output=embed&type=G_NORMAL_MAP");

	
}


