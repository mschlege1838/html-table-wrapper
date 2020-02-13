

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