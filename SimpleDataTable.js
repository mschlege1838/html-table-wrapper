

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
 * Index of the column this SortDescriptor describes how to sort.
 *
 * @member {number} SortDescriptor#columnIndex
 */
/**
 * Optional; if true, the value returned from this sort descriptor will be reversed (multiplied by -1)
 * in processing {@link SimpleDataTable#sort} calls.
 *
 * @member {boolean} SortDescriptor#descending
 */
/**
 * Callback comparator function that compares one cell to another.
 *
 * @function SortDescriptor#compare
 * @param {HTMLCellElement} cellA Reference cell.
 * @param {HTMLCellElement} cellB Compare cell.
 * @returns {number} 
 * @returns {number} 
 *		A value greater than 0 if cellA should be sorted below cellB, less than 0 for above, 0 for 
 *		no preference.
 */


// FilterDescriptor
/**
 * @interface FilterDescriptor
 * @classdesc
 *
 * Describes the information necessary to filter a table based upon a column.
 */
/**
 * Index of the column this FilterDescriptor describes how to filter.
 * 
 * @member {number} FilterDescriptor#columnIndex
 */
/**
 * Callback function to determine whether the given cell's row is to be filtered. If this function returns false,
 * the containing row will be filtered.
 *
 * @function FilterDescriptor#include
 * @param {HTMLCellElement} cell to be considered for inclusion.
 * @returns {boolean} false if this cell's row is to be filtered.
 * @returns {boolean} false if this cell's row is to be filtered.
 */




// Constructor
/**
 * 
 * @constructor 
 * @param {HTMLTableElement} table Table element this `SimpleDataTable` is to process.
 * @throws {ReferenceError} 
 *   If `table` is not defined, `table` does not define a `tBodies` property, or if `table.tBodies` does not define a 0th element
 *   (i.e. `table.tBodies[0]`).
 * @classdesc
 *
 * Wrapper for 'simply defined' `HTMLTableElement`s that provides extended functionality, most notably {@link SimpleDataTable#sort sorting}
 * and {@link SimpleDataTable#filter filtering}. The tables this class processes are 'simply defined' in that they define a single table body section
 * (`<tbody>`) whose rows contain the table's data.
 *
 * Although the table can define more than one table body section, all but the first table body section will be ignored by the processing in
 * in this class.
 */
function SimpleDataTable(table) {
	'use strict';
	
	if (!table || !table.tBodies || !table.tBodies[0]) {
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
 * Utility function to copy the elements from the given `src` into a new `Array`. The given `src` need not
 * necessarily be an `Array`, but only needs to be a collection-like object indexable by numbers and defining 
 * a `length` property that reflects the number of values in the collection. E.g. a `NodeList` is an acceptable
 * value for `src`.
 *
 * @private
 * @param {object} src A collection-like object to be copied.
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




/**
 * Utility function for obtaining a cell within a column that considers the `colSpan` attribute of a row's cells. Cells with a 
 * `colSpan` greater than 1 are considered to span multiple column indicies.
 *
 * @private
 * @param {HTMLTableRowElement} row Row from which to extract a column.
 * @param {number} columnIndex Column index of the cell to be extracted.
 * @returns {HTMLCellElement} Cell corresponding to the given `columnIndex`.
 * @throws {RangeError} If `columnIndex` is greater than the number of columns spanned by the given `row`.
 */
SimpleDataTable.getColumn = function (row, columnIndex) {
	'use strict';
	
	var i, j, cells, cell, currentIndex;
	
	cells = row.cells;
	currentIndex = 0;
	
	for (i = 0; i < cells.length; ++i) {
		cell = cells[i];
		for (j = 0; j < cell.colSpan; ++j) {
			if (currentIndex++ == columnIndex) {
				return cell;
			}
		}
	}
	
	throw new RangeError('Attempt to retrieve column index ' + columnIndex + ' from a row with only ' + currentIndex + ' identified columns.');
};





// Instance methods
/**
 * Sorts the backing table according to the given {@link SortDescriptor}s. This function can be called with a single
 * Array of {@link SortDescriptor}s or in a variatric manner.
 *
 * @param {...SortDescriptor} args 
 *		{@link SortDescriptor}s to process. If the first argument is an Array, it will be used and subsequent arguments
 *		will be ignored.
 */
SimpleDataTable.prototype.sort = function () {
	'use strict';
	
	var sortDescriptors, sortDescriptor, i, tbody, rows, copy, _this;
	
	// Pre-checks.
	if (!arguments.length) {
		return;
	}
	
	// Pre-Validation Initialization.
	sortDescriptors = arguments[0] instanceof Array ? arguments[0] : arguments;
	
	console.info(sortDescriptors);
	
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
			
			cellA = SimpleDataTable.getColumn(rowA, columnIndex);
			cellB = SimpleDataTable.getColumn(rowB, columnIndex);
			
			compareValue = sortDescriptor.compare(cellA, cellB);
			
			// Allowing type coercion if (for whatever reason) the compare function does not return an integer.
			if (compareValue != 0) {
				return sortDescriptor.descending ? -1 * compareValue : compareValue;
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
 * Filters the backing table according to the given {@link FilterDescriptor}s. This function can be called with a single
 * `Array` of {@link FilterDescriptor}s or in a variatric manner.
 *
 * @param {...FilterDescriptor} args 
 *		{@link FilterDescriptor}s to process. If the first argument is an `Array`, it will be used and subsequent arguments
 *		will be ignored.
 */
SimpleDataTable.prototype.filter = function () {
	'use strict';
	
	var filterDescriptors, filterDescriptor, i, rows, row, filter, j;
	
	// Initialization.
	filterDescriptors = arguments[0] instanceof Array ? arguments[0] : arguments;
	
	if (!filterDescriptors.length) {
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
		filter = false;
		
		for (j = 0; j < filterDescriptors.length; ++j) {
			filterDescriptor = filterDescriptors[j];
			
			if (!filterDescriptor.include(SimpleDataTable.getColumn(row, filterDescriptor.columnIndex))) {
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
 * Clears the sorting for all columns. The original order (at the time this `SimpleDataTable` was constructed) for all
 * rows is restored.
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






