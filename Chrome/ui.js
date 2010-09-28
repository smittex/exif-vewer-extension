function image(src){
	this.src = src;
}

// A generic onclick callback function.
function genericOnClick(info, tab) {
	try{
		console.log("item " + info.menuItemId + " was clicked");
		console.log("mediaType " + info.mediaType  + " was clicked");
		console.log("linkUrl  " + info.linkUrl  + " was clicked");
		console.log("selectionText  " + info.selectionText  + " was clicked");

		if(info.pageUrl .indexOf(".jpg") == info.pageUrl .length-4 ||
			info.pageUrl .indexOf(".jpeg") == info.pageUrl .length-5){
			
		}
		var img = {src: info.srcUrl};

		
		EXIF.getData(img, function(){

				//http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.3/themes/base/jquery-ui.css
				var exif_data = EXIF.prettyHTML(img, {
					"Make": chrome.i18n.getMessage("Make"),
					"Model": chrome.i18n.getMessage("Model"),
					"ExposureTime": chrome.i18n.getMessage("ExposureTime"),
					"FNumber": chrome.i18n.getMessage("FNumber"),
					"ExposureProgram": chrome.i18n.getMessage("ExposureProgram"),
					"ExposureBias": chrome.i18n.getMessage("ExposureBias"),
					"ISOSpeedRatings": chrome.i18n.getMessage("ISOSpeedRatings"),
					"FocalLength": chrome.i18n.getMessage("FocalLength"),
					"DateTimeOriginal": chrome.i18n.getMessage("DateTimeOriginal"),
					"ExposureProgram": chrome.i18n.getMessage("ExposureProgram"),
					"MeteringMode": chrome.i18n.getMessage("MeteringMode"),
					"Flash": chrome.i18n.getMessage("Flash"),
					"WhiteBalance": chrome.i18n.getMessage("WhiteBalance")
				});
				chrome.tabs.insertCSS(tab.id, {file: "css/redmond/jquery-ui-1.8.5.custom.css"});
				chrome.tabs.executeScript(tab.id, {file: "jquery-1.4.2.min.js"}, function(){
					chrome.tabs.executeScript(tab.id, {file: "jquery-ui-1.8.5.custom.min.js"}, function(){
						chrome.tabs.executeScript(tab.id, {file: "exif_inject.js"}, function(){
							if(exif_data == '')
								exif_data = chrome.i18n.getMessage("noEXIF")
							var js = 'try{exif_inject("'+
								exif_data+'","'+
								chrome.i18n.getMessage("dialogTitle")+'"'+
								');}catch(e){alert(e)}';
							chrome.tabs.executeScript(tab.id, {code: js});
						});
					});
				});
				//alert(EXIF.pretty(img));
		});
		//alert(info.srcUrl + "I was taken by a " + EXIF.getTag(img, "Make") + " " + EXIF.getTag(img, "Model"));
	}catch(e){
		alert(e);
	}
}

// Create one test item for each context type.
  var context = "image"
  var title = chrome.i18n.getMessage("menuitem");
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
  console.log("'" + context + "' item:" + id);


