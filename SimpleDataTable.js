

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
 * Index of the column this `SortDescriptor` describes how to sort.
 *
 * @member {number} SortDescriptor#columnIndex
 */
/**
 * Callback comparator function that compares one cell to another.
 *
 * @function SortDescriptor#compare
 * @param {HTMLCellElement} cellA Reference cell.
 * @param {HTMLCellElement} cellB Compare cell.
 * @returns {number} 
 *   A value greater than 0 if `cellA` should be sorted below `cellB`, less than 0 for above, 0 for no preference.
 */


// FilterDescriptor
/**
 * @interface FilterDescriptor
 * @classdesc
 *
 * Describes the information necessary to filter a table based upon a column.
 */
/**
 * Index of the column this `FilterDescriptor` describes how to filter.
 * 
 * @member {number} FilterDescriptor#columnIndex
 */
/**
 * Callback function to determine whether the given cell's row should be filtered. If this function returns `false`,
 * the containing row will be filtered.
 *
 * @function FilterDescriptor#include
 * @param {HTMLCellElement} cell Cell to be considered for inclusion.
 * @returns {boolean} `false` if the given `cell`'s row should be filtered.
 */




// Constructor
/**
 * 
 * @constructor 
 * @param {HTMLTableElement} table Table element this `SimpleDataTable` is to process.
 * @throws {ReferenceError} If `table` is not defined, or does not have any table body sections.
 * @classdesc
 *
 * Wrapper for `HTMLTableElement`s that provides a limited set of extended functionality, most notably the capibility of {@link SimpleDataTable#sort sorting} and 
 * {@link SimpleDataTable#filter filtering} the first table body section.
 *
 * As the description implies, the given `table` must define at least one table body section, and that section should contain the table's primary data set
 * (any subsequent table body sections are ignored). It is also assumed all the cells for each column are aligned (i.e. they all define the same `colSpan`;
 * any misaligned rows will likely result in `RangeError`s). 
 *
 */
function SimpleDataTable(table) {
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
	 * Cache of the initial state of the table's rows. Used when sort parameters are {@link SimpleDataTable#clearSort cleared}.
	 *
	 * @private
	 * @type {Array}
	 */
	this.initialOrder = SimpleDataTable.copy(table.tBodies[0].rows);

}



// Static Fields

/**
 * Class name added to the class list of filtered elements. Default value is `'data-table-filtered'`.
 *
 * @type {string}
 */
SimpleDataTable.filteredClassName = 'data-table-filtered';



// Static methods
/**
 * Utility function to copy the elements from the given `src` {@link MinimalList} into a new `Array`.
 *
 * @private
 * @param {MinimalList} src List to be copied.
 * @return {Array} An `Array` containing the same elements of the given `src`.
 */
SimpleDataTable.copy = function (src) {
	
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
 * {@link SimpleDataTable#clearSort} is implicitly called.
 *
 * @param {...SortDescriptor} args 
 *   {@link SortDescriptor}s to process. If the first argument is an Array, it will be used and subsequent arguments
 *   will be ignored.
 */
SimpleDataTable.prototype.sort = function () {
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
		
		if (typeof sortDescriptor.columnIndex !== 'number') {
			throw new TypeError('Sort descriptor does not define the columnIndex property (of type number) at index ' + i);
		}
		if (sortDescriptor.columnIndex < 0) {
			throw new RangeError('Sort descriptor defines a column index less than 0 at index ' + i + ': ' + sortDescriptor.columnIndex);
		}
		
		if (typeof sortDescriptor.compare !== 'function') {
			throw new TypeError('Sort descriptor does not define define the compare property (of type function) at index ' + i);
		}
		
	}
	
	// Post-Validation Initialization.
	tbody = this.table.tBodies[0];
	rows = tbody.rows;
	copy = SimpleDataTable.copy(rows);
	
	// Perform sort.
	_this = this;
	copy.sort(function (rowA, rowB) {
		var sortDescriptor, columnIndex, cellA, cellB, compareValue, i;
		
		for (i = 0; i < sortDescriptors.length; ++i) {
			sortDescriptor = sortDescriptors[i];
			
			columnIndex = sortDescriptor.columnIndex;
			
			cellA = rowA.cells[columnIndex];
			cellB = rowB.cells[columnIndex];
			
			compareValue = sortDescriptor.compare(cellA, cellB);
			
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
 * {@link SimpleDataTable#clearFilter} is implicitly called.
 *
 * @param {...FilterDescriptor} args 
 *   {@link FilterDescriptor}s to process. If the first argument is an `Array`, it will be used and subsequent arguments
 *   will be ignored.
 */
SimpleDataTable.prototype.filter = function () {
	'use strict';
	
	var filterDescriptors, filterDescriptor, i, rows, row, filter, j, cells;
	
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
		
		if (typeof filterDescriptor.columnIndex !== 'number') {
			throw new TypeError('Filter descriptor does not define the columnIndex property (of type number) at index ' + i);
		}
		if (filterDescriptor.columnIndex < 0) {
			throw new RangeError('Filter descriptor defines a column index less than 0 at index ' + i + ': ' + filterDescriptor.columnIndex);
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
			
			if (!filterDescriptor.include(cells[filterDescriptor.columnIndex])) {
				filter = true;
				break;
			}
		}
		
		if (filter) {
			IE9Compatibility.addClass(row, SimpleDataTable.filteredClassName);
		} else {
			IE9Compatibility.removeClass(row, SimpleDataTable.filteredClassName);
		}
	}
};


/**
 * Clears all filters.
 */
SimpleDataTable.prototype.clearFilter = function () {
	'use strict';
	
	var i, rows;
	
	rows = this.table.tBodies[0].rows;
	
	for (i = 0; i < rows.length; ++i) {
		IE9Compatibility.removeClass(rows[i], SimpleDataTable.filteredClassName);
	}
	
};

/**
 * Clears the sorting for all columns. The original order for all rows (at the time this `SimpleDataTable` was constructed) is restored.
 */
SimpleDataTable.prototype.clearSort = function () {
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
 * Returns the `HTMLTableElement` backing this `SimpleDataTable`.
 *
 * @returns {MinimalList} The `HTMLTableElement` backing this `SimpleDataTable`.
 */
SimpleDataTable.prototype.getTableElement = function () {
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
SimpleDataTable.prototype.getRows = function (includeFiltered) {
	'use strict';
	
	var rows, row, i, result;
	
	rows = this.table.tBodies[0].rows;
	
	if (includeFiltered) {
		return rows;
	}
	
	result = [];
	for (i = 0; i < rows.length; ++i) {
		row = rows[i];
		if (!IE9Compatibility.hasClass(row, SimpleDataTable.filteredClassName)) {
			result.push(row);
		}
	}
	
	return result;
};
