function exif_inject(data){
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
		});
}


function exif_injectMap(sData){
	var data = JSON.parse(unescape(sData));
	$("<iframe />")
		.appendTo($("#ExifViewer").attr("id", ""))
		.css("width", "100%")
		.css("height", "200px")
		.css("border", "1px solid #cccccc")
		.attr("src","http://maps.google.com/maps?f=q&source=s_q&q="+data.lat+","+data.lng+"&output=embed&type=G_NORMAL_MAP");

	
}


