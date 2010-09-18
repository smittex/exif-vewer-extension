// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// A generic onclick callback function.
function genericOnClick(info, tab) {
	try{
		console.log("item " + info.menuItemId + " was clicked");
		alert("I was taken by a " + EXIF.getTag(info, "Make") + " " + EXIF.getTag(info, "Model"));
	}catch(e){
		alert(e);
	}
}

// Create one test item for each context type.
  var context = "image"
  var title = "View EXIF data";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
  console.log("'" + context + "' item:" + id);


