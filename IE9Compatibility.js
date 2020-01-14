

function IE9Compatibility() {
	'use strict';
}

(function (src, target) {
	'use strict';
	
	var name;
	
	for (name in src) {
		target[name] = src[name];
	}
})(IEGeneralCompatibility, IE9Compatibility);


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

IE9Compatibility.hasClass = function (el, className) {
	'use strict';
	
	if (el.classList) {
		return el.classList.contains(className);
	}
	
	return el.className.trim().split(/\s+/).indexOf(className) != -1;
};

