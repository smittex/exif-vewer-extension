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
];

function fixUrl(src){
	$.each(rxs, function(i, rx){
		if(rx.rx.test(src)){
			src = src.replace(rx.rx, rx.rep);
		}
	})
	return src;
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
	  try {
		callback(e.data);
	  }catch(e) {
		console.log(e);
	  }
	}, false);
	worker.addEventListener('error', function(e) {
	  console.log(e);
	}, false);
}

function checkExif(src, callback){
	var originalSrc = src,
		src = fixUrl(src);
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
		
		var gps_data = {
			Latitude: EXIF.getTag(img, "GPSLatitude"),
			Longitude: EXIF.getTag(img, "GPSLongitude"),
			LatitudeRef: EXIF.getTag(img, "GPSLatitudeRef"),
			LongitudeRef: EXIF.getTag(img, "GPSLongitudeRef"),
			Position: EXIF.getTag(img, "GPSPosition")
		}
		
		var gps = {};
		gps.lat = Geo.parseDMS(gps_data.Latitude,gps_data.LatitudeRef);
		gps.lng = Geo.parseDMS(gps_data.Longitude,gps_data.LongitudeRef);
		

			callback({
				'data': aExifData,
				'gps': gps,
				'src': originalSrc,
				'histogram': true
			});

	});
}

// get Flikr exif

function getFlikrEXIF(id, callback){
	var oData = {};
	$.when(
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
				if(data['photo']){
					$.each(data['photo']['exif'], function(i, tag){
						var data = tag['raw']['_content'],
							name = tag['tag'];
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
				oData.data = aExifData;
			}
		}),
		$.ajax({
			'url': "http://api.flickr.com/services/rest/",
			'dataType': 'json',
			'data': {
				'method': 'flickr.photos.geo.getLocation',
				'api_key': 'a44589ed5e15fc1c6d0e08193ab7b5b3',
				'photo_id': id,
				'format': 'json',
				'nojsoncallback':'1'
			},
			'success': function(data){
				if(data && data.photo && data.photo.location){
					oData.gps = {
						lat: data.photo.location.latitude,
						lng: data.photo.location.longitude
					}
				}
			}
		})
	).then(function(){
		oData.histogram = true;
		callback(oData);
	});
}

// A generic onclick callback function.
function genericOnClick(info, tab) {
		var img = {src: info.srcUrl};
		
		if(/https?:\/\/.*?\.staticflickr.com\//g.test(info.srcUrl)){

		} else {
			chrome.tabs.sendRequest(tab.id, {
					'action': 'startExifProcessing',
					'data': info.srcUrl
				});
			try {
				checkExif(info.srcUrl, function(data){
					chrome.tabs.sendRequest(tab.id, {
						'action': 'showExif',
						'data': data
					});
				})
			} catch(e) {
				checkExif(info.srcUrl, function(data){
					chrome.tabs.sendRequest(tab.id, {
						'action': 'showExif',
						'data': null
					});
				})
			}
		}
}
// Create one test item for each context type.
  var context = "image";
  var title = chrome.i18n.getMessage("menuitem");
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});


chrome.extension.onRequest.addListener(	function (request, sender, callback) {
	if(request['action'] == 'checkExif'){
		checkExif(request['src'], function(data){
			if($.map(data.data, function(tag){
				return tag.visible?true:null
			}).length)
				callback(data);
		});
	} else if(request['action'] == 'checkFlikrExif'){
		getFlikrEXIF(request['id'], callback);
	} else if(request['action'] == 'checkOverlayEnabled'){
		if(localStorage.getItem("overlayEnabled") != "false")
			callback();
	} else if(request['action'] == 'checkShowCameraImage'){
		if(localStorage.getItem("showCameraImage") != "false")
			getCameraImage(request, callback);
	} else if(request['action'] == 'getHistogramData'){
		getHistogramData(request.src, callback);
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
		$.each(exifAttributes, function(name, val){
			if(typeof tmp[name] == 'undefined'){
				tmp[name] = val;
			}
		});
		exifAttributes = tmp;
	} 
	localStorage.setItem("exif_attributes", JSON.stringify(exifAttributes));
}

function getCameraImage(camera, callback){
	if (cameraImages[camera.model]){
		callback(cameraImages[camera.model]);
	} else {
		//https://www.googleapis.com/shopping/search/v1/public/products?key=AIzaSyCbF3jcr3FT01DDTOBvYoU8s4r6skTXVd4&country=US&q=canon%205d
		/*$.ajax({
			url: 'https://www.googleapis.com/shopping/search/v1/public/products',
			data: {
				key: 'AIzaSyCbF3jcr3FT01DDTOBvYoU8s4r6skTXVd4',
				country: 'US',
				q: camera['model'],
				restrictBy: 'brand:'+camera['brand']+', title:'+camera['model']+', condition:new',
				rankBy: 'relevancy'
			},
			success: function(data){
				var img = {
					src: data.items[0].product.images[0].link,
					desc: data.items[0].product.description,
					title: data.items[0].product.title
				}
				console.log(img);
			}
		});*/
		
		$.ajax({
			url: 'https://ajax.googleapis.com/ajax/services/search/images',
			data: {
				rsz: 1,
				q: 'New ' + camera['model'] + ' photo camera',
				imgsz: 'small|medium|large',
				context: 0,
				num: 1,
				//as_sitesearch: param.site?param.site:'',
				imgtype: 'photo',
				v: '1.0'
			},
			dataType: 'json',
			success: function(resp){
				cameraImages[camera['model']] = resp.responseData.results[0];
				localStorage.setItem('cameraImages', JSON.stringify(cameraImages));
				callback (resp.responseData.results[0]);
			}
		});
	}
}

var cameraImages = JSON.parse(localStorage.getItem('cameraImages'))||{};
window['loadExifAttributes'] = loadExifAttributes;