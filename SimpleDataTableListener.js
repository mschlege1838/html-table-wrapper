
// Virtual Interfaces
/**
 * @interface ColumnControlFactory
 * @classdesc
 *
 * Can be used with {@link SimpleDataTableListener} to create custom {@link ColumnControl}s if client-defined controls are 
 * needed. If given to a {@link SimpleDataTableListener}, it will call {@link ColumnControlFactory#getColumnControl}
 * when it determines a new control needs to be created for a column. If the call returns a value, it will
 * be used as the control for that column.
 */
/**
 * Called by {@link SimpleDataTable} to obtain a {@link ColumnControl} for a given column. If a value is returned,
 * it will be used as the control for that column. If no value is returned, a new {@link SimpleDataTableControl}
 * will be created and used for that column.
 *
 * @function ColumnControlFactory#getColumnControl
 * @param {number} columnIndex Column index for which a {@link ColumnControl} is needed.
 * @param {HTMLTableHeaderElement} header Table header for the given columnIndex.
 * @param {SimpleDataTableListener} parent The {@link SimpleDataTableListener} requesting a control.
 * @returns {ColumnControl} A {@link ColumnControl} if a client-defined control is needed for the given columnIndex, otherwise nothing.
 */


/**
 * @interface ColumnControl
 * @classdesc
 *
 * A handle used by {@link SimpleDataTableListener} to open and close controls in response to click events on column headers. 
 * Client code can define custom controls by implementing this interface and returning instances via an implementation of
 * {@link ColumnControlFactory}.
 */
/**
 * Index of the column this `ColumnControl` handles.
 *
 * @member {number} ColumnControl#columnIndex
 */
/**
 * Opens this `ColumnControl` such that it is visible to the end-user.
 *
 * @function ColumnControl#open
 */
/**
 * Closes this `ColumnControl` such that it is hidden from the end-user.
 *
 * @function ColumnControl#close
 */
/**
 * Called by {@link SimpleDataTable#processTable} to obtain a {@link FilterDescriptor} based upon the current state of this
 * `ColumnControl`. If this control is in a state in which no filtering should be performed, it is permissible to return nothing
 * (i.e. a value that is convertible to `false`).
 *
 * @function ColumnControl#getFilterDescriptor
 * @returns {FilterDescriptor} 
 *   A {@link FilterDescriptor} based upon the state of this ColumnControl or nothing if no filtering should be performed.
 */
/**
 * Called by {@link SimpleDataTable#processTable} to obtain a {@link SortDescriptor} based upon the current state of this
 * `ColumnControl`. If this control is in a state in which no sorting should be performed, it is permissible to return nothing
 * (i.e. a value that is convertible to `false`).
 *
 * @function ColumnControl#getSortDescriptor
 * @returns {SortDescriptor}
 *   A {@link SortDescriptor} based upon the state of this ColumnControl or nothing if no sorting should be performed.
 */
/**
 * Optional function to be called when the owning {@link SimpleDataTableListener} is {@link SimpleDataTableListener#dispose disposed}.
 *
 * @function ColumnControl#dispose
 */
 
 

// Constructor
/**
 * @constructor
 * @param {(HTMLTableElement|SimpleDataTable)} table Table element or {@link SimpleDataTable} backing this listener.
 * @param {ColumnControlFactory} [columnControlFactory] Optional factory if custom column controls are needed.
 * @classdesc
 *
 * Facilitates communication between the API-level {@link SimpleDataTable} and the UI-level {@link ColumnControl}.
 * 
 * Upon {@link SimpleDataTableListener#init initialization}, this class will add itself as a listener for click events on
 * all cells in the first row of the backing `HTMLTableElement`'s table header section. The class name
 * {@link SimpleDataTableListener.processedColumnHeader} will be added to each cell for which this type registers itself.
 * 
 * In response to click events, the appropriate {@link ColumnControl} will be created using the given {@link ColumnControlFactory}
 * if defined, or will fall back to {@link SimpleDataTableControl} in the case no {@link ColumnControlFactory} is defined, or
 * the call to {@link ColumnControlFactory#getColumnControl} does not return a value. {@link ColumnControl}s are cached after created, and will 
 * be used for subsequent click events.
 * 
 * {@link ColumnControl}s can make calls back to {@link SimpleDataTableListener#processTable} to trigger table-wide
 * sorting and filtering in response to user-triggered events on the control that would be expected to update the state of the 
 * bacing table. Upon a call to {@link SimpleDataTableListener#processTable}, {@link ColumnControl#getFilterDescriptor} and 
 * {@link ColumnControl#getSortDescriptor} are called for each cached {@link ColumnControl}. Each non-null (defined) result is stored, 
 * and ultimately passed to {@link SimpleDataTable#filter} and {@link SimpleDataTable#sort}. If no {@link FilterDescriptor} or 
 * {@link SortDescriptor} is obtained, {@link SimpleDataTable#clearFilter} and/or {@link SimpleDataTable#clearSort} is/are instead 
 * called, respectively.
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
	
	/**
	 * {@link ColumnControlFactory} to use when creating controls.
	 *
	 * @type ColumnControlFactory
	 */
	this.columnControlFactory = columnControlFactory;
	
	/**
	 * Cache of `HTMLTableCellElement`s for which this class is registered for click events.
	 *
	 * @private
	 */
	this.tableHeaderCache = [];
	
	/**
	 * {@link ColumnControl} cache.
	 *
	 * @private
	 */
	this.columnControls = [];
}

// Static fields.
/**
 * Class name added to `HTMLTableCellElement`s upon which `SimpleDataTableListener` instances are registered for
 * click events. Default value is 'data-table-column-header'.
 *
 */
SimpleDataTableListener.processedColumnHeader = 'data-table-column-header';

// Instance Properties
/**
 * Backing {@link SimpleDataTable}.
 *
 * @member {SimpleDataTable} SimpleDataTableListener#dataTable
 */
/**
 * Backing table element.
 *
 * @member {HTMLTableElement} SimpleDataTableListener#table
 */

// Instance Methods
/**
 * Initializes this SimpleDataTableListener. This SimpleDataTableListener will be added as a click listener for each 
 * HTMLTableCellElement in the first row of the backing table's header (i.e. `this.table.tHead.rows[0].cells`). 
 * The class name {@link SimpleDataTableListener.processedColumnHeader} will also be added to each cell.
 */
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

/**
 * Disposes this SimpleDataTableListener. This SimpleDataTableListener will remove itself as a click listener for any
 * HTMLTableCellElements upon which it has registered itself, and the {@link SimpleDataTableListener.processedColumnHeader}
 * class name will be removed. Additionally, if any cached {@link ColumnControl}s define a {@link ColumnControl#dispose dispose}
 * function, it will be called as well.
 */
SimpleDataTableListener.prototype.dispose = function () {
	'use strict';
	
	var tableHeaderCache, i, columnControls, columnControl, tableHeader;
	
	tableHeaderCache = this.tableHeaderCache;
	for (i = 0; i < tableHeaderCache.length; ++i) {
		tableHeader = tableHeaderCache[i];
		tableHeader.removeEventListener('click', this, false);
		IE9Compatibility.removeClass(tableHeader, SimpleDataTableListener.processedColumnHeader)
	}
	
	columnControls = this.columnControls;
	for (i = 0; i < columnControls.length; ++i) {
		columnControl = columnControls[i];
		if (typeof columnControl.dispose === 'function') {
			columnControl.dispose();
		}
	}
	
};

/**
 * Implementation of DOM `EventListener`.
 *
 * @param {Event} event Event being dispatched.
 */
SimpleDataTableListener.prototype.handleEvent = function (event) {
	'use strict';
	
	var columnIndex, target;
	
	// Only process click events (warn otherwise).
	if (event.type !== 'click') {
		if (console && console.warn) {
			console.warn('Unsupported event: ' + event.type);
			console.warn(event);
		}
		return;
	}
	
	// Get column index.
	target = event.target;
	columnIndex = this.tableHeaderCache.indexOf(target);
	if (columnIndex === -1) {
		if (console && console.warn) {
			console.warn('Unrecognized event target.');
			console.warn(target);
		}
		return;
	}
	
	// Open control
	this.openColumnControl(columnIndex);
};

/**
 * Opens the {@link ColumnControl} for the given columnIndex. Delegates to {@link SimpleDataTableListener#getColumnControl}
 * to obtain the {@link ColumnControl} to be opened. After obtained, {@link ColumnControl#open} will be called on it, and 
 * {@link ColumnControl#close} on all others.
 *
 * @param {number} columnIndex Index of the column upon who a {@link ColumnControl} is to be opened.
 * @throws {RangeError} If columnIndex is greater than or equal to the number of columns in the backing table.
 */
SimpleDataTableListener.prototype.openColumnControl = function (columnIndex) {
	'use strict';
	
	var tableHeader, targetColumnControl, columnControls, columnControl, i;
	
	targetColumnControl = this.getColumnControl(columnIndex);
	
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

/**
 * Obtains a {@link ColumnControl} for the given `columnIndex`. If one is cached (has been obtained before), it will be returned.
 * Otherwise it will be craeted using {@link SimpleDataTableListener#columnControlFactory} if defined. If defined, and its
 * {@link ColumnControlFactory#getColumnControl} returns a non-null (defined) value, it will be cached and returned. Failing that,
 * a new {@link SimpleDataTableControl} will be created and cached for this column, and be subsequently returned.
 *
 * @param {number} columnIndex Index of the column for whom a {@link ColumnControl} is to be obtained.
 * @throws {RangeError} If columnIndex is greater than or equal to the number of columns in the backing table.
 */
SimpleDataTableListener.prototype.getColumnControl = function (columnIndex) {
	'use strict';
	
	var columnControls, columnControl, currentColumnControl, i, columnControlFactory, tableHeader;
	
	columnControls = this.columnControls;
	for (i = 0; i < columnControls.length; ++i) {
		currentColumnControl = columnControls[i];
		if (currentColumnControl.columnIndex === columnIndex) {
			return currentColumnControl;
		}
	}
	
	
	tableHeader = this.tableHeaderCache[columnIndex];
	
	columnControlFactory = this.columnControlFactory;
	if (columnControlFactory) {
		columnControl = columnControlFactory.getColumnControl(columnIndex, tableHeader, this);
	}
	
	if (!columnControl) {
		columnControl = new SimpleDataTableControl(columnIndex, tableHeader, this);
	}
	
	if (typeof columnControl.init === 'function') {
		columnControl.init();
	}
	
	columnControls.push(columnControl);
	return columnControl;
};


/**
 * {@link SimpleDataTable#filter Filters} and {@link SimpleDataTable#sort sorts} the backing table based upon
 * the state of cached {@link ColumnControl}s.
 *
 * The {@link ColumnControl#getFilterDescriptor} and {@link ColumnControl#getSortDescriptor} functions are called for each
 * cached {@link ColumnControl} in the order they are created. Each defined (convertible to `true`) result is stored in a distinct
 * `Array` (one for {@link FiterDescriptor}s, another for {@link SortDescriptor}s), and subsequently passed to the backing
 * {@link SimpleDataTable}'s {@link SimpleDataTable#filter} and {@link SimpleDataTable#sort} functions.
 *
 * Filtering is performed before sorting. In the case where no {@link FilterDescriptor}s are returned from calls to
 * {@link ColumnControl#getFilterDescriptor}, {@link SimpleDataTable#clearFilter} is called instead of
 * {@link SimpleDataTable#filter}; similarly the case for {@link ColumnControl#getSortDescriptor}, {@link SimpleDataTable#sort}
 * and {@link SimpleDataTable#clearSort}, respectively.
 *
 */
SimpleDataTableListener.prototype.processTable = function () {
	'use strict';
	
	var sortDescriptors, filterDescriptors, columnControls, i, columnControl, dataTable, filterDescriptor,
		sortDescriptor;
	
	filterDescriptors = [];
	sortDescriptors = [];
	columnControls = this.columnControls;
	for (i = 0; i < columnControls.length; ++i) {
		columnControl = columnControls[i];
		
		filterDescriptor = columnControl.getFilterDescriptor();
		if (filterDescriptor) {
			filterDescriptors.push(filterDescriptor);
		}
		
		sortDescriptor = columnControl.getSortDescriptor();
		if (sortDescriptor) {
			sortDescriptors.push(sortDescriptor);
		}
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


