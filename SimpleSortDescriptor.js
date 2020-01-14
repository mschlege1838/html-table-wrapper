
// Constructor
/**
 * @constructor
 * @implements SortDescriptor
 * @param {number} columnIndex Column index to which this descriptor is to apply.
 * @param {boolean} [descending=false] true if the result of this descriptor is to be inverted.
 * @param {number} [columnType={@link SimpleDataTableUtils.COLUMN_TYPE_INFER}] 
 *		How this column is to be sorted. Default is infer, set to {@link SimpleDataTableUtils.COLUMN_TYPE_TEXT} to sort as text only.
 * @classdesc
 *		Simple/direct implementation of {@link SortDescriptor}. 
 */
function SimpleSortDescriptor(columnIndex, descending, columnType) {
	'use strict';
	
	this.columnIndex = columnIndex;
	
	if (descending) {
		this.descending = true;
	}
	if (columnType && columnType !== SimpleDataTableUtils.COLUMN_TYPE_INFER) {
		this.columnType = columnType;
	}
}


// Default Instance Properties
SimpleSortDescriptor.prototype.descending = false;

/**
 * How this column is to be sorted. If {@link SimpleDataTableUtils.COLUMN_TYPE_INFER}, will attempt to convert values to
 * numbers prior to running the sort comparison; values that cannot be converted will be compared as strings,
 * and will be sorted under those successfully converted to numbers. If {@link SimpleDataTableUtils.COLUMN_TYPE_TEXT}, all
 * values will be compared as strings only.
 *
 * @type {number}
 */
SimpleSortDescriptor.prototype.columnType = SimpleDataTableUtils.COLUMN_TYPE_INFER;


// Instance Methods
SimpleDataTableUtils.prototype.compare = function (cellA, cellB) {
	'use strict';
	
	var aVal, bVal;
	
	aVal = cellA.textContent.trim();
	bVal = cellB.textContent.trim();
	
	return SimpleDataTableUtils.doCompare(aVal, bVal, this.columnType);
};