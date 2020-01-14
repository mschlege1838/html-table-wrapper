
// Constructor
function DataTableListener(table) {
	'use strict';
	
	if (!table) {
		throw new ReferenceError('Table must be defined.');
	}
	
	if (table instanceof DataTable) {
		this.dataTable = table;
		this.table = table.table;
	} else {
		this.dataTable = new DataTable(table);
		this.table = table;
	}
}

// Static fields
DataTableListener.COLUMN_OPTIONS_CONTAINER_CLASS_NAME = 'data-table-column-options';
DataTableListener.DIALOGUE_OPENED_CLASS_NAME = 'opened';
DataTableListener.DIALOGUE_CLOSED_CLASS_NAME = 'closed';
DataTableListener.DIALOGUE_MOBILE_THRESHOLD = 0.35;
DataTableListener.MOBILE_VIEW_CLASS_NAME = 'data-table-mobile-view';
DataTableListener.DIALOGUE_COLUMN_HORIZANTAL_OFFSET_PX = 10;
DataTableListener.DIALOGUE_COLUMN_VERTICAL_OFFSET_PX = -10;

DataTableListener.PROCESSED_COLUMN_HEADER = 'data-table-column-header';

DataTableListener.i18nStrings = {
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


DataTableListener.getWindowScrollX = function () {
	'use strict';
	
	if (typeof window.scrollX === 'number') {
		return window.scrollX;
	}
	
	return window.pageXOffset;
	
};

DataTableListener.getWindowScrollY = function () {
	'use strict';
	
	if (typeof window.scrollY === 'number') {
		return window.scrollY;
	}
	
	return window.pageYOffset;
};


// Static methods
DataTableListener.getIdBase = function () {
	'use strict';
	
	return 'dataTable_' + Math.random() + '_';
};

DataTableListener.createColumnOptionsElement = function () {
	'use strict';
	
	var container, idBase, inferColumnTypeId, textOnlyColumnTypeId, i18nStrings, sortOptionAscendingId,
		sortOptionDescendingId, filterOptionEq, filterOptionNeq, filterOptionLt, filterOptionGt,
		filterOptionLte, filterOptionGte, filterOptionContains, filterOptionIgnoreCase, sortOptionNoneId,
		filterByValueInputId, writer, selectAllCells;
	
	i18nStrings = DataTableListener.i18nStrings;
	
	idBase = DataTableListener.getIdBase();
	
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
	
	container = document.createElement('div');
	container.className = DataTableListener.COLUMN_OPTIONS_CONTAINER_CLASS_NAME;
	
	
	writer = new XMLWriter();
	
	writer.startTag('div').attribute('class', 'section title-bar')
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
	
	container.insertAdjacentHTML('afterbegin', writer.toString());
	
	document.body.appendChild(container);
	return container;
};

DataTableListener.getOffset = function (el) {
	'use strict';
	
	var result = { X: 0, Y: 0 };
	DataTableListener._getOffset(el, result);
	return result;
};

DataTableListener._getOffset = function (el, offsetCoords) {
	'use strict';
	
	if (el == null) {
		return;
	}
	
	offsetCoords.X += el.offsetLeft;
	offsetCoords.Y += el.offsetTop;
	DataTableListener._getOffset(el.offsetParent, offsetCoords);
};



// Default instance properties
DataTableListener.prototype.tableHeaderCache = null;

DataTableListener.prototype.columnOperationsElement = null;

DataTableListener.prototype.lastSelectedHeader = null;

DataTableListener.prototype.mobileViewState = null;


// Instance methods
DataTableListener.prototype.init = function () {
	'use strict';
	
	var tableHeaders, tableHeaderCache, i, tableHeader;
	
	tableHeaders = this.table.tHead.rows[0].cells;
	tableHeaderCache = this.tableHeaderCache = [];
	
	
	for (i = 0; i < tableHeaders.length; ++i) {
		tableHeader = tableHeaders[i];
		tableHeader.addEventListener('click', this, false);
		DataTable.addClass(tableHeader, DataTableListener.PROCESSED_COLUMN_HEADER);
		tableHeaderCache.push(tableHeader);
	}
	
};

DataTableListener.prototype.dispose = function () {
	'use strict';
	
	var tableHeaderCache, i, columnOperationsElement, clickTargets;
	
	tableHeaderCache = this.tableHeaderCache;
	if (tableHeaderCache) {
		for (i = 0; i < tableHeaders.length; ++i) {
			tableHeaderCache[i].removeEventListener('click', this, false);
		}
	
		this.tableHeaderCache = null;
	}
	
	columnOperationsElement = this.columnOperationsElement;
	if (columnOperationsElement) {
		columnOperationsElement.getElementsByClassName('close-button')[0].removeEventListener('click', this, false);
		
		columnOperationsElement.querySelector('input[name="filter-by-value-value"]').removeEventListener('keyup', this, false);
		
		clickTargets = columnOperationsElement.querySelectorAll('input[name="column-type"], input[name="sort-direction"], input[name=filter-by-value-option], input[name="filter-option-ignore-case"], input[name="clear-filter-button"], input[name="select-all-cell-values"]');
		for (i = 0; i < clickTargets.length; ++i) {
			clickTargets[i].removeEventListener('click', this, false);
		}
		
		document.body.removeChild(columnOperationsElement);
		window.removeEventListener('resize', this, false);
		columnOperationsElement = this.columnOperationsElement = null;
	}
	
};

DataTableListener.prototype.handleEvent = function (event) {
	'use strict';
	
	var target, columnOperationsElement, re, columnIndex, name;
	
	target = event.currentTarget;
	
	switch (event.type) {
		case 'resize':
			if (this.lastSelectedHeader) {
				this.positionColumnOptions(this.lastSelectedHeader);
				return;
			}
			break;
		case 'click':
			if ((columnIndex = this.tableHeaderCache.indexOf(target)) !== -1) {
				this.lastSelectedHeader = target;
				this.openColumnOptions(columnIndex);
				return;
			}
			
			if (DataTable.hasClass(target, 'close-button')) {
				this.closeColumnOptions();
				return;
			}
			
			name = target.name;
			if (name === 'column-value') {
				console.info(`Cell value: ${target.value} ${target.checked}`);
				return;
			}
			
			if (name === 'column-type') {
				console.info(`column type: ${target.value}`);
				return;
			}
			
			if (name === 'sort-direction') {
				console.info(`sort direction: ${target.value}`);
				return;
			}
			
			if (name === 'filter-by-value-option') {
				console.info(`filter option: ${target.value}`);
				return;
			}
			
			if (name === 'filter-option-ignore-case') {
				console.info(`ignore case: ${target.checked}`);
				return;
			}
			
			if (name === 'clear-filter-button') {
				console.info('Clear filters');
				return;
			}
			
			if (name === 'select-all-cell-values') {
				console.info(`Select All: ${target.checked}`);
				return;
			}
			
			break;
		case 'keyup':
			if (target.name === 'filter-by-value-value') {
				console.info(`Filter value: ${target.value}`);
				return;
			}
			break;
	}


};


DataTableListener.prototype.openColumnOptions = function (columnIndex) {
	'use strict';
	
	var columnOperationsElement, writer, columnValues, i, columnValue, idBase, id, cellValueList,
		newInputs, child, clickTargets, referenceHeader, fieldList, field;
	
	columnOperationsElement = this.columnOperationsElement;
	
	// Create dialogue if it doesn't exist.
	if (!columnOperationsElement) {
		columnOperationsElement = this.columnOperationsElement = DataTableListener.createColumnOptionsElement();
		columnOperationsElement.getElementsByClassName('close-button')[0].addEventListener('click', this, false);
		
		columnOperationsElement.querySelector('input[name="filter-by-value-value"]').addEventListener('keyup', this, false);
		
		clickTargets = columnOperationsElement.querySelectorAll('input[name="column-type"], input[name="sort-direction"], input[name=filter-by-value-option], input[name="filter-option-ignore-case"], input[name="clear-filter-button"], input[name="select-all-cell-values"]');
		for (i = 0; i < clickTargets.length; ++i) {
			clickTargets[i].addEventListener('click', this, false);
		}
		
		window.addEventListener('resize', this, false);
	}
	
	// Begin opening sequence.
	DataTable.removeClass(columnOperationsElement, DataTableListener.DIALOGUE_CLOSED_CLASS_NAME);
	DataTable.removeClass(columnOperationsElement, DataTableListener.DIALOGUE_OPENED_CLASS_NAME);
	
	
	// Add cell values for this column if not present.
	cellValueList = columnOperationsElement.getElementsByClassName('filter-by-cell-values')[0];
	if (!cellValueList.querySelector('[data-column-index="' + columnIndex + '"]')) {
		idBase = DataTableListener.getIdBase();
		writer = new XMLWriter()
		columnValues = this.dataTable.getColumnValues(columnIndex);
		for (i = 0; i < columnValues.length; ++i) {
			columnValue = columnValues[i];
			id = idBase + 'columnValue_' + i;
			
			writer.startTag('li').attribute('class', 'field').attribute('data-column-index', columnIndex)
				.startTag('input').attribute('type', 'checkbox').attribute('checked').attribute('value', columnValue).attribute('id', id).attribute('name', 'column-value').attribute('data-column-index', columnIndex).closeTag()
				.startTag('label').attribute('for', id).content(columnValue).closeTag()
			.closeTag();
		}
		
		cellValueList.insertAdjacentHTML('afterbegin', writer.toString());
		newInputs = cellValueList.querySelectorAll('input[data-column-index="' + columnIndex + '"]');
		for (i = 0; i < newInputs.length; ++i) {
			newInputs[i].addEventListener('click', this, false);
		}
	}
	
	// Filter values not for this column.
	fieldList = cellValueList.querySelectorAll('li[data-column-index="' + columnIndex + '"]');
	for (i = 0; i < fieldList.length; ++i) {
		field = fieldList[i];
		if (field.getAttribute('data-column-index') == columnIndex) {
			DataTable.removeClass(field, DataTable.FILTERED_CLASS_NAME);
		} else {
			DataTable.addClass(field, DataTable.FILTERED_CLASS_NAME);
		}
	}
	
	
	referenceHeader = this.tableHeaderCache[columnIndex];
	
	// Position dialogue.
	this.positionColumnOptions(referenceHeader);
	
	
	// Finish opening sequence.
	cellValueList.scrollTop = 0;
	columnOperationsElement.getElementsByClassName('column-title')[0].textContent = referenceHeader.textContent;
	DataTable.addClass(columnOperationsElement, DataTableListener.DIALOGUE_OPENED_CLASS_NAME);
};

DataTableListener.prototype.closeColumnOptions = function () {
	'use strict';
	
	var columnOperationsElement, mobileViewState;
	
	columnOperationsElement = this.columnOperationsElement;
	
	if (!columnOperationsElement) {
		return;
	}
	
	if (mobileViewState = this.mobileViewState) {
		mobileViewState.restoreDefaultView();
		this.mobileViewState = null;
	}
	
	DataTable.removeClass(columnOperationsElement, DataTableListener.DIALOGUE_OPENED_CLASS_NAME);
	DataTable.addClass(columnOperationsElement, DataTableListener.DIALOGUE_CLOSED_CLASS_NAME);
};

DataTableListener.prototype.positionColumnOptions = function (referenceHeader) {
	'use strict';
	
	var columnOperationsElement, offset, windowWidth, windowHeight, areaRatio, dialogueHeight, dialogueWidth, lastOverflow,
		mobileViewState, proposedLeft, proposedTop;
	
	columnOperationsElement = this.columnOperationsElement;
	mobileViewState = this.mobileViewState;
	
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	dialogueWidth = mobileViewState ? mobileViewState.initialWidth : columnOperationsElement.offsetWidth;
	dialogueHeight = mobileViewState ? mobileViewState.initialHeight : columnOperationsElement.offsetHeight;
	
	
	areaRatio = (dialogueHeight * dialogueWidth) / (windowHeight * windowWidth);
	
	
	if (areaRatio >= DataTableListener.DIALOGUE_MOBILE_THRESHOLD) {
		if (!mobileViewState) {
			mobileViewState = this.mobileViewState = new DataTableListener.MobileViewState(columnOperationsElement);
			mobileViewState.setupMobileView();
		}
	} else {
		if (mobileViewState) {
			mobileViewState.restoreDefaultView();
			this.mobileViewState = null;
			dialogueWidth = columnOperationsElement.offsetWidth;
			dialogueHeight = columnOperationsElement.offsetHeight;
		}
		
		
		offset = DataTableListener.getOffset(referenceHeader);
		
		proposedLeft = offset.X + DataTableListener.DIALOGUE_COLUMN_HORIZANTAL_OFFSET_PX;
		proposedTop = offset.Y + referenceHeader.offsetHeight + DataTableListener.DIALOGUE_COLUMN_VERTICAL_OFFSET_PX;
		
		columnOperationsElement.style.left = (proposedLeft + dialogueWidth > window.innerWidth ? window.innerWidth - dialogueWidth - (window.outerWidth - window.innerWidth) : proposedLeft) + 'px';
		columnOperationsElement.style.top = (proposedTop + dialogueHeight > window.innerHeight ? Math.max(0, window.innerHeight - dialogueHeight) : proposedTop) + 'px';
	}
	
};



DataTableListener.MobileViewState = function (columnOperationsElement) {
	'use strict';
	
	
	this.columnOperationsElement = columnOperationsElement;
	this.initialWidth = columnOperationsElement.offsetWidth;
	this.initialHeight = columnOperationsElement.offsetHeight;
	this.scrollX = DataTableListener.getWindowScrollX();
	this.scrollY = DataTableListener.getWindowScrollY();
};

DataTableListener.MobileViewState.prototype.setupMobileView = function () {
	'use strict';
	
	var columnOperationsElement, controlStyle;
	
	columnOperationsElement = this.columnOperationsElement;
	controlStyle = columnOperationsElement.style;
	
	controlStyle.removeProperty('left');
	controlStyle.removeProperty('top');
	
	DataTable.addClass(columnOperationsElement, DataTableListener.MOBILE_VIEW_CLASS_NAME);
	DataTable.addClass(document.body, DataTableListener.MOBILE_VIEW_CLASS_NAME);
	
	window.scrollTo(0, 0);
};

DataTableListener.MobileViewState.prototype.restoreDefaultView = function () {
	'use strict';
	
	var columnOperationsElement;
	
	columnOperationsElement = this.columnOperationsElement;
		
	DataTable.removeClass(columnOperationsElement, DataTableListener.MOBILE_VIEW_CLASS_NAME);
	DataTable.removeClass(document.body, DataTableListener.MOBILE_VIEW_CLASS_NAME);
	
	window.scrollTo(this.scrollX, this.scrollY);
};
