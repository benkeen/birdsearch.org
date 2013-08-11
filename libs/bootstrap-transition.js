/* ===================================================
 * bootstrap-transition.js v2.0.2
 * http://twitter.github.com/bootstrap/javascript.html#transitions
 * ===================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function( $ ) {

	$(function () {

		"use strict"

		jQuery.uaMatch = function( ua ) {
			ua = ua.toLowerCase();

			var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
				/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
				/(msie) ([\w.]+)/.exec( ua ) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
				[];

			return {
				browser: match[ 1 ] || "",
				version: match[ 2 ] || "0"
			};
		};

		// Don't clobber any existing jQuery.browser in case it's different
		if ( !jQuery.browser ) {
			var matched = jQuery.uaMatch( navigator.userAgent );
			var browser = {};

			if ( matched.browser ) {
				browser[ matched.browser ] = true;
				browser.version = matched.version;
			}

			// Chrome is Webkit, but Webkit is also Safari.
			if ( browser.chrome ) {
				browser.webkit = true;
			} else if ( browser.webkit ) {
				browser.safari = true;
			}

			jQuery.browser = browser;
		}

		/* CSS TRANSITION SUPPORT (https://gist.github.com/373874)
		 * ======================================================= */

		$.support.transition = (function () {
			var thisBody = document.body || document.documentElement
				, thisStyle = thisBody.style
				, support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined

			return support && {
				end: (function () {
					var transitionEnd = "TransitionEnd"
					if ( $.browser.webkit ) {
						transitionEnd = "webkitTransitionEnd"
					} else if ( $.browser.mozilla ) {
						transitionEnd = "transitionend"
					} else if ( $.browser.opera ) {
						transitionEnd = "oTransitionEnd"
					}
					return transitionEnd
				}())
			}
		})()

	})

}( window.jQuery );