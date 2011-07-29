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
					"data": data,
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

// get Flikr exif

function getFlikrEXIF(id, callback){
	$.ajax({
		'url': "http://api.flickr.com/services/rest/",
		'dataType': 'json',
		'data': {
			'method': 'flickr.photos.getExif',
			'api_key': 'a44589ed5e15fc1c6d0e08193ab7b5b3',
			'photo_id': id,
			'format': 'json',
			'nojsoncallback':'1'
		},
		'success': function(data){
			var aExifData = {};
			$.each(data['photo']['exif'], function(i, tag){
				var data = tag['raw']['_content'],
					name = tag['tag'];
				if(typeof exifAttributes[name] != 'undefined'){
					aExifData[name] = $.extend({}, exifAttributes[name], {
						"data": data,
						"label": chrome.i18n.getMessage(name)
					});
				} else {
					aExifData[name] = {
						"data": data,
						"label": tag['label'],
						"visible": false
					};
				}
			});
			//console.log(aExifData);
			callback(aExifData);
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
	} else if(request['action'] == 'checkFlikrExif'){
		getFlikrEXIF(request['id'], callback);
	} else if(request['action'] == 'checkOverlayEnabled'){
		if(localStorage.getItem("overlayEnabled") != "false")
			callback();
	} else if(request['action'] == 'copyToClipboard'){
		copyToClipboard(request['value'])
	}
});

function copyToClipboard(str) {
  var obj=document.getElementById("hbnaclhngkhpmpgmfakaghgjbblokeeh");
  if( obj ){
	obj.value = str;
	obj.select();
	document.execCommand("copy", false, null);
  }
}
		
//-- Load exif attributes list;
function loadExifAttributes(){
	if(localStorage.getItem("exif_attributes")){
		var tmp = JSON.parse(localStorage.getItem("exif_attributes"));
		exifAttributes = $.extend(exifAttributes, JSON.parse(localStorage.getItem("exif_attributes")));
	} 
	localStorage.setItem("exif_attributes", JSON.stringify(exifAttributes));
}

window['loadExifAttributes'] = loadExifAttributes;