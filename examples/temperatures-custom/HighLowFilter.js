

function HighLowFilter(columnIndex, gtRange, lteRange) {
    'use strict';
    
    this.columnIndex = columnIndex;
    this.gtRange = gtRange;
    this.lteRange = lteRange;
}

HighLowFilter.prototype.include = function (cell) {
    'use strict';
    
    var gtRange, lteRange, currentValue;
    
    currentValue = Number.parseFloat(cell.textContent);
    if (Number.isNaN(currentValue)) {
        return false;
    }
    
    gtRange = this.gtRange;
    lteRange = this.lteRange;
    
    if (!Number.isNaN(gtRange) && !(currentValue > gtRange)) {
        return false;
    }
    if (!Number.isNaN(lteRange) && !(currentValue <= lteRange)) {
        return false;
    }
    
    return true;
};