

function HighLowSortDescriptor(columnIndex, descending) {
    'use strict';
    
    this.columnIndex = columnIndex;
    this.descending = descending;
}

HighLowSortDescriptor.prototype.compare = function (cellA, cellB) {
    'use strict';
    
    var numA, numB, aNaN, bNaN, result;
    
    // Parse cell values.
    numA = Number.parseFloat(cellA.textContent);
    numB = Number.parseFloat(cellB.textContent);
    
    // Test for NaN.
    aNaN = Number.isNaN(numA);
    bNaN = Number.isNaN(numB);
    if (aNaN && bNaN) {
        return 0;
    } else if (aNaN) {
        return 1;
    } else if (bNaN) {
        return -1;
    }
    
    // Return difference, or inverse of the difference if descending.
    result = numA - numB;
    return this.descending ? -1 * result : result;
};