

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