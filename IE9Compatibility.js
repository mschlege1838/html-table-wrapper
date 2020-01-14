
/**
 * Not actually a constructor as there are no instance methods; underlying definition is an empty object.
 * Documented as a class for the purposes of this documentation generator only.
 *
 * @class
 * @augments IEGeneralCompatibility
 * @classdesc
 *		Utility functions for MS Internet Explorer 9 compatibility.
 */
var IE9Compatibility = {
	
};

(function (src, target) {
	'use strict';
	
	var name;
	
	for (name in src) {
		target[name] = src[name];
	}
})(IEGeneralCompatibility, IE9Compatibility);


/**
 * Adds compatibility for the DOMTokenList.add function for Element.classList.
 *
 * @param {Element} el Element to which the given class is to be added.
 * @param {string} className Class name to add to the given element.
 */
IE9Compatibility.addClass = function (el, className) {
	'use strict';
	
	var classNames;
	
	if (el.classList) {
		el.classList.add(className);
		return;
	}
	
	classNames = el.className.trim().split(/\s+/);
	if (classNames.indexOf(className) == -1) {
		classNames.push(className);
		el.className = classNames.join(' ');
	}
};


/**
 * Adds compatibility for the DOMTokenList.remove function for Element.classList.
 *
 * @param {Element} el Element from which the given class is to be removed.
 * @param {string} className Class name to remove from the given element.
 */
IE9Compatibility.removeClass = function (el, className) {
	'use strict';
	
	var classNames, index;
	
	if (el.classList) {
		el.classList.remove(className);
		return;
	}
	
	classNames = el.className.trim().split(/\s+/);
	index = classNames.indexOf(className);
	if (index != -1) {
		classNames.splice(index, 1);
		el.className = classNames.join(' ');
	}
};

/**
 * Adds compatibility for the DOMTokenList.contains function for Element.className.
 *
 * @param {Element} el Element whose class list is to be examined.
 * @param {string} className Class name for which to look in el's classlist.
 * @returns {boolean} true if the given className is present in el's classlist, otherwise false.
 */
IE9Compatibility.hasClass = function (el, className) {
	'use strict';
	
	if (el.classList) {
		return el.classList.contains(className);
	}
	
	return el.className.trim().split(/\s+/).indexOf(className) != -1;
};

