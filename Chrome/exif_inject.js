function exif_inject(data, title, closeButton){
	var buttons = {};
	buttons[chrome.i18n.getMessage("dialogConfigure")] = function() { document.location = chrome.extension.getURL("options.html"); };
	buttons[chrome.i18n.getMessage("dialogClose")] = function() { $(this).dialog("close"); }
	
		$("<div />").html(data).dialog({
			"minWidth" : 400,
			"position": "center",
			"resizable": false,
			"title": chrome.i18n.getMessage("dialogTitle"),
			"closeOnEscape": true,
			"closeText": 'hide',
			"buttons": buttons
		});
}