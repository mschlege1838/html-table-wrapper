
// ClickSortListener
function ClickSortListener(tableWrapper) {
    'use strict';
    
    this.tableWrapper = tableWrapper;
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
    tableHeaders = this.tableWrapper.getTableElement().tHead.rows[0].cells;
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
    
    var header, headerClassList, columnIndex, tableWrapper, lastColumnIndex, tableHeaderCache;
    
    // Setup.
    tableWrapper = this.tableWrapper;
    tableHeaderCache = this.tableHeaderCache;
    header = event.target;
    
    // Error conditions.
    columnIndex = tableHeaderCache.indexOf(header);
    if (columnIndex === -1) {
        throw new Error('Unrecognized column.');
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
    if (headerClassList.contains(ClickSortListener.ASCENDING_SORT_CLASS_NAME)) {
        headerClassList.remove(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
        headerClassList.add(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
        
        tableWrapper.sort(new SimpleSortDescriptor(columnIndex, true));
    } else if (headerClassList.contains(ClickSortListener.DESCENDING_SORT_CLASS_NAME)) {
        headerClassList.remove(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
        
        tableWrapper.clearSort();
    } else {
        headerClassList.add(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
        
        tableWrapper.sort(new SimpleSortDescriptor(columnIndex, false));
    }
};
//


// GradeCategoryListener
function GradeCategoryListener(tableWrapper, gradeColumnIndex, gradeCategoryInputs) {
    'use strict';
    
    this.tableWrapper = tableWrapper;
    this.gradeColumnIndex = gradeColumnIndex;
    this.gradeCategoryInputs = gradeCategoryInputs;
}

GradeCategoryListener.prototype.init = function () {
    'use strict';
    
    var gradeCategoryInputs, i;
    
    gradeCategoryInputs = this.gradeCategoryInputs;
    for (i = 0; i < gradeCategoryInputs.length; ++i) {
        gradeCategoryInputs[i].addEventListener('click', this, false);
    }
};

GradeCategoryListener.prototype.dispose = function () {
    'use strict';
    
    var gradeCategoryInputs, i;
    
    gradeCategoryInputs = this.gradeCategoryInputs;
    for (i = 0; i < gradeCategoryInputs.length; ++i) {
        gradeCategoryInputs[i].removeEventListener('click', this, false);
    }
};

GradeCategoryListener.prototype.handleEvent = function (event) {
    'use strict';
    
    this.filterByCategory(event.target.value);
};

GradeCategoryListener.prototype.filterByCategory = function (category) {
    'use strict';
    
    var tableWrapper, gradeColumnIndex;
    
    tableWrapper = this.tableWrapper;
    gradeColumnIndex = this.gradeColumnIndex;
    
    switch (category) {
        case 'passing':
            tableWrapper.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '<='));
            break;
        case 'failing':
            tableWrapper.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '>'));
            break;
        case 'all':
        default:
            tableWrapper.clearFilter();
            break;
    }

};