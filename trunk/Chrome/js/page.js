/**
 * Copyright 2009 Daniel Pupius (http://code.google.com/p/fittr/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * Page Utils
 * Utilities for accessing elements in Flickr pages.
 */

var re = {
	PHOTO_PAGE: /^https?:\/\/[^\/]*\bflickr\.com\/photos\/[^\/]+\/(\d+)/i
};
 
var page = {

  getPhotoId: function() {
    var m = re.PHOTO_PAGE.exec(location.href);
    return m && Number(m[1]);
  },

  getPhotoUrl: function() {
    var photo = $('div.photoImgDiv img')[0] || $('div.photo-div img')[0];
    return photo ? photo.src : null;
  },

  getPageType: function() {
    var url = location.href;
    if (re.STREAM.test(url)) return 'stream';
    if (re.HOME_PAGE.test(url)) return 'home';
    if (page.getPhotoUrl()) return 'photo';
    return 'unknown';
  },

  getContext: function() {
    return page.isInPool() ? 'pool' :
           page.isInSet() ? 'set' :
           'stream';
  },

  isInPhotoStream: function() {
    return location.href.indexOf('in/photostream') != -1;
  },
  
  isInPool: function() {
    return location.href.indexOf('in/pool-') != -1;
  },
  
  isInSet: function() {
    return location.href.indexOf('in/set-') != -1;
  }
};
