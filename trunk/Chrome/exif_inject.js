function exif_inject(data, title, closeButton){
		$("<div />").html(data).dialog({
			"minWidth" : 400,
			"position": "center",
			"resizable": false,
			"title": title,
			"closeOnEscape": true,
			"closeText": 'hide',
			buttons: { 
				"Configure": function() { document.location = chrome.extension.getURL("options.html"); },
				"Close": function() { $(this).dialog("close"); },
			}
		});
}