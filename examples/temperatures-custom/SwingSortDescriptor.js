

function SwingSortDescriptor(highColumnIndex, lowColumnIndex, descending) {
	'use strict';
	
	this.highColumnIndex = highColumnIndex;
	this.lowColumnIndex = lowColumnIndex;
	this.descending = descending;
}

SwingSortDescriptor.prototype.compare = function (rowA, rowB) {
	'use strict';
	
	var highColumnIndex, lowColumnIndex, aCells, bCells, aSwing, bSwing, aNaN, bNaN, result;
	
	highColumnIndex = this.highColumnIndex;
	lowColumnIndex = this.lowColumnIndex;
	
	aCells = rowA.cells;
	bCells = rowB.cells;
	
	aSwing = Number.parseFloat(aCells[highColumnIndex].textContent) - Number.parseFloat(aCells[lowColumnIndex].textContent);
	bSwing = Number.parseFloat(bCells[highColumnIndex].textContent) - Number.parseFloat(bCells[lowColumnIndex].textContent);
	
	aNaN = Number.isNaN(aSwing);
	bNaN = Number.isNaN(bSwing);
	if (aNaN && bNaN) {
		return 0;
	} else if (aNaN) {
		return 1;
	} else if (bNaN) {
		return -1;
	}
	
	result = aSwing - bSwing;
	return this.descending ? -1 * result : result;
};