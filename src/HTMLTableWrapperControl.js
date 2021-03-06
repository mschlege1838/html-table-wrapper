/*
 * Copyright 2020 Martin F. Schlegel Jr. | MIT AND BSD-3-Clause
 */
 
// Virtual Interfaces

// CellInterpreter
/**
 * @interface CellInterpreter
 * @classdesc
 *
 * Object-based implementation of {@link HTMLTableWrapperControl~populateCellValues}.
 */
/**
 * Implementation of {@link HTMLTableWrapperControl~populateCellValues}. See the callback's documentation for further details.
 *
 * @function CellInterpreter#populateCellValues
 * @param {HTMLCellElement} cell Cell element whose values are to be retrieved.
 * @param {ColumnValueSet} values Values to populate.
 * @returns `true` to trigger default column value processing, otherwise {@link Nothing}.
 */

// Callbacks

// populateCellValues
/**
 * Optional callback for {@link HTMLTableWrapperControl} to customize how cell values are interpreted. Based upon the given `cell`,
 * should determine the individual cell value/values, and add them to the given {@link ColumnValueSet}. If `true` is returned
 * from a call to this function, default processing, as defined in {@link HTMLTableWrapperControl#getColumnValues} will be triggered.
 *
 * @callback HTMLTableWrapperControl~populateCellValues
 * @param {HTMLTableCellElement} cell Cell element whose values are to be retrieved.
 * @param {ColumnValueSet} values Values to populate.
 * @returns `true` to trigger default column value processing, otherwise {@link Nothing}.
 */



// Constructor
/**
 * @constructor
 * @implements ColumnControl
 * @param {number} columnIndex Index of the column this `HTMLTableWrapperControl` controls.
 * @param {HTMLTableWrapperListener} parent Parent {@link HTMLTableWrapperListener}.
 * @param {CellInterpreter|HTMLTableWrapperControl~populateCellValues} [cellInterpreter] 
 *   Optional interpreter for cell values to use with calls to {@link HTMLTableWrapperControl#getColumnValues}.
 * @classdesc
 *
 * The default {@link ColumnControl} used by {@link HTMLTableWrapperListener}. Defines a UI where an end-user
 * can select a column's type and sort order, and define filters based upon a custom, user-entered value as well as selection from a list of
 * individual cell values (similar to the column filtering dialogue in MS Excel). Uses a backing {@link ContextControl}.
 */
function HTMLTableWrapperControl(columnIndex, parent, cellInterpreter) {
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
     * Parent {@link HTMLTableWrapperListener}.
     *
     * @private
     * @type {HTMLTableWrapperListener}
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
HTMLTableWrapperControl.controlClassName = 'data-table-column-options';

/**
 * Constant representing a column should have no sort order.
 *
 * @type {number}
 * @const
 */
HTMLTableWrapperControl.SORT_ORDER_NONE = 1;

/**
 * Constant representing a column should have ascending sort order.
 *
 * @type {number}
 * @const
 */
HTMLTableWrapperControl.SORT_ORDER_ASCENDING = 2;

/**
 * Constant representing a column should have descending sort order.
 *
 * @type {number}
 * @const
 */
HTMLTableWrapperControl.SORT_ORDER_DESCENDING = 3;


HTMLTableWrapperControl.CLICK_TARGETS_SELECTOR = 
        'input.column-type, input.sort-direction, input.filter-by-value-operator, input.filter-option-ignore-case, input[name="clear-filter-button"], input[name="select-all-cell-values"], input.column-value, .close-button';

/**
 * A 'mapping' object whose property values correspond to labels printed on the dialogue presented to the end-user.
 * 
 * By default, values are in en-US (United States English), however clients that require internationalization can redefine the properties
 * of this object on page initialization (or, at minimum before any `HTMLTableWrapperControl`s are created) for the desired locale. 
 * (Alternatively, a completely new object can be assigned, so long as it contains all the property names of the original).
 *
 * @type {object}
 */
HTMLTableWrapperControl.i18nStrings = {
    columnOptionsLabel: 'Column Type',
    sortOptionsLabel: 'Sort Order',
    
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
    
    clearSearchFilters: 'Reset Column',
    
    toolTipCloseDialogue: 'Close'
};

/**
 * Counter for generating unique DOM ids.
 *
 * @type {number}
 * @private
 */
HTMLTableWrapperControl.idCounter = 0;


// Static Methods
/**
 * Utility function for generating a unique id prefix to use in generated dialogue content.
 *
 * @private
 */
HTMLTableWrapperControl.getIdBase = function () {
    'use strict';
    
    return 'dataTable_' + HTMLTableWrapperControl.idCounter++ + '_';
};

/**
 * Returns `true` if any input in the given set of `inputs` is not `checked`, otherwise `false`. Of note, whether each input
 * is of type checkbox, radio, etc. (i.e. an input where the `checked` attribute is appropriate) is not evaluated; the `checked`
 * attribute of each `input` is simply inspected.
 *
 * @param {MinimalList} inputs Inputs to inspect.
 * @returns `true` if at least one input in `inputs` has a `checked` attribute of `false`, otherwise `false`.
 */
HTMLTableWrapperControl.hasUnchecked = function (inputs) {
    'use strict';
    
    var i;
    
    for (i = 0; i < inputs.length; ++i) {
        if (!inputs[i].checked) {
            return true;
        }
    }
    
    return false;
};

/**
 * Sets the first `HTMLInputElement`'s `checked` attribute in the given set of `inputs` whose `value` is the given `value`.
 * Of note, whether each input is of type checkbox, radio, etc. (i.e. an input where the `checked` attribute is appropriate) 
 * is not evaluated; the `checked` attribute is simply set.
 *
 * @param {MinimalList} inputs Collection of inputs to process.
 * @param {string} value Value of the input whose checked attribute is to be set.
 */
HTMLTableWrapperControl.setChecked = function (inputs, value) {
    'use strict';
    
    var i, input;
    
    for (i = 0; i < inputs.length; ++i) {
        input = inputs[i];
        input.checked = input.value === value;
    }
};

/**
 * Utility function to check whether the given callback is a function itself (a {@link HTMLTableWrapperControl~populateCellValues}), or a
 * {@link CellInterpreter}. Throws a `TypeError` if neither.
 *
 * @private
 * @throws TypeError If `callback` is neither a {@link HTMLTableWrapperControl~populateCellValues} nor a {@link CellInterpreter}.
 */
HTMLTableWrapperControl.checkCellInterpreter = function (callback) {
    'use strict';
    
    if (typeof callback !== 'function' && typeof callback.populateCellValues !== 'function') {
        throw new TypeError('Callback must either define a populateCellValues function, or be a function itself.');
    }
};


// Instance fields.
HTMLTableWrapperControl.prototype.cellInterpreter = null;


// Instance Methods
HTMLTableWrapperControl.prototype.init = function () {
    'use strict';
    
    IE8Compatibility.addEventListener(this.contextControl, 'create', this, false);
};


HTMLTableWrapperControl.prototype.dispose = function () {
    'use strict';
    
    var contextControl, controlElement, clickTargets, i;
    
    contextControl = this.contextControl;
    
    controlElement = contextControl.getControlElement();
    if (controlElement) {
        IE8Compatibility.removeEventListener(controlElement.querySelector('input.filter-by-value-value'), 'keyup', this, false);
        
        clickTargets = controlElement.querySelectorAll(HTMLTableWrapperControl.CLICK_TARGETS_SELECTOR);
        for (i = 0; i < clickTargets.length; ++i) {
            IE8Compatibility.removeEventListener(clickTargets[i], 'click', this, false);
        }
    }
    
    IE8Compatibility.removeEventListener(contextControl, 'create', this, false);
    contextControl.dispose();
};


/**
 * Implementation of DOM `EventListener`.
 *
 * @param {Event} event Event being dispatched.
 */
HTMLTableWrapperControl.prototype.handleEvent = function (event) {
    'use strict';
    
    var target, sortOrder, operation, columnValues, value, checked, index, controlElement;
    
    target = IE8Compatibility.getEventTarget(event);
    
    switch (event.type) {
        case 'create':
            this.defineContent(target.getControlElement());
            break;
        case 'click':
            if (IE8Compatibility.hasClass(target, 'close-button')) {
                this.contextControl.close();
            } else if (IE8Compatibility.hasClass(target, 'filter-by-value-operator')) {
                IE8Compatibility.setTextContent(this.contextControl.getControlElement().querySelector('.filter-by-value-description'), this.getOperatorDescription());
                this.updateParent();
            } else if (IE8Compatibility.hasClass(target, 'column-value')) {
                controlElement = this.contextControl.getControlElement();
                controlElement.querySelector('input[name="select-all-cell-values"]').checked = !HTMLTableWrapperControl.hasUnchecked(controlElement.querySelectorAll('input.column-value'));
                this.updateParent();
            } else if (
                IE8Compatibility.hasClass(target, 'column-type')
                || IE8Compatibility.hasClass(target, 'sort-direction')
                || IE8Compatibility.hasClass(target, 'filter-option-ignore-case')
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

HTMLTableWrapperControl.prototype.open = function () {
    'use strict';
    
    this.contextControl.open(this.parent.getTableHeaderElement(this.columnIndex));
};

HTMLTableWrapperControl.prototype.close = function () {
    'use strict';
    
    this.contextControl.close();
};


/**
 * Resets the state of this `HTMLTableWrapperControl`; all fields will be reset to their inital values. Note, this
 * only updates the state of the user interface; if the parent table needs to be updated, {@link HTMLTableWrapperControl#updateParent}
 * must be called subsequently.
 */
HTMLTableWrapperControl.prototype.reset = function () {
    'use strict';
    
    var control, columnValueInputs, i;
    
    control = this.contextControl.getControlElement();
    
    HTMLTableWrapperControl.setChecked(control.querySelectorAll('input.column-type'), 'infer');
    HTMLTableWrapperControl.setChecked(control.querySelectorAll('input.sort-direction'), 'none');
    HTMLTableWrapperControl.setChecked(control.querySelectorAll('input.filter-by-value-operator'), 'contains');
    control.querySelector('input.filter-option-ignore-case').checked = true;
    control.querySelector('input.filter-by-value-value').value = '';
    
    
    columnValueInputs = control.querySelectorAll('input.column-value');
    for (i = 0; i < columnValueInputs.length; ++i) {
        columnValueInputs[i].checked = true;
    }
};

/**
 * {@link HTMLTableWrapperListener#processTable Updates} the parent table.
 */
HTMLTableWrapperControl.prototype.updateParent = function () {
    'use strict';
    
    this.parent.processTable();
    this.contextControl.position();
};

/**
 * Selects or deselects all individual cell values for filtering. Note, this
 * only updates the state of the cell value checkboxes; if the parent table needs to be updated {@link HTMLTableWrapperControl#updateParent}
 * must be called subsequently.
 *
 * @param {boolean} checked Whether to select or deselect all individual cell values.
 */
HTMLTableWrapperControl.prototype.selectAllColumnValues = function (checked) {
    'use strict';
    
    var columnValueInputs, columnValueInput, i;
    
    columnValueInputs = this.contextControl.getControlElement().querySelectorAll('input.column-value');

    for (i = 0; i < columnValueInputs.length; ++i) {
        columnValueInputs[i].checked = checked;
    }
    
};


HTMLTableWrapperControl.prototype.getFilterDescriptor = function () {
    'use strict';
    
    var controlElement, compareValue, columnValueInputs, i, selectedValues, columnValueInput;
    
    controlElement = this.contextControl.getControlElement();
    
    if (!controlElement) {
        return null;
    }
    
    compareValue = controlElement.querySelector('input.filter-by-value-value').value;
    
    columnValueInputs = controlElement.querySelectorAll('input.column-value');
    selectedValues = [];
    for (i = 0; i < columnValueInputs.length; ++i) {
        columnValueInput = columnValueInputs[i];
        if (columnValueInput.checked) {
            selectedValues.push(columnValueInput.value);
        }
    }
    
    if (!compareValue && selectedValues.length === columnValueInputs.length) {
        return null;
    }
    
    return new HTMLTableWrapperControl.ColumnValueFilter(this.columnIndex, this.getOperator(), compareValue, this.getColumnType(), selectedValues, this.cellInterpreter);
};

HTMLTableWrapperControl.prototype.getSortDescriptor = function () {
    'use strict';
    
    var sortOrder, columnType;
    
    if (!this.contextControl.getControlElement()) {
        return null;
    }
    
    sortOrder = this.getSortOrder();
    if (sortOrder === HTMLTableWrapperControl.SORT_ORDER_NONE) {
        return null;
    }
    
    columnType = this.getColumnType();
    
    return new SimpleSortDescriptor(this.columnIndex, sortOrder === HTMLTableWrapperControl.SORT_ORDER_DESCENDING, columnType);
};


/**
 * Returns and `Array` containting all the individual cell values of the column with which this `HTMLTableWrapperControl` is associated.
 * If this `HTMLTableWrapperControl` has a {@link CellInterpreter} or {@link HTMLTableWrapperControl~populateCellValues} callback
 * configured, it will be used to obtain the values of individual cells, otherwise, returns the unique set of each cell's trimmed
 * `textContent`. If any call to a defined interpreter returns `true`, the cell's trimmed `textContent` is also used.
 *
 * By default, the result is sorted prior to being returned, unless the `noSort` parameter is not {@link Nothing}.
 *
 * @param {boolean} [noSort=false] Whether to return the result unsorted.
 * @returns {Array} All the values within the column this `HTMLTableWrapperControl` controls.
 */
HTMLTableWrapperControl.prototype.getColumnValues = function (noSort) {
    'use strict';
    
    var rows, i, cell, values, result, columnIndex, callback, defaultProcessing, itr, itrVal;
    
    callback = this.cellInterpreter;
    if (callback) {
        HTMLTableWrapperControl.checkCellInterpreter(callback);
    }
    
    columnIndex = this.columnIndex;
    
    values = new ColumnValueSet();
    rows = this.parent.getDataTable().getRows(true);
    
    for (i = 0; i < rows.length; ++i) {
        cell = rows[i].cells[columnIndex];
        if (callback) {
            if (callback.populateCellValues) {
                defaultProcessing = callback.populateCellValues(cell, values);
            } else {
                defaultProcessing = callback(cell, values);
            }
        } else {
            defaultProcessing = true;
        }
        
        if (defaultProcessing) {
            values.add(IE8Compatibility.getTextContent(cell));
        }
        
    }
    
    result = [];
    itr = values.iterator();
    while (!(itrVal = itr.next()).done) {
        result.push(itrVal.value);
    }
    
    
    if (!noSort) {
        result.sort();
    }
    
    return result;
};



/**
 * Returns a combination of the {@link HTMLTableWrapperUtils}`.FILTER_OP_`* and `FILTER_FLAG_`* bitfields corresponding to
 * the current selected operator, or `null` if no operator is selected, or this control has yet not been opened.
 *
 * @returns {number}
 *   A combination of the {@link HTMLTableWrapperUtils} bitfields corresponding to the current selected operator, or `null`
 *   if no operator is selected, or this control has not yet been opened.
 */
HTMLTableWrapperControl.prototype.getOperator = function () {
    'use strict';
    
    var result;
    
    switch (this.getCheckedValue('input.filter-by-value-operator')) {
        case 'eq':
            result = HTMLTableWrapperUtils.FILTER_OP_EQUALS;
            break;
        case 'neq':
            result = HTMLTableWrapperUtils.FILTER_OP_NOT_EQUALS;
            break;
        case 'lt':
            result = HTMLTableWrapperUtils.FILTER_OP_LESS_THAN;
            break;
        case 'gt':
            result = HTMLTableWrapperUtils.FILTER_OP_GREATER_THAN;
            break;
        case 'lte':
            result = HTMLTableWrapperUtils.FILTER_OP_LESS_THAN | HTMLTableWrapperUtils.FILTER_OP_EQUALS;
            break;
        case 'gte':
            result = HTMLTableWrapperUtils.FILTER_OP_GREATER_THAN | HTMLTableWrapperUtils.FILTER_OP_EQUALS;
            break;
        case 'contains':
            result = HTMLTableWrapperUtils.FILTER_OP_CONTAINS;
            break;
        default:
            return null;
    }
    
    if (this.contextControl.getControlElement().querySelector('input.filter-option-ignore-case').checked) {
        result |= HTMLTableWrapperUtils.FILTER_FLAG_IGNORE_CASE; 
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
HTMLTableWrapperControl.prototype.getOperatorDescription = function () {
    'use strict';
    
    var i18nStrings = HTMLTableWrapperControl.i18nStrings;
    
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
 * Returns the {@link HTMLTableWrapperUtils}`.COLUMN_TYPE_`* constant corresponding to the current selected column type, or
 * `null` if no column type is selected, or this control has not yet been opened.
 *
 * @returns {number}
 *   The {@link HTMLTableWrapperUtils}`.COLUMN_TYPE_`* constant corresponding to the current selected column type, or
 *   `null` if no column type is selected, or this control has not yet been opened.
 */
HTMLTableWrapperControl.prototype.getColumnType = function () {
    'use strict';
    
    switch (this.getCheckedValue('input.column-type')) {
        case 'infer':
            return HTMLTableWrapperUtils.COLUMN_TYPE_INFER;
        case 'text':
            return HTMLTableWrapperUtils.COLUMN_TYPE_TEXT;
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
HTMLTableWrapperControl.prototype.getSortOrder = function () {
    'use strict';
    
    switch (this.getCheckedValue('input.sort-direction')) {
        case 'none':
            return HTMLTableWrapperControl.SORT_ORDER_NONE;
        case 'ascending':
            return HTMLTableWrapperControl.SORT_ORDER_ASCENDING;
        case 'descending':
            return HTMLTableWrapperControl.SORT_ORDER_DESCENDING;
        default:
            return null;
    }
};


/**
 * Utility function to obtain the `value` of the first `checked` input element within this control's backing `HTMLElement` matching the given query
 * `selector`. The `querySelectorAll` function is ran on the backing element, and the result is iterated until the first element with a `checked`
 * attribute of `true` is encountered, in which case that element's `value` attribute is returned. If no `checked` element is found with the given
 * `selector`, or this control has not yet been opened, `null` is returned.
 *
 * @private
 * @param {string} selector Query selector string.
 * @return {string} 
 *   The `value` of the first `checked` element within this control matching the given `selector`, or `null` if no checked element is found, or this
 *   control has not yet been opened.
 */
HTMLTableWrapperControl.prototype.getCheckedValue = function (selector) {
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
 * Defines the UI content on the given `container`, and registers this `HTMLTableWrapperControl` for the appropriate events on
 * generated elements. Only intended to be called once (in response to {@link ContextControl#event:create} events).
 *
 * @private
 * @param {HTMLElement} container Element upon which the content of this control is to be defined.
 */
HTMLTableWrapperControl.prototype.defineContent = function (container) {
    'use strict';
    
    var idBase, inferColumnTypeId, textOnlyColumnTypeId, i18nStrings, sortOptionAscendingId,
        sortOptionDescendingId, filterOptionEq, filterOptionNeq, filterOptionLt, filterOptionGt,
        filterOptionLte, filterOptionGte, filterOptionContains, filterOptionIgnoreCase, sortOptionNoneId,
        filterByValueInputId, builder, selectAllCells, clickTargets, i, columnValues, columnValue, id, 
        columnIndex, columnTypeName, sortOrderName, operatorName;
    
    i18nStrings = HTMLTableWrapperControl.i18nStrings;
    
    // Generate IDs.
    idBase = HTMLTableWrapperControl.getIdBase();
    
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
    
    IE8Compatibility.addClass(container, HTMLTableWrapperControl.controlClassName)
    
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
        .startTag('input').attribute('class', 'filter-by-value-value').attribute('id', filterByValueInputId).closeTag()
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
                .startTag('input').attribute('type', 'checkbox').attribute('checked').attribute('value', columnValue).attribute('id', id).attribute('class', 'column-value').closeTag()
                .startTag('label').attribute('for', id).content(columnValue).closeTag()
            .closeTag();
        }
        
        builder.closeTag(true)
    .closeTag();
    
    // Define content.
    container.insertAdjacentHTML('afterbegin', builder.toString());
    
    
    // Register events.
    IE8Compatibility.addEventListener(container.querySelector('input.filter-by-value-value'), 'keyup', this, false);
    
    clickTargets = container.querySelectorAll(HTMLTableWrapperControl.CLICK_TARGETS_SELECTOR);
    for (i = 0; i < clickTargets.length; ++i) {
        IE8Compatibility.addEventListener(clickTargets[i], 'click', this, false);
    }
    
};




/**
 *
 * @constructor
 * @implements FilterDescriptor
 * @param {number} columnIndex Column index of the parent {@link HTMLTableWrapperControl}.
 * @param {number} operator {@link HTMLTableWrapperUtils}`.FILTER_OP_`* and `FILTER_FLAG_*` combination representing the current selected operator.
 * @param {string} compareValue User-entered filter value.
 * @param {number} columnType {@link HTMLTableWrapperUtils}`.COLUMN_TYPE_`* constant representing the current selected column type.
 * @param {Array} selectedValues A list of values currently selected in the Excel-like filter portion of the parent control.
 * @param {(CellInterpreter|HTMLTableWrapperControl~populateCellValues)} [cellInterpreter=null] {@link CellInterpreter} or callback of the parent {@link HTMLTableWrapperControl}.
 * @private
 * @classdesc
 *
 * The {@link FilterDescriptor} implementation returned by {@link HTMLTableWrapperControl#getFilterDescriptor}. Determines whether individual cell values should be filtered
 * based upon the given `operator`, `compareValue`, `selectedValues` and `columnType`. Individual cell values are determined with the given `cellInterpreter` if present. If no value
 * is given for `cellInterpreter`, each cell's value is its trimmed `textContent`.
 */
HTMLTableWrapperControl.ColumnValueFilter = function (columnIndex, operator, compareValue, columnType, selectedValues, cellInterpreter) {
    'use strict';
    
    this.columnIndex = columnIndex;
    
    /**
     * {@link HTMLTableWrapperUtils}`.FILTER_OP_`* and `FILTER_FLAG_*` combination representing the current selected operator.
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
     * {@link HTMLTableWrapperUtils}`.COLUMN_TYPE_`* constant representing the current selected column type.
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
        HTMLTableWrapperControl.checkCellInterpreter(cellInterpreter);
        this.cellInterpreter = cellInterpreter;
        this.currentCellCache = new ColumnValueSet();
    }
};

/**
 * {@link CellInterpreter} or callback of the parent {@link HTMLTableWrapperControl}.
 *
 * @private
 * @type {(CellInterpreter|HTMLTableWrapperControl~populateCellValues)}
 */
HTMLTableWrapperControl.ColumnValueFilter.prototype.cellInterpreter = null;

/**
 * `ColumnValueSet` to use with the configured {@link HTMLTableWrapperControl.ColumnValueFilter#cellInterpreter}, if present. (Prevents the need to create a new
 * `ColumnValueSet` on each call to {@link HTMLTableWrapperControl.ColumnValueFilter#include} when filtering). This property is `null` if no `cellInterpreter`
 * is configured.
 *
 * @private
 * @type {ColumnValueSet}
 */
HTMLTableWrapperControl.ColumnValueFilter.prototype.currentCellCache = null;


HTMLTableWrapperControl.ColumnValueFilter.prototype.include = function (cell) {
    'use strict';
    
    var cellInterpreter, currentCellCache, itr, itrVal, defaultProcessing;
    
    cellInterpreter = this.cellInterpreter;
    
    if (cellInterpreter) {
        currentCellCache = this.currentCellCache;
        if (cellInterpreter.populateCellValues) {
            defaultProcessing = cellInterpreter.populateCellValues(cell, currentCellCache)
        } else {
            defaultProcessing = cellInterpreter(cell, currentCellCache);
        }
        
        if (defaultProcessing) {
            currentCellCache.add(IE8Compatibility.getTextContent(cell));
        }
        
        itr = currentCellCache.iterator();
        while (!(itrVal = itr.next()).done) {
            if (this.shouldInclude(itrVal.value)) {
                currentCellCache.clear();
                return true;
            }
        }
        
        currentCellCache.clear();
        return false;
    } else {
        return this.shouldInclude(IE8Compatibility.getTextContent(cell).trim());
    }
    
};


/**
 * Utility function to test whether an individual cell value qualifies it for inclusion in a filtering operation.
 *
 * @private
 * @param {string} cellValue Cell value to test.
 * @returns {boolean} `false` if the cell containing the given `cellValue` should be filtered, otherwise `true`.
 */
HTMLTableWrapperControl.ColumnValueFilter.prototype.shouldInclude = function (cellValue) {
    'use strict';

    var simple, list;
    
    simple = HTMLTableWrapperUtils.shouldInclude(cellValue, this.operator, this.compareValue, this.columnType);
    list = this.selectedValues.indexOf(cellValue) !== -1;
    
    return simple && list;
};


