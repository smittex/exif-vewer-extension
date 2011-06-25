function image(src){
	this['src'] = src;
}

$(document).ready(function(){
	loadExifAttributes();
});



function checkExif(src, callback){
	var img = new image(src);
	EXIF.getData(img, function(){
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
		if(Object['keys'](aExifData).length){
			callback({
				'data': aExifData,
				'src': src
			});
		}
	});
}



// A generic onclick callback function.
function genericOnClick(info, tab) {
		var img = {src: info.srcUrl};
		EXIF.getData(img, function(){
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
					}
				});
		});
}
// Create one test item for each context type.
  var context = "image";
  var title = chrome.i18n.getMessage("menuitem");
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});


chrome.extension.onRequest.addListener(	function (request, sender, callback) {
	if(request['action'] == 'checkExif'){
		checkExif(request['src'], callback);
	}
});

  
//-- Load exif attributes list;
function loadExifAttributes(){
	if(localStorage.getItem("exif_attributes")){
		var tmp = JSON.parse(localStorage.getItem("exif_attributes"));
		exifAttributes = $.extend(exifAttributes, JSON.parse(localStorage.getItem("exif_attributes")));
	} 
	localStorage.setItem("exif_attributes", JSON.stringify(exifAttributes));
}

window['loadExifAttributes'] = loadExifAttributes;