

// Constructor
function DataTable(table) {
	'use strict';
	
	if (!table || !table.tBodies || !table.tBodies[0]) {
		throw new ReferenceError('Table must be an defined and have a body.');
	}
	
	this.table = table;
	this.initialOrder = DataTable.copy(table.tBodies[0].rows);

}



// Static Fields
DataTable.FILTERED_CLASS_NAME = 'data-table-filtered';

DataTable.FILTER_OP_CONTAINS = 1;
DataTable.FILTER_OP_EQUALS = 1 << 1;
DataTable.FILTER_OP_LESS_THAN = 1 << 2;
DataTable.FILTER_OP_GREATER_THAN = 1 << 3;
DataTable.FILTER_OP_IGNORE_CASE = 1 << 4;
DataTable.FILTER_OP_NOT_EQUALS = 1 << 5;

DataTable.COLUMN_TYPE_TEXT = 1;
DataTable.COLUMN_TYPE_INFER = 2;



// Static methods
DataTable.hasFlag = function (flags, flag) {
	'use strict';
	
	return (flags & flag) != 0;
};

DataTable.copy = function (src) {
	
	var result, i;
	
	result = [];
	for (i = 0; i < src.length; ++i) {
		result.push(src[i]);
	}
	
	return result;
};


DataTable.getNumber = function (val, strict) {
	'use strict';
	
	var result;
	
	if (typeof val === 'number') {
		return val;
	}
	
	if (DataTable.isInt(val)) {
		return IEGeneralCompatibility.parseInt(val);
	} else if (DataTable.isNumeric(val)) {
		return IEGeneralCompatibility.parseFloat(val);
	} else {
		return strict ? Number.NaN : val;
	}
	
};

DataTable.getColumn = function (row, columnIndex) {
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

DataTable.getElementCount = function (el) {
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

DataTable.getCellValues = function (cell, items) {
	'use strict';
	
	var listItems, i, value;
	
	if (DataTable.getElementCount(cell) == 1 && (cell.getElementsByTagName('ul').length) || cell.getElementsByTagName('ol').length) {
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

DataTable.isInt = function (val) {
	'use strict';
	
	return /^\d+$/.test(val);
};

DataTable.isNumeric = function (val) {
	'use strict';
	
	return /^\d+(?:\.\d*)?(?:[eE]\d*)?$/.test(val);
};


// Instance methods
DataTable.prototype.sort = function () {
	'use strict';
	
	var sortDescriptors, sortDescriptor, i, tbody, rows, copy;
	
	// Pre-checks.
	if (!arguments.length) {
		return;
	}
	
	// Pre-Validation Initialization.
	sortDescriptors = arguments[0] instanceof Array ? arguments[0] : arguments;
	
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
	copy = DataTable.copy(rows);
	
	// Perform sort.
	copy.sort(function (rowA, rowB) {
		var sortDescriptor, columnIndex, cellA, cellB, compareValue, i;
		
		for (i = 0; i < sortDescriptors.length; ++i) {
			sortDescriptor = sortDescriptors[i];
			columnIndex = sortDescriptor.columnIndex;
			
			cellA = DataTable.getColumn(rowA, columnIndex);
			cellB = DataTable.getColumn(rowB, columnIndex);
			
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

DataTable.prototype.filter = function () {
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
			
			if (!filterDescriptor.include(DataTable.getColumn(row, filterDescriptor.columnIndex))) {
				filter = true;
				break;
			}
		}
		
		if (filter) {
			IE9Compatibility.addClass(row, DataTable.FILTERED_CLASS_NAME);
		} else {
			IE9Compatibility.removeClass(row, DataTable.FILTERED_CLASS_NAME);
		}
	}
};

DataTable.prototype.clearFilter = function () {
	'use strict';
	
	var i, rows;
	
	rows = this.table.tBodies[0].rows;
	
	for (i = 0; i < rows.length; ++i) {
		IE9Compatibility.removeClass(rows[i], DataTable.FILTERED_CLASS_NAME);
	}
	
};

DataTable.prototype.clearSort = function () {
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


DataTable.prototype.getColumnValues = function (columnIndex) {
	'use strict';
	
	var rows, i, cell, value, listItems, j, result;
	
	result = [];
	rows = this.table.tBodies[0].rows;
	
	for (i = 0; i < rows.length; ++i) {
		DataTable.getCellValues(DataTable.getColumn(rows[i], columnIndex), result);
	}
	
	result.sort();
	
	return result;
};






// Nested Types

// ValueSort
DataTable.ValueSort = function (columnIndex, descending, columnType) {
	'use strict';
	
	this.columnIndex = columnIndex;
	
	if (descending) {
		this.descending = true;
	}
	if (columnType && columnType !== DataTable.COLUMN_TYPE_INFER) {
		this.columnType = DataTable.COLUMN_TYPE_INFER;
	}
};

DataTable.ValueSort.prototype.descending = false;

DataTable.ValueSort.prototype.columnType = DataTable.COLUMN_TYPE_INFER;


DataTable.ValueSort.prototype.compare = function (cellA, cellB) {
	'use strict';
	
	var aVal, bVal, aNum, aNaN, bNum, bNaN;
	
	aVal = cellA.textContent;
	bVal = cellB.textContent;
	
	switch (this.columnType) {
		case DataTable.COLUMN_TYPE_INFER:
			aNum = DataTable.getNumber(aVal, true);
			aNaN = IEGeneralCompatibility.isNaN(aNum);
			bNum = DataTable.getNumber(bVal, true);
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
		case DataTable.COLUMN_TYPE_TEXT:
			return aVal < bVal ? -1 : (aVal > bVal ? 1 : 0);
	}

};
//




// ValueFilter
DataTable.ValueFilter = function (columnIndex, compareValue, operation, columnType, ignoreListCells) {
	'use strict';
	
	this.columnIndex = columnIndex;
	this.compareValue = compareValue;
	if (operation && operation !== DataTable.FILTER_OP_EQUALS) {
		this.operation = operation;
	}
	if (columnType && columnType !== DataTable.COLUMN_TYPE_INFER) {
		this.columnType = columnType;
	}
	if (ignoreListCells) {
		this.ignoreListCells = true;
	}

};



DataTable.ValueFilter.prototype.operation = DataTable.FILTER_OP_EQUALS;

DataTable.ValueFilter.prototype.ignoreListCells = false;

DataTable.ValueFilter.prototype.columnType = DataTable.COLUMN_TYPE_INFER;

DataTable.ValueFilter.prototype.include = function (cell) {
	'use strict';
	
	var values, i;
	
	if (this.ignoreListCells) {
		return this.includeValue(cell.textContent.trim());
	} else {
		values = [];
		DataTable.getCellValues(cell, values);
		for (i = 0; i < values.length; ++i) {
			if (this.includeValue(values[i])) {
				console.info(cell);
				return true;
			}
		}
		return false;
	}
};

DataTable.ValueFilter.prototype.includeValue = function (rawValue) {
	'use strict';
	
	var operation, rawCompareValue, compareValue, cellValue, filterType;
	
	// Initialization.
	operation = this.operation;
	
	// Attempt to discern operation from supported convenience tokens if operation is a string.
	if (typeof operation === 'string') {
		switch (operation) {
			case '=':
				operation = DataTable.FILTER_OP_EQUALS;
				break;
			case '<':
				operation = DataTable.FILTER_OP_LESS_THAN;
				break;
			case '>':
				operation = DataTable.FILTER_OP_GREATER_THAN;
				break;
			case '<=':
				operation = DataTable.FILTER_OP_LESS_THAN | DataTable.FILTER_OP_EQUALS;
				break;
			case '>=':
				operation = DataTable.FILTER_OP_GREATER_THAN | DataTable.FILTER_OP_EQUALS;
				break;
			case '~':
				operation = DataTable.FILTER_OP_CONTAINS | DataTable.FILTER_OP_IGNORE_CASE;
				break;
			case '!=':
				operation = DataTable.FILTER_OP_NOT_EQUALS;
				break;
		}
	}
	
	rawCompareValue = this.compareValue;
	switch (this.columnType) {
		case DataTable.COLUMN_TYPE_INFER:
			compareValue = DataTable.getNumber(rawCompareValue);
			cellValue = DataTable.getNumber(rawValue);
			break;
		case DataTable.COLUMN_TYPE_TEXT:
			compareValue = String(rawCompareValue);
			cellValue = String(rawValue);
			break;
	}
	

	// Common comparisons.
	if (DataTable.hasFlag(operation, DataTable.FILTER_OP_EQUALS)) {
		if (cellValue == compareValue) {
			return true;
		}
	}
	
	if (DataTable.hasFlag(operation, DataTable.FILTER_OP_LESS_THAN)) {
		if (cellValue < compareValue) {
			return true;
		}
	}
	
	if (DataTable.hasFlag(operation, DataTable.FILTER_OP_GREATER_THAN)) {
		if (cellValue > compareValue) {
			return true;
		}
	}
	
	if (DataTable.hasFlag(operation, DataTable.FILTER_OP_NOT_EQUALS)) {
		if (cellValue != compareValue) {
			return true;
		}
	}
	
	
	
	// String comparisons.
	
	// Reset compare values to strings.
	cellValue = String(rawValue);
	compareValue = String(rawCompareValue);
	if (DataTable.hasFlag(operation, DataTable.FILTER_OP_IGNORE_CASE)) {
		cellValue = cellValue.toUpperCase();
		compareValue = compareValue.toUpperCase();
	}
	
	
	// Comparisons.
	if (DataTable.hasFlag(operation, DataTable.FILTER_OP_CONTAINS)) {
		if (cellValue.indexOf(compareValue) != -1) {
			return true;
		}
	}
	
	
	// Default case (no matches).
	return false;
};
//
