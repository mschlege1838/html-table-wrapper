

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