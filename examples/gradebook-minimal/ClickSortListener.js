

function ClickSortListener(htmlTableWrapper) {
    'use strict';
    
    this.htmlTableWrapper = htmlTableWrapper;
}

// Static fields.
ClickSortListener.ASCENDING_SORT_CLASS_NAME = 'ascending';
ClickSortListener.DESCENDING_SORT_CLASS_NAME = 'descending';

// Instance fields.
ClickSortListener.prototype.tableHeaderCache = null;
ClickSortListener.prototype.lastColumnIndex = -1;

// Instance methods.
ClickSortListener.prototype.init = function () {
    'use strict';
    
    var tableHeaderCache, tableHeaders, i, tableHeader;
    
    tableHeaderCache = this.tableHeaderCache = [];
    tableHeaders = this.htmlTableWrapper.getTableElement().tHead.rows[0].cells;
    for (i = 0; i < tableHeaders.length; ++i) {
        tableHeader = tableHeaders[i];
        tableHeader.addEventListener('click', this, false);
        tableHeaderCache.push(tableHeader);
    }
};

ClickSortListener.prototype.dispose = function () {
    'use strict';
    
    var tableHeaderCache, i;
    
    tableHeaderCache = this.tableHeaderCache;
    for (i = 0; i < tableHeaderCache.length; ++i) {
        tableHeaderCache[i].removeEventListener('click', this, false);
    }
    
    this.tableHeaderCache = null;
};

ClickSortListener.prototype.handleEvent = function (event) {
    'use strict';
    
    var header, headerClassList, columnIndex, htmlTableWrapper, lastColumnIndex, tableHeaderCache;
    
    // Setup.
    htmlTableWrapper = this.htmlTableWrapper;
    tableHeaderCache = this.tableHeaderCache;
    header = event.target;
    
    // Error conditions.
    columnIndex = tableHeaderCache.indexOf(header);
    if (columnIndex === -1) {
        console.warn('Unrecognized column.');
        return;
    }
    
    // Clear last sorted column.
    lastColumnIndex = this.lastColumnIndex;
    if (lastColumnIndex !== -1 && columnIndex !== lastColumnIndex) {
        headerClassList = tableHeaderCache[lastColumnIndex].classList;
        headerClassList.remove(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
        headerClassList.remove(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
    }
    this.lastColumnIndex = columnIndex;
    
    // Sort requested column.
    headerClassList = header.classList;
    
    // Currently sorted in ascending order => switch to descending.
    if (headerClassList.contains(ClickSortListener.ASCENDING_SORT_CLASS_NAME)) {
        headerClassList.remove(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
        headerClassList.add(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
        
        htmlTableWrapper.sort(new SimpleSortDescriptor(columnIndex, true));
    } 
    // Currently sorted in descending order => clear sorting.
    else if (headerClassList.contains(ClickSortListener.DESCENDING_SORT_CLASS_NAME)) {
        headerClassList.remove(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
        
        htmlTableWrapper.clearSort();
    } 
    // Currently not sorted => switch to ascending.
    else {
        headerClassList.add(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
        
        htmlTableWrapper.sort(new SimpleSortDescriptor(columnIndex, false));
    }
};
