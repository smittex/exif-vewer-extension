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
				var param = {};
				for(name in exifAttributes){
					if(exifAttributes[name].visible){
						param[name] = chrome.i18n.getMessage(name)
					}
				}
				var exif_data = EXIF.prettyHTML(img,param);
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
  var context = "image";
  loadExifAttributes();
  var title = chrome.i18n.getMessage("menuitem");
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
  console.log("'" + context + "' item:" + id);

  
//-- Load exif attributes list;
function loadExifAttributes(){
	if(localStorage.getItem("exif_attributes")){
		exifAttributes = JSON.parse(localStorage.getItem("exif_attributes"));
	} else {
		localStorage.setItem("exif_attributes", JSON.stringify(exifAttributes));
	}
}

