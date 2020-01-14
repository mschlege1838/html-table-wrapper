

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

DataTable.FILTER_TYPE_STRING = 0;
DataTable.FILTER_TYPE_INT = 1;
DataTable.FILTER_TYPE_FLOAT = 2;



// Static methods
DataTable.parseInt = function (val) {
	'use strict';
	
	if (typeof Number.parseInt === 'function') {
		return Number.parseInt(val);
	}
	
	return parseInt(val);
};

DataTable.parseFloat = function (val) {
	'use strict';
	
	if (typeof Number.parseFloat === 'function') {
		return Number.parseFloat(val);
	}
	
	return parseFloat(val);
};

DataTable.isNaN = function (val) {
	'use strict';
	
	if (typeof Number.isNaN === 'function') {
		return Number.isNaN(val);
	}
	
	return val !== val;
};

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

DataTable.addClass = function (el, className) {
	'use strict';
	
	var classNames;
	
	if (el.classList) {
		el.classList.add(className);
		return;
	}
	
	classNames = el.className.trim().split(/\s+/);
	if (classNames.indexOf(className) == -1) {
		classNames.push(className);
		el.className = classNames.join(' ');
	}
};

DataTable.removeClass = function (el, className) {
	'use strict';
	
	var classNames, index;
	
	if (el.classList) {
		el.classList.remove(className);
		return;
	}
	
	classNames = el.className.trim().split(/\s+/);
	index = classNames.indexOf(className);
	if (index != -1) {
		classNames.splice(index, 1);
		el.className = classNames.join(' ');
	}
};

DataTable.getNumber = function (val, parse) {
	'use strict';
	
	var result;
	
	if (typeof val === 'number') {
		return val;
	}
	
	result = parse(val);
	return DataTable.isNaN(result) ? val : result;
	
};

DataTable.compareNumberCells = function (cellA, cellB, parse) {
	'use strict';
	
	var aVal, bVal, aNum, aNaN, bNum, bNaN;
	
	aVal = cellA.textContent;
	bVal = cellB.textContent;
	
	aNum = DataTable.getNumber(aVal, parse);
	aNaN = DataTable.isNaN(aNum);
	bNum = DataTable.getNumber(bVal, parse);
	bNaN = DataTable.isNaN(bNum);
	
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
			
			cellA = rowA.cells[columnIndex];
			cellB = rowB.cells[columnIndex];
			
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
	
	var filterDescriptors, filterDescriptor, i, rows, row, cells, filter, j;
	
	// Pre-checks.
	if (!arguments.length) {
		return;
	}
	
	// Pre-Validation Initialization.
	filterDescriptors = arguments[0] instanceof Array ? arguments[0] : arguments;
	
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
			DataTable.addClass(row, DataTable.FILTERED_CLASS_NAME);
		} else {
			DataTable.removeClass(row, DataTable.FILTERED_CLASS_NAME);
		}
	}
};

DataTable.prototype.clearFilter = function () {
	'use strict';
	
	var i, rows;
	
	rows = this.table.tBodies[0].rows;
	
	for (i = 0; i < rows.length; ++i) {
		DataTable.removeClass(rows[i], DataTable.FILTERED_CLASS_NAME);
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




// Nested Types

// SortDescriptor
DataTable.SortDescriptor = function (columnIndex, descending) {
	'use strict';
	
	this.columnIndex = columnIndex;
	
	if (descending) {
		this.descending = true;
	}
};

DataTable.SortDescriptor.prototype.descending = false;
//


// StringSort
DataTable.StringSort = function (columnIndex, descending) {
	'use strict';
	
	DataTable.SortDescriptor.call(this, columnIndex, descending);
};

DataTable.StringSort.prototype = Object.create(DataTable.SortDescriptor.prototype);

DataTable.StringSort.prototype.compare = function (cellA, cellB) {
	'use strict';
	
	var aVal, bVal;
	
	aVal = cellA.textContent;
	bVal = cellB.textContent;
	
	return aVal < bVal ? -1 : (aVal > bVal ? 1 : 0);
};
//


// IntSort
DataTable.IntSort = function (columnIndex, descending) {
	'use strict';
	
	DataTable.SortDescriptor.call(this, columnIndex, descending);
};

DataTable.IntSort.prototype = Object.create(DataTable.SortDescriptor.prototype);

DataTable.IntSort.prototype.compare = function (cellA, cellB) {
	return DataTable.compareNumberCells(cellA, cellB, parseInt);
};
//


// FloatSort
DataTable.FloatSort = function (columnIndex, descending) {
	'use strict';
	
	DataTable.SortDescriptor.call(this, columnIndex, descending);
};

DataTable.FloatSort.prototype = Object.create(DataTable.SortDescriptor.prototype);

DataTable.FloatSort.prototype.compare = function (cellA, cellB) {
	return DataTable.compareNumberCells(cellA, cellB, parseFloat);
};
//




// ValueFilter
DataTable.ValueFilter = function (columnIndex, filterType, operation, compareValue) {
	'use strict';
	
	this.columnIndex = columnIndex;
	this.filterType = filterType;
	if (operation && operation != DataTable.FILTER_OP_EQUALS) {
		this.operation = operation;
	}
	this.compareValue = compareValue;
};



DataTable.ValueFilter.prototype.operation = DataTable.FILTER_OP_EQUALS;

DataTable.ValueFilter.prototype.include = function (cell) {
	'use strict';
	
	var operation, rawCompareValue, rawCellValue, compareValue, cellValue;
	
	// Initialization.
	operation = this.operation;
	
	rawCompareValue = this.compareValue;
	rawCellValue = cell.textContent;
	
	
	// Type conversion.
	switch (this.filterType) {
		case DataTable.FILTER_TYPE_STRING:
		default:
			compareValue = rawCompareValue;
			cellValue = rawCellValue;
			break;
		case DataTable.FILTER_TYPE_INT:
			compareValue = DataTable.getNumber(rawCompareValue, DataTable.parseInt);
			cellValue = DataTable.getNumber(rawCellValue, DataTable.parseInt);
			break;
		case DataTable.FILTER_TYPE_FLOAT:
			compareValue = DataTable.getNumber(rawCompareValue, DataTable.parseFloat);
			cellValue = DataTable.getNumber(rawCellValue, DataTable.parseFloat);
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
	
	
	
	// String comparisons.
	
	// Reset compare values.
	cellValue = rawCellValue;
	compareValue = typeof compareValue === 'string' ? compareValue : String(rawCompareValue);
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