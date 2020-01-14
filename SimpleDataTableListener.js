

function SimpleDataTableListener(table, contextControl) {
	'use strict';
	
	if (table instanceof DataTable) {
		this.dataTable = dataTable;
		this.table = dataTable.table;
	} else {
		this.dataTable = new DataTable(table);
		this.table = table;
	}
	
	this.contextControl = contextControl;
	this.columnOperations = [];
}


// Static Fields
SimpleDataTableListener.SORT_ORDER_NONE = 0;
SimpleDataTableListener.SORT_ORDER_ASCENDING = 1;
SimpleDataTableListener.SORT_ORDER_DESCENDING = 2;


SimpleDataTableListener.columnOptionsControlClassName = 'data-table-column-options';
SimpleDataTableListener.PROCESSED_COLUMN_HEADER = 'data-table-column-header';


SimpleDataTableListener.i18nStrings = {
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


// Static Methods
SimpleDataTableListener.getIdBase = function () {
	'use strict';
	
	return 'dataTable_' + Math.random() + '_';
};

SimpleDataTableListener.getSortOrder = function (str) {
	'use strict';
	
	switch (str) {
		case 'none':
			return SimpleDataTableListener.SORT_ORDER_NONE;
		case 'ascending':
			return SimpleDataTableListener.SORT_ORDER_ASCENDING;
		case 'descending':
			return SimpleDataTableListener.SORT_ORDER_DESCENDING;
	}
};

SimpleDataTableListener.getSortOrderValue = function (val) {
	'use strict';
	
	switch (val) {
		case SimpleDataTableListener.SORT_ORDER_NONE:
			return 'none';
		case SimpleDataTableListener.SORT_ORDER_ASCENDING:
			return 'ascending';
		case SimpleDataTableListener.SORT_ORDER_DESCENDING:
			return 'descending';
	}
};

SimpleDataTableListener.getColumnType = function (str) {
	'use strict';
	
	switch (str) {
		case 'infer':
			return DataTable.COLUMN_TYPE_INFER;
		case 'text':
			return DataTable.COLUMN_TYPE_TEXT;
	}
};

SimpleDataTableListener.getColumnTypeValue = function (val) {
	'use strict';
	
	switch (val) {
		case DataTable.COLUMN_TYPE_INFER:
			return 'infer';
		case DataTable.COLUMN_TYPE_TEXT:
			return 'text';
	}
};

SimpleDataTableListener.getOperation = function (str) {
	'use strict';
	
	switch (str) {
		case 'eq':
			return DataTable.FILTER_OP_EQUALS;
		case 'neq':
			return DataTable.FILTER_OP_NOT_EQUALS;
		case 'lt':
			return DataTable.FILTER_OP_LESS_THAN;
		case 'gt':
			return DataTable.FILTER_OP_GREATER_THAN;
		case 'lte':
			return DataTable.FILTER_OP_LESS_THAN | DataTable.FILTER_OP_EQUALS;
		case 'gte':
			return DataTable.FILTER_OP_GREATER_THAN | DataTable.FILTER_OP_EQUALS;
		case 'contains':
			return DataTable.FILTER_OP_CONTAINS;
	}
};

SimpleDataTableListener.getOperationValue = function (val) {
	'use strict';
	
	var hasFlag = DataTable.hasFlag;
	
	if (hasFlag(val, DataTable.FILTER_OP_CONTAINS)) {
		return 'contains';
	} else if (hasFlag(val, DataTable.FILTER_OP_LESS_THAN) && hasFlag(val, DataTable.FILTER_OP_EQUALS)) {
		return 'lte';
	} else if (hasFlag(val, DataTable.FILTER_OP_GREATER_THAN) && hasFlag(val, DataTable.FILTER_OP_EQUALS)) {
		return 'gte';
	} else if (hasFlag(val, DataTable.FILTER_OP_EQUALS)) {
		return 'eq';
	} else if (hasFlag(val, DataTable.FILTER_OP_NOT_EQUALS)) {
		return 'neq';
	} else if (hasFlag(val, DataTable.FILTER_OP_LESS_THAN)) {
		return 'lt';
	} else if (hasFlag(val, DataTable.FILTER_OP_GREATER_THAN)) {
		return 'gt';
	}
	
	
};

SimpleDataTableListener.getChecked = function (inputs) {
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

SimpleDataTableListener.setChecked = function (inputs, targetValue) {
	'use strict';
	
	var i, input;
	
	for (i = 0; i < inputs.length; ++i) {
		input = inputs[i];
		if (input.value == targetValue) {
			input.checked = true;
		} else {
			input.checked = false;
		}
	}
	
};


// Default Instance Properties
SimpleDataTableListener.prototype.tableHeaderCache = null;

SimpleDataTableListener.prototype.currentColumnIndex = -1;


// Instance Methods
SimpleDataTableListener.prototype.init = function () {
	'use strict';
	
	var tableHeaders, tableHeaderCache, i, tableHeader;
	
	tableHeaders = this.table.tHead.rows[0].cells;
	tableHeaderCache = this.tableHeaderCache = [];
	
	
	for (i = 0; i < tableHeaders.length; ++i) {
		tableHeader = tableHeaders[i];
		tableHeader.addEventListener('click', this, false);
		IE9Compatibility.addClass(tableHeader, SimpleDataTableListener.PROCESSED_COLUMN_HEADER);
		tableHeaderCache.push(tableHeader);
	}
	
	this.contextControl.addEventListener('create', this, false);
	
};


SimpleDataTableListener.prototype.dispose = function () {
	'use strict';
	
	var tableHeaders, i, tableHeader, clickTargets, controlElement, contextControl;

	for (i = 0; i < tableHeaders.length; ++i) {
		tableHeader = tableHeaders[i];
		tableHeader.removeEventListener('click', this, false);
		IE9Compatibility.removeClass(tableHeader, SimpleDataTableListener.PROCESSED_COLUMN_HEADER);
	}
	this.tableHeaderCache = null;
	
	
	contextControl = this.contextControl;
	controlElement = contextControl.getControlElement();
	if (controlElement) {
		controlElement.getElementsByClassName('close-button')[0].removeEventListener('click', this, false);
			
		controlElement.querySelector('input[name="filter-by-value-value"]').removeEventListener('keyup', this, false);
		
		clickTargets = controlElement.querySelectorAll('input[name="column-type"], input[name="sort-direction"], input[name=filter-by-value-option], input[name="filter-option-ignore-case"], input[name="clear-filter-button"], input[name="select-all-cell-values"]');
		for (i = 0; i < clickTargets.length; ++i) {
			clickTargets[i].removeEventListener('click', this, false);
		}
	}
	contextControl.removeEventListener('create', this, false);
	contextControl.dispose();
	
};

SimpleDataTableListener.prototype.handleEvent = function (event) {
	'use strict';
	
	var target, name, currentColumnIndex, tableHeaderCache, contextControl, columnIndex, operation;
	
	target = event.currentTarget;
	contextControl = this.contextControl;
	tableHeaderCache = this.tableHeaderCache;
	
	switch (event.type) {
		case 'create':
			this.defineContent(contextControl.getControlElement());
			break;
		case 'open':
			columnIndex = this.currentColumnIndex;
			this.onOpen(contextControl.getControlElement(), columnIndex, tableHeaderCache[columnIndex]);
			break;
		case 'click':
			if ((columnIndex = tableHeaderCache.indexOf(target)) !== -1) {
				this.currentColumnIndex = columnIndex;
				contextControl.open(target);
				this.onOpen(contextControl.getControlElement(), columnIndex, target);
				return;
			}
			
			if (IE9Compatibility.hasClass(target, 'close-button')) {
				this.currentColumnIndex = -1;
				contextControl.close();
				return;
			}
			
			name = target.name;
			if (name === 'column-value') {
				this.selectColumnValue(target.getAttribute('data-column-index'), target.checked, target.value);
				return;
			}
			
			if (name === 'column-type') {
				this.getColumnOperations(this.currentColumnIndex).setColumnType(SimpleDataTableListener.getColumnType(target.value));
				return;
			}
			
			if (name === 'sort-direction') {
				this.getColumnOperations(this.currentColumnIndex).setSortOrder(SimpleDataTableListener.getSortOrder(target.value));
				return;
			}
			
			if (name === 'filter-by-value-option') {
				operation = SimpleDataTableListener.getOperation(target.value);
				if (contextControl.getControlElement().querySelector('input[name="filter-option-ignore-case"]').checked) {
					operation |= DataTable.FILTER_OP_IGNORE_CASE;
				}
				this.getColumnOperations(this.currentColumnIndex).setOperation(operation);
				return;
			}
			
			if (name === 'filter-option-ignore-case') {
				operation = SimpleDataTableListener.getOperation(SimpleDataTableListener.getChecked(contextControl.getControlElement().querySelectorAll('input[name="filter-by-value-option"]')).value);
				if (target.checked) {
					operation |= DataTable.FILTER_OP_IGNORE_CASE;
				}
				this.getColumnOperations(this.currentColumnIndex).setOperation(operation);
				return;
			}
			
			if (name === 'clear-filter-button') {
				this.dataTable.clearFilter();
				return;
			}
			
			if (name === 'select-all-cell-values') {
				currentColumnIndex = this.currentColumnIndex;
				if (currentColumnIndex < 0) {
					return;
				}
				this.selectAll(currentColumnIndex, target.checked);
				return;
			}
			
			break;
		case 'keyup':
			if (target.name === 'filter-by-value-value') {
				this.getColumnOperations(this.currentColumnIndex).setCompareValue(target.value);
				return;
			}
			break;
	}
};



SimpleDataTableListener.prototype.selectColumnValue = function (columnIndex, checked, value) {
	'use strict';
	
	var columnOperationsElement, inputs, i, selectAll;
	
	columnOperationsElement = this.contextControl.getControlElement();
	if (!columnOperationsElement) {
		return;
	}
	
	
	// Update Filter.
	this.getColumnOperations(columnIndex).toggleColumnValue(value, checked);
	
	
	// Update 'Select All' checkbox.
	selectAll = true;
	inputs = columnOperationsElement.querySelectorAll('.filter-by-cell-values input[name="column-value"][data-column-index="' + columnIndex + '"]');
	for (i = 0; i < inputs.length; ++i) {
		if (!inputs[i].checked) {
			selectAll = false;
			break;
		}
	}
	
	columnOperationsElement.querySelector('input[name="select-all-cell-values"]').checked = selectAll;
};

SimpleDataTableListener.prototype.selectAll = function (columnIndex, checked) {
	'use strict';
	
	var columnOperationsElement, inputs, i;
	
	columnOperationsElement = this.contextControl.getControlElement();
	if (!columnOperationsElement) {
		return;
	}
	
	inputs = columnOperationsElement.querySelectorAll('.filter-by-cell-values input[name="column-value"][data-column-index="' + columnIndex + '"]');
	for (i = 0; i < inputs.length; ++i) {
		inputs[i].checked = checked;
	}
};

SimpleDataTableListener.prototype.defineContent = function (container) {
	'use strict';
	
	var idBase, inferColumnTypeId, textOnlyColumnTypeId, i18nStrings, sortOptionAscendingId,
		sortOptionDescendingId, filterOptionEq, filterOptionNeq, filterOptionLt, filterOptionGt,
		filterOptionLte, filterOptionGte, filterOptionContains, filterOptionIgnoreCase, sortOptionNoneId,
		filterByValueInputId, builder, selectAllCells, clickTargets, i;
	
	i18nStrings = SimpleDataTableListener.i18nStrings;
	
	// Generate IDs.
	idBase = SimpleDataTableListener.getIdBase();
	
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
		.startTag('ul').attribute('class', 'filter-by-cell-values').closeTag(true)
	.closeTag();
	
	// Define content.
	IE9Compatibility.addClass(container, SimpleDataTableListener.columnOptionsControlClassName);
	container.insertAdjacentHTML('afterbegin', builder.toString());
	
	
	// Register events.
	container.getElementsByClassName('close-button')[0].addEventListener('click', this, false);
		
	container.querySelector('input[name="filter-by-value-value"]').addEventListener('keyup', this, false);
	
	clickTargets = container.querySelectorAll('input[name="column-type"], input[name="sort-direction"], input[name=filter-by-value-option], input[name="filter-option-ignore-case"], input[name="clear-filter-button"], input[name="select-all-cell-values"]');
	for (i = 0; i < clickTargets.length; ++i) {
		clickTargets[i].addEventListener('click', this, false);
	}
	
};

SimpleDataTableListener.prototype.onOpen = function (controlElement, columnIndex, referenceHeader) {
	'use strict'; 	
	
	var cellValueList, idBase, builder, columnValues, newInputs, i, columnValue, id, fieldList, field, columnOptions, selectAll, columnValueInputs;
	
	// Add cell values for this column if not present.
	cellValueList = controlElement.getElementsByClassName('filter-by-cell-values')[0];
	if (!(columnOptions = this.getColumnOperations(columnIndex))) {
		idBase = SimpleDataTableListener.getIdBase();
		builder = new XMLBuilder();
		columnValues = this.dataTable.getColumnValues(columnIndex);
		for (i = 0; i < columnValues.length; ++i) {
			columnValue = columnValues[i];
			id = idBase + 'columnValue_' + i;
			
			builder.startTag('li').attribute('class', 'field').attribute('data-column-index', columnIndex)
				.startTag('input').attribute('type', 'checkbox').attribute('checked').attribute('value', columnValue).attribute('id', id).attribute('name', 'column-value').attribute('data-column-index', columnIndex).closeTag()
				.startTag('label').attribute('for', id).content(columnValue).closeTag()
			.closeTag();
		}
		
		cellValueList.insertAdjacentHTML('afterbegin', builder.toString());
		newInputs = cellValueList.querySelectorAll('input[data-column-index="' + columnIndex + '"]');
		for (i = 0; i < newInputs.length; ++i) {
			newInputs[i].addEventListener('click', this, false);
		}
		
		
		this.columnOperations.push(columnOptions = new SimpleDataTableListener.ColumnConfiguration({
			columnIndex: columnIndex,
			sortOrder: SimpleDataTableListener.SORT_ORDER_NONE,
			columnType: DataTable.COLUMN_TYPE_INFER,
			compareValue: '',
			operation: DataTable.FILTER_OP_CONTAINS | DataTable.FILTER_OP_IGNORE_CASE,
			compareValues: columnValues
		}));
	} 
		
	columnOptions.updateControl(controlElement, columnIndex);
	
	
	// Filter values not for this column.
	fieldList = cellValueList.querySelectorAll('li[data-column-index]');
	for (i = 0; i < fieldList.length; ++i) {
		field = fieldList[i];
		if (field.getAttribute('data-column-index') == columnIndex) {
			IE9Compatibility.removeClass(field, DataTable.FILTERED_CLASS_NAME);
		} else {
			IE9Compatibility.addClass(field, DataTable.FILTERED_CLASS_NAME);
		}
	}
	
	// Update select all checkbox.
	columnValueInputs = cellValueList.querySelectorAll('input[data-column-index="' + columnIndex + '"]');
	selectAll = true;
	for (i = 0; i < columnValueInputs.length; ++i) {
		if (!columnValueInputs[i].checked) {
			selectAll = false;
			break;
		}
	}
	controlElement.querySelector('input[name="select-all-cell-values"]').checked = selectAll;
	
	cellValueList.scrollTop = 0;
	controlElement.getElementsByClassName('column-title')[0].textContent = referenceHeader.textContent;
};

SimpleDataTableListener.prototype.getColumnOperations = function (columnIndex) {
	'use strict';
	
	var i, columnOperations, columnOperation;
	
	columnOperations = this.columnOperations;
	
	for (i = 0; i < columnOperations.length; ++i) {
		columnOperation = columnOperations[i];
		if (columnOperation.columnIndex == columnIndex) {
			return columnOperation;
		}
	}
	
	return null;
};

SimpleDataTableListener.prototype.processOperations = function () {
	'use strict';
	
	
};




// Nested Types
SimpleDataTableListener.ColumnConfiguration = function (config) {
	'use strict';
	
	var columnIndex = config.columnIndex, sortOrder = config.sortOrder, columnType = config.columnType, operation = config.operation;

	this.columnIndex = columnIndex;
	this.sortOrder = sortOrder;
	this.operation = operation;
	this.columnType = columnType;
	
	this.sortDelegate = new DataTable.ValueSort(columnIndex, sortOrder == SimpleDataTableListener.SORT_ORDER_DESCENDING, columnType);
	this.filterDelegate = new DataTable.ValueFilter(columnIndex, config.compareValue, operation, columnType);
	
	this.columnValues = config.compareValues;
};

SimpleDataTableListener.ColumnConfiguration.prototype.setColumnType = function (columnType) {
	'use strict';
	
	this.columnType = this.sortDelegate.columnType = this.filterDelegate.columnType = columnType;
};

SimpleDataTableListener.ColumnConfiguration.prototype.setColumnIndex = function (columnIndex) {
	'use strict';
	
	this.columnIndex = this.sortDelegate.columnIndex = this.filterDelegate.columnIndex = columnIndex;
};

SimpleDataTableListener.ColumnConfiguration.prototype.setSortOrder = function (sortOrder) {
	'use strict';
	
	this.sortOrder = sortOrder;
	if (sortOrder == SimpleDataTableListener.SORT_ORDER_DESCENDING) {
		this.sortDelegate.descending = true;
	}
};

SimpleDataTableListener.ColumnConfiguration.prototype.setCompareValue = function (compareValue) {
	'use strict';
	
	this.filterDelegate.compareValue = compareValue;
};

SimpleDataTableListener.ColumnConfiguration.prototype.setOperation = function (operation) {
	'use strict';
	
	this.operation = this.filterDelegate.operation = operation;
};


SimpleDataTableListener.ColumnConfiguration.prototype.toggleColumnValue = function (val, checked) {
	'use strict';
	
	var columnValues, index;
	
	columnValues = this.columnValues;
	
	if (checked) {
		if (columnValues.indexOf(val) === -1) {
			columnValues.push(val);
		}
	} else {
		if ((index = columnValues.indexOf(val)) !== -1) {
			columnValues.splice(index, 1);
		}
	}
};

SimpleDataTableListener.ColumnConfiguration.prototype.updateControl = function (controlElement, columnIndex) {
	'use strict';
	
	var operation, columnValueInputs, i, columnValueInput;
	
	operation = this.operation;
	
	
	SimpleDataTableListener.setChecked(controlElement.querySelectorAll('input[name="column-type"]'), SimpleDataTableListener.getColumnTypeValue(this.columnType));
	SimpleDataTableListener.setChecked(controlElement.querySelectorAll('input[name="sort-direction"]'), SimpleDataTableListener.getSortOrderValue(this.sortOrder));
	SimpleDataTableListener.setChecked(controlElement.querySelectorAll('input[name="filter-by-value-option"]'), SimpleDataTableListener.getOperationValue(operation));
	
	controlElement.querySelector('input[name="filter-option-ignore-case"]').checked = DataTable.hasFlag(operation, DataTable.FILTER_OP_IGNORE_CASE);
	
};

SimpleDataTableListener.ColumnConfiguration.prototype.compare = function (cellA, cellB) {
	'use strict';
	
	return this.sortDelegate.compare(cellA, cellB);
};

SimpleDataTableListener.ColumnConfiguration.prototype.include = function (cell) {
	'use strict';
	
	var columnValues, cellValues, i;
	
	if (!this.filterDelegate.include(cell)) {
		return false;
	}
	
	columnValues = this.columnValues;
	
	cellValues = DataTable.getCellValues(cell);
	for (i = 0; i < cellValues.length; ++i) {
		if (columnValues.indexOf(cellValues[i]) !== -1) {
			return true;
		}
	}
	
	return true;
};