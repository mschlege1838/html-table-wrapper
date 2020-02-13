
// Constructor
/**
 * @constructor
 * @implements SortDescriptor
 * @param {number} columnIndex Column index for which this descriptor applies.
 * @param {boolean} [descending=false] `true` if the result of this descriptor is to be inverted.
 * @param {number} [columnType={@link HTMLTableWrapperUtils.COLUMN_TYPE_INFER}] 
 *   `HTMLTableWrapperUtils.COLUMN_TYPE_*` constant indicating how this column is to be sorted.
 * @classdesc
 *
 * Simple/direct implementation of {@link SortDescriptor}. 
 */
function SimpleSortDescriptor(columnIndex, descending, columnType) {
    'use strict';
    
    this.columnIndex = columnIndex;
    
    if (descending) {
        this.descending = true;
    }
    if (columnType && columnType !== HTMLTableWrapperUtils.COLUMN_TYPE_INFER) {
        this.columnType = columnType;
    }
}


// Default Instance Properties
SimpleSortDescriptor.prototype.descending = false;

/**
 * How this column is to be sorted. If {@link HTMLTableWrapperUtils.COLUMN_TYPE_INFER}, will attempt to convert values to
 * numbers prior to running the sort comparison; values that cannot be converted will be compared as strings,
 * and will be sorted under those successfully converted to numbers. If {@link HTMLTableWrapperUtils.COLUMN_TYPE_TEXT}, all
 * values will be compared as strings only.
 *
 * @type {number}
 */
SimpleSortDescriptor.prototype.columnType = HTMLTableWrapperUtils.COLUMN_TYPE_INFER;


// Instance Methods
SimpleSortDescriptor.prototype.compare = function (cellA, cellB) {
    'use strict';
    
    var aVal, bVal, result, columnType, aNum, aNaN, bNum, bNaN;
    
    aVal = IE8Compatibility.getTextContent(cellA).trim();
    bVal = IE8Compatibility.getTextContent(cellB).trim();
    
    columnType = this.columnType;
    switch (columnType) {
        case HTMLTableWrapperUtils.COLUMN_TYPE_INFER:
            aNum = HTMLTableWrapperUtils.getNumber(aVal, true);
            aNaN = IE8Compatibility.isNaN(aNum);
            bNum = HTMLTableWrapperUtils.getNumber(bVal, true);
            bNaN = IE8Compatibility.isNaN(bNum);
            
            if (aNaN && bNaN) {
                result = aVal < bVal ? -1 : (aVal > bVal ? 1 : 0);
            } else if (aNaN) {
                result = 1;
            } else if (bNaN) {
                result = -1;
            } else {
                result = aNum - bNum;
            }
            break;
        case HTMLTableWrapperUtils.COLUMN_TYPE_TEXT:
            result = aVal < bVal ? -1 : (aVal > bVal ? 1 : 0);
            break;
        default:
            result = 0;
    }
    
    if (!result) {
        return 0;
    }
    
    return this.descending ? -1 * result : result;
};