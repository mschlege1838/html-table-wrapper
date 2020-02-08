
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



class HighLowFilter {
	
	constructor(columnIndex, gtRange, lteRange) {
		this.columnIndex = columnIndex;
		this.gtRange = gtRange;
		this.lteRange = lteRange;
	}
	
	include(cell) {
		const currentValue = Number.parseFloat(cell.textContent);
		if (Number.isNaN(currentValue)) {
			return false;
		}
		
		const gtRange = this.gtRange;
		const lteRange = this.lteRange;
		
		if (!Number.isNaN(gtRange) && !(currentValue > gtRange)) {
			return false;
		}
		if (!Number.isNaN(lteRange) && !(currentValue <= lteRange)) {
			return false;
		}
		
		return true;
	}
	
}


class SwingFilter {
	
	constructor(gtRange, lteRange, highColumnIndex, lowColumnIndex) {
		this.gtRange = gtRange;
		this.lteRange = lteRange;
		this.highColumnIndex = highColumnIndex;
		this.lowColumnIndex = lowColumnIndex;
	}
	
	include(row) {
		const cells = row.cells;
		
		const currentSwing = Number.parseFloat(cells[this.highColumnIndex].textContent) - Number.parseFloat(cells[this.lowColumnIndex].textContent)
		if (Number.isNaN(currentSwing)) {
			return false;
		}
		
		const gtRange = this.gtRange;
		const lteRange = this.lteRange;
		
		if (!Number.isNaN(gtRange) && !(currentSwing > gtRange)) {
			return false;
		}
		if (!Number.isNaN(lteRange) && !(currentSwing <= lteRange)) {
			return false;
		}
		
		return true;
	}
}

class TemperatureCategoryListener {
	
	constructor(tableWrapper, categoryInputs, highColumnIndex, lowColumnIndex) {
		this.tableWrapper = tableWrapper;
		this.categoryInputs = categoryInputs;
		this.highColumnIndex = highColumnIndex;
		this.lowColumnIndex = lowColumnIndex;
	}
	
	init() {
		for (const input of this.categoryInputs) {
			input.addEventListener('click', this, false);
		}
	}
	
	dispose() {
		for (const input of this.categoryInputs) {
			input.removeEventListener('click', this, false);
		}
	}
	
	handleEvent() {
		this.updateTable();
	}
	
	updateTable() {
		const tableWrapper = this.tableWrapper;
		const highColumnIndex = this.highColumnIndex;
		const lowColumnIndex = this.lowColumnIndex;
		
		const tableFilters = [];
		for (const input of this.categoryInputs) {
			if (!input.checked) {
				continue;
			}
			
			if (input.value === 'none') {
				continue;
			}
			
			const gt = Number.parseFloat(input.getAttribute(TemperatureConversionListener.CURRENT_GT_ATTRIBUTE));
			const lte = Number.parseFloat(input.getAttribute(TemperatureConversionListener.CURRENT_LTE_ATTRIBUTE));
			
			const classList = input.classList;
			if (classList.contains('high')) {
				tableFilters.push(new HighLowFilter(highColumnIndex, gt, lte));
			} else if (classList.contains('low')) {
				tableFilters.push(new HighLowFilter(lowColumnIndex, gt, lte));
			} else if (classList.contains('swing')) {
				tableFilters.push(new SwingFilter(gt, lte, highColumnIndex, lowColumnIndex));
			}
		}
		
		tableWrapper.filter(tableFilters);
	}

}


class HighLowSortDescriptor {
	
	constructor(columnIndex, descending) {
		this.columnIndex = columnIndex;
		this.descending = descending;
	}
	
	compare(cellA, cellB) {
		const numA = Number.parseFloat(cellA.textContent);
		const numB = Number.parseFloat(cellB.textContent);
		
		const aNaN = Number.isNaN(numA);
		const bNaN = Number.isNaN(numB);
		if (aNaN && bNaN) {
			return 0;
		} else if (aNaN) {
			return 1;
		} else if (bNaN) {
			return -1;
		}
		
		const result = numA - numB;
		return this.descending ? -1 * result : result;
	}
	
}


class SwingSortDescriptor {
	
	constructor(highColumnIndex, lowColumnIndex, descending) {
		this.highColumnIndex = highColumnIndex;
		this.lowColumnIndex = lowColumnIndex;
		this.descending = descending;
	}
	
	compare(rowA, rowB) {
		const highColumnIndex = this.highColumnIndex;
		const lowColumnIndex = this.lowColumnIndex;
		
		const aCells = rowA.cells;
		const bCells = rowB.cells;
		
		const aSwing = Number.parseFloat(aCells[highColumnIndex].textContent) - Number.parseFloat(aCells[lowColumnIndex].textContent);
		const bSwing = Number.parseFloat(bCells[highColumnIndex].textContent) - Number.parseFloat(bCells[lowColumnIndex].textContent);
		
		const aNaN = Number.isNaN(aSwing);
		const bNaN = Number.isNaN(bSwing);
		if (aNaN && bNaN) {
			return 0;
		} else if (aNaN) {
			return 1;
		} else if (bNaN) {
			return -1;
		}
		
		const result = aSwing - bSwing;
		return this.descending ? -1 * result : result;
	}
}



class TemperatureSortListener {
	
	static get CATEGORY_ATTRIBUTE_NAME() { return 'data-category'; }
	
	constructor(tableWrapper, sortInputs, highColumnIndex, lowColumnIndex) {
		this.tableWrapper = tableWrapper;
		this.sortInputs = sortInputs;
		this.highColumnIndex = highColumnIndex;
		this.lowColumnIndex = lowColumnIndex;
	}
	
	init() {
		for (const input of this.sortInputs) {
			input.addEventListener('click', this, false);
		}
	}
	
	dispose() {
		for (const input of this.sortInputs) {
			input.removeEventListener('click', this, false);
		}
	}
	
	handleEvent(event) {
		const target = event.target;
		this.doSort(target.getAttribute(TemperatureSortListener.CATEGORY_ATTRIBUTE_NAME), target.value);
	}
	
	doSort(category, direction) {
		const tableWrapper = this.tableWrapper;
		const highColumnIndex = this.highColumnIndex;
		const lowColumnIndex = this.lowColumnIndex;
		
		const descending = direction == 'desc';
		let sortDescriptor;
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
			tableWrapper.sort(sortDescriptor);
		} else {
			tableWrapper.clearSort();
		}
	}
}

