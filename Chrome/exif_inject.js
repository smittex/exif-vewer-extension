function exif_inject(data, title, closeButton){
		$("<div />").html(data+"<hr />").css("text-size", "0.9em").css("color", "black").append(
			$("<a href='"+chrome.extension.getURL("options.html")+"' />")
				.text("Options")
				.css("font-size","0.8em")
				.css("padding","2px 5px 2px 5px")
				.css("float", "right")
				.button()
		).dialog({
			"minWidth" : 400,
			"position": "center",
			"title": title,
			"closeOnEscape": true,
			"closeText": 'hide'
		});
}