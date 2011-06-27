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
 * RE
 * Regular expressions used for common matching tasks.
 */

var re = {
  PHOTO_URL: /https?:\/\/farm\d+\.static\.flickr\.com\/[^\/]+\/(\d+)_[0-9a-z]+(_[mstboz])?\.[a-z]{3}/i,
  PHOTO_PAGE: /^https?:\/\/[^\/]*\bflickr\.com\/photos\/[^\/]+\/(\d+)/i,
  STREAM: /^https?:\/\/[^\/]*\bflickr\.com\/photos\/([^\/]+)\/?$/i,
  PROFILE: /^https?:\/\/[^\/]*\bflickr\.com\/people\/([^\/]+)\/?$/i,
  HOME_PAGE: /^https?:\/\/[^\/]*\bflickr\.com\/?$/i
};
