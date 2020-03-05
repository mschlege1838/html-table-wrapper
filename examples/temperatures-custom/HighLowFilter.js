

function HighLowFilter(columnIndex, gtRange, lteRange) {
    'use strict';
    
    this.columnIndex = columnIndex;
    this.gtRange = gtRange;
    this.lteRange = lteRange;
}

HighLowFilter.prototype.include = function (cell) {
    'use strict';
    
    var gtRange, lteRange, currentValue;
    
    // Parse current value.
    currentValue = Number.parseFloat(cell.textContent);
    if (Number.isNaN(currentValue)) {
        // Always filter NaNs
        return false;
    }
    
    gtRange = this.gtRange;
    lteRange = this.lteRange;
    
    // If the current value is not greater than the lower bound of the range, filter.
    if (!Number.isNaN(gtRange) && !(currentValue > gtRange)) {
        return false;
    }
    // If the current value is not less than or equal to the upper bound of the range, filter.
    if (!Number.isNaN(lteRange) && !(currentValue <= lteRange)) {
        return false;
    }
    
    // Otheriwse, include.
    return true;
};