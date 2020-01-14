
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
 * @param {number} columnIndex Index of the column this `SimpleDataTableControl` controls.
 * @param {SimpleDataTableListener} parent Parent {@link SimpleDataTableListener}.
 * @classdesc
 *
 * The default {@link ColumnControl} used by {@link SimpleDataTableListener}. Defines a UI where an end-user
 * can select a column's type and sort order, and define filters based upon a custom, user-entered value as well as selection from a list of
 * individual cell values (similar to the column filtering dialogue in MS Excel). Uses a backing {@link ContextControl}.
 */
function SimpleDataTableControl(columnIndex, parent, cellInterpreter) {
	'use strict';
	
	this.columnIndex = columnIndex;
	
	/**
	 * Backing {@link ContextControl}.
	 *
	 * @private
	 * @type {ContextControl}
	 */
	this.contextControl = new ContextControl();
	
	/**
	 * Parent {@link SimpleDataTableListener}.
	 *
	 * @private
	 * @type {SimpleDataTableListener}
	 */
	this.parent = parent;
	
	if (cellInterpreter) {
		this.cellInterpreter = cellInterpreter;
	}
	
}


// Static Fields
/**
 * Class name added to {@link ContextControl} {@link ContextControl#getControlElement element}s when they are
 * being {@link ContextControl#event:create created} by instances of this class.
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
 * A 'mapping' object whose property values correspond to labels printed on the dialogue presented to the end-user.
 * 
 * By default, values are in en-US (United States English), however clients that require internationalization can redefine the properties
 * of this object on page initialization (or, at minimum before any `SimpleDataTableControl`s are created) for the desired locale. 
 * (Alternatively, a completely new object can be assigned, so long as it contains all the property names of the original).
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
 * Utility function for generating a unique id prefix to use in generated dialogue content.
 *
 * @private
 */
SimpleDataTableControl.getIdBase = function () {
	'use strict';
	
	return 'dataTable_' + SimpleDataTableControl.idCounter++ + '_';
};


/**
 * Sets the first `HTMLInputElement`'s `checked` attribute in the given set of `inputs` whose `name` is the given `name`.
 *
 * @param {MinimalList} inputs Collection of inputs to process.
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

/**
 * Utility function to check whether the given callback is a function itself (a {@link SimpleDataTableControl~populateCellValues}), or a
 * {@link CellInterpreter}. Throws a `TypeError` if neither.
 *
 * @private
 * @throws TypeError If `callback` is neither a {@link SimpleDataTableControl~populateCellValues} nor a {@link CellInterpreter}.
 */
SimpleDataTableControl.checkCellInterpreter = function (callback) {
	'use strict';
	
	if (callback && (typeof callback !== 'function' || typeof callback.populateCellValues !== 'function')) {
		throw new TypeError('Callback must either define a populateCellValues function, or be a function itself.');
	}
};




// Instance Methods
SimpleDataTableControl.prototype.init = function () {
	'use strict';
	
	this.contextControl.addEventListener('create', this, false);
};


SimpleDataTableControl.prototype.dispose = function () {
	'use strict';
	
	var contextControl, controlElement, clickTargets, i;
	
	contextControl = this.contextControl;
	
	controlElement = contextControl.getControlElement();
	if (controlElement) {
		controlElement.querySelector('input[name="filter-by-value-value"]').removeEventListener('keyup', this, false);
		
		clickTargets = controlElement.querySelectorAll('input.column-type, input.sort-direction, input.filter-by-value-operator, input[name="filter-option-ignore-case"], input[name="clear-filter-button"], input[name="select-all-cell-values"], input[name="column-value"], .close-button');
		for (i = 0; i < clickTargets.length; ++i) {
			clickTargets[i].removeEventListener('click', this, false);
		}
	}
	
	contextControl.removeEventListener('create', this, false);
	contextControl.dispose();
};


/**
 * Implementation of DOM `EventListener`.
 *
 * @param {Event} event Event being dispatched.
 */
SimpleDataTableControl.prototype.handleEvent = function (event) {
	'use strict';
	
	var target, sortOrder, operation, columnValues, value, checked, index;
	
	target = event.currentTarget;
	
	switch (event.type) {
		case 'create':
			this.defineContent(target.getControlElement());
			break;
		case 'click':
			if (IE9Compatibility.hasClass(target, 'close-button')) {
				this.contextControl.close();
			} else if (IE9Compatibility.hasClass(target, 'filter-by-value-operator')) {
				this.contextControl.getControlElement().getElementsByClassName('filter-by-value-description')[0].textContent = this.getOperatorDescription();
				this.updateParent();
			} else if (
				IE9Compatibility.hasClass(target, 'column-type')
				|| IE9Compatibility.hasClass(target, 'sort-direction')
				|| IE9Compatibility.hasClass(target, 'filter-option-ignore-case')
				|| IE9Compatibility.hasClass(target, 'column-value')
			) {
				this.updateParent();
			} else {
				switch (target.name) {
					case 'clear-filter-button':
						this.reset();
						this.updateParent();
						break;

					case 'select-all-cell-values':
						this.selectAllColumnValues(target.checked);
						this.updateParent();
						break;
				}
				
			}
			break;
		
		case 'keyup':
			this.updateParent();
			break;
	}	
};

SimpleDataTableControl.prototype.open = function () {
	'use strict';
	
	this.contextControl.open(this.parent.getTableHeaderElement(this.columnIndex));
};

SimpleDataTableControl.prototype.close = function () {
	'use strict';
	
	this.contextControl.close();
};


/**
 * Resets the state of this `SimpleDataTableControl`; all fields will be reset to their inital values. Note, this
 * only updates the state of the user interface; if the parent table needs to be updated, {@link SimpleDataTableControl#updateParent}
 * must be called subsequently.
 */
SimpleDataTableControl.prototype.reset = function () {
	'use strict';
	
	var control, columnValueInputs, i;
	
	control = this.contextControl.getControlElement();
	
	columnValueInputs = control.querySelectorAll('input[name="column-value"]');
	
	SimpleDataTableControl.setChecked(control.querySelectorAll('input.column-type'), 'infer');
	SimpleDataTableControl.setChecked(control.querySelectorAll('input.sort-direction'), 'none');
	SimpleDataTableControl.setChecked(control.querySelectorAll('input.filter-by-value-operator'), 'contains');
	control.querySelector('input[name="filter-option-ignore-case"]').checked = true;
	
	for (i = 0; i < columnValueInputs.length; ++i) {
		columnValueInputs[i].checked = true;
	}
	
	this.setUpDescriptors();
};

/**
 * {@link SimpleDataTableListener#processTable Updates} the parent table.
 */
SimpleDataTableControl.prototype.updateParent = function () {
	'use strict';
	
	this.parent.processTable();
};

/**
 * Selects or deselects all individual cell values for filtering. Note, this
 * only updates the state of the cell value checkboxes; if the parent table needs to be updated {@link SimpleDataTableControl#updateParent}
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
	
	var controlElement, operator, compareValue, columnType, columnValueInputs, selectedValues, i, columnValueInput;

	if (!this.contextControl.getControlElement()) {
		return null;
	}
	
	return new SimpleDataTableControl.ColumnValueFilter(this.columnIndex, this.getOperator(), this.getCompareValue(), this.getColumnType(), this.getSelectedCellValues(), this.cellInterpreter);
};

SimpleDataTableControl.prototype.getSortDescriptor = function () {
	'use strict';
	
	var controlElement, sortOrder, columnType;
	
	if (!this.contextControl.getControlElement()) {
		return null;
	}
	
	sortOrder = this.getSortOrder();
	if (sortOrder === SimpleDataTableControl.SORT_ORDER_NONE) {
		return null;
	}
	
	columnType = this.getColumnType();
	
	return new SimpleSortDescriptor(this.columnIndex, sortOrder === SimpleDataTableControl.SORT_ORDER_DESCENDING, columnType);
};


/**
 * Returns and `Array` containting all the individual cell values of the column with which this `SimpleDataTableControl` is associated.
 * If this `SimpleDataTableControl` has a {@link CellInterpreter} or {@link SimpleDataTableControl~populateCellValues} callback
 * configured, it will be used to obtain the values of individual cells, otherwise, returns the unique set of each cell's trimmed
 * `textContent`.
 *
 * By default, the result is sorted prior to being returned, unless the `noSort` parameter is not {@link Nothing}.
 *
 * @param {boolean} [noSort=false] Whether to return the result unsorted.
 */
SimpleDataTableControl.prototype.getColumnValues = function (noSort) {
	'use strict';
	
	var rows, i, cell, value, result, columnIndex, callback;
	
	callback = this.cellInterpreter;
	SimpleDataTableControl.checkCellInterpreter(callback);
	
	columnIndex = this.columnIndex;
	
	result = [];
	rows = this.parent.getDataTable().getRows();
	
	for (i = 0; i < rows.length; ++i) {
		cell = rows[i].cells[columnIndex];
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
	
	if (!noSort) {
		result.sort();
	}
	
	return result;
};



/**
 * Returns a combination of the {@link SimpleDataTableUtils}`.FILTER_OP_`* and `FILTER_FLAG_`* bitfields corresponding to
 * the current selected operator, or `null` if no operator is selected, or this control has yet not been opened.
 *
 * @returns {number}
 *   A combination of the {@link SimpleDataTableUtils} bitfields corresponding to the current selected operator, or `null`
 *   if no operator is selected, or this control has not yet been opened.
 */
SimpleDataTableControl.prototype.getOperator = function () {
	'use strict';
	
	var result;
	
	switch (this.getCheckedValue('input.filter-by-value-operator')) {
		case 'eq':
			result = SimpleDataTableUtils.FILTER_OP_EQUALS;
			break;
		case 'neq':
			result = SimpleDataTableUtils.FILTER_OP_NOT_EQUALS;
			break;
		case 'lt':
			result = SimpleDataTableUtils.FILTER_OP_LESS_THAN;
			break;
		case 'gt':
			result = SimpleDataTableUtils.FILTER_OP_GREATER_THAN;
			break;
		case 'lte':
			result = SimpleDataTableUtils.FILTER_OP_LESS_THAN | SimpleDataTableUtils.FILTER_OP_EQUALS;
			break;
		case 'gte':
			result = SimpleDataTableUtils.FILTER_OP_GREATER_THAN | SimpleDataTableUtils.FILTER_OP_EQUALS;
			break;
		case 'contains':
			result = SimpleDataTableUtils.FILTER_OP_CONTAINS;
			break;
		default:
			return null;
	}
	
	if (this.contextControl.getControlElement().querySelector('input.filter-option-ignore-case').checked) {
		result |= SimpleDataTableUtils.FILTER_OP_IGNORE_CASE; 
	}
	
	return result;
};

/**
 * Returns a description based upon the current selected operator, or `null` if no operator is selected, or this control has not
 * yet been opened.
 *
 * @returns {string} 
 *   A description based upon the current selected operator, or `null` if no operator is selected, or this control has not yet
 *   been opened.
 */
SimpleDataTableControl.prototype.getOperatorDescription = function () {
	'use strict';
	
	var i18nStrings = SimpleDataTableControl.i18nStrings;
	
	switch (this.getCheckedValue('input.filter-by-value-operator')) {
		case 'eq':
			return i18nStrings.filterDescriptionEquals;
		case 'neq':
			return i18nStrings.filterDescriptionNotEquals;
		case 'lt':
			return i18nStrings.filterDescriptionLessThan;
		case 'gt':
			return i18nStrings.filterDescriptionGreaterThan;
		case 'lte':
			return i18nStrings.filterDescriptionLessThanOrEqualTo;
		case 'gte':
			return i18nStrings.filterDescriptionGreaterThanOrEqualTo;
		case 'contains':
			return i18nStrings.filterDescriptionContains;
		default:
			return null;
	}
};

/**
 * Returns the {@link SimpleDataTableUtils}`.COLUMN_TYPE_`* constant corresponding to the current selected column type, or
 * `null` if no column type is selected, or this control has not yet been opened.
 *
 * @returns {number}
 *   The {@link SimpleDataTableUtils}`.COLUMN_TYPE_`* constant corresponding to the current selected column type, or
 *   `null` if no column type is selected, or this control has not yet been opened.
 */
SimpleDataTableControl.prototype.getColumnType = function () {
	'use strict';
	
	switch (this.getCheckedValue('input.column-type')) {
		case 'infer':
			return SimpleDataTableUtils.COLUMN_TYPE_INFER;
		case 'text':
			return SimpleDataTableUtils.COLUMN_TYPE_TEXT;
		default:
			return null;
	}
};


/**
 * Returns the `SORT_ORDER_`* constant defined on this class corresponding to the current selected sort order, or `null` if
 * no sort order is selected, or this control has not yet been opened.
 *
 * @returns {number}
 *   The `SORT_ORDER_`* constant defined on this class corresponding to the current selected sort order, or `null` if
 *   no sort order is selected, or this control has not yet been opened.
 */
SimpleDataTableControl.prototype.getSortOrder = function () {
	'use strict';
	
	switch (this.getCheckedValue('input.sort-direction')) {
		case 'none':
			return SimpleDataTableControl.SORT_ORDER_NONE;
		case 'ascending':
			return SimpleDataTableControl.SORT_ORDER_ASCENDING;
		case 'descending':
			return SimpleDataTableControl.SORT_ORDER_DESCENDING;
		default:
			return null;
	}
};


/**
 * Returns an `Array` containing current selected individual cell values for this column (i.e. the selected values in the MS Excel-like filtering feature
 * offered by this control), or `null` if this control has not yet been opened.
 *
 * @returns {Array} The current selected individual cell values for this column, or `null` if this control has not yet been opened.
 */
SimpleDataTableControl.prototype.getSelectedCellValues = function () {
	'use strict';
	
	var controlElement, columnValueInputs, selectedValues, i, columnValueInput;
	
	controlElement = this.contextControl.getControlElement();
	if (!controlElement) {
		return null;
	}
	
	columnValueInputs = controlElement.querySelectorAll('input[name="column-value"]');
	selectedValues = [];
	for (i = 0; i < columnValueInputs.length; ++i) {
		columnValueInput = columnValueInputs[i];
		if (columnValueInput.checked) {
			selectedValues.push(columnValueInput.value);
		}
	}
	
	return selectedValues;
};

/**
 * Returns the current `value` of the free-text filter input, or `null` if this control has not yet been opened.
 *
 * @returns {string} The current `value` of the free-text filter input, or `null` if this control has not yet been opened.
 */
SimpleDataTableControl.prototype.getCompareValue = function () {
	'use strict';
	
	var controlElement;
	
	controlElement = this.contextControl.getControlElement();
	if (!controlElement) {
		return null;
	}
	
	return controlElement.querySelector('input[name="filter-by-value-value"]').value;
};


/**
 * Utility function to obtain the `value` of the first `checked` input element within this control's backing `HTMLElement` matching the given query
 * `selector`. The `querySelectorAll` function is ran on the backing element, and the result is iterated until the first element with a `checked`
 * attribute of `true` is encountered, in which case that element's `value` attribute is returned. If no `checked` element is found with the given
 * `selector`, or this control has not yet been opened, `null` is returned.
 *
 * @private
 * @return {string} 
 *   The `value` of the first `checked` element within this control matching the given `selector`, or `null` if no checked element is found, or this
 *   control has not yet been opened.
 */
SimpleDataTableControl.prototype.getCheckedValue = function (selector) {
	'use strict';
	
	var controlElement, inputs, input, i;
	
	controlElement = this.contextControl.getControlElement();
	if (!controlElement) {
		return null;
	}
	
	inputs = controlElement.querySelectorAll(selector);
	for (i = 0; i < inputs.length; ++i) {
		input = inputs[i];
		if (input.checked) {
			return input.value;
		}
	}
	
	return null;
};




/**
 * Defines the UI content on the given `container`, and registers this `SimpleDataTableControl` for the appropriate events on
 * generated elements. Only intended to be called once (in response to {@link ContextControl#event:create} events).
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
		columnIndex, columnTypeName, sortOrderName, operatorName;
	
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
	
	columnTypeName = idBase + 'columnType';
	sortOrderName = idBase + 'sortOrder';
	operatorName = idBase + 'operator';
	
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
				.startTag('div').attribute('class', 'section-content')
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', columnTypeName).attribute('class', 'column-type').attribute('value', 'infer').attribute('checked').attribute('id', inferColumnTypeId).closeTag()
						.startTag('label').attribute('for', inferColumnTypeId).content(i18nStrings.inferDataType).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', columnTypeName).attribute('class', 'column-type').attribute('value', 'text').attribute('id', textOnlyColumnTypeId).closeTag()
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
						.startTag('input').attribute('type', 'radio').attribute('name', sortOrderName).attribute('class', 'sort-direction').attribute('value', 'none').attribute('checked').attribute('id', sortOptionNoneId).closeTag()
						.startTag('label').attribute('for', sortOptionNoneId).content(i18nStrings.noSortOrder).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', sortOrderName).attribute('class', 'sort-direction').attribute('value', 'ascending').attribute('id', sortOptionAscendingId).closeTag()
						.startTag('label').attribute('for', sortOptionAscendingId).content(i18nStrings.ascendingSortOrder).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', sortOrderName).attribute('class', 'sort-direction').attribute('value', 'descending').attribute('id', sortOptionDescendingId).closeTag()
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
						.startTag('input').attribute('type', 'radio').attribute('name', operatorName).attribute('class', 'filter-by-value-operator').attribute('value', 'eq').attribute('id', filterOptionEq).attribute('title', i18nStrings.filterOptionEqualsToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionEq).attribute('title', i18nStrings.filterOptionEqualsToolTip).content(i18nStrings.filterOptionEquals).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', operatorName).attribute('class', 'filter-by-value-operator').attribute('value', 'neq').attribute('id', filterOptionNeq).attribute('title', i18nStrings.filterOptionNotEqualsToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionNeq).attribute('title', i18nStrings.filterOptionNotEqualsToolTip).content(i18nStrings.filterOptionNotEquals).closeTag()
					.closeTag()
				.closeTag()
				.startTag('div').attribute('class', 'field-group')
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', operatorName).attribute('class', 'filter-by-value-operator').attribute('value', 'lt').attribute('id', filterOptionLt).attribute('title', i18nStrings.filterOptionLessThanToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionLt).attribute('title', i18nStrings.filterOptionLessThanToolTip).content(i18nStrings.filterOptionLessThan).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', operatorName).attribute('class', 'filter-by-value-operator').attribute('value', 'gt').attribute('id', filterOptionGt).attribute('title', i18nStrings.filterOptionGreaterThanToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionGt).attribute('title', i18nStrings.filterOptionGreaterThanToolTip).content(i18nStrings.filterOptionGreaterThan).closeTag()
					.closeTag()
				.closeTag()
				.startTag('div').attribute('class', 'field-group')
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', operatorName).attribute('class', 'filter-by-value-operator').attribute('value', 'lte').attribute('id', filterOptionLte).attribute('title', i18nStrings.filterOptionLessThanOrEqualToToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionLte).attribute('title', i18nStrings.filterOptionLessThanOrEqualToToolTip).content(i18nStrings.filterOptionLessThanOrEqualTo).closeTag()
					.closeTag()
					.startTag('div').attribute('class', 'field')
						.startTag('input').attribute('type', 'radio').attribute('name', operatorName).attribute('class', 'filter-by-value-operator').attribute('value', 'gte').attribute('id', filterOptionGte).attribute('title', i18nStrings.filterOptionGreaterThanOrEqualToToolTip).closeTag()
						.startTag('label').attribute('for', filterOptionGte).attribute('title', i18nStrings.filterOptionGreaterThanOrEqualToToolTip).content(i18nStrings.filterOptionGreaterThanOrEqualTo).closeTag()
					.closeTag()
				.closeTag()
				.startTag('div').attribute('class', 'field')
					.startTag('input').attribute('type', 'radio').attribute('name', operatorName).attribute('class', 'filter-by-value-operator').attribute('value', 'contains').attribute('id', filterOptionContains).attribute('checked').closeTag()
					.startTag('label').attribute('for', filterOptionContains).content(i18nStrings.filterOptionContains).closeTag()
				.closeTag()
				.startTag('div').attribute('class', 'field')
					.startTag('input').attribute('type', 'checkbox').attribute('class', 'filter-option-ignore-case').attribute('id', filterOptionIgnoreCase).attribute('checked').closeTag()
					.startTag('label').attribute('for', filterOptionIgnoreCase).content(i18nStrings.filterOptionIgnoreTextCase).closeTag()
				.closeTag()
			.closeTag()
		.closeTag()
		.startTag('div').attribute('class', 'sub-section')
			.startTag('div').attribute('class', 'section-content')
				.startTag('div').attribute('class', 'field clear-filter-field')
					.startTag('input').attribute('type', 'button').attribute('name', 'clear-filter-button').attribute('value', i18nStrings.clearSearchFilters).closeTag()
				.closeTag()
				.startTag('label').attribute('class', 'filter-by-value-description').attribute('for', filterByValueInputId).content(i18nStrings.filterDescriptionContains).closeTag()
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
			
			builder.startTag('li').attribute('class', 'field')
				.startTag('input').attribute('type', 'checkbox').attribute('checked').attribute('value', columnValue).attribute('id', id).attribute('name', 'column-value').closeTag()
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
	
	clickTargets = container.querySelectorAll('input.column-type, input.sort-direction, input.filter-by-value-operator, input[name="filter-option-ignore-case"], input[name="clear-filter-button"], input[name="select-all-cell-values"], input[name="column-value"], .close-button');
	for (i = 0; i < clickTargets.length; ++i) {
		clickTargets[i].addEventListener('click', this, false);
	}
	
};




/**
 *
 * @constructor
 * @implements FilterDescriptor
 * @param {number} columnIndex Column index of the parent {@link SimpleDataTableControl}.
 * @param {number} operator {@link SimpleDataTableUtils}`.FILTER_OP_`* and `FILTER_FLAG_*` combination representing the current selected operator.
 * @param {string} compareValue User-entered filter value.
 * @param {number} columnType {@link SimpleDataTableUtils}`.COLUMN_TYPE_`* constant representing the current selected column type.
 * @param {Array} selectedValues A list of values currently selected in the Excel-like filter portion of the parent control.
 * @param {(CellInterpreter|SimpleDataTableControl~populateCellValues)} [cellInterpreter=null] {@link CellInterpreter} or callback of the parent {@link SimpleDataTableControl}.
 * @private
 * @classdesc
 *
 * The {@link FilterDescriptor} implementation returned by {@link SimpleDataTableControl#getFilterDescriptor}. Determines whether individual cell values should be filtered
 * based upon the given `operator`, `compareValue`, `selectedValues` and `columnType`. Individual cell values are determined with the given `cellInterpreter` if present. If no value
 * is given for `cellInterpreter`, each cell's value is its trimmed `textContent`.
 */
SimpleDataTableControl.ColumnValueFilter = function (columnIndex, operator, compareValue, columnType, selectedValues, cellInterpreter) {
	'use strict';
	
	this.columnIndex = columnIndex;
	
	/**
	 * {@link SimpleDataTableUtils}`.FILTER_OP_`* and `FILTER_FLAG_*` combination representing the current selected operator.
	 *
	 * @private
	 * @type {number}
	 */
	this.operator = operator;
	
	/**
	 * User-entered filter value.
	 *
	 * @private
	 * @type {string}
	 */
	this.compareValue = compareValue;
	
	/**
	 * {@link SimpleDataTableUtils}`.COLUMN_TYPE_`* constant representing the current selected column type.
	 *
	 * @private
	 * @type {number}
	 */
	this.columnType = columnType;
	
	/**
	 * A list of values currently selected in the Excel-like filter portion of the parent control.
	 *
	 * @private
	 * @type {Array}
	 */
	this.selectedValues = selectedValues;
	
	if (cellInterpreter) {
		SimpleDataTableControl.checkCellInterpreter(cellInterpreter);
		this.cellInterpreter = cellInterpreter;
		this.currentCellCache = [];
	}
};

/**
 * {@link CellInterpreter} or callback of the parent {@link SimpleDataTableControl}.
 *
 * @private
 * @type {(CellInterpreter|SimpleDataTableControl~populateCellValues)}
 */
SimpleDataTableControl.ColumnValueFilter.prototype.cellInterpreter = null;

/**
 * `Array` to use with the configured {@link SimpleDataTableControl.ColumnValueFilter#cellInterpreter}, if present. (Prevents the need to create a new
 * `Array` on each call to {@link SimpleDataTableControl.ColumnValueFilter#include} when filtering). This property is `null` if no `cellInterpreter`
 * is configured.
 *
 * @private
 * @type {Array}
 */
SimpleDataTableControl.ColumnValueFilter.prototype.currentCellCache = null;


SimpleDataTableControl.ColumnValueFilter.prototype.include = function (cell) {
	'use strict';
	
	var cellInterpreter, currentCellCache, i;
	
	cellInterpreter = this.cellInterpreter;
	
	if (cellInterpreter) {
		currentCellCache = this.currentCellCache;
		if (cellInterpreter.populateCellValues) {
			cellInterpreter.populateCellValues(cell, currentCellCache)
		} else {
			cellInterpreter(cell, currentCellCache);
		}
		
		for (i = 0; i < currentCellCache.length; ++i) {
			if (this.shouldInclude(currentCellCache[i])) {
				currentCellCache.length = 0;
				return true;
			}
		}
		
		currentCellCache.length = 0;
		return false;
	} else {
		return this.shouldInclude(cell.textContent.trim());
	}
	
};


/**
 * Utility function to test whether an individual cell value qualifies it for inclusion in a filtering operation.
 *
 * @private
 * @param {string} cellValue Cell value to test.
 * @returns {boolean} `false` if the cell containing the given `cellValue` should be filtered, otherwise `true`.
 */
SimpleDataTableControl.ColumnValueFilter.prototype.shouldInclude = function (cellValue) {
	'use strict';

	var simple, list;
	
	simple = SimpleDataTableUtils.shouldInclude(cellValue, this.operator, this.compareValue, this.columnType);
	list = this.selectedValues.indexOf(cellValue) !== -1;
	
	return simple && list;
};

