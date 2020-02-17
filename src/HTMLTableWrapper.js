/*
 * Copyright 2020 Martin F. Schlegel Jr. | MIT AND BSD-3-Clause
 */

// Virtual Interfaces

// SortDescriptor
/**
 *
 * @interface SortDescriptor
 * @classdesc
 *
 * Describes the information necessary to sort a table based upon a column.
 */
/**
 * Optional property indicating the index of the column this `SortDescriptor` describes how to sort. If this property
 * is not a positive number, it will be assumed this `SortDescriptor` describes how to sort entire rows.
 *
 * @member {number} SortDescriptor#columnIndex
 */
/**
 * Callback comparator function that compares one cell or row to another. If {@link SortDescriptor#columnIndex} is defined, and
 * a postiive number, `HTMLTableCellElement`s in the approprite position within the rows being compared will be passed to this
 * function corresponding to this `SortDescriptor`'s {@link SortDescriptor#columnIndex} property, otherwise the `HTMLTableRowElement`s
 * undergoing comparison will be passed.
 *
 * If this function returns a value greater than 0, the relevant row corresponding to the first given item will be sorted below the second,
 * if a value less than 0, the first will be sorted above the second, and if 0, no preference will be applied.
 *
 * @function SortDescriptor#compare
 * @param {HTMLCellElement|HTMLTableRowElement} itemA Reference cell or row.
 * @param {HTMLCellElement|HTMLTableRowElement} itemB Compare cell or row.
 * @returns {number} 
 *   A value greater than 0 if `itemA` should be sorted below `itemB`, less than 0 for above, 0 for no preference.
 */


// FilterDescriptor
/**
 * @interface FilterDescriptor
 * @classdesc
 *
 * Describes the information necessary to filter a table based upon a column.
 */
/**
 * Optional property indicating the index of the column this `FilterDescriptor` describes how to filter. If this property
 * is not a positive number, it will be assumed this `FilterDescriptor` describes how to filter entire rows.
 * 
 * @member {number} FilterDescriptor#columnIndex
 */
/**
 * Callback function to determine whether the given row or cell's parent row should be filtered. If {@link FilterDescriptor#columnIndex}
 * is defined, and a postiive number, the `HTMLTableCellElement` in the approprite position within the row being considered will be passed
 * to this function corresponding to this `FilterDescriptor`'s {@link FilterDescriptor#columnIndex} property, otherwise the `HTMLTableRowElement`
 * being considered will be passed directly. 
 *
 * If this function returns `false`, the relevant row will be filtered.
 *
 * @function FilterDescriptor#include
 * @param {HTMLCellElement|HTMLTableRowElement} item Cell or Row to be considered for inclusion.
 * @returns {boolean} `false` if the given `item` should be filtered.
 */




// Constructor
/**
 * 
 * @constructor 
 * @param {HTMLTableElement} table Table element this `HTMLTableWrapper` is to process.
 * @throws {ReferenceError} If `table` is not defined, or does not have any table body sections.
 * @classdesc
 *
 * Wrapper for `HTMLTableElement`s that provides a limited set of extended functionality, most notably the capibility of {@link HTMLTableWrapper#sort sorting} and 
 * {@link HTMLTableWrapper#filter filtering} the first table body section.
 *
 * As the description implies, the given `table` must define at least one table body section, and that section should contain the table's primary data set
 * (any subsequent table body sections are ignored). It is also assumed all the cells for each column are aligned (i.e. they all define the same `colSpan`;
 * any misaligned rows will likely result in `RangeError`s). 
 *
 */
function HTMLTableWrapper(table) {
    'use strict';
    
    if (!table || !table.tBodies || !table.tBodies.length) {
        throw new ReferenceError('Table must be an defined and have a body.');
    }
    
    /**
     * Backing `HTMLTableElement`.
     *
     * @private
     * @type {HTMLTableElement}
     */
    this.table = table;
    
    /**
     * Cache of the initial state of the table's rows. Used when sort parameters are {@link HTMLTableWrapper#clearSort cleared}.
     *
     * @private
     * @type {Array}
     */
    this.initialOrder = HTMLTableWrapper.copy(table.tBodies[0].rows);

}



// Static Fields

/**
 * Class name added to the class list of filtered elements. Default value is `'data-table-filtered'`.
 *
 * @type {string}
 */
HTMLTableWrapper.filteredClassName = 'data-table-filtered';



// Static methods
/**
 * Utility function to copy the elements from the given `src` {@link MinimalList} into a new `Array`.
 *
 * @private
 * @param {MinimalList} src List to be copied.
 * @return {Array} An `Array` containing the same elements of the given `src`.
 */
HTMLTableWrapper.copy = function (src) {
    
    var result, i;
    
    result = [];
    for (i = 0; i < src.length; ++i) {
        result.push(src[i]);
    }
    
    return result;
};







// Instance methods
/**
 * Sorts the first table body section of the backing table according to the given {@link SortDescriptor}s. This function can be called with a single
 * `Array` of {@link SortDescriptor}s or in a variadic manner. If no arguments are provided, or a zero-length `Array` is provided for argument 0,
 * {@link HTMLTableWrapper#clearSort} is implicitly called.
 *
 * @param {...SortDescriptor} args 
 *   {@link SortDescriptor}s to process. If the first argument is an `Array`, it will be used and subsequent arguments
 *   will be ignored.
 */
HTMLTableWrapper.prototype.sort = function () {
    'use strict';
    
    var sortDescriptors, sortDescriptor, i, tbody, rows, copy, _this;
    
    // Pre-Validation Initialization.
    sortDescriptors = arguments[0] instanceof Array ? arguments[0] : arguments;
    
    if (!sortDescriptors.length) {
        this.clearSort();
        return;
    }
    
    // Validation.
    for (i = 0; i < sortDescriptors.length; ++i) {
        sortDescriptor = sortDescriptors[i];
        
        if (!sortDescriptor) {
            throw new ReferenceError('Invalid reference supplied for sort descriptor at index ' + i + ': ' + sortDescriptor);
        }
        
        if (typeof sortDescriptor.compare !== 'function') {
            throw new TypeError('Sort descriptor does not define define the compare property (of type function) at index ' + i);
        }
        
    }
    
    // Post-Validation Initialization.
    tbody = this.table.tBodies[0];
    rows = tbody.rows;
    copy = HTMLTableWrapper.copy(rows);
    
    // Perform sort.
    _this = this;
    copy.sort(function (rowA, rowB) {
        var sortDescriptor, columnIndex, cellA, cellB, compareValue, i;
        
        for (i = 0; i < sortDescriptors.length; ++i) {
            sortDescriptor = sortDescriptors[i];
            
            columnIndex = sortDescriptor.columnIndex;
            
            if (typeof columnIndex === 'number' && columnIndex >= 0) {
                cellA = rowA.cells[columnIndex];
                cellB = rowB.cells[columnIndex];
                compareValue = sortDescriptor.compare(cellA, cellB);
            } else {
                compareValue = sortDescriptor.compare(rowA, rowB);
            }
            
            
            
            // Allowing type coercion if (for whatever reason) the compare function does not return an integer.
            if (compareValue != 0) {
                return compareValue;
            }
            
        }
        return 0;
    });
    
    
    // Update table.
    while (rows.length) {
        tbody.removeChild(rows[0]);
    }
    
    for (i = 0; i < copy.length; ++i) {
        tbody.appendChild(copy[i]);
    }
};

/**
 * Filters the first table body section of the backing table according to the given {@link FilterDescriptor}s. This function can be called with a single
 * `Array` of {@link FilterDescriptor}s or in a variadic manner. If no arguments are provided or a zero-length `Array` is provided for argument 0,
 * {@link HTMLTableWrapper#clearFilter} is implicitly called.
 *
 * @param {...FilterDescriptor} args 
 *   {@link FilterDescriptor}s to process. If the first argument is an `Array`, it will be used and subsequent arguments
 *   will be ignored.
 */
HTMLTableWrapper.prototype.filter = function () {
    'use strict';
    
    var filterDescriptors, filterDescriptor, i, rows, row, filter, j, cells, columnIndex, shouldInclude;
    
    // Initialization.
    filterDescriptors = arguments[0] instanceof Array ? arguments[0] : arguments;
    
    if (!filterDescriptors.length) {
        this.clearFilter();
        return;
    }
    
    // Validation.
    for (i = 0; i < filterDescriptors.length; ++i) {
        filterDescriptor = filterDescriptors[i];
        
        if (!filterDescriptor) {
            throw new ReferenceError('Invalid reference supplied for filter descriptor at index ' + i);
        }
        
        if (typeof filterDescriptor.include !== 'function') {
            throw new TypeError('Filter descriptor does not define the include property (of type function) at index ' + i);
        }

    }
    
    // Perform filtering.
    rows = this.table.tBodies[0].rows;
    for (i = 0; i < rows.length; ++i) {
        row = rows[i];
        cells = row.cells;
        filter = false;
        
        for (j = 0; j < filterDescriptors.length; ++j) {
            filterDescriptor = filterDescriptors[j];
            
            columnIndex = filterDescriptor.columnIndex;
            
            if (typeof columnIndex === 'number' && columnIndex >= 0) {
                shouldInclude = filterDescriptor.include(cells[columnIndex]);
            } else {
                shouldInclude = filterDescriptor.include(row);
            }
            
            if (!shouldInclude) {
                filter = true;
                break;
            }
        }
        
        if (filter) {
            IE8Compatibility.addClass(row, HTMLTableWrapper.filteredClassName);
        } else {
            IE8Compatibility.removeClass(row, HTMLTableWrapper.filteredClassName);
        }
    }
};


/**
 * Clears all filters.
 */
HTMLTableWrapper.prototype.clearFilter = function () {
    'use strict';
    
    var i, rows;
    
    rows = this.table.tBodies[0].rows;
    
    for (i = 0; i < rows.length; ++i) {
        IE8Compatibility.removeClass(rows[i], HTMLTableWrapper.filteredClassName);
    }
    
};

/**
 * Clears the sorting for all columns. The original order for all rows (at the time this `HTMLTableWrapper` was constructed) is restored.
 */
HTMLTableWrapper.prototype.clearSort = function () {
    'use strict';
    
    var initialOrder, tbody, rows, i;
    
    tbody = this.table.tBodies[0];
    rows = tbody.rows;
    initialOrder = this.initialOrder;
    
    while (rows.length) {
        tbody.removeChild(rows[0]);
    }
    
    for (i = 0; i < initialOrder.length; ++i) {
        tbody.appendChild(initialOrder[i]);
    }
    
};


/**
 * Returns the `HTMLTableElement` backing this `HTMLTableWrapper`.
 *
 * @returns {HTMLTableElement} The `HTMLTableElement` backing this `HTMLTableWrapper`.
 */
HTMLTableWrapper.prototype.getTableElement = function () {
    'use strict';
    
    return this.table;
};

/**
 * Returns the `HTMLTableRowElement`s of the first table body section of the backing table. Rows that have been filtered are excluded unless
 * `includeFiltered` is `true`.
 *
 * *IMPLEMENTATION NOTE:* Callers to this function should only rely on the interface defined by {@link MinimalList}, as this method may return
 * either an `Array` or a `NodeList`.
 *
 * @param {boolean} [includeFiltered=false] Whether to include rows that are filtered in the result.
 * @returns {MinimalList} `HTMLTableRowElement`s of the first table body section of the backing table.
 */
HTMLTableWrapper.prototype.getRows = function (includeFiltered) {
    'use strict';
    
    var rows, row, i, result;
    
    rows = this.table.tBodies[0].rows;
    
    if (includeFiltered) {
        return rows;
    }
    
    result = [];
    for (i = 0; i < rows.length; ++i) {
        row = rows[i];
        if (!IE8Compatibility.hasClass(row, HTMLTableWrapper.filteredClassName)) {
            result.push(row);
        }
    }
    
    return result;
};
