
// Virtual Interfaces
/**
 * @interface ColumnControlFactory
 */
/**
 *
 * @function ColumnControlFactory#getColumnControl
 * @param {number} columnIndex
 * @param {HTMLTableHeaderElement} header
 * @param {SimpleDataTableListener} listener
 * @returns {ColumnControl}
 */

/**
 * @interface ColumnControl
 */
/**
 * @function ColumnControl#open
 */
/**
 * @function ColumnControl#close
 */
/**
 * @function ColumnControl#getFilterDescriptor
 * @returns {FilterDescriptor}
 */
/**
 * @function ColumnControl#getSortDescriptor
 * @returns {SortDescriptor}
 */
/**
 * Optional
 *
 * @function ColumnControl#dispose
 */
////
 
 

// Constructor
/**
 * @constructor
 * @param {HTMLTableElement | SimpleDataTable} table
 * @param {ColumnControlFactory} [columnControlFactory]
 */
function SimpleDataTableListener(table, columnControlFactory) {
	'use strict';
	
	if (table instanceof SimpleDataTable) {
		this.dataTable = dataTable;
		this.table = dataTable.table;
	} else {
		this.dataTable = new SimpleDataTable(table);
		this.table = table;
	}
	
	this.columnControlFactory = columnControlFactory;
	this.tableHeaderCache = [];
	this.columnControls = [];
}

// Static fields.
SimpleDataTableListener.processedColumnHeader = 'data-table-column-header';

// Instance Methods
SimpleDataTableListener.prototype.init = function () {
	'use strict';
	
	var tableHeaders, tableHeaderCache, i, tableHeader;
	
	tableHeaders = this.table.tHead.rows[0].cells;
	tableHeaderCache = this.tableHeaderCache = [];
	
	
	for (i = 0; i < tableHeaders.length; ++i) {
		tableHeader = tableHeaders[i];
		tableHeader.addEventListener('click', this, false);
		IE9Compatibility.addClass(tableHeader, SimpleDataTableListener.processedColumnHeader);
		tableHeaderCache.push(tableHeader);
	}
	
};

SimpleDataTableListener.prototype.dispose = function () {
	'use strict';
	
	var tableHeaderCache, i, columnControls, columnControl;
	
	tableHeaderCache = this.tableHeaderCache;
	for (i = 0; i < tableHeaderCache.length; ++i) {
		tableHeaderCache[i].removeEventListener('click', this, false);
	}
	
	columnControls = this.columnControls;
	for (i = 0; i < columnControls.length; ++i) {
		columnControl = columnControls[i];
		if (typeof columnControl.dispose === 'function') {
			columnControl.dispose();
		}
	}
	
};


SimpleDataTableListener.prototype.handleEvent = function (event) {
	'use strict';
	
	var columnIndex, target, targetColumnControl, columnControls, columnControl, i;
	
	// Only process click events (warn otherwise).
	if (event.type !== 'click') {
		if (console && console.warn) {
			console.warn('Unsupported event: ' + event.type);
			console.warn(event);
		}
		return;
	}
	
	// Get column index.
	target = event.currentTarget;
	columnIndex = this.tableHeaderCache.indexOf(target);
	if (columnIndex === -1) {
		if (console && console.warn) {
			console.warn('Unrecognized event target.');
			concat.warn(target);
		}
		return;
	}
	
	// Get associated control.
	targetColumnControl = this.getColumnControl(columnIndex, target);
	console.info(targetColumnControl);
	
	// Open taget/close others.
	columnControls = this.columnControls;
	for (i = 0; i < columnControls.length; ++i) {
		columnControl = columnControls[i];
		if (columnControl === targetColumnControl) {
			columnControl.open();
		} else {
			columnControl.close();
		}
	}
};


SimpleDataTableListener.prototype.getColumnControl = function (columnIndex, tableHeader) {
	'use strict';
	
	var columnControls, columnControl, currentColumnControl, i, columnControlFactory;
	
	columnControls = this.columnControls;
	for (i = 0; i < columnControls.length; ++i) {
		currentColumnControl = columnControls[i];
		if (currentColumnControl.columnIndex === columnIndex) {
			return currentColumnControl;
		}
	}
	
	columnControlFactory = this.columnControlFactory;
	if (columnControlFactory) {
		columnControl = columnControlFactory.getColumnControl(columnIndex, tableHeader, this);
	}
	
	if (!columnControl) {
		columnControl = new SimpleDataTableControl(columnIndex, tableHeader, this);
	}
	
	columnControls.push(columnControl);
	return columnControl;
};


SimpleDataTableListener.prototype.processTable = function () {
	'use strict';
	
	var sortDescriptors, filterDescriptors, columnControls, i, columnControl, dataTable;
	
	filterDescriptors = [];
	sortDescriptors = [];
	columnControls = this.columnControls;
	for (i = 0; i < columnControls.length; ++i) {
		columnControl = columnControls[i];
		filterDescriptors.push(columnControl.getFilterDescriptor());
		sortDescriptors.push(columnControl.getSortDescriptor());
	}
	
	dataTable = this.dataTable;
	
	if (filterDescriptors.length) {
		dataTable.filter(filterDescriptors);
	} else {
		dataTable.clearFilter();
	}
	
	if (sortDescriptors.length) {
		dataTable.sort(sortDescriptors);
	} else {
		dataTable.clearSort();
	}
};