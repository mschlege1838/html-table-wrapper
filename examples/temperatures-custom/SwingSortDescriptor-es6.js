

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