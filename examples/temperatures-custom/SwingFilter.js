

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
    
    // Calculate difference between the high and low (swing).
    currentSwing = Number.parseFloat(cells[this.highColumnIndex].textContent) - Number.parseFloat(cells[this.lowColumnIndex].textContent)
    if (Number.isNaN(currentSwing)) {
        // Always filter NaNs.
        return false;
    }
    
    gtRange = this.gtRange;
    lteRange = this.lteRange;
    
    // If the current swing is not greater than the lower bound of the range, filter.
    if (!Number.isNaN(gtRange) && !(currentSwing > gtRange)) {
        return false;
    }
    // If the current swing is not less than or equal to the upper bound of the range, filter.
    if (!Number.isNaN(lteRange) && !(currentSwing <= lteRange)) {
        return false;
    }
    
    // Otheriwse, include.
    return true;
};