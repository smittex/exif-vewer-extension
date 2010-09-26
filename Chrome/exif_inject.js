function exif_inject(data, title, closeButton){
		$("<div />").html(data).dialog({
			"position": "center",
			"draggable": true,
			"title": title,
			"closeOnEscape": true,
			"closeText": 'hide'
		});
}