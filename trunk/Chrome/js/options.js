
$(document).ready(function(){

	$(".navbar-item").click(function(){
		$(".navbar-item").removeClass("navbar-item-selected");
		var tab = $(this);
		$(".tabPage").hide();
		tab.addClass("navbar-item-selected");
		$("#" + tab.attr("pagename")).show();
	});

	if(localStorage.getItem("overlayEnabled") != "false")
		$("#overlayEnabled").attr('checked', true);

	var attributes = JSON.parse(localStorage.getItem("exif_attributes"));
	var table = $("table#attributes");
	$.each(attributes, function(name, attr){
		table.append(
			$("<tr />").attr("id", name).attr('selected', attr.visible).append(
				$("<td />").append(
					$("<img />").attr('src', attr.visible ? 'img/yes.png' : 'img/no.png').click( function(){
						var tr = $(this).parent().parent(),
							visible = !tr.get(0).hasAttribute('selected');
						console.log(visible)
						
						$(this).attr('src', visible ? 'img/yes.png' : 'img/no.png');
						if(visible)
							tr.attr('selected', true);
						else
							tr.removeAttr('selected');
					})
				)
			).append(
				$("<td />").attr('width', '100%').text(chrome.i18n.getMessage(name)?chrome.i18n.getMessage(name):name)
			).append(
				$("<td />").append($("<span class=\"exif-icon exif-icon-sort_up\"></span>").click(function(){
					table.prepend($(this).parent().parent());
					$("#attributesContainer")//.scrollTop(0);
				}))
			)
		)
	});

	$("table#attributes tbody").sortable();


	var cameras = $("table#cameras");
	var ci = chrome.extension.getBackgroundPage().cameraImages;
	var td;
	$.each(ci, function(name, cam){
		cameras.append(
			$("<tr />").addClass("camera-row").append(
				$("<td class='camera-iamge-container'/>").css({
						'background-image': 'url(' + cam.tbUrl + ')'
				})
			).append(
				td = $("<td />").addClass("camera-description")
					.append( (cam['brand'] ? "<b>"+cam['brand']+"</b><br/>" : "") + name )
					.append( "<br><i>Camera Image: </i>" )
					.append( $("<input />").addClass("camera-image-url").val(cam.tbUrl))
					.append( $("<img />").addClass("camera-image-reload").attr("src", "/img/reload.png").click(function(){
							var img = $(this).parent().parent("tr.camera-row").find("td.camera-iamge-container").ajaxLoader();
							var url = $(this).prev().val();
							chrome.extension.getBackgroundPage().setCameraImage({
								"model": name,
								"tbUrl": url,
							}, function(cam){
								img.css({
										'background-image': 'url(' + cam.tbUrl + ')'
								}).ajaxLoaderRemove();
							})							
						})
					)
			)
		);
		if (cam.productUrl){
			td.append("<br/>").append(
				$("<a />").attr({
					"href": cam.productUrl,
					"target": "_tab"
				}).text("Read review")
			)
		}
	});
	
	$("#reportAnIssue").click(function(){
		chrome.tabs.create({
			url: 'http://code.google.com/p/exif-vewer-extension/issues/list'
		});
	});
	$("#saveOptions").click(function(){

			localStorage.setItem("overlayEnabled", $("#overlayEnabled").is(':checked'));
			var attributes = {};

			$("#attributes tr").each(function(i, elem){
				var name = elem.getAttribute("id");
				attributes[name] = {
					visible: elem.hasAttribute('selected'),
					pos: i
				}
			});
			
			localStorage.setItem("exif_attributes", JSON.stringify(attributes));
			var bgPage = chrome.extension.getBackgroundPage();
			bgPage.exifAttributes = attributes;

				
			$("#dialog").text(chrome.i18n.getMessage("optionsSaved")).dialog({
				title: chrome.i18n.getMessage("optionsDone"),
				modal: true,
				resizable: false,
				buttons: {
					Ok: function() {
						$( this ).dialog( "close" );
					}
				}
			});
		});

});
		
		
		