function image(src){
	this.src = src;
}

// A generic onclick callback function.
function genericOnClick(info, tab) {
		/*if(info.pageUrl .indexOf(".jpg") == info.pageUrl.length-4 ||
			info.pageUrl .indexOf(".jpeg") == info.pageUrl.length-5){
			
		}*/
		var img = {src: info.srcUrl};

		
		EXIF.getData(img, function(){

				//http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.3/themes/base/jquery-ui.css
				
				var param = {};
				for(name in exifAttributes){
					if(exifAttributes[name].visible){
						param[name] = chrome.i18n.getMessage(name)
					}
				}
				
				//var exif_data = exif_data = EXIF.prettyHTML(img,param);
				var aExifData = $.extend({}, exifAttributes);
				$.each(aExifData, function(name, tag){
					var data = EXIF.getTag(img, name);
					if(data){
						$.extend(tag, {
							"data": EXIF.getTag(img, name),
							"label": chrome.i18n.getMessage(name)
						});
					} else {
						delete aExifData[name];
					}
				});

				var gps_data = {
					Latitude: EXIF.getTag(img, "GPSLatitude"),
					Longitude: EXIF.getTag(img, "GPSLongitude"),
					LatitudeRef: EXIF.getTag(img, "GPSLatitudeRef"),
					LongitudeRef: EXIF.getTag(img, "GPSLongitudeRef"),
					Position: EXIF.getTag(img, "GPSPosition")
				}
					

				//if(exif_data == '')	exif_data = chrome.i18n.getMessage("noEXIF");
				chrome.tabs.sendRequest(tab.id, {
					'action': 'showExif',
					'src': img.src,
					'data': aExifData
				}, function (){
					if(gps_data.Latitude && gps_data.Longitude){
						var gps = {};
						gps.lat = Geo.parseDMS(gps_data.Latitude,gps_data.LatitudeRef);
						gps.lng = Geo.parseDMS(gps_data.Longitude,gps_data.LongitudeRef);
						chrome.tabs.sendRequest(tab.id, {
							'action': 'showGps',
							'src': img.src,
							'data' : gps
						});
						//chrome.tabs.executeScript(tab.id, {code: 'exif_injectMap("'+escape(JSON.stringify(gps))+'");'});
					}
				});
				/*
				chrome.tabs.executeScript(tab.id, {code: 'exif_inject("'+exif_data+'", "'+img.src+'");'}, function(){
					if(gps_data.Latitude && gps_data.Longitude){
						var gps = {};
						gps.lat = Geo.parseDMS(gps_data.Latitude,gps_data.LatitudeRef);
						gps.lng = Geo.parseDMS(gps_data.Longitude,gps_data.LongitudeRef);
						chrome.tabs.executeScript(tab.id, {code: 'exif_injectMap("'+escape(JSON.stringify(gps))+'");'});
					}
				});*/
		});
}

// Create one test item for each context type.
  var context = "image";
  loadExifAttributes();
  var title = chrome.i18n.getMessage("menuitem");
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
//console.log("'" + context + "' item:" + id);

  
//-- Load exif attributes list;
function loadExifAttributes(){
	if(localStorage.getItem("exif_attributes")){
		var tmp = JSON.parse(localStorage.getItem("exif_attributes"));
		exifAttributes = $.extend(exifAttributes, JSON.parse(localStorage.getItem("exif_attributes")));
		//exifAttributes = $.map($.extend(exifAttributes, tmp) , function(id){
		//	console.log(JSON.stringify(tmp[id]));
		//	return $.extend(exifAttributes[id], tmp[id]);
		//});
		
	} 
	localStorage.setItem("exif_attributes", JSON.stringify(exifAttributes));
	
}

