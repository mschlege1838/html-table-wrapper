


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