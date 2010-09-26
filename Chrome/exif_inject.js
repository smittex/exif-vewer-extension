function exif_inject(data, title, closeButton){
		$("<div />").html(data).dialog({
			"minWidth" : 400,
			"position": "center",
			"title": title,
			"closeOnEscape": true,
			"closeText": 'hide'
		});
}