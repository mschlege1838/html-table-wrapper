
// Virtual Interfaces

// CellInterpreter
/**
 * @interface CellInterpreter
 * @classdesc
 *		Object-based implementation of {@link SimpleDataTableControl~populateCellValues}.
 */
/**
 * Implementation of {@link SimpleDataTableControl~populateCellValues}. See documentation for the callback for further details.
 *
 * @function CellInterpreter#populateCellValues
 * @param {HTMLCellElement} cell
 * @param {Array} values
 */

// Callbacks

// populateCellValues
/**
 * Optional callback for {@link SimpleDataTableControl} to customize how cell values are interpreted. Based upon the given `cell`,
 * should determine the individual cell value/values, and add them to the given `Array`. Note, duplicate values are permitted; 
 * if distinct values are desired, this function should test for their presence in the `Array` prior to adding.
 *
 * @callback SimpleDataTableControl~populateCellValues
 * @param {HTMLTableCellElement} cell Cell element whose values are to be retrieved.
 * @param {Array} values Values to populate.
 */



// Constructor
/**
 * @constructor
 * @implements ColumnControl
 * @param {number} columnIndex
 * @param {HTMLTableCellElement} tableHeader
 * @param {SimpleDataTableListener} parent
 * @classdesc
 *		The default {@link ColumnControl} used by {@link SimpleDataTableListener}. Defines a UI where an end-user
 *		can select a column's type and sort order, as well as define filters based upon user-entered values and
 *		individual cell values. Uses a backing {@link ContextControl}.
 */
function SimpleDataTableControl(columnIndex, tableHeader, parent, cellInterpreter) {
	'use strict';
	
	var contextControl;
	
	this.columnIndex = columnIndex;
	
	/**
	 * Backing {@link ContextControl}.
	 *
	 * @private
	 * @type {ContextControl}
	 */
	this.contextControl = contextControl = new ContextControl();
	
	/**
	 * Header of the column to which this {@link ColumnControl} is associated.
	 *
	 * @private
	 * @type {HTMLTableCellElement}
	 */
	this.tableHeader = tableHeader;
	
	/**
	 * Parent {@link SimpleDataTableListener}
	 *
	 * @private
	 * @type {SimpleDataTableListener}
	 */
	this.parent = parent;
	
	if (cellInterpreter) {
		this.cellInterpreter = cellInterpreter;
	}
	
	contextControl.addEventListener('create', this, false);
}


// Static Fields
/**
 * Class name added to the backing {@link ContextControl}'s {@link ContextControl#getControlElement element} upon
 * being {@link ContextControl#event:create created}.
 *
 * @type {string}
 */
SimpleDataTableControl.controlClassName = 'data-table-column-options';

/**
 * Constant representing a column should have no sort order.
 *
 * @type {number}
 * @const
 */
SimpleDataTableControl.SORT_ORDER_NONE = 1;

/**
 * Constant representing a column should have ascending sort order.
 *
 * @type {number}
 * @const
 */
SimpleDataTableControl.SORT_ORDER_ASCENDING = 2;

/**
 * Constant representing a column should have descending sort order.
 *
 * @type {number}
 * @const
 */
SimpleDataTableControl.SORT_ORDER_DESCENDING = 3;

/**
 * A 'mapping' object whose properties correspond to labels printed on the control displayed to the end-user.
 * By default values are set to en-US; client code that requires internationalization can redefine the properties
 * of this object (or reassign a new value, so long as it contains all the properties in the original) on page
 * initialization (before any SimpleDataTableControls are created) for the desired locale.
 *
 * @type {object}
 */
SimpleDataTableControl.i18nStrings = {
	columnOptionsLabel: 'Column Options',
	sortOptionsLabel: 'Sort Options',
	
	inferDataType: 'Infer',
	textOnlyDataType: 'Text Only',
	
	noSortOrder: 'None',
	ascendingSortOrder: 'Ascending',
	descendingSortOrder: 'Descending',
	
	filterTypeEnteredValue: 'Filter By Entered Value',
	filterTypeCellValue: "Filter By Cell's Value",
	selectAll: 'Select All',
	
	filterOptionEquals: '=',
	filterOptionEqualsToolTip: 'Equals',
	filterOptionNotEquals: '!=',
	filterOptionNotEqualsToolTip: 'Not Equals',
	filterOptionLessThan: '<',
	filterOptionLessThanToolTip: 'Less Than',
	filterOptionGreaterThan: '>',
	filterOptionGreaterThanToolTip: 'Greater Than',
	filterOptionLessThanOrEqualTo: '<=',
	filterOptionLessThanOrEqualToToolTip: 'Less Than or Equal To',
	filterOptionGreaterThanOrEqualTo: '>=',
	filterOptionGreaterThanOrEqualToToolTip: 'Greater Than or Equal To',
	filterOptionContains: 'Contains',
	filterOptionIgnoreTextCase: 'Ignore Case',
	
	filterDescriptionEquals: 'Select cells whose value is equal to the entered value:',
	filterDescriptionNotEquals: 'Select cells whose value is not equal to the entered value:',
	filterDescriptionLessThan: 'Select cells whose value is less than the entered value:',
	filterDescriptionGreaterThan: 'Select cells whose value is greater than the entered value:',
	filterDescriptionLessThanOrEqualTo: 'Select cells whose value is less than or equal to the entered value:',
	filterDescriptionGreaterThanOrEqualTo: 'Select cells whose value is greater than or equal to the entered value:',
	filterDescriptionContains: 'Select cells whose value contain the entered value:',
	
	clearSearchFilters: 'Reset Filters',
	
	toolTipCloseDialogue: 'Close'
};

/**
 * Counter for generating unique DOM ids.
 *
 * @type {number}
 * @private
 */
SimpleDataTableControl.idCounter = 0;


// Static Methods
/**
 * Utility function for generating a unique id prefix for generated elements by SimpleDataTableControls.
 *
 * @private
 */
SimpleDataTableControl.getIdBase = function () {
	'use strict';
	
	return 'dataTable_' + SimpleDataTableControl.idCounter++ + '_';
};

/**
 * Gets a SimpleDataTableControl.SORT_ORDER_* constant based upon an HTMLInputElement value from generated control
 * elements.
 *
 * @private
 * @param {string} str Input value.
 * @returns {number} A SimpleDataTableControl.SORT_ORDER_* constant based upon the given value.
 * @throws {Error} If the given value does not correspond to a SimpleDataTableControl.SORT_ORDER_* constant.
 */
SimpleDataTableControl.getSortOrder = function (str) {
	'use strict';
	
	switch (str) {
		case 'none':
			return SimpleDataTableControl.SORT_ORDER_NONE;
		case 'ascending':
			return SimpleDataTableControl.SORT_ORDER_ASCENDING;
		case 'descending':
			return SimpleDataTableControl.SORT_ORDER_DESCENDING;
	}
	
	throw new Error('Unrecognized sort order: ' + str);
};

/**
 * Gets a {@link SimpleDataTable}.FILTER_OP_* constant based upon an HTMLInputElement value from generated control
 * elements.
 *
 * @private
 * @param {string} str Input value.
 * @returns {number} A {@link SimpleDataTable}.FILTER_OP_* constant based upon the given value.
 * @throws {Error} If the given value does not correspond to a {@link SimpleDataTable}.FILTER_OP_* constant.
 */
SimpleDataTableControl.getOperator = function (str) {
	'use strict';
	
	switch (str) {
		case 'eq':
			return SimpleDataTable.FILTER_OP_EQUALS;
		case 'neq':
			return SimpleDataTable.FILTER_OP_NOT_EQUALS;
		case 'lt':
			return SimpleDataTable.FILTER_OP_LESS_THAN;
		case 'gt':
			return SimpleDataTable.FILTER_OP_GREATER_THAN;
		case 'lte':
			return SimpleDataTable.FILTER_OP_LESS_THAN | SimpleDataTable.FILTER_OP_EQUALS;
		case 'gte':
			return SimpleDataTable.FILTER_OP_GREATER_THAN | SimpleDataTable.FILTER_OP_EQUALS;
		case 'contains':
			return SimpleDataTable.FILTER_OP_CONTAINS;
	}
	
	throw new Error('Unrecognized operator: ' + str);
};

/**
 * Gets a {@link SimpleDataTable}.COLUMN_TYPE_* constant based upon an HTMLInputElement value from generated control
 * elements.
 *
 * @private
 * @param {string} str Input value.
 * @returns {number} A {@link SimpleDataTable}.COLUMN_TYPE_* constant based upon the given value.
 * @throws {Error} If the given value does not correspond to a {@link SimpleDataTable}.COLUMN_TYPE_* constant.
 */
SimpleDataTableControl.getColumnType = function (str) {
	'use strict';
	
	switch (str) {
		case 'infer':
			return SimpleDataTable.COLUMN_TYPE_INFER;
		case 'text':
			return SimpleDataTable.COLUMN_TYPE_TEXT;
	}
	
	throw new Error('Unrecognized column type: ' + str);
};

/**
 * Gets the first HTMLInputElement whose checked attribute is true from the given inputs.
 *
 * @param {NodeList} inputs Collection of inputs to process.
 * @returns The first input whose checked attribute is true; null if no element is checked.
 */
SimpleDataTableControl.getChecked = function (inputs) {
	'use strict';
	
	var i, input;
	
	for (i = 0; i < inputs.length; ++i) {
		input = inputs[i];
		if (input.checked) {
			return input;
		}
	}
	
	return null;
};

/**
 * Sets the first HTMLInputElement's checked attribute in the given inputs whose name is the given name.
 *
 * @param {NodeList} inputs Collection of inputs to process.
 * @param {string} name Name of the input whose checked attribute is to be set.
 */
SimpleDataTableControl.setChecked = function (inputs, name) {
	'use strict';
	
	var i, input;
	
	for (i = 0; i < inputs.length; ++i) {
		input = inputs[i];
		input.checked = input.name === name;
	}
};

// Default Instance Properties
/**
 * Current {@link FilterDescriptor}.
 *
 * @private
 * @type {FilterDescriptor}
 */
SimpleDataTableControl.prototype.filterDescriptor = null;

/**
 * Current {@link SortDescriptor}.
 *
 * @private
 * @type {SortDescriptor}
 */
SimpleDataTableControl.prototype.sortDescriptor = null;

/**
 * Current sort order.
 *
 * @private
 * @type {number}
 */
SimpleDataTableControl.prototype.sortOrder = SimpleDataTable.SORT_ORDER_NONE;

// Instance Methods
/**
 * Disposes this SimpleDataTableControl. This SimpleDataTableControl will be removed as an event listener for generated content;
 * the backing {@link ContextControl} will also be {@link ContextControl#dispose disposed}.
 */
SimpleDataTableControl.prototype.dispose = function () {
	'use strict';
	
	var contextControl, controlElement, clickTargets, i;
	
	contextControl = this.contextControl;
	
	controlElement = contextControl.getControlElement();
	if (controlElement) {
		controlElement.querySelector('input[name="filter-by-value-value"]').removeEventListener('keyup', this, false);
		
		clickTargets = controlElement.querySelectorAll('input[name="column-type"], input[name="sort-direction"], input[name=filter-by-value-option], input[name="filter-option-ignore-case"], input[name="clear-filter-button"], input[name="select-all-cell-values"], input[data-column-index], .close-button');
		for (i = 0; i < clickTargets.length; ++i) {
			clickTargets[i].removeEventListener('click', this, false);
		}
	}
	
	contextControl.removeEventListener('create', this, false);
	contextControl.dispose();
};


/**
 * Implementation of DOM EventListener.
 *
 * @param {Event} event Event being dispatched.
 */
SimpleDataTableControl.prototype.handleEvent = function (event) {
	'use strict';
	
	var target, sortOrder, operation, operatorInput, columnValues, value, checked, index;
	
	target = event.currentTarget;
	
	switch (event.type) {
		case 'create':
			this.defineContent(target.getControlElement());
			this.setUpDescriptors();
			break;
		case 'click':
			if (IE9Compatibility.hasClass(target, 'close-button')) {
				this.contextControl.close();
			} else {
			
				switch (target.name) {
					case 'column-type':
						this.filterDescriptor.valueFilter.columnType = this.sortDescriptor.columnType = SimpleDataTableControl.getColumnType(target.value);
						
						this.parent.processTable();
						break;
						
					case 'sort-direction':
						this.sortOrder = sortOrder = SimpleDataTableControl.getSortOrder(target.value);
						this.sortDelegate.descending = sortOrder === SimpleDataTableControl.SORT_ORDER_DESCENDING;
						
						this.parent.processTable();
						break;
						
					case 'filter-by-value-option':
						operation = SimpleDataTableControl.getOperator(target.value);
						if (this.contextControl.getControlElement().querySelector('input[name="filter-option-ignore-case"]').checked) {
							operation |= SimpleDataTable.FILTER_OP_IGNORE_CASE;
						}
						this.filterDescriptor.valueFilter.operation = operation;
						
						this.parent.processTable();
						break;
						
					case 'filter-option-ignore-case':
						operatorInput = SimpleDataTableControl.getChecked(this.contextControl.getControlElement().querySelectorAll('input[name="filter-by-value-option"]'));
						operation = operatorInput ? SimpleDataTableControl.getOperator(operatorInput.value) : SimpleDataTable.FILTER_OP_EQUALS;
						if (target.checked) {
							operation |= SimpleDataTable.FILTER_OP_IGNORE_CASE;
						}
						this.filterDescriptor.valueFilter.operation = operation;
						
						this.parent.processTable();
						break;
					
					case 'clear-filter-button':
						this.reset();
						this.parent.processTable();
						break;
						
					case 'column-value':
						columnValues = this.filterDescriptor.columnValues;
						value = target.value;
						checked = target.checked;
						
						if (checked) {
							if (columnValues.indexOf(value) === -1) {
								columnValues.push(value);
							}
						} else {
							if ((index = columnValues.indexOf(value)) !== -1) {
								columnValues.splice(index, 1);
							}
						}
						
						this.parent.processTable();
						break;
						
					case 'select-all-cell-values':
						this.selectAllColumnValues(target.checked);
						this.parent.processTable();
						break;
				}
				
			}
			break;
		
		case 'keyup':
			this.filterDescriptor.valueFilter.compareValue = target.value;
			this.parent.processTable();
			break;
	}	
};

SimpleDataTableControl.prototype.open = function () {
	'use strict';
	
	this.contextControl.open(this.tableHeader);
};

SimpleDataTableControl.prototype.close = function () {
	'use strict';
	
	this.contextControl.close();
};


/**
 * Resets the state of this SimpleDataTableControl; all fields will be reset to their inital values. Note, this
 * only updates the state of the user interface; if the parent table needs to be updated {@link SimpleDataTable#processTable}
 * must be called subsequently.
 */
SimpleDataTableControl.prototype.reset = function () {
	'use strict';
	
	var control, columnValueInputs, i;
	
	control = this.contextControl.getControlElement();
	
	columnValueInputs = control.querySelectorAll('input[name="column-value"]');
	
	SimpleDataTableControl.setChecked(control.querySelectorAll('input[name="column-type"]'), 'infer');
	SimpleDataTableControl.setChecked(control.querySelectorAll('input[name="sort-direction"]'), 'none');
	SimpleDataTableControl.setChecked(control.querySelectorAll('input[name="filter-by-value-option"]'), 'contains');
	control.querySelector('input[name="filter-option-ignore-case"]').checked = true;
	
	for (i = 0; i < columnValueInputs.length; ++i) {
		columnValueInputs[i].checked = true;
	}
	
	this.setUpDescriptors();
};

/**
 * Selects or deselects (depending upon the value of checked) all individual cell values for filtering. Note, this
 * only updates the state of cell value checkboxes; if the parent table needs to be updated {@link SimpleDataTable#processTable}
 * must be called subsequently.
 *
 * @param {boolean} checked Whether to select or deselect all individual cell values.
 */
SimpleDataTableControl.prototype.selectAllColumnValues = function (checked) {
	'use strict';
	
	var columnValues, columnValueInputs, columnValueInput, i;
	
	columnValueInputs = this.contextControl.getControlElement().querySelectorAll('input[name="column-value"]');
	columnValues = [];
	

	for (i = 0; i < columnValueInputs.length; ++i) {
		columnValueInput = columnValueInputs[i];
		columnValueInput.checked = checked;
		if (checked) {
			columnValues.push(columnValueInput.value)
		}
	}
	
	this.filterDescriptor.columnValues = columnValues;
};


SimpleDataTableControl.prototype.getFilterDescriptor = function () {
	'use strict';
	
	return this.filterDescriptor;
};

SimpleDataTableControl.prototype.getSortDescriptor = function () {
	'use strict';
	
	var sortOrder = this.sortOrder;
	
	return sortOrder === SimpleDataTableControl.SORT_ORDER_NONE ? null : this.sortDescriptor;
};

/**
 * Synchronizes the state of {@link SimpleDataTableControl#filterDescriptor} and {@link SimpleDataTableControl#sortDescriptor}
 * with the UI. The fields are redefined; {@link SimpleDataTableListener#processTable} is not called.
 *
 * @private
 */
SimpleDataTableControl.prototype.setUpDescriptors = function () {
	'use strict';
	
	var columnIndex, control, compareValue, operatorInput, operation, columnTypeInput, columnType, columnValues,
		sortOrderInput, sortOrder;
	
	columnIndex = this.columnIndex;
	control = this.contextControl.getControlElement();

	
	compareValue = control.querySelector('input[name="filter-by-value-value"]').value;
	
	operatorInput = SimpleDataTableControl.getChecked(control.querySelectorAll('input[name="filter-by-value-option"]'));
	operation = operatorInput ? SimpleDataTableControl.getOperator(operatorInput.value) : SimpleDataTable.FILTER_OP_EQUALS;
	if (control.querySelector('input[name="filter-option-ignore-case"]').checked) {
		operation |= SimpleDataTable.FILTER_OP_IGNORE_CASE;
	}
	
	columnTypeInput = SimpleDataTableControl.getChecked(control.querySelectorAll('input[name="column-type"]'));
	columnType = columnTypeInput ? SimpleDataTableControl.getColumnType(columnTypeInput.value) : SimpleDataTable.COLUMN_TYPE_INFER;
	
	columnValues = this.getColumnValues();
	
	sortOrderInput = SimpleDataTableControl.getChecked(control.querySelectorAll('input[name="sort-direction"]'));
	sortOrder = sortOrderInput ? SimpleDataTableControl.getSortOrder(sortOrderInput.value) : SimpleDataTableControl.SORT_ORDER_NONE;
	
	this.sortOrder = sortOrder;
	this.sortDescriptor = new SimpleDataTable.ValueSort(this.columnIndex, sortOrder === SimpleDataTableControl.SORT_ORDER_DESCENDING, columnType);
	this.filterDescriptor = new SimpleDataTableControl.ColumnValueFilter(columnIndex, compareValue, operation, columnType, columnValues);
	
};

/**
STALE
 * Returns an `Array` containing all values for each cell of the given `columnIndex`. An optional callback can be provided to customize how cell values
 * are intrepreted. If defined, it will be used, otherwise the default behavior is to simply return the distinct set of trimmed `textContent`
 * for each cell in the column. The result is sorted prior to being returned unless `noSort` is `true`.
 *
 * @param {number} columnIndex Column index whose values are to be retrieved.
 * @param {(SimpleDataTable~populateCellValues|CellInterpreter)} [callback] 
 *		Optional {@link CellInterpreter} or callback function to customize how cell values are intrepreted.
 * @param {boolean} [noSort=false] Whether to prevent the sorting of the result prior to being returned.
 * @returns {Array} An `Array` containing all values for each cell of the given `columnIndex`.
 * @throws {RangeError} If `columnIndex` is greater than the number of columns in the table.
 * @throws {TypeError} If `callback` is defined, but does not implement {@link CellInterpreter} or is not a function itself.
 */
SimpleDataTableControl.prototype.getColumnValues = function () {
	'use strict';
	
	var rows, i, cell, value, listItems, j, result, columnIndex, callback;
	
	if (callback && (typeof callback !== 'function' || typeof callback.populateCellValues !== 'function')) {
		throw new TypeError('Callback must either define a populateCellValues function, or be a function itself.');
	}
	
	columnIndex = this.columnIndex;
	callback = this.cellInterpreter;
	
	result = [];
	rows = this.table.tBodies[0].rows;
	
	for (i = 0; i < rows.length; ++i) {
		cell = SimpleDataTable.getColumn(rows[i], columnIndex);
		if (callback) {
			if (callback.populateCellValues) {
				callback.populateCellValues(cell, result);
			} else {
				callback(cell, result);
			}
		} else {
			value = cell.textContent.trim();
			if (result.indexOf(value) === -1) {
				result.push(value);
			}
		}
	}
	
	result.sort();
	
	return result;
};


/**
 * Defines the UI content on the given container, and registers this SimpleDataTableControl for the appropriate events.
 * Only intended to be called once (in response to {@link ContextControl#event:create} events).
 *
 * @private
 * @param {HTMLElement} Element upon which the content of this control is to be defined.
 */
SimpleDataTableControl.prototype.defineContent = function (container) {
	'use strict';
	
	var idBase, inferColumnTypeId, textOnlyColumnTypeId, i18nStrings, sortOptionAscendingId,
		sortOptionDescendingId, filterOptionEq, filterOptionNeq, filterOptionLt, filterOptionGt,
		filterOptionLte, filterOptionGte, filterOptionContains, filterOptionIgnoreCase, sortOptionNoneId,
		filterByValueInputId, builder, selectAllCells, clickTargets, i, columnValues, columnValue, id, 
		columnIndex;
	
	i18nStrings = SimpleDataTableControl.i18nStrings;
	
	// Generate IDs.
	idBase = SimpleDataTableControl.getIdBase();
	
	inferColumnTypeId = idBase + 'inferColumnType';
	textOnlyColumnTypeId = idBase + 'textOnly';
	sortOptionAscendingId = idBase + 'sortDirectionAscending';
	sortOptionDescendingId = idBase + 'sortDirectionDescending';
	filterOptionEq = idBase + 'filterOptionEq';
	filterOptionNeq = idBase + 'filterOptionNeq';
	filterOptionLt = idBase + 'filterOptionLt';
	filterOptionGt = idBase + 'filterOptionGt';
	filterOptionLte = idBase + 'filterOptionLte';
	filterOptionGte = idBase + 'filterOptionGte';
	filterOptionContains = idBase + 'filterOptionContains';
	filterOptionIgnoreCase = idBase + 'filterOptionIgnoreCase';
	sortOptionNoneId = idBase + 'sortOptionNone';
	filterByValueInputId = idBase + 'filterByValue';
	selectAllCells = idBase + 'selectAllCells';
	
	columnIndex = this.columnIndex;
	columnValues = this.getColumnValues();
	
	IE9Compatibility.addClass(container, SimpleDataTableControl.controlClassName)
	
	// Compose content.
	builder = new XMLBuilder();
	
	builder.startTag('div').attribute('class', 'section title-bar')
		.startTag('span').attribute('class', 'column-title').closeTag(true)
		.startTag('span').attribute('class', 'control-buttons')
			.startTag('span').attribute('class', 'control-button close-button').attribute('title', i18nStrings.toolTipCloseDialogue).content('\u00D7').closeTag()
		.closeTag()
	.closeTag()
	.startTag('div').attribute('class', 'section')
		.startTag('div').attribute('class', 'sub-section')
			.startTag('div').attribute('class', 'section-container column-options')
				.startTag('h5').attribute('class', 'section-title').content(i18nStrings.columnOptionsLabel).closeTag()
				.startTag('div').attribute('class', 'column-type section-content')
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', 'column-type').attribute('value', 'infer').attribute('checked').attribute('id', inferColumnTypeId).closeTag()
						.startTag('label').attribute('for', inferColumnTypeId).content(i18nStrings.inferDataType).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', 'column-type').attribute('value', 'text').attribute('id', textOnlyColumnTypeId).closeTag()
						.startTag('label').attribute('for', textOnlyColumnTypeId).content(i18nStrings.textOnlyDataType).closeTag()
					.closeTag()
				.closeTag()
			.closeTag()
		.closeTag()
		.startTag('div').attribute('class', 'sub-section')
			.startTag('div').attribute('class', 'section-container sort-options')
				.startTag('h5').attribute('class', 'section-title').content(i18nStrings.sortOptionsLabel).closeTag()
				.startTag('div').attribute('class', 'sort-options section-content')
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', 'sort-direction').attribute('value', 'none').attribute('checked').attribute('id', sortOptionNoneId).closeTag()
						.startTag('label').attribute('for', sortOptionNoneId).content(i18nStrings.noSortOrder).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', 'sort-direction').attribute('value', 'ascending').attribute('id', sortOptionAscendingId).closeTag()
						.startTag('label').attribute('for', sortOptionAscendingId).content(i18nStrings.ascendingSortOrder).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', 'sort-direction').attribute('value', 'descending').attribute('id', sortOptionDescendingId).closeTag()
						.startTag('label').attribute('for', sortOptionDescendingId).content(i18nStrings.descendingSortOrder).closeTag()
					.closeTag()
				.closeTag()
			.closeTag()
		.closeTag()
	.closeTag()
	.startTag('div').attribute('class', 'section')
		.startTag('h5').attribute('class', 'section-title').content(i18nStrings.filterTypeEnteredValue).closeTag()
		.startTag('div').attribute('class', 'sub-section')
			.startTag('div').attribute('class', 'filter-by-value-operators section-content')
				.startTag('div').attribute('class', 'field-group')
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', 'filter-by-value-option').attribute('value', 'eq').attribute('id', filterOptionEq).attribute('title', i18nStrings.filterOptionEqualsToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionEq).attribute('title', i18nStrings.filterOptionEqualsToolTip).content(i18nStrings.filterOptionEquals).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', 'filter-by-value-option').attribute('value', 'neq').attribute('id', filterOptionNeq).attribute('title', i18nStrings.filterOptionNotEqualsToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionNeq).attribute('title', i18nStrings.filterOptionNotEqualsToolTip).content(i18nStrings.filterOptionNotEquals).closeTag()
					.closeTag()
				.closeTag()
				.startTag('div').attribute('class', 'field-group')
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', 'filter-by-value-option').attribute('value', 'lt').attribute('id', filterOptionLt).attribute('title', i18nStrings.filterOptionLessThanToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionLt).attribute('title', i18nStrings.filterOptionLessThanToolTip).content(i18nStrings.filterOptionLessThan).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', 'filter-by-value-option').attribute('value', 'gt').attribute('id', filterOptionGt).attribute('title', i18nStrings.filterOptionGreaterThanToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionGt).attribute('title', i18nStrings.filterOptionGreaterThanToolTip).content(i18nStrings.filterOptionGreaterThan).closeTag()
					.closeTag()
				.closeTag()
				.startTag('div').attribute('class', 'field-group')
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', 'filter-by-value-option').attribute('value', 'lte').attribute('id', filterOptionLte).attribute('title', i18nStrings.filterOptionLessThanOrEqualToToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionLte).attribute('title', i18nStrings.filterOptionLessThanOrEqualToToolTip).content(i18nStrings.filterOptionLessThanOrEqualTo).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', 'filter-by-value-option').attribute('value', 'gte').attribute('id', filterOptionGte).attribute('title', i18nStrings.filterOptionGreaterThanOrEqualToToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionGte).attribute('title', i18nStrings.filterOptionGreaterThanOrEqualToToolTip).content(i18nStrings.filterOptionGreaterThanOrEqualTo).closeTag()
					.closeTag()
				.closeTag()
				.startTag('div').attribute('class', 'field')
					.startTag('input').attribute('type', 'radio').attribute('name', 'filter-by-value-option').attribute('value', 'contains').attribute('id', filterOptionContains).attribute('checked').closeTag()
					.startTag('label').attribute('for', filterOptionContains).content(i18nStrings.filterOptionContains).closeTag()
				.closeTag()
				.startTag('div').attribute('class', 'field')
					.startTag('input').attribute('type', 'checkbox').attribute('name', 'filter-option-ignore-case').attribute('id', filterOptionIgnoreCase).attribute('checked').closeTag()
					.startTag('label').attribute('for', filterOptionIgnoreCase).content(i18nStrings.filterOptionIgnoreTextCase).closeTag()
				.closeTag()
			.closeTag()
		.closeTag()
		.startTag('div').attribute('class', 'sub-section')
			.startTag('div').attribute('class', 'filter-by-value-description section-content')
				.startTag('div').attribute('class', 'field clear-filter-field')
					.startTag('input').attribute('type', 'button').attribute('name', 'clear-filter-button').attribute('value', i18nStrings.clearSearchFilters).closeTag()
				.closeTag()
				.startTag('label').attribute('for', filterByValueInputId).content(i18nStrings.filterDescriptionContains).closeTag()
			.closeTag()
		.closeTag()
	.closeTag()
	.startTag('div').attribute('class', 'section filter-by-value-container')
		.startTag('input').attribute('name', 'filter-by-value-value').attribute('id', filterByValueInputId).closeTag()
	.closeTag()
	.startTag('div').attribute('class', 'section filter-by-cell-values-container')
		.startTag('h5').attribute('class', 'section-title').content(i18nStrings.filterTypeCellValue).closeTag()
		.startTag('div').attribute('class', 'field')
			.startTag('input').attribute('type', 'checkbox').attribute('name', 'select-all-cell-values').attribute('id', selectAllCells).attribute('checked').closeTag()
			.startTag('label').attribute('for', selectAllCells).content(i18nStrings.selectAll).closeTag()
		.closeTag()
		.startTag('ul').attribute('class', 'filter-by-cell-values');
		
		for (i = 0; i < columnValues.length; ++i) {
			columnValue = columnValues[i];
			id = idBase + 'columnValue_' + i;
			
			builder.startTag('li').attribute('class', 'field').attribute('data-column-index', columnIndex)
				.startTag('input').attribute('type', 'checkbox').attribute('checked').attribute('value', columnValue).attribute('id', id).attribute('name', 'column-value').attribute('data-column-index', columnIndex).closeTag()
				.startTag('label').attribute('for', id).content(columnValue).closeTag()
			.closeTag();
		}
		
		builder.closeTag(true)
	.closeTag();
	
	// Define content.
	IE9Compatibility.addClass(container, SimpleDataTableListener.columnOptionsControlClassName);
	container.insertAdjacentHTML('afterbegin', builder.toString());
	
	
	// Register events.
	container.querySelector('input[name="filter-by-value-value"]').addEventListener('keyup', this, false);
	
	clickTargets = container.querySelectorAll('input[name="column-type"], input[name="sort-direction"], input[name=filter-by-value-option], input[name="filter-option-ignore-case"], input[name="clear-filter-button"], input[name="select-all-cell-values"], input[data-column-index], .close-button');
	for (i = 0; i < clickTargets.length; ++i) {
		clickTargets[i].addEventListener('click', this, false);
	}
	
};




/**
 *
 * @constructor
 * @implements FilterDescriptor
 * @param {number} columnIndex Index of the column this {@link FilterDescriptor} describes.
 * @param {*} compareValue See {@link SimpleDataTable.ValueFilter}.
 * @param {(number|string)} operation See {@link SimpleDataTable.ValueFilter}.
 * @param {number} columnType See {@link SimpleDataTable.ValueFilter}.
 * @param {Array} columnValues A list of values against whom individual cell values are to be compared.
 * @classdesc
 *		<p>A {@link FilterDescriptor} that delegates to a {@link SimpleDataTable.ValueFilter}, but also offers the capability of filtering
 *		based upon whether a cell's value is within a given list of values.</p>
 *
 *		<p>When filtering, the {@link SimpleDataTable.ValueFilter}'s {@link FilterDescriptor#include include} function is called first. If
 *		it returns false, the row in question will be filterd. If it returns true, the row will only be filtered if the cell's value does
 *		not appear in the given columnValues.</p>
 */
SimpleDataTableControl.ColumnValueFilter = function (columnIndex, compareValue, operation, columnType, columnValues) {
	'use strict';
	
	this.columnIndex = columnIndex;
	
	/**
	 * {@link SimpleDataTable.ValueFilter} delegate.
	 *
	 * @type {SimpleDataTable.ValueFilter}
	 */
	this.valueFilter = new SimpleDataTable.ValueFilter(columnIndex, compareValue, operation, columnType);
		
	/**
	 * List of values against whom individual cell values are to be compared. If a cell's value appears in this list,
	 * it will not be filtered, otherwise it will be.
	 * 
	 * @type Array
	 */
	this.columnValues = columnValues;
};


SimpleDataTableControl.ColumnValueFilter.prototype.include = function (cell) {
	'use strict';
	
	if (!this.valueFilter.include(cell)) {
		return false;
	}
	
	return this.columnValues.indexOf(cell.textContent.trim()) !== -1;
};


