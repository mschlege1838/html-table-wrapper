

function HighLowSortDescriptor(columnIndex, descending) {
    'use strict';
    
    this.columnIndex = columnIndex;
    this.descending = descending;
}

HighLowSortDescriptor.prototype.compare = function (cellA, cellB) {
    'use strict';
    
    var numA, numB, aNaN, bNaN, result;
    
    numA = Number.parseFloat(cellA.textContent);
    numB = Number.parseFloat(cellB.textContent);
    
    aNaN = Number.isNaN(numA);
    bNaN = Number.isNaN(numB);
    if (aNaN && bNaN) {
        return 0;
    } else if (aNaN) {
        return 1;
    } else if (bNaN) {
        return -1;
    }
    
    result = numA - numB;
    return this.descending ? -1 * result : result;
};