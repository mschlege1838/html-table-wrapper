

class TemperatureConversionListener {
	
	static get ORIGINAL_UNIT_ATTRIBUTE() { return 'data-orig-unit'; }
	static get ORIGINAL_GT_ATTRIBUTE() { return 'data-orig-gt'; }
	static get ORIGINAL_LTE_ATTRIBUTE() { return 'data-orig-lte'; }
	static get ORIGINAL_READING_ATTRIBUTE() { return 'data-orig-temp'; }

	static get CURRENT_GT_ATTRIBUTE() { return 'data-gt'; }
	static get CURRENT_LTE_ATTRIBUTE() { return 'data-lte'; }

	static get APPLICABLE_INPUT_SELECTOR() { return `.temperature-category[${TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE}]`; }

	static get TEMPERATURE_COLUMN_CLASS_NAME() { return 'temperature-column'; }

	static get SWING_CATEGORY_CLASS_NAME() { return 'swing'; }
	
	
	static convertField(field, conversionFn, origAttribute, currentAttribute) {
		const orig = Number.parseFloat(field.getAttribute(origAttribute));
		let current;
		if (!Number.isNaN(orig)) {
			current = TemperatureConversionListener.strRoundToMax(conversionFn(orig), 2);
			field.setAttribute(currentAttribute, current);
		} else {
			current = NaN;
			field.removeAttribute(currentAttribute);
		}
		
		return current;
	}
	
	static getTitle(gt, lte, unit) {
		const gtNum = !Number.isNaN(gt);
		const lteNum = !Number.isNaN(lte);
		const unitAffix = `\u00B0${unit}`;
		const rtm = TemperatureConversionListener.strRoundToMax;
		
		if (gtNum && lteNum) {
			return `${rtm(gt, 2)}${unitAffix} < T <= ${rtm(lte, 2)}${unitAffix}`;
		} else if (gtNum) {
			return `T > ${rtm(gt, 2)}${unitAffix}`;
		} else if (lteNum) {
			return `T <= ${rtm(lte, 2)}${unitAffix}`;
		}
		
		return '';
	}
	
	static strRoundToMax(num, places) {
		const sign = Math.sign(num);
		num = Math.abs(num);
		
		const fixed = (num + 2 * Number.EPSILON).toFixed(places);
		
		const decimalPointIndex = fixed.indexOf('.');
		const trailingZeroIndex = fixed.indexOf('0', decimalPointIndex);
		
		let result;
		if (trailingZeroIndex == -1) {
			result = fixed;
		} else if (trailingZeroIndex == decimalPointIndex + 1) {
			result = fixed.substring(0, decimalPointIndex);
		} else {
			result = fixed.substring(0, trailingZeroIndex);
		}
		
		return sign < 0 ? '-' + result : result;
	}
	
	
	constructor(table, categoryFieldGroup, conversionMapping, unitInputs) {
		this.table = table;
		this.categoryFieldGroup = categoryFieldGroup;
		this.conversionMapping = conversionMapping;
		this.unitInputs = unitInputs;
	}
	
	
	init() {
		for (const input of this.unitInputs) {
			input.addEventListener('click', this, false);
			if (input.checked) {
				this.convertTo(input.value);
			}
		}
	}
	
	dispose() {
		for (const input of this.unitInputs) {
			input.removeEventListener('click', this, false);
		} 
	}
	
	handleEvent(event) {
		this.convertTo(event.target.value);
	}
	
	convertTo(targetUnit) {
		this.convertFields(targetUnit);
		this.convertTable(targetUnit);
	}
	
	convertFields(targetUnit) {
		const categoryFieldGroup = this.categoryFieldGroup;
		
		const fields = categoryFieldGroup.querySelectorAll(TemperatureConversionListener.APPLICABLE_INPUT_SELECTOR);
		for (const field of fields) {
			
			// Get conversion function.
			const conversionFn = this.getConversionFn(field.getAttribute(TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE), targetUnit,
					field.classList.contains(TemperatureConversionListener.SWING_CATEGORY_CLASS_NAME) ? 'toUnit' : 'toTemp');
			
			// Convert fields, set attributes.
			const gt = TemperatureConversionListener.convertField(field, conversionFn, TemperatureConversionListener.ORIGINAL_GT_ATTRIBUTE, TemperatureConversionListener.CURRENT_GT_ATTRIBUTE);
			const lte = TemperatureConversionListener.convertField(field, conversionFn, TemperatureConversionListener.ORIGINAL_LTE_ATTRIBUTE, TemperatureConversionListener.CURRENT_LTE_ATTRIBUTE);
			
			// Set title on corresponding label, if present.
			const correspondingLabel = categoryFieldGroup.querySelector(`label[for="${field.id}"]`);
			if (correspondingLabel) {
				correspondingLabel.title = TemperatureConversionListener.getTitle(gt, lte, targetUnit);
			}
		}
	}
	
	convertTable(targetUnit) {
		const table = this.table;
		const conversionMapping = this.conversionMapping;
		
		const temperatureColumnIndicies = [];
		let columnIndex = -1;
		for (const header of table.tHead.rows[0].cells) {
			++columnIndex;
			if (header.classList.contains(TemperatureConversionListener.TEMPERATURE_COLUMN_CLASS_NAME)) {
				temperatureColumnIndicies.push(columnIndex);
			}
		}
		
		if (!temperatureColumnIndicies.length) {
			return;
		}
		
		let rowIndex = -1;
		for (const row of table.tBodies[0].rows) {
			++rowIndex;
			const cells = row.cells;
			
			for (const columnIndex of temperatureColumnIndicies) {
				const cell = cells[columnIndex];
				
				const originalReadingRaw = cell.getAttribute(TemperatureConversionListener.ORIGINAL_READING_ATTRIBUTE);
				const originalReading = Number.parseFloat(originalReadingRaw);
				if (Number.isNaN(originalReading)) {
					throw new Error(`Unable to parse original reading: ${originalReadingRaw} (row ${rowIndex}, column ${columnIndex})`);
				}
				
				const conversionFn = this.getConversionFn(cell.getAttribute(TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE), targetUnit, 'toTemp');
				cell.textContent = TemperatureConversionListener.strRoundToMax(conversionFn(originalReading), 2);
				cell.className = conversionMapping[targetUnit].className;
			}
		}
	}
	
	getConversionFn(fromUnit, toUnit, lib) {
		const conversionMapping = this.conversionMapping;
		
		const conversion = conversionMapping[fromUnit];
		if (!conversion) {
			throw new Error(`No conversion for unit: ${fromUnit}`);
		}
		
		const conversionFn = conversion[lib][toUnit];
		if (!conversionFn) {
			throw new Error(`No conversion from ${originalUnit} to target unit: ${toUnit}`);
		}
		
		return conversionFn;
	}
}