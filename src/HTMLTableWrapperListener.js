/*
 * Copyright 2020 Martin F. Schlegel Jr. | MIT AND BSD-3-Clause
 */

// Callbacks
/**
 * Called by {@link HTMLTableWrapperListener} to obtain a {@link ColumnControl} for a given column. If a value is returned, it will be used as the 
 * control for that column. If {@link Nothing} is returned, the default control ({@link HTMLTableWrapperControl}) will be created and used 
 * for that column.
 *
 * @callback HTMLTableWrapperListener~getColumnControl
 * @param {number} columnIndex Column index for which a {@link ColumnControl} is needed.
 * @param {HTMLTableWrapperListener} parent The {@link HTMLTableWrapperListener} requesting a control.
 * @returns {ColumnControl} A {@link ColumnControl} if a client-defined control is needed for the given `columnIndex`, otherwise {@link Nothing}.
 */

// Virtual Interfaces
// ColumnControlFactory
/**
 * @interface ColumnControlFactory
 * @classdesc
 *   Object-based implementation of {@link HTMLTableWrapperListener~getColumnControl}.
 */
/**
 * Implementation of {@link HTMLTableWrapperListener~getColumnControl}. See the callback's documentation for further details.
 *
 * @function ColumnControlFactory#getColumnControl
 * @param {number} columnIndex Column index for which a {@link ColumnControl} is needed.
 * @param {HTMLTableWrapperListener} parent The {@link HTMLTableWrapperListener} requesting a control.
 * @returns {ColumnControl} A {@link ColumnControl} if a client-defined control is needed for the given `columnIndex`, otherwise {@link Nothing}.
 */

// ColumnControl
/**
 * @interface ColumnControl
 * @extends Disposable
 * @classdesc
 *
 * A handle used by {@link HTMLTableWrapperListener} to open and close controls in response to client calls and end-user requests. 
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
 * Called by {@link HTMLTableWrapperListener#processTable} to obtain a {@link FilterDescriptor} based upon the current state of this
 * `ColumnControl`. If this control is in a state in which no filtering should be performed, it is permissible to return {@link Nothing}.
 *
 * @function ColumnControl#getFilterDescriptor
 * @returns {FilterDescriptor} 
 *   A {@link FilterDescriptor} based upon the state of this `ColumnControl` or {@link Nothing} if no filtering should be performed.
 */
/**
 * Called by {@link HTMLTableWrapperListener#processTable} to obtain a {@link SortDescriptor} based upon the current state of this
 * `ColumnControl`. If this control is in a state in which no sorting should be performed, it is permissible to return {@link Nothing}.
 *
 * @function ColumnControl#getSortDescriptor
 * @returns {SortDescriptor}
 *   A {@link SortDescriptor} based upon the state of this `ColumnControl` or {@link Nothing} if no sorting should be performed.
 */

 
 

// Constructor
/**
 * @constructor
 * @implements Disposable
 * @param {(HTMLTableElement|HTMLTableWrapper)} table `HTMLTableElement` or {@link HTMLTableWrapper} backing this listener.
 * @param {ColumnControlFactory|HTMLTableWrapperListener~getColumnControl} [columnControlFactory] Optional factory if custom column controls are needed.
 * @param {CellInterpreter|HTMLTableWrapperControl~populateCellValues} [cellInterpreter]
 *   Interpreter to use when falling back to the default {@link HTMLTableWrapperControl} on calls to {@link HTMLTableWrapperListener#getColumnControl}.
 * @classdesc
 *
 * Facilitates communication between the API-level {@link HTMLTableWrapper} and the UI-level {@link ColumnControl}. In addition to the constraints
 * placed on the backing `HTMLTableElement` in {@link HTMLTableWrapper}, this class also requires it to define a table header section
 * (`<thead>`) with the first row's cells defining the column headers for the table. Although the table can define more than one row in its table
 * header section, only the first row will be processed by this class.
 * 
 * Upon {@link HTMLTableWrapperListener#init initialization}, this class will add itself as a listener for click events on
 * all cells in the first row of the backing `HTMLTableElement`'s table header section, as well as add the class name
 * {@link HTMLTableWrapperListener.processedColumnHeader} to each cell.
 * 
 * In response to click events, the appropriate {@link ColumnControl} will be created using the given {@link ColumnControlFactory} (or {@link HTMLTableWrapperListener~getColumnControl} 
 * callback), if defined, or will fall back to {@link HTMLTableWrapperControl} in the case no {@link ColumnControlFactory} (or callback) is defined, or the call to 
 * {@link ColumnControlFactory#getColumnControl} (or direct invocation of the {@link HTMLTableWrapperListener~getColumnControl} callback) returns {@link Nothing}. {@link ColumnControl}s 
 * are cached after they are created, and are reused for subsequent click events. The given `cellInterpreter` is used when falling back to {@link HTMLTableWrapperControl}.
 * 
 * {@link ColumnControl}s can make calls back to {@link HTMLTableWrapperListener#processTable} to trigger table-wide
 * sorting and filtering in response to user-triggered events on the control that would be expected to update the state of the 
 * backing table. Upon a call to {@link HTMLTableWrapperListener#processTable}, {@link ColumnControl#getFilterDescriptor} and 
 * {@link ColumnControl#getSortDescriptor} are called for each cached {@link ColumnControl}. Each result that is not {@link Nothing} is stored, 
 * and ultimately passed to {@link HTMLTableWrapper#filter} and {@link HTMLTableWrapper#sort}. (Implicit to this, calls to {@link HTMLTableWrapperListener#processTable}
 * should not be made in {@link ColumnControl#getFilterDescriptor} and {@link ColumnControl#getSortDescriptor}, as such would cause infinite recursion).
 */
function HTMLTableWrapperListener(table, columnControlFactory, cellInterpreter) {
    'use strict';
    
    if (table instanceof HTMLTableWrapper) {
        this.dataTable = dataTable;
    } else {
        this.dataTable = new HTMLTableWrapper(table);
    }
    
    if (columnControlFactory) {
        this.columnControlFactory = columnControlFactory;
    }
    
    if (cellInterpreter) {
        this.cellInterpreter = cellInterpreter;
    }
    
    /**
     * {@link ColumnControl} cache.
     *
     * @private
     * @type {ColumnControl[]}
     */
    this.columnControls = [];
}

// Static fields.
/**
 * Class name added to `HTMLTableCellElement`s upon which `HTMLTableWrapperListener` instances are registered for
 * click events. Default value is `'data-table-column-header'`.
 *
 */
HTMLTableWrapperListener.processedColumnHeader = 'data-table-column-header';

// Instance Properties
/**
 * Backing {@link HTMLTableWrapper}.
 *
 * @member {HTMLTableWrapper} HTMLTableWrapperListener#dataTable
 * @private
 */
 

/**
 * Cache of `HTMLTableCellElement`s for which this class is registered for click events.
 *
 * @private
 * @type {HTMLTableCellElement[]}
 */
HTMLTableWrapperListener.prototype.tableHeaderCache = null;

/**
 * Current column-order in which to apply sort descriptors. Initially `null`, initialized on first call to {@link HTMLTableWrapperListener#processTable}.
 *
 * @private
 * @type {number[]}
 */
HTMLTableWrapperListener.prototype.sortDescriptorOrder = null;


/**
 * {@link ColumnControlFactory} to use when creating controls.
 *
 * @type ColumnControlFactory
 * @private
 */
HTMLTableWrapperListener.prototype.columnControlFactory = null;


HTMLTableWrapperListener.prototype.cellInterpreter = null;



// Instance Methods
/**
 * Initializes this `HTMLTableWrapperListener`. This `HTMLTableWrapperListener` will be added as a click listener for each `HTMLTableCellElement` 
 * in the first row of the backing table's header section. The class name {@link HTMLTableWrapperListener.processedColumnHeader} will also be added to
 * each cell.
 */
HTMLTableWrapperListener.prototype.init = function () {
    'use strict';
    
    var table, tableHeaders, tableHeaderCache, i, tableHeader;
    
    table = this.dataTable.getTableElement();
    tableHeaders = table.tHead.rows[0].cells;
    tableHeaderCache = this.tableHeaderCache = [];
    
    
    for (i = 0; i < tableHeaders.length; ++i) {
        tableHeader = tableHeaders[i];
        IE8Compatibility.addEventListener(tableHeader, 'click', this, false);
        IE8Compatibility.addClass(tableHeader, HTMLTableWrapperListener.processedColumnHeader);
        tableHeaderCache.push(tableHeader);
    }
    
};

/**
 * Disposes this `HTMLTableWrapperListener`. This `HTMLTableWrapperListener` will remove itself as a click listener for any
 * `HTMLTableCellElement`s upon which it has registered itself, as well as remove the {@link HTMLTableWrapperListener.processedColumnHeader}
 * class name. Additionally, if any cached {@link ColumnControl}s define a {@link ColumnControl#dispose dispose} function, it will also be called.
 */
HTMLTableWrapperListener.prototype.dispose = function () {
    'use strict';
    
    var tableHeaderCache, i, columnControls, columnControl, tableHeader;
    
    tableHeaderCache = this.tableHeaderCache;
    for (i = 0; i < tableHeaderCache.length; ++i) {
        tableHeader = tableHeaderCache[i];
        IE8Compatibility.removeEventListener(tableHeader, 'click', this, false);
        IE8Compatibility.removeClass(tableHeader, HTMLTableWrapperListener.processedColumnHeader)
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
HTMLTableWrapperListener.prototype.handleEvent = function (event) {
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
    target = IE8Compatibility.getEventTarget(event);
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
 * Opens the {@link ColumnControl} for the given `columnIndex`. Delegates to {@link HTMLTableWrapperListener#getColumnControl}
 * to obtain the {@link ColumnControl} to be opened. After obtained, {@link ColumnControl#open} will be called on it, and 
 * {@link ColumnControl#close} on all others in the cache.
 *
 * @param {number} columnIndex Index of the column upon which a {@link ColumnControl} is to be opened.
 * @throws {RangeError} If `columnIndex` is greater than or equal to the number of columns in the backing table.
 */
HTMLTableWrapperListener.prototype.openColumnControl = function (columnIndex) {
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
 * Obtains a {@link ColumnControl} for the given `columnIndex`. If one is cached (has been obtained before), it will be returned. Otherwise it will be created using the 
 * {@link ColumnControlFactory} passed to the constructor of this `HTMLTableWrapperListener`. If defined, and its {@link ColumnControlFactory#getColumnControl} (or its 
 * direct invocation if a {@link HTMLTableWrapperListener~getColumnControl}) function returns a value that is not {@link Nothing}, that value will be cached and returned. 
 * Failing that, a new {@link HTMLTableWrapperControl} will be cached and returned.
 *
 * @param {number} columnIndex Index of the column for which a {@link ColumnControl} is to be obtained.
 * @throws {RangeError} If `columnIndex` is greater than or equal to the number of columns in the backing table.
 * @returns {ColumnControl} The newly created, or previously cached {@link ColumnControl} for the given `columnIndex`.
 */
HTMLTableWrapperListener.prototype.getColumnControl = function (columnIndex) {
    'use strict';
    
    var columnControls, columnControl, currentColumnControl, i, columnControlFactory, columnCount;
    
    if (columnIndex > (columnCount = this.tableHeaderCache.length)) {
        throw new RangeError('The given columnIndex must be less than the number of columns in the backing table (' + columnCount + '): ' + columnIndex);
    }
    
    columnControls = this.columnControls;
    for (i = 0; i < columnControls.length; ++i) {
        currentColumnControl = columnControls[i];
        if (currentColumnControl.columnIndex === columnIndex) {
            return currentColumnControl;
        }
    }

    
    columnControlFactory = this.columnControlFactory;
    if (columnControlFactory) {
        columnControl = typeof columnControlFactory.getColumnControl === 'function' ? 
                columnControlFactory.getColumnControl(columnIndex, this) : columnControlFactory(columnIndex, this);
    }
    
    if (!columnControl) {
        columnControl = new HTMLTableWrapperControl(columnIndex, this, this.cellInterpreter);
    }
    
    if (typeof columnControl.init === 'function') {
        columnControl.init();
    }
    
    columnControls.push(columnControl);
    return columnControl;
};


/**
 * {@link HTMLTableWrapper#filter Filters} and {@link HTMLTableWrapper#sort sorts} the backing table based upon
 * the state of cached {@link ColumnControl}s.
 *
 * The {@link ColumnControl#getFilterDescriptor} and {@link ColumnControl#getSortDescriptor} functions are called for each
 * cached {@link ColumnControl} in the order they are created. Each result that is not {@link Nothing} is stored in a distinct
 * `Array` (one for {@link FilterDescriptor}s, another for {@link SortDescriptor}s), and subsequently passed to the backing
 * {@link HTMLTableWrapper}'s {@link HTMLTableWrapper#filter} and {@link HTMLTableWrapper#sort} functions. Filtering is performed before sorting.
 * 
 * {@link SortDescriptor}s are ordered according to the order in which they are/were returned from this and previous calls. E.g., consider
 * the following sequence of calls to `processTable`:
 *   1. A valid {@link SortDescriptor} is returned for column 1 => table will be ordered by column 1
 *   2. A valid {@link SortDescriptor} is returned for columns 1 and 2 => table will be ordered by columns 1, 2
 *   3. A valid {@link SortDescriptor} is returned for columns 1, 2, and 3 => table will be ordered by columns 1, 2, 3
 *   4. A valid {@link SortDescriptor} is only returned for columns 2 and 3 => table will be ordered by columns 2, 3
 *   5. A valid {@link SortDescriptor} is returned for columns 1, 2, and 3 again => table will be ordered by columns 2, 3, 1
 *
 */
HTMLTableWrapperListener.prototype.processTable = function () {
    'use strict';
    
    var sortDescriptors, filterDescriptors, columnControls, i, columnControl, dataTable, filterDescriptor,
        sortDescriptor, sortDescriptorOrder, columnIndex, j, targetIndex;
    
    
    // Get descriptors.
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
    
    
    // Determine order for sort descriptors.
    sortDescriptorOrder = this.sortDescriptorOrder;
    if (!sortDescriptorOrder) {
        sortDescriptorOrder = this.sortDescriptorOrder = [];
    }
    
    // Add column indicies to order that were returned, but not present.
    for (i = 0; i < sortDescriptors.length; ++i) {
        columnIndex = sortDescriptors[i].columnIndex;
        if (sortDescriptorOrder.indexOf(columnIndex) === -1) {
            sortDescriptorOrder.push(columnIndex);
        }
    }
    
    // Remove column indicies from order that are present, but not returned
    for (i = 0; i < sortDescriptorOrder.length; ++i) {
        columnIndex = sortDescriptorOrder[i];
        
        targetIndex = -1;
        for (j = 0; j < sortDescriptors.length; ++j) {
            if (sortDescriptors[j].columnIndex === columnIndex) {
                targetIndex = j;
                break;
            }
        }
        
        if (targetIndex === -1) {
            sortDescriptorOrder.splice(i, 1);
            --i;
        }
    }
    
    // Sort sort descriptors according to order.
    sortDescriptors.sort(function (a, b) {
        return sortDescriptorOrder.indexOf(a.columnIndex) - sortDescriptorOrder.indexOf(b.columnIndex);
    });
    
    
    
    // Process backing table.
    dataTable = this.dataTable;
    
    dataTable.filter(filterDescriptors);
    dataTable.sort(sortDescriptors);
};


/**
 * Returns this `HTMLTableWrapperListener`'s backing {@link HTMLTableWrapper}.
 *
 * @returns {HTMLTableWrapper} This `HTMLTableWrapperListener`'s backing {@link HTMLTableWrapper}.
 */
HTMLTableWrapperListener.prototype.getDataTable = function () {
    'use strict';
    
    return this.dataTable;
};


/**
 * Returns the `HTMLTableCellElement` acting as the column header for the given `columnIndex`.
 *
 * @param {number} columnIndex Index of the column header to be retrieved.
 * @returns {HTMLTableCellElement} The `HTMLTableCellElement` acting as the column header for the given `columnIndex`.
 * @throws {RangeError} If `columnIndex` is greater than or equal to the number of columns in the backing table.
 */
HTMLTableWrapperListener.prototype.getTableHeaderElement = function (columnIndex) {
    'use strict';
    
    return this.dataTable.getTableElement().tHead.rows[0].cells[columnIndex];
};


