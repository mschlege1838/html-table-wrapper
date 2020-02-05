

class TemperatureConverter {
	
	static get ORIGINAL_TEMPERATURE_READING_ATTRIBUTE() { return 'data-orig-temp'; }
	static get ORIGINAL_TEMPERATURE_UNIT_ATTRIBUTE() { return 'data-orig-unit'; }
	
	static strRoundToMax(num, places) {
		// Store sign, convert to absolute value for EPSILON offset.
		const sign = Math.sign(num);
		num = Math.abs(num);
		
		// Calculate fixed representation of EPSILON offset.
		const fixed = (num + 2 * Number.EPSILON).toFixed(places);
		
		// Determine whether a substring of the fixed representation needs to be returned.
		const decimalPointIndex = fixed.indexOf('.');
		const trailingZeroIndex = fixed.indexOf('0', decimalPointIndex);
		
		let result;
		if (trailingZeroIndex == -1) { // If there are no trailing zeros, the fixed representation is the result.
			result = fixed;
		} else if (trailingZeroIndex === decimalPointIndex + 1) { // If the first digit after the decimal point is a zero, no decimal point is needed.
			result = fixed.substring(0, decimalPointIndex);
		} else { // Otherwise, the result is the substring of the fixed representation including the decimal, and all significant digits after.
			result = fixed.substring(0, trailingZeroIndex);
		}

		return sign < 0 ? `-${result}` : result;
	}
	
	
	constructor(table, temperatureDescriptions) {
		this.table = table;
		this.temperatureDescriptions = temperatureDescriptions;
	}
	
	convertColumn(columnIndex, unit) {
		if (typeof columnIndex !== 'number') {
			throw new TypeError(`Given column index is not a number: ${columnIndex}`);
		}
		
		const temperatureDescriptions = this.temperatureDescriptions;
		
		for (const row of this.table.tBodies[0].rows) {
			const cells = row.cells;
			
			if (columnIndex >= cells.length) {
				throw new RangeError(`Given column index is out of range for row ${i}: ${columnIndex}`);
			}
			
			// Obtain original reading for cell.
			const cell = cells[columnIndex];
			const originalUnit = cell.getAttribute(TemperatureConverter.ORIGINAL_TEMPERATURE_UNIT_ATTRIBUTE);
			
			// Obtain descriptor for original unit.
			const fromDescription = temperatureDescriptions[originalUnit];
			if (!fromDescription) {
				throw new ReferenceError(`No description found for original column unit: ${originalUnit}`);
			}
			
			// Obtain conversion function to target unit.
			const conversionFn = fromDescription.toTemp[unit];
			if (!conversionFn) {
				throw new ReferenceError(`No conversion found from original unit ${originalUnit} to desired unit: ${unit}`);
			}
			
			// Read in original reading.
			const originalTempRaw = cell.getAttribute(TemperatureConverter.ORIGINAL_TEMPERATURE_READING_ATTRIBUTE)
			const originalTemp = Number.parseFloat(originalTempRaw);
			if (Number.isNaN(originalTemp)) {
				throw new Error(`Unable to parse original temperature reading for row ${i}: ${originalTempRaw}`);
			}
			
			// Convert, format, and set result to the current cell's textContent.
			cell.textContent = TemperatureConverter.strRoundToMax(conversionFn(originalTemp), 2);
			
			// Obtain descriptor for target unit.
			const toDescription = temperatureDescriptions[unit];
			if (!toDescription) {
				throw new ReferenceError(`No description found for desired unit: ${unit}`);
			}
			
			// Apply target unit class name to cell.
			cell.className = toDescription.className;
		}
	}
}




class TemperatureColumnControl {
	
	static get CLICK_TARGETS_SELECTOR() { return '.temperature-unit, .close-button'; }
	
	static getIdBase() {
		return `temperatureControl_${TemperatureColumnControl.idCounter++}_`;
	}
	
	constructor(columnIndex, parent, temperatureConverter) {
		this.columnIndex = columnIndex;
		this.parent = parent;
		this.temperatureConverter = temperatureConverter;
		this.contextControl = new ContextControl();
	}
	
	init() {
		this.contextControl.addEventListener('create', this, false);
	}
	
	dispose() {
		const contextControl = this.contextControl;
		
		const controlElement = contextControl.getControlElement();
		if (controlElement) {
			const clickTargets = controlElement.querySelectorAll(TemperatureColumnControl.CLICK_TARGETS_SELECTOR);
			for (const clickTarget of clickTargets) {
				clickTarget.removeEventListener('click', this, false);
			}
			
			controlElement.querySelector('.temperature-filter-operator').removeEventListener('change', this, false);
			controlElement.querySelector('.temperature-filter-operand').removeEventListener('keyup', this, false);
		}
		
		contextControl.removeEventListener('create', this, false);
	}
	
	handleEvent(event) {
		const target = event.target;
		
		switch (event.type) {
			case 'create':
				this.defineContent(target.getControlElement());
				break;
			case 'click':
				if (target.classList.contains('temperature-unit')) {
					this.temperatureConverter.convertColumn(this.columnIndex, target.value);
				} else if (target.classList.contains('close-button')) {
					this.close();
				}
				break;
			case 'change':
			case 'keyup':
				this.updateParent();
				break;
		}
	}
	
	open() {
		this.contextControl.open(this.parent.getTableHeaderElement(this.columnIndex));
	}
	
	close() {
		this.contextControl.close();
	}
	
	getFilterDescriptor() {
		const controlElement = this.contextControl.getControlElement();
		if (!controlElement) {
			return null;
		}
		
		const operand = Number.parseFloat(controlElement.querySelector('.temperature-filter-operand').value);
		if (Number.isNaN(operand)) {
			return null;
		}
		
		return new SimpleFilterDescriptor(this.columnIndex, operand, controlElement.querySelector('.temperature-filter-operator').value);
	}
	
	getSortDescriptor() {
		// Not strictly necessary; no return statement implies a return value of undefined.
		return null;
	}
	
	updateParent() {
		'use strict';
		
		this.parent.processTable();
		this.contextControl.position();
	}
	
	defineContent(container) {
		const builder = new XMLBuilder();
		const idBase = TemperatureColumnControl.getIdBase();
		
		const fId = idBase + 'fInput';
		const cId = idBase + 'cInput';
		const kId = idBase + 'kInput';
		const unitInputSetName = idBase + 'temperatureInput';
		const operatorId = idBase + 'operator';
		const operandId = idBase + 'operand';
		
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
		
		
		container.insertAdjacentHTML('afterbegin', builder.toString());
		
		for (const clickTarget of container.querySelectorAll(TemperatureColumnControl.CLICK_TARGETS_SELECTOR)) {
			clickTarget.addEventListener('click', this, false);
		}
		
		container.querySelector('.temperature-filter-operator').addEventListener('change', this, false);
		container.querySelector('.temperature-filter-operand').addEventListener('keyup', this, false);
	}
}

// (Static field declarations within the body of the class are not yet standardized.)
TemperatureColumnControl.idCounter = 0;



class TemperatureColumnControlFactory {

	constructor(temperatureConverter) {
		this.temperatureConverter = temperatureConverter;
	}
	
	getColumnControl(columnIndex, parent) {
		if (parent.getTableHeaderElement(columnIndex).classList.contains('temperature-column')) {
			return new TemperatureColumnControl(columnIndex, parent, this.temperatureConverter);
		}
		
		// Not strictly necessary; no return statement implies a return value of undefined.
		return null;
	}
}