var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-15750103-6']);
_gaq.push(['_trackPageview']);

(function() {
var ga = document.createElement('script'); ga['type'] = 'text/javascript'; ga['async'] = true;
ga['src'] = 'https://ssl.google-analytics.com/ga.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var flickrApiKey = '76f67ec399e50432f88749c94f49f64e';
function image(src){
	this['src'] = src;
}

$(document).ready(function(){
	loadExifAttributes();
});

var rxs = [
	{
		"rx": /(https?:\/\/(?:.+\.)+(?:googleusercontent|blogspot)\.com\/(?:.+\/){4})(.+)\/(.+)/,
		"rep": "$1d/$3"
	},
	{
		"rx": /(https?:\/\/(?:.+\.)+(?:ggpht)\.com\/(?:.+\/){4})(.+)/,
		"rep": "$1d/$3"
	}
	// ,
	// {
		// "rx": /https?:\/\/farm\d+\.staticflickr\.com\/\d+\/(\d+).*/,
		// "type": "flikr",
		// "rep": "$1"
	// }
];

function ImageData(data){
	$.extend(this, data);
	if(this['data']['LensID'] && EXIF['Lens'][this['data']['Make']['data']] && EXIF['Lens'][this['data']['Make']['data']][this['data']['LensID']['data']]){
		this['data']['LensModel'] = $.extend(exifAttributes['LensModel'], {
			"data": EXIF['Lens'][this['data']['Make']['data']][this['data']['LensID']['data']],
			"label": chrome.i18n.getMessage("LensModel")
		});
	}
	
	this.histogram = true;
}

function getHistogramData(src, callback){
	var image = new Image;
	var cImage = document.createElement("canvas");
	var ctxImage = cImage.getContext('2d');
	var worker = new Worker('/js/histogram.js');

	image.src = src;
	image.addEventListener('load', function(e) {
		cImage.width = image.width;
		cImage.height = image.height;
		ctxImage.drawImage(image, 0, 0);
		var imageData = ctxImage.getImageData(0, 0, cImage.width, cImage.height);
		var message = {'image':[imageData]};
		worker.postMessage(message);
	}, false);

	worker.addEventListener('message', function(e) {
		callback(e['data']);
	}, false);
}

function checkExif(src, callback){
	var originalSrc = src;
	var bProcessed = false;
	$.each(rxs, function(i, rx){
		if(rx['rx'].test(src)){
			bProcessed = true;
			if(rx['type'] == "flikr"){
				getFlikrEXIF(src.replace(rx['rx'], rx['rep']), callback, src);
			} else {
				getEmbeddedEXIF(src.replace(rx['rx'], rx['rep']), callback, src);
			}
			return;
		}
	});
	if(!bProcessed){
		getEmbeddedEXIF(src, callback);
	}
}

// get EXIF from image content
function getEmbeddedEXIF(src, callback, originalSrc){
	originalSrc = originalSrc || src;
	var oImage = new image(src);
	EXIF.getData(oImage, function(){
		//console.log(oImage);
		//var exif_data = exif_data = EXIF.prettyHTML(oImage,param);
		var aExifData = $.extend({}, exifAttributes);
		$.each(aExifData, function(name, tag){
			var data = EXIF.getTag(oImage, name);
			//console.log(name, tag, data);
			if(data){
				$.extend(tag, {
					"data": data,
					"label": chrome.i18n.getMessage(name)||name
				});
			} else {
				delete aExifData[name];
			}
		});
		
		var gps_data = {
			Latitude: EXIF.getTag(oImage, "GPSLatitude"),
			Longitude: EXIF.getTag(oImage, "GPSLongitude"),
			LatitudeRef: EXIF.getTag(oImage, "GPSLatitudeRef"),
			LongitudeRef: EXIF.getTag(oImage, "GPSLongitudeRef"),
			Position: EXIF.getTag(oImage, "GPSPosition")
		}
		
		var gps = {};
		gps['lat'] = Geo.parseDMS(gps_data.Latitude,gps_data.LatitudeRef);
		gps['lng'] = Geo.parseDMS(gps_data.Longitude,gps_data.LongitudeRef);
		
		
			callback(new ImageData({
				'data': aExifData,
				'gps': gps,
				'src': originalSrc,
				'originalSrc': src
			}));

	});
}

// get Flikr exif
function getFlikrEXIF(id, callback, src){
	var oData = {
		"src": src
	};
	$.when(
		$.ajax({
			'url': "http://api.flickr.com/services/rest/",
			'dataType': 'json',
			'data': {
				'method': 'flickr.photos.getExif',
				'api_key': flickrApiKey,
				'photo_id': id,
				'format': 'json',
				'nojsoncallback':'1'
			},
			'success': function(data){
				var aExifData = {};
				if(data['photo']){
					$.each(data['photo']['exif'], function(i, tag){
						var data = tag['raw']['_content'],
							name = tag['tag'];
							
						if(parseInt(tag['tag'])){
							var tagId = parseInt(tag['tag']);
							name = (tag['tagspace'] == "TIFF")?EXIF.TiffTags[tagId]:EXIF.Tags[tagId]
						}
						if(name == "ISO"){
							name = "ISOSpeedRatings"
						}
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
				}
				oData['data'] = aExifData;
			}
		}),
		$.ajax({
			'url': "http://api.flickr.com/services/rest/",
			'dataType': 'json',
			'data': {
				'method': 'flickr.photos.geo.getLocation',
				'api_key': flickrApiKey,
				'photo_id': id,
				'format': 'json',
				'nojsoncallback':'1'
			},
			'success': function(data){
				if(data && data['photo'] && data['photo']['location']){
					oData['gps'] = {
						"lat": data['photo']['location']['latitude'],
						"lng": data['photo']['location']['longitude']
					}
				}
			}
		}),
		$.ajax({
			'url': "http://api.flickr.com/services/rest/",
			'dataType': 'json',
			'data': {
				'method': 'flickr.photos.getSizes',
				'api_key': flickrApiKey,
				'photo_id': id,
				'format': 'json',
				'nojsoncallback':'1'
			},
			'success': function(data){
				if(data && data['sizes'] && data['sizes'] && data['sizes']['size'] && data['sizes']['size'].length){
					oData['originalSrc'] = data['sizes']['size'][data['sizes']['size'].length-1]['source'];
					oData['src'] = oData['src'] || oData['originalSrc'];
				}
			}
		})
	).then(function(){
		callback(new ImageData(oData));
	});
}

// A generic onclick callback function.
function genericOnClick(info, tab) {
		var img = {src: info.srcUrl};
		
			chrome.tabs.sendRequest(tab.id, {
					'action': 'startExifProcessing',
					'data': info.srcUrl
				});

			checkExif(info.srcUrl, function(data){
				chrome.tabs.sendRequest(tab.id, {
					'action': 'showExif',
					'data': data
				});
			})

}
// Create one test item for each context type.
  var context = "image";
  var title = chrome.i18n.getMessage("menuitem");
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});


chrome.extension.onRequest.addListener(	function (request, sender, callback) {
	if(request['action'] == 'checkExif'){
		checkExif(request['src'], function(data){
			if($.map(data['data'], function(tag){
				return tag['visible']?true:null
			}).length)
				callback(data);
		});
	} else if(request['action'] == 'checkFlikrExif'){
		getFlikrEXIF(request['id'], callback);
	} else if(request['action'] == 'getSettings'){
		callback({
			"overlayEnabled": localStorage.getItem("overlayEnabled") != "false",
			"accordion": localStorage.getItem("accordion")?JSON.parse(localStorage.getItem("accordion")):[0,1,2,3],
			"tab":0
		})
	} else if(request['action'] == 'setSeetings'){
		if(request['accordion']){
			localStorage.setItem("accordion", JSON.stringify(request['accordion']));
		}
	} else if(request['action'] == 'checkShowCameraImage'){
		getCameraImage(request, callback);
	} else if(request['action'] == 'getHistogramData'){
		getHistogramData(request.src, callback);
	} else if(request['action'] == 'copyToClipboard'){
		copyToClipboard(request['value'])
	}else if(request['action'] == 'buy'){
		buy(request['model'])
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
		$.each(exifAttributes, function(name, val){
			if(typeof tmp[name] == 'undefined'){
				tmp[name] = val;
			} else {
				tmp[name] = $.extend(val, tmp[name]);
			}
		});
		exifAttributes = tmp;
	} 
	localStorage.setItem("exif_attributes", JSON.stringify(exifAttributes));
}

function getCameraImage(camera, callback){
	if (cameraImages[camera['model']]){
		callback(cameraImages[camera['model']]);
	} else {
		cameraImages[camera['model']] = {};
		$.when(
			$.ajax({
				"url": 'http://www.dpreview.com/products/search-by-name',
				"type": "POST",
				"data": {
					"terms": camera['model'].replace(/\n{2,}/g,'')
				},
				"dataType": 'json',
				"success": function(resp){
					if(parseInt(resp['result']) && resp['products'] && resp['products'][0]){
						$.extend(cameraImages[camera['model']], {
							"imageUrl": resp['products'][0]['imageUrl'],
							"productUrl": resp['products'][0]['productUrl'],
							"name": resp['products'][0]['name'],
							"model": camera['model'],
							"brand": camera['brand']
						})
					}
				}
			}),
			$.ajax({
				"url": 'https://ajax.googleapis.com/ajax/services/search/images',
				"data": {
					"rsz": 1,
					"q": camera['model'].replace(/\n{2,}/g,'') + (camera['brand']?(' by "' + camera['brand'].replace(/\n{2,}/g,'') + '"'):""),
					"imgsz": 'small|medium|large',
					"context": 0,
					"num": 1,
					"start": (camera['force']?Math.round(Math.random(1)*20):1),
					"imgtype": 'photo',
					"v": '1.0'
				},
				"dataType": 'json',
				"success": function(resp){
					$.extend(cameraImages[camera['model']], {
						"tbUrl": resp['responseData']['results'][0]['tbUrl'],
						"model": camera['model'],
						"brand": camera['brand']
					});
				}
			})
		).then(function(){
			callback (cameraImages[camera['model']]);
			localStorage.setItem('cameraImages', JSON.stringify(cameraImages));
		})
	}
}

window['setCameraImage'] = function(camera, callback){
	$.extend(cameraImages[camera['model']], camera);
	localStorage.setItem('cameraImages', JSON.stringify(cameraImages));
	callback (cameraImages[camera['model']]);
}


window['cameraImages'] = JSON.parse(localStorage.getItem('cameraImages'))||{};
window['loadExifAttributes'] = loadExifAttributes;