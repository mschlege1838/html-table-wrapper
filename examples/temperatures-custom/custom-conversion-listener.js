
// TemperatureConversionListener
function TemperatureConversionListener(table, categoryFieldGroup, conversionMapping, unitInputs) {
	'use strict';
	
	this.table = table;
	this.categoryFieldGroup = categoryFieldGroup;
	this.conversionMapping = conversionMapping;
	this.unitInputs = unitInputs;
}

// Static fields.
TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE = 'data-orig-unit';
TemperatureConversionListener.ORIGINAL_GT_ATTRIBUTE = 'data-orig-gt';
TemperatureConversionListener.ORIGINAL_LTE_ATTRIBUTE = 'data-orig-lte';
TemperatureConversionListener.ORIGINAL_READING_ATTRIBUTE = 'data-orig-temp';

TemperatureConversionListener.CURRENT_GT_ATTRIBUTE = 'data-gt';
TemperatureConversionListener.CURRENT_LTE_ATTRIBUTE = 'data-lte';

TemperatureConversionListener.APPLICABLE_INPUT_SELECTOR = '.temperature-category[' + TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE + ']';

TemperatureConversionListener.TEMPERATURE_COLUMN_CLASS_NAME = 'temperature-column';

TemperatureConversionListener.SWING_CATEGORY_CLASS_NAME = 'swing';

// Static methods.
TemperatureConversionListener.convertField = function (field, conversionFn, origAttribute, currentAttribute) {
	'use strict';
	
	var orig, current;
	
	orig = Number.parseFloat(field.getAttribute(origAttribute));
	if (!Number.isNaN(orig)) {
		current = TemperatureConversionListener.strRoundToMax(conversionFn(orig), 2);
		field.setAttribute(currentAttribute, current);
	} else {
		current = NaN;
		field.removeAttribute(currentAttribute);
	}
	
	return current;
};

TemperatureConversionListener.getTitle = function (gt, lte, unit) {
	'use strict';
	
	var gtNum, lteNum, unitAffix, rtm;
	
	gtNum = !Number.isNaN(gt);
	lteNum = !Number.isNaN(lte);
	unitAffix = '\u00B0' + unit;
	rtm = TemperatureConversionListener.strRoundToMax;
	
	if (gtNum && lteNum) {
		return rtm(gt, 2) + unitAffix + ' < T <= ' + rtm(lte, 2) + unitAffix;
	} else if (gtNum) {
		return 'T > ' + rtm(gt, 2) + unitAffix;
	} else if (lteNum) {
		return 'T <= ' + rtm(lte, 2) + unitAffix;
	}
	
	return '';
};


TemperatureConversionListener.strRoundToMax = function (num, places) {
	'use strict';
	
	var sign, fixed, decimalPointIndex, trailingZeroIndex, result;
	
	sign = Math.sign(num);
	num = Math.abs(num);
	
	fixed = (num + 2 * Number.EPSILON).toFixed(places);
	
	decimalPointIndex = fixed.indexOf('.');
	trailingZeroIndex = fixed.indexOf('0', decimalPointIndex);
	
	if (trailingZeroIndex == -1) {
		result = fixed;
	} else if (trailingZeroIndex == decimalPointIndex + 1) {
		result = fixed.substring(0, decimalPointIndex);
	} else {
		result = fixed.substring(0, trailingZeroIndex);
	}
	
	return sign < 0 ? '-' + result : result;
};


// Instance methods.
TemperatureConversionListener.prototype.init = function () {
	'use strict';
	
	var unitInputs, i, input;
	
	unitInputs = this.unitInputs;
	for (i = 0; i < unitInputs.length; ++i) {
		input = unitInputs[i];
		input.addEventListener('click', this, false);
		if (input.checked) {
			this.convertTo(input.value);
		}
	}
	
};

TemperatureConversionListener.prototype.dispose = function () {
	'use strict';
	
	var unitInputs, i;
	
	unitInputs = this.unitInputs;
	for (i = 0; i < unitInputs.length; ++i) {
		unitInputs[i].removeEventListener('click', this, false);
	} 
};

TemperatureConversionListener.prototype.handleEvent = function (event) {
	'use strict';
	
	this.convertTo(event.target.value);
};

TemperatureConversionListener.prototype.convertTo = function (targetUnit) {
	'use strict';
	
	this.convertFields(targetUnit);
	this.convertTable(targetUnit);
};


TemperatureConversionListener.prototype.convertFields = function (targetUnit) {
	'use strict';
	
	var categoryFieldGroup, conversionFn, applicableFields, i, field, gt, lte, correspondingLabel;
	
	categoryFieldGroup = this.categoryFieldGroup;
	
	applicableFields = categoryFieldGroup.querySelectorAll(TemperatureConversionListener.APPLICABLE_INPUT_SELECTOR);
	for (i = 0; i < applicableFields.length; ++i) {
		field = applicableFields[i];
		
		// Get conversion function.
		conversionFn = this.getConversionFn(field.getAttribute(TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE), targetUnit,
				field.classList.contains(TemperatureConversionListener.SWING_CATEGORY_CLASS_NAME) ? 'toUnit' : 'toTemp');
		
		// Convert fields, set attributes.
		gt = TemperatureConversionListener.convertField(field, conversionFn, TemperatureConversionListener.ORIGINAL_GT_ATTRIBUTE, TemperatureConversionListener.CURRENT_GT_ATTRIBUTE);
		lte = TemperatureConversionListener.convertField(field, conversionFn, TemperatureConversionListener.ORIGINAL_LTE_ATTRIBUTE, TemperatureConversionListener.CURRENT_LTE_ATTRIBUTE);
		
		// Set title on corresponding label, if present.
		correspondingLabel = categoryFieldGroup.querySelector('label[for="' + field.id + '"]');
		if (correspondingLabel) {
			correspondingLabel.title = TemperatureConversionListener.getTitle(gt, lte, targetUnit);
		}
	}
};


TemperatureConversionListener.prototype.convertTable = function (targetUnit) {
	'use strict';
	
	var table, conversionMapping, columnHeaders, i, temperatureColumnIndicies, rows, cells, j, cell, conversionFn, 
		originalReadingRaw, originalReading;
	
	table = this.table;
	conversionMapping = this.conversionMapping;
	
	temperatureColumnIndicies = [];
	columnHeaders = table.tHead.rows[0].cells;
	for (i = 0; i < columnHeaders.length; ++i) {
		if (columnHeaders[i].classList.contains(TemperatureConversionListener.TEMPERATURE_COLUMN_CLASS_NAME)) {
			temperatureColumnIndicies.push(i);
		}
	}
	
	if (!temperatureColumnIndicies.length) {
		return;
	}
	
	rows = table.tBodies[0].rows;
	for (i = 0; i < rows.length; ++i) {
		cells = rows[i].cells;
		
		for (j = 0; j < temperatureColumnIndicies.length; ++j) {
			cell = cells[temperatureColumnIndicies[j]];
			
			originalReadingRaw = cell.getAttribute(TemperatureConversionListener.ORIGINAL_READING_ATTRIBUTE);
			originalReading = Number.parseFloat(originalReadingRaw);
			if (Number.isNaN(originalReading)) {
				throw new Error('Unable to parse original reading: ' + originalReadingRaw + '(row ' + i + ', column ' + temperatureColumnIndicies[j] + ')');
			}
			
			conversionFn = this.getConversionFn(cell.getAttribute(TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE), targetUnit, 'toTemp');
			cell.textContent = TemperatureConversionListener.strRoundToMax(conversionFn(originalReading), 2);
			cell.className = conversionMapping[targetUnit].className;
		}
	}
};


TemperatureConversionListener.prototype.getConversionFn = function (fromUnit, toUnit, lib) {
	'use strict';
	
	var conversionMapping, conversion, conversionFn;
	
	conversionMapping = this.conversionMapping;
	
	conversion = conversionMapping[fromUnit];
	if (!conversion) {
		throw new Error('No conversion for unit: ' + fromUnit);
	}
	
	conversionFn = conversion[lib][toUnit];
	if (!conversionFn) {
		throw new Error('No conversion from ' + originalUnit + ' to target unit: ' + toUnit);
	}
	
	return conversionFn;
};
//




// HighLowFilter
function HighLowFilter(columnIndex, gtRange, lteRange) {
	'use strict';
	
	this.columnIndex = columnIndex;
	this.gtRange = gtRange;
	this.lteRange = lteRange;
}

HighLowFilter.prototype.include = function (cell) {
	'use strict';
	
	var gtRange, lteRange, currentValue;
	
	currentValue = Number.parseFloat(cell.textContent);
	if (Number.isNaN(currentValue)) {
		return false;
	}
	
	gtRange = this.gtRange;
	lteRange = this.lteRange;
	
	if (!Number.isNaN(gtRange) && !(currentValue > gtRange)) {
		return false;
	}
	if (!Number.isNaN(lteRange) && !(currentValue <= lteRange)) {
		return false;
	}
	
	return true;
};
//

// SwingFilter
function SwingFilter(gtRange, lteRange, highColumnIndex, lowColumnIndex) {
	'use strict';
	
	this.gtRange = gtRange;
	this.lteRange = lteRange;
	this.highColumnIndex = highColumnIndex;
	this.lowColumnIndex = lowColumnIndex;
}

SwingFilter.prototype.include = function (row) {
	'use strict';
	
	var cells, currentSwing, gtRange, lteRange;
	
	cells = row.cells;
	
	currentSwing = Number.parseFloat(cells[this.highColumnIndex].textContent) - Number.parseFloat(cells[this.lowColumnIndex].textContent)
	if (Number.isNaN(currentSwing)) {
		return false;
	}
	
	gtRange = this.gtRange;
	lteRange = this.lteRange;
	
	if (!Number.isNaN(gtRange) && !(currentSwing > gtRange)) {
		return false;
	}
	if (!Number.isNaN(lteRange) && !(currentSwing <= lteRange)) {
		return false;
	}
	
	return true;
};
//



// TemperatureCategoryListener
function TemperatureCategoryListener(simpleDataTable, categoryInputs, highColumnIndex, lowColumnIndex) {
	'use strict';
	
	this.simpleDataTable = simpleDataTable;
	this.categoryInputs = categoryInputs;
	this.highColumnIndex = highColumnIndex;
	this.lowColumnIndex = lowColumnIndex;
}

TemperatureCategoryListener.prototype.init = function () {
	'use strict';
	
	var categoryInputs, i;
	
	categoryInputs = this.categoryInputs;
	for (i = 0; i < categoryInputs.length; ++i) {
		categoryInputs[i].addEventListener('click', this, false);
	}
};

TemperatureCategoryListener.prototype.dispose = function () {
	'use strict';
	
	var categoryInputs, i;
	
	categoryInputs = this.categoryInputs;
	for (i = 0; i < categoryInputs.length; ++i) {
		categoryInputs[i].removeEventListener('click', this, false);
	}
};

TemperatureCategoryListener.prototype.handleEvent = function () {
	'use strict';
	
	this.updateTable();
};

TemperatureCategoryListener.prototype.updateTable = function () {
	'use strict';
	
	var simpleDataTable, categoryInputs, i, input, tableFilters, classList, highColumnIndex, lowColumnIndex, gt, lte;
	
	simpleDataTable = this.simpleDataTable;
	categoryInputs = this.categoryInputs;
	highColumnIndex = this.highColumnIndex;
	lowColumnIndex = this.lowColumnIndex;
	
	tableFilters = [];
	for (i = 0; i < categoryInputs.length; ++i) {
		input = categoryInputs[i];
		if (!input.checked) {
			continue;
		}
		
		if (input.value === 'none') {
			continue;
		}
		
		gt = Number.parseFloat(input.getAttribute(TemperatureConversionListener.CURRENT_GT_ATTRIBUTE));
		lte = Number.parseFloat(input.getAttribute(TemperatureConversionListener.CURRENT_LTE_ATTRIBUTE));
		
		classList = input.classList;
		if (classList.contains('high')) {
			tableFilters.push(new HighLowFilter(highColumnIndex, gt, lte));
		} else if (classList.contains('low')) {
			tableFilters.push(new HighLowFilter(lowColumnIndex, gt, lte));
		} else if (classList.contains('swing')) {
			tableFilters.push(new SwingFilter(gt, lte, highColumnIndex, lowColumnIndex));
		}
	}
	
	simpleDataTable.filter(tableFilters);
};
//



// HighLowSortDescriptor
function HighLowSortDescriptor(columnIndex, descending) {
	'use strict';
	
	this.columnIndex = columnIndex;
	this.descending = descending;
}

HighLowSortDescriptor.prototype.compare = function (cellA, cellB) {
	'use strict';
	
	var numA, numB, aNaN, bNaN, result;
	
	numA = Number.parseFloat(cellA.textContent);
	numB = Number.parseFloat(cellB.textContent);
	
	aNaN = Number.isNaN(numA);
	bNaN = Number.isNaN(numB);
	if (aNaN && bNaN) {
		return 0;
	} else if (aNaN) {
		return 1;
	} else if (bNaN) {
		return -1;
	}
	
	result = numA - numB;
	return this.descending ? -1 * result : result;
};
//



// SwingSortDescriptor
function SwingSortDescriptor(highColumnIndex, lowColumnIndex, descending) {
	'use strict';
	
	this.highColumnIndex = highColumnIndex;
	this.lowColumnIndex = lowColumnIndex;
	this.descending = descending;
}

SwingSortDescriptor.prototype.compare = function (rowA, rowB) {
	'use strict';
	
	var highColumnIndex, lowColumnIndex, aCells, bCells, aSwing, bSwing, aNaN, bNaN, result;
	
	highColumnIndex = this.highColumnIndex;
	lowColumnIndex = this.lowColumnIndex;
	
	aCells = rowA.cells;
	bCells = rowB.cells;
	
	aSwing = Number.parseFloat(aCells[highColumnIndex].textContent) - Number.parseFloat(aCells[lowColumnIndex].textContent);
	bSwing = Number.parseFloat(bCells[highColumnIndex].textContent) - Number.parseFloat(bCells[lowColumnIndex].textContent);
	
	aNaN = Number.isNaN(aSwing);
	bNaN = Number.isNaN(bSwing);
	if (aNaN && bNaN) {
		return 0;
	} else if (aNaN) {
		return 1;
	} else if (bNaN) {
		return -1;
	}
	
	result = aSwing - bSwing;
	return this.descending ? -1 * result : result;
};
//



// TemperatureSortListener
function TemperatureSortListener(simpleDataTable, sortInputs, highColumnIndex, lowColumnIndex) {
	'use strict';
	
	this.simpleDataTable = simpleDataTable;
	this.sortInputs = sortInputs;
	this.highColumnIndex = highColumnIndex;
	this.lowColumnIndex = lowColumnIndex;
}

TemperatureSortListener.CATEGORY_ATTRIBUTE_NAME = 'data-category';

TemperatureSortListener.prototype.init = function () {
	'use strict';
	
	var sortInputs, i;
	
	sortInputs = this.sortInputs;
	
	for (i = 0; i < sortInputs.length; ++i) {
		sortInputs[i].addEventListener('click', this, false);
	}
};

TemperatureSortListener.prototype.dispose = function () {
	'use strict';
	
	var sortInputs, i;
	
	sortInputs = this.sortInputs;
	
	for (i = 0; i < sortInputs.length; ++i) {
		sortInputs[i].removeEventListener('click', this, false);
	}
};

TemperatureSortListener.prototype.handleEvent = function (event) {
	'use strict';
	
	var target;
	
	target = event.target;
	
	this.doSort(target.getAttribute(TemperatureSortListener.CATEGORY_ATTRIBUTE_NAME), target.value);
};

TemperatureSortListener.prototype.doSort = function (category, direction) {
	'use strict';
	
	var simpleDataTable, highColumnIndex, lowColumnIndex, descending, sortDescriptor;
	
	simpleDataTable = this.simpleDataTable;
	highColumnIndex = this.highColumnIndex;
	lowColumnIndex = this.lowColumnIndex;
	
	descending = direction == 'desc';
	switch (category) {
		case 'high':
			sortDescriptor = new HighLowSortDescriptor(highColumnIndex, descending);
			break;
		case 'low':
			sortDescriptor = new HighLowSortDescriptor(lowColumnIndex, descending);
			break;
		case 'swing':
			sortDescriptor = new SwingSortDescriptor(highColumnIndex, lowColumnIndex, descending);
			break;
		case 'none':
		default:
			sortDescriptor = null;
	}
	
	if (sortDescriptor) {
		simpleDataTable.sort(sortDescriptor);
	} else {
		simpleDataTable.clearSort();
	}
};
//