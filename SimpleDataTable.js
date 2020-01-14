

// Virtual Interfaces

// SortDescriptor
/**
 *
 * @interface SortDescriptor
 * @classdesc
 *		Describes the information necessary to sort a table based upon a column.
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
 * Callback comparator function that compares one cell to another. The respective rows are given in
 * case additional context is needed.
 *
 * @function SortDescriptor#compare
 * @param {HTMLCellElement} cellA Reference cell.
 * @param {HTMLCellElement} cellB Compare cell.
 * @param {HTMLRowElement} rowA Row containing reference cell.
 * @param {HTMLRowElement} rowB Row containing compare cell.
 * @returns {number} 
 *		A value greater than 0 if cellA should be sorted below cellB, less than 0 for above, 0 for 
 *		no preference.
 */


// FilterDescriptor
/**
 * @interface FilterDescriptor
 * @classdesc
 *		Describes the information necessary to filter a table based upon a column.
 */
/**
 * Index of the column this FilterDescriptor describes how to filter.
 * 
 * @member {number} FilterDescriptor#columnIndex
 */
/**
 * Callback function to determine whether the given cell's row is to be filtered. If this function returns false,
 * the containing row will be filtered. The cell's row is given in case additional is needed.
 *
 * @function FilterDescriptor#include
 * @param {HTMLCellElement} cell to be considered for inclusion.
 * @param {HTMLRowElement} row to which the cell being considered belongs.
 * @returns {boolean} false if this cell's row is to be filtered.
 */





// Constructor
/**
 * 
 * @constructor 
 * @param {HTMLTableElement} table Table element this SimpleDataTable is to process.
 * @classdesc
 *		
 */
function SimpleDataTable(table) {
	'use strict';
	
	if (!table || !table.tBodies || !table.tBodies[0]) {
		throw new ReferenceError('Table must be an defined and have a body.');
	}
	
	this.table = table;
	this.initialOrder = SimpleDataTable.copy(table.tBodies[0].rows);

}



// Static Fields

/**
 * Class name to add to the class list of filtered elements. Default value is 'data-table-filtered';
 * configure a new value in page initialization scripts if another class name is desired for this purpose.
 *
 * @member {string}
 */
SimpleDataTable.filteredClassName = 'data-table-filtered';

/**
 * Bit flag indicating only cells containing a specified value should remain after a filtering operation.
 *
 * @member {number}
 * @const
 */
SimpleDataTable.FILTER_OP_CONTAINS = 1;
/**
 * Bit flag indicating only cells with a value equal to a specified value should remain after a filtering operation.
 *
 * @member {number}
 * @const
 */
SimpleDataTable.FILTER_OP_EQUALS = 1 << 1;
/**
 * Bit flag indicating only cells with a value less than a specified value should remain after a filtering operation.
 *
 * @member {number}
 * @const
 */
SimpleDataTable.FILTER_OP_LESS_THAN = 1 << 2;
/**
 * Bit flag indicating only cells with a value greater than a specified value should remain after a filtering operation.
 *
 * @member {number}
 * @const
 */
SimpleDataTable.FILTER_OP_GREATER_THAN = 1 << 3;
/**
 * Bit flag indicating string-type comparisons during a filtering operation should ignore case.
 *
 * @member {number}
 * @const
 */
SimpleDataTable.FILTER_OP_IGNORE_CASE = 1 << 4;
/**
 * Bit flag indicating only cells with a value not equal to a specified value should remain after a filtering operation.
 *
 * @member {number}
 * @const
 */
SimpleDataTable.FILTER_OP_NOT_EQUALS = 1 << 5;


/**
 * Indicates cells within a column should be considered to have text only for processing.
 *
 * @member {number}
 * @const
 */
SimpleDataTable.COLUMN_TYPE_TEXT = 1;

/**
 * Indicates values of cells within a column should attempt be inferred, and converted to appropriate underlying types
 * prior to processing.
 *
 * @member {number}
 * @const
 */
SimpleDataTable.COLUMN_TYPE_INFER = 2;



// Static methods
/**
 * Utility function to determine whether the given flags (number) has the given flag set.
 *
 * 
 * @package
 * @param {number} flags Set of flags to test.
 * @param {number} flag Flag for which the given set of flags is to be tested.
 * @returns {boolean} true if the given set of flags has the given flag set, otherwise false.
 */
SimpleDataTable.hasFlag = function (flags, flag) {
	'use strict';
	
	return (flags & flag) !== 0;
};

/**
 * Utility function to copy the elements from the given src into a new Array. The given src need not
 * necessarily be an array, but only needs to be a collection-like object indexable by numbers and define 
 * a length property that reflects the number of values in the collection.
 *
 * @package
 * @param {object} src A collection-like object to be copied.
 * @return {Array} An Array containing the same elements of the given src.
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
 * Utility function for obtaining a number from the given val. If the given val is, itself, a number, it
 * is simply returned. If not, it is treated as a string, and parsed as an integer if it contains only digits,
 * or as a float if it contains a decimal point or E-notation exponents. If val is not numeric, it is returned
 * as given if strict is false, or NaN is returned if strict is true.
 *
 * @package
 * @param {(string|number)} val Value to be converted to a number.
 * @param {boolean} [strict=false] Whether to return NaN if val is not a number, or simply to return val itself.
 */
SimpleDataTable.getNumber = function (val, strict) {
	'use strict';
	
	if (typeof val === 'number') {
		return val;
	}
	
	if (SimpleDataTable.isInt(val)) {
		return IEGeneralCompatibility.parseInt(val);
	} else if (SimpleDataTable.isNumeric(val)) {
		return IEGeneralCompatibility.parseFloat(val);
	} else {
		return strict ? Number.NaN : val;
	}
	
};


/**
 * Utility function for obtaining a column that considers the colSpan attribute of a row's cells. Cells with a 
 * colSpan greater than 1 are considered to span multiple column indicies.
 *
 * @package
 * @param {HTMLTableRowElement} row Row from which to extract a column.
 * @param {number} columnIndex Column index defining the cell to be extracted.
 * @returns {HTMLCellElement} Cell corresponding to the given columnIndex.
 * @throws {RangeError} If columnIndex is greater than the number of columns spanned by the given row.
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

/**
 * Utility method to determine the count of child elements of the given el. Returns the count of the
 * childNodes of el with a nodeType of 1 (ELEMENT_NODE).
 *
 * @package
 * @param {Node} el Element whose child element count is to be determined.
 * @returns {number} Count of child elements of the given el.
 */
SimpleDataTable.getElementCount = function (el) {
	'use strict';
	
	var count, i, childNodes;
	
	childNodes = el.childNodes;
	count = 0;
	
	for (i = 0; i < childNodes.length; ++i) {
		if (childNodes[i].nodeType == 1) {
			++count;
		}
	}
	
	return count;
};


/**
 * Populates the given items with the (trimmed) text content of the given cell. If the cell contains a single
 * list element (ul or ol), the text content of each child list item (li) is added to the given items, otherwise the
 * text content of the entire cell is added.
 *
 * @package
 * @param {HTMLCellElement} cell Cell whose content is to be added to items.
 * @param {Array} items Array to add the content of the given cell.
 */
SimpleDataTable.getCellValues = function (cell, items) {
	'use strict';
	
	var listItems, i, value;
	
	if (SimpleDataTable.getElementCount(cell) == 1 && (cell.getElementsByTagName('ul').length) || cell.getElementsByTagName('ol').length) {
		listItems = cell.getElementsByTagName('li');
		for (i = 0; i < listItems.length; ++i) {
			value = listItems[i].textContent.trim();
			if (items.indexOf(value) === -1) {
				items.push(value);
			}
		}
	} else {
		value = cell.textContent.trim();
		if (items.indexOf(value) === -1) {
			items.push(value);
		}
	}
};

/**
 * Determines whether the given val is an integer. Returns true if val contains only digits, otherwise false.
 *
 * @package
 * @param {string} val Value to parse.
 * @returns {boolean} true if val represents an integer, otherwise false.
 */
SimpleDataTable.isInt = function (val) {
	'use strict';
	
	return /^\d+$/.test(val);
};

/**
 * Determines whether the given val is numeric. Returns true if val contains only digits, optionally a decimal point,
 * and optionally a scientific E-notation expontent, otherwise false.
 *
 * @package
 * @param {string} val Value to parse.
 * @returns {boolean} true if val represents a number, otherwise false.
 */
SimpleDataTable.isNumeric = function (val) {
	'use strict';
	
	return /^\d+(?:\.\d*)?(?:[eE]\d*)?$/.test(val);
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
	
	var sortDescriptors, sortDescriptor, i, tbody, rows, copy;
	
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
	copy.sort(function (rowA, rowB) {
		var sortDescriptor, columnIndex, cellA, cellB, compareValue, i;
		
		for (i = 0; i < sortDescriptors.length; ++i) {
			sortDescriptor = sortDescriptors[i];
			
			columnIndex = sortDescriptor.columnIndex;
			
			cellA = SimpleDataTable.getColumn(rowA, columnIndex);
			cellB = SimpleDataTable.getColumn(rowB, columnIndex);
			
			compareValue = sortDescriptor.compare(cellA, cellB, rowA, rowB);
			
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
 * Array of {@link FilterDescriptor}s or in a variatric manner.
 *
 * @param {...FilterDescriptor} args 
 *		{@link FilterDescriptor}s to process. If the first argument is an Array, it will be used and subsequent arguments
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
			
			if (!filterDescriptor.include(SimpleDataTable.getColumn(row, filterDescriptor.columnIndex), row)) {
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
 * Clears the sorting for all columns. The original order (at the time this SimpleDataTable was constructed) for all
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


/**
 * Returns an Array containing all values for each cell of the given columnIndex.
 *
 * @param {number} columnIndex Column index whose values are to be retrieved.
 * @returns {Array} An array containing all values fore each cell of the given columnIndex.
 * @throws {RangeError} If columnIndex is greater than the number of columns spanned by any row in the table.
 */
SimpleDataTable.prototype.getColumnValues = function (columnIndex) {
	'use strict';
	
	var rows, i, cell, value, listItems, j, result;
	
	result = [];
	rows = this.table.tBodies[0].rows;
	
	for (i = 0; i < rows.length; ++i) {
		SimpleDataTable.getCellValues(SimpleDataTable.getColumn(rows[i], columnIndex), result);
	}
	
	result.sort();
	
	return result;
};





// Nested Types

// ValueSort
/**
 * @constructor
 * @implements SortDescriptor
 * @param {number} columnIndex Column index to which this descriptor is to apply.
 * @param {boolean} [descending=false] true if the result of this descriptor is to be inverted.
 * @param {number} [columnType={@link SimpleDataTable.COLUMN_TYPE_INFER}] 
 *		How this column is to be sorted. Default is infer, set to {@link SimpleDataTable.COLUMN_TYPE_TEXT} to sort as text only.
 * @classdesc
 *		Simple/direct implementation of {@link SortDescriptor}. 
 */
SimpleDataTable.ValueSort = function (columnIndex, descending, columnType) {
	'use strict';
	
	this.columnIndex = columnIndex;
	
	if (descending) {
		this.descending = true;
	}
	if (columnType && columnType !== SimpleDataTable.COLUMN_TYPE_INFER) {
		this.columnType = columnType;
	}
};

// Default Instance Properties
SimpleDataTable.ValueSort.prototype.descending = false;

/**
 * How this column is to be sorted. If {@link SimpleDataTable.COLUMN_TYPE_INFER}, will attempt to convert values to
 * numbers prior to running the sort comparison; values that cannot be converted will be compared as strings,
 * and will be sorted under those successfully converted to numbers. If {@link SimpleDataTable.COLUMN_TYPE_TEXT}, all
 * values will be compared as strings only.
 *
 * @member {number}
 */
SimpleDataTable.ValueSort.prototype.columnType = SimpleDataTable.COLUMN_TYPE_INFER;


// Instance Methods
SimpleDataTable.ValueSort.prototype.compare = function (cellA, cellB) {
	'use strict';
	
	var aVal, bVal, aNum, aNaN, bNum, bNaN;
	
	aVal = cellA.textContent;
	bVal = cellB.textContent;
	
	switch (this.columnType) {
		case SimpleDataTable.COLUMN_TYPE_INFER:
			aNum = SimpleDataTable.getNumber(aVal, true);
			aNaN = IEGeneralCompatibility.isNaN(aNum);
			bNum = SimpleDataTable.getNumber(bVal, true);
			bNaN = IEGeneralCompatibility.isNaN(bNum);
			
			if (aNaN && bNaN) {
				return aVal < bVal ? -1 : (aVal > bVal ? 1 : 0);
			}
			
			if (aNaN) {
				return 1;
			}
			
			if (bNaN) {
				return -1;
			}
			
			return aNum - bNum;
		case SimpleDataTable.COLUMN_TYPE_TEXT:
			return aVal < bVal ? -1 : (aVal > bVal ? 1 : 0);
	}

};





// ValueFilter
/**
 * @constructor
 * @implements FilterDescriptor
 * @param {number} columnIndex Column index this FilterDescriptor describes.
 * @param {*} compareValue Value to which cells are to be compared.
 * @param {(number|string)} [operation={@link SimpleDataTable.FILTER_OP_EQUALS}] 
 *		Bit field or string indicating the operation this filter is to perform. Must be a combination of the {@link SimpleDataTable}.FILTER_OP_* fields
 *		if a number, or '=', '!=' '&lt', '&gt;' '&lt;=', '&gt;=', or '~' (contains, ignore case) if a string.
 * @param {number} [columnType={@link SimpleDataTable.COLUMN_TYPE_INFER}] How the cells in this column are to be interpreted.
 * @param {boolean} [ignoreListCells=false] 
 *		Whether to indiscriminately treat each cell's value as its textContent, or to first inspect it for list elements as described
 *		in {@link SimpleDataTable.getCellValues}.
 * @classdesc
 *		<p>Generic implementation of {@link FilterDescriptor}. Filters cells for the given columnIndex based upon the given compareValue using the given 
 *		operation. The values for individual cells are determined base upon columnType and ignoreListCells.<p>
 *
 *		<p>
 *		<span>Operation can be defined as either a bit field, or, for convenience, a string. If a bit field, it must be a combination 
 *		of the following:<span>
 *		<ul>
 *		<li>{@link SimpleDataTable.FILTER_OP_CONTAINS}</li>
 *		<li>{@link SimpleDataTable.FILTER_OP_EQUALS}</li>
 *		<li>{@link SimpleDataTable.FILTER_OP_LESS_THAN}</li>
 *		<li>{@link SimpleDataTable.FILTER_OP_GREATER_THAN}</li>
 *		<li>{@link SimpleDataTable.FILTER_OP_IGNORE_CASE}</li>
 *		<li>{@link SimpleDataTable.FILTER_OP_NOT_EQUALS}</li>
 *		</ul>
 *		<span>If a string, it must be one of the following (equivalent bit field combinations shown in parenthesis):</span>
 *		<ul>
 *		<li>'=' (<code>{@link SimpleDataTable.FILTER_OP_EQUALS}</code>)</li>
 *		<li>'&gt;' (<code>{@link SimpleDataTable.FILTER_OP_GREATER_THAN}</code>)</li>
 *		<li>'&lt;' (<code>{@link SimpleDataTable.FILTER_OP_LESS_THAN}</code>)</li>
 *		<li>'&gt=' (<code>{@link SimpleDataTable.FILTER_OP_GREATER_THAN}|{@link SimpleDataTable.FILTER_OP_EQUALS}</code>)</li>
 *		<li>'&lt=' (<code>{@link SimpleDataTable.FILTER_OP_LESS_THAN}|{@link SimpleDataTable.FILTER_OP_EQUALS}</code>)</li>
 *		<li>'!=' (<code>{@link SimpleDataTable.FILTER_OP_NOT_EQUALS}</code>)</li>
 *		<li>'~' (<code>{@link SimpleDataTable.FILTER_OP_CONTAINS}|{@link SimpleDataTable.FILTER_OP_IGNORE_CASE}</code>)</li>
 *		</ul>
 *		</p>
 */
SimpleDataTable.ValueFilter = function (columnIndex, compareValue, operation, columnType, ignoreListCells) {
	'use strict';
	
	this.columnIndex = columnIndex;
	
	/**
	 */
	this.compareValue = compareValue;
	
	if (operation && operation !== SimpleDataTable.FILTER_OP_EQUALS) {
		this.operation = operation;
	}
	if (columnType && columnType !== SimpleDataTable.COLUMN_TYPE_INFER) {
		this.columnType = columnType;
	}
	if (ignoreListCells) {
		this.ignoreListCells = true;
	}

};


// Default Instance Properties
/**
 * Operation this ValueFilter is to use when determining whether to filter a cell. Valid values are described
 * in this class' description.
 */
SimpleDataTable.ValueFilter.prototype.operation = SimpleDataTable.FILTER_OP_EQUALS;

/**
 * Whether or not to ignore cells with list elements. I.e. true to consider textContent only, or to call false
 * {@link SimpleDataTable.getCellValues} when determining values against which to filter for individual cells.
 */
SimpleDataTable.ValueFilter.prototype.ignoreListCells = false;

/**
 * How individual cell values are to be converted. If {@link SimpleDataTable.COLUMN_TYPE_TEXT}, cell values will
 * be treated only as text; if {@link SimpleDataTable.COLUMN_TYPE_INFER} (default), an attempt will be made to 
 * convert cell values to numbers prior to evaluating filter conditions.
 */
SimpleDataTable.ValueFilter.prototype.columnType = SimpleDataTable.COLUMN_TYPE_INFER;


// Instance Methods
SimpleDataTable.ValueFilter.prototype.include = function (cell) {
	'use strict';
	
	var values, i;
	
	if (this.ignoreListCells) {
		return this.includeValue(cell.textContent.trim());
	} else {
		values = [];
		SimpleDataTable.getCellValues(cell, values);
		for (i = 0; i < values.length; ++i) {
			if (this.includeValue(values[i])) {
				return true;
			}
		}
		return false;
	}
};

/**
 * Internal function that tests an individual value of a cell for whether or not it should be filtered.
 * 
 * @private
 * @param {string} rawValue Individual value to test.
 * @returns {boolean} false if the containing cell should be filtered, otherwise true.
 */
SimpleDataTable.ValueFilter.prototype.includeValue = function (rawValue) {
	'use strict';
	
	var operation, rawCompareValue, compareValue, cellValue, filterType;
	
	// Initialization.
	operation = this.operation;
	
	// Attempt to discern operation from supported convenience tokens if operation is a string.
	if (typeof operation === 'string') {
		switch (operation) {
			case '=':
				operation = SimpleDataTable.FILTER_OP_EQUALS;
				break;
			case '<':
				operation = SimpleDataTable.FILTER_OP_LESS_THAN;
				break;
			case '>':
				operation = SimpleDataTable.FILTER_OP_GREATER_THAN;
				break;
			case '<=':
				operation = SimpleDataTable.FILTER_OP_LESS_THAN | SimpleDataTable.FILTER_OP_EQUALS;
				break;
			case '>=':
				operation = SimpleDataTable.FILTER_OP_GREATER_THAN | SimpleDataTable.FILTER_OP_EQUALS;
				break;
			case '~':
				operation = SimpleDataTable.FILTER_OP_CONTAINS | SimpleDataTable.FILTER_OP_IGNORE_CASE;
				break;
			case '!=':
				operation = SimpleDataTable.FILTER_OP_NOT_EQUALS;
				break;
		}
	}
	
	rawCompareValue = this.compareValue;
	switch (this.columnType) {
		case SimpleDataTable.COLUMN_TYPE_INFER:
			compareValue = SimpleDataTable.getNumber(rawCompareValue);
			cellValue = SimpleDataTable.getNumber(rawValue);
			break;
		case SimpleDataTable.COLUMN_TYPE_TEXT:
			compareValue = String(rawCompareValue);
			cellValue = String(rawValue);
			break;
	}
	

	// Common comparisons.
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_EQUALS)) {
		if (cellValue == compareValue) {
			return true;
		}
	}
	
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_LESS_THAN)) {
		if (cellValue < compareValue) {
			return true;
		}
	}
	
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_GREATER_THAN)) {
		if (cellValue > compareValue) {
			return true;
		}
	}
	
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_NOT_EQUALS)) {
		if (cellValue != compareValue) {
			return true;
		}
	}
	
	
	
	// String comparisons.
	
	// Reset compare values to strings.
	cellValue = String(rawValue);
	compareValue = String(rawCompareValue);
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_IGNORE_CASE)) {
		cellValue = cellValue.toUpperCase();
		compareValue = compareValue.toUpperCase();
	}
	
	
	// Comparisons.
	if (SimpleDataTable.hasFlag(operation, SimpleDataTable.FILTER_OP_CONTAINS)) {
		if (cellValue.indexOf(compareValue) != -1) {
			return true;
		}
	}
	
	
	// Default case (fall back to equals).
	return cellValue == compareValue;
};
