

// TemperatureConverter
function TemperatureConverter(table, temperatureDescriptions) {
	'use strict';
	
	this.table = table;
	this.temperatureDescriptions = temperatureDescriptions;
}

// Static fields.
TemperatureConverter.ORIGINAL_TEMPERATURE_READING_ATTRIBUTE = 'data-orig-temp';
TemperatureConverter.ORIGINAL_TEMPERATURE_UNIT_ATTRIBUTE = 'data-orig-unit';

// Static methods.
TemperatureConverter.strRoundToMax = function (num, places) {
	'use strict';
	
	var sign, fixed, decimalPointIndex, trailingZeroIndex, result;
	
	// Store sign, convert to absolute value for EPSILON offset.
	sign = Math.sign(num);
	num = Math.abs(num);
	
	// Calculate fixed representation of EPSILON offset.
	fixed = (num + 2 * Number.EPSILON).toFixed(places);
	
	// Determine whether a substring of the fixed representation needs to be returned.
	decimalPointIndex = fixed.indexOf('.');
	trailingZeroIndex = fixed.indexOf('0', decimalPointIndex);
	
	if (trailingZeroIndex == -1) { // If there are no trailing zeros, the fixed representation is the result.
		result = fixed;
	} else if (trailingZeroIndex === decimalPointIndex + 1) { // If the first digit after the decimal point is a zero, no decimal point is needed.
		result = fixed.substring(0, decimalPointIndex);
	} else { // Otherwise, the result is the substring of the fixed representation including the decimal, and all significant digits after.
		result = fixed.substring(0, trailingZeroIndex);
	}
	
	// Return the result calculated above, with the original sign applied.
	return sign < 0 ? '-' + result : result;
};

// Instance methods.
TemperatureConverter.prototype.convertColumn = function (columnIndex, unit) {
	'use strict';
	
	var rows, i, columnIndex, cells, cell, temperatureDescriptions, fromDescription, originalUnit, conversionFn, 
		originalTempRaw, originalTemp, toDescription;
	
	if (typeof columnIndex !== 'number') {
		throw new TypeError('Given column index is not a number: ' + columnIndex);
	}
	
	temperatureDescriptions = this.temperatureDescriptions;
	
	rows = this.table.tBodies[0].rows;
	for (i = 0; i < rows.length; ++i) {
		cells = rows[i].cells;
		
		if (columnIndex >= cells.length) {
			throw new RangeError('Given column index is out of range for row ' + i + ': ' + columnIndex);
		}
		
		// Obtain original reading for cell.
		cell = cells[columnIndex];
		originalUnit = cell.getAttribute(TemperatureConverter.ORIGINAL_TEMPERATURE_UNIT_ATTRIBUTE);
		
		// Obtain descriptor for original unit.
		fromDescription = temperatureDescriptions[originalUnit];
		if (!fromDescription) {
			throw new ReferenceError('No description found for original column unit: ' + originalUnit);
		}
		
		// Obtain conversion function to target unit.
		conversionFn = fromDescription.toTemp[unit];
		if (!conversionFn) {
			throw new ReferenceError('No conversion found from original unit ' + originalUnit + ' to desired unit: ' + unit);
		}
		
		// Read in original reading.
		originalTempRaw = cell.getAttribute(TemperatureConverter.ORIGINAL_TEMPERATURE_READING_ATTRIBUTE)
		originalTemp = Number.parseFloat(originalTempRaw);
		if (Number.isNaN(originalTemp)) {
			throw new Error('Unable to parse original temperature reading for row ' + i + ': ' + originalTempRaw);
		}
		
		// Convert, format, and set result to the current cell's textContent.
		cell.textContent = TemperatureConverter.strRoundToMax(conversionFn(originalTemp), 2);
		
		// Obtain descriptor for target unit.
		toDescription = temperatureDescriptions[unit];
		if (!toDescription) {
			throw new ReferenceError('No description found for desired unit: ' + unit);
		}
		
		// Apply target unit class name to cell.
		cell.className = toDescription.className;
	}
};
//


// TemperatureColumnControl
function TemperatureColumnControl(columnIndex, parent, temperatureConverter) {
	'use strict';
	
	this.columnIndex = columnIndex;
	this.parent = parent;
	this.temperatureConverter = temperatureConverter;
	this.contextControl = new ContextControl();
}

// Static fields.
TemperatureColumnControl.CLICK_TARGETS_SELECTOR = '.temperature-unit, .close-button';

TemperatureColumnControl.idCounter = 0;

// Static methods.
TemperatureColumnControl.getIdBase = function () {
	'use strict';
	
	return 'temperatureControl_ ' + TemperatureColumnControl.idCounter++ + '_';
};

// Instance methods.
TemperatureColumnControl.prototype.init = function () {
	'use strict';
	
	this.contextControl.addEventListener('create', this, false);
};

TemperatureColumnControl.prototype.dispose = function () {
	'use strict';
	
	var contextControl, controlElement, clickTargets, i;
	
	contextControl = this.contextControl;
	
	controlElement = contextControl.getControlElement();
	if (controlElement) {
		clickTargets = controlElement.querySelectorAll(TemperatureColumnControl.CLICK_TARGETS_SELECTOR);
		for (i = 0; i < clickTargets.length; ++i) {
			clickTargets[i].removeEventListener('click', this, false);
		}
		
		controlElement.querySelector('.temperature-filter-operator').removeEventListener('change', this, false);
		controlElement.querySelector('.temperature-filter-operand').removeEventListener('keyup', this, false);
	}
	
	contextControl.removeEventListener('create', this, false);
};

TemperatureColumnControl.prototype.handleEvent = function (event) {
	'use strict';
	
	var target;
	
	target = event.target;
	
	switch (event.type) {
		case 'create':
			this.defineContent(target.getControlElement());
			break;
		case 'click':
			if (target.classList.contains('temperature-unit')) {	// Unit change.
				this.convertTo(target.value);
			} else if (target.classList.contains('close-button')) {		// Close button.
				this.close();
			}
			break;
			
		// Filter operator or operand change.
		case 'change':
		case 'keyup':
			this.updateParent();
			break;
	}
};



TemperatureColumnControl.prototype.open = function () {
	'use strict';
	
	this.contextControl.open(this.parent.getTableHeaderElement(this.columnIndex));
};

TemperatureColumnControl.prototype.close = function () {
	'use strict';
	
	this.contextControl.close();
};

TemperatureColumnControl.prototype.getFilterDescriptor = function () {
	'use strict';
	
	var controlElement, rawOperand, operand;
	
	controlElement = this.contextControl.getControlElement();
	if (!controlElement) {
		return null;
	}
	
	operand = Number.parseFloat(controlElement.querySelector('.temperature-filter-operand').value);
	if (Number.isNaN(operand)) {
		return null;
	}
	
	return new SimpleFilterDescriptor(this.columnIndex, operand, controlElement.querySelector('.temperature-filter-operator').value);
};

TemperatureColumnControl.prototype.getSortDescriptor = function () {
	'use strict';
	
	// Not strictly necessary; no return statement implies a return value of undefined.
	return null;
};


TemperatureColumnControl.prototype.convertTo = function (unit) {
	'use strict';
	
	this.temperatureConverter.convertColumn(this.columnIndex, unit);
};

TemperatureColumnControl.prototype.updateParent = function () {
	'use strict';
	
	this.parent.processTable();
	this.contextControl.position();
};

TemperatureColumnControl.prototype.defineContent = function (container) {
	'use strict';
	
	var builder, idBase, fId, cId, kId, unitInputSetName, operatorId, operandId, clickTargets, i;
	
	builder = new XMLBuilder();
	idBase = TemperatureColumnControl.getIdBase();
	
	// Generate ids.
	fId = idBase + 'fInput';
	cId = idBase + 'cInput';
	kId = idBase + 'kInput';
	operatorId = idBase + 'operator';
	operandId = idBase + 'operand';
		
	// Generate names.
	unitInputSetName = idBase + 'temperatureInput';
	
	// Build content.
	builder.startTag('div').attribute('class', 'control-bar')
		.startTag('span').attribute('class', 'control-button close-button').content('\u00D7').closeTag()
	.closeTag()
	.startTag('div').attribute('class', 'unit-selection')
		.startTag('span')
			.startTag('input').attribute('id', fId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName).attribute('value', 'F').attribute('type', 'radio').closeTag()
			.startTag('label').attribute('for', fId).attribute('class', 'fahrenheit').closeTag(true)
		.closeTag()
		.startTag('span')
			.startTag('input').attribute('id', cId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName).attribute('value', 'C').attribute('type', 'radio').closeTag()
			.startTag('label').attribute('for', cId).attribute('class', 'celsius').closeTag(true)
		.closeTag()
		.startTag('span')
			.startTag('input').attribute('id', kId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName).attribute('value', 'K').attribute('type', 'radio').closeTag()
			.startTag('label').attribute('for', kId).attribute('class', 'kelvin').closeTag(true)
		.closeTag()
	.closeTag()
	.startTag('div').attribute('class', 'filter-condition')
		.startTag('label').attribute('for', operatorId).content('Temperature is ').closeTag()
		.startTag('select').attribute('id', operatorId).attribute('class', 'temperature-filter-operator')
			.startTag('option').attribute('value', '>=').content('>=').closeTag()
			.startTag('option').attribute('value', '<=').content('<=').closeTag()
			.startTag('option').attribute('value', '>').content('>').closeTag()
			.startTag('option').attribute('value', '<').content('<').closeTag()
			.startTag('option').attribute('value', '=').content('=').closeTag()
		.closeTag()
		.startTag('label').attribute('for', operandId).content(' to ').closeTag()
		.startTag('input').attribute('id', operandId).attribute('class', 'temperature-filter-operand')
	.closeTag();
	
	// Insert content.
	container.insertAdjacentHTML('afterbegin', builder.toString());
	
	// Register for events on newly defined content.
	clickTargets = container.querySelectorAll(TemperatureColumnControl.CLICK_TARGETS_SELECTOR);
	for (i = 0; i < clickTargets.length; ++i) {
		clickTargets[i].addEventListener('click', this, false);
	}
	
	container.querySelector('.temperature-filter-operator').addEventListener('change', this, false);
	container.querySelector('.temperature-filter-operand').addEventListener('keyup', this, false);
};
//



// TemperatureColumnControlFactory
function TemperatureColumnControlFactory(temperatureConverter) {
	'use strict';
	
	this.temperatureConverter = temperatureConverter;
}

TemperatureColumnControlFactory.prototype.getColumnControl = function (columnIndex, parent) {
	'use strict';
	
	if (parent.getTableHeaderElement(columnIndex).classList.contains('temperature-column')) {
		return new TemperatureColumnControl(columnIndex, parent, this.temperatureConverter);
	}
	
	// Not strictly necessary; no return statement implies a return value of undefined.
	return null;
};
//
