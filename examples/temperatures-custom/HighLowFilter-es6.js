

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