

function TemperatureColumnControl(columnIndex, parent, temperatureConverter) {
    'use strict';
    
    this.columnIndex = columnIndex;
    this.parent = parent;
    this.temperatureConverter = temperatureConverter;
    this.contextControl = new ContextControl();
}

// Static fields.
TemperatureColumnControl.CLICK_TARGETS_SELECTOR = '.temperature-unit, .close-button, .sort-option';

TemperatureColumnControl.idCounter = 0;

// Static methods.
TemperatureColumnControl.getIdBase = function () {
    'use strict';
    
    return 'temperatureControl_' + TemperatureColumnControl.idCounter++ + '_';
};

// Instance methods.
TemperatureColumnControl.prototype.init = function () {
    'use strict';
    
    this.contextControl.addEventListener('create', this, false);
};

TemperatureColumnControl.prototype.dispose = function () {
    'use strict';
    
    var contextControl, controlElement, clickTargets, i;
    
    contextControl = this.contextControl;
    
    controlElement = contextControl.getControlElement();
    if (controlElement) {
        clickTargets = controlElement.querySelectorAll(TemperatureColumnControl.CLICK_TARGETS_SELECTOR);
        for (i = 0; i < clickTargets.length; ++i) {
            clickTargets[i].removeEventListener('click', this, false);
        }
        
        controlElement.querySelector('.temperature-filter-operator').removeEventListener('change', this, false);
        controlElement.querySelector('.temperature-filter-operand').removeEventListener('keyup', this, false);
    }
    
    contextControl.removeEventListener('create', this, false);
};

TemperatureColumnControl.prototype.handleEvent = function (event) {
    'use strict';
    
    var target;
    
    target = event.target;
    
    switch (event.type) {
        // First time control is opened.
        case 'create':
            this.defineContent(target.getControlElement());
            break;
            
        case 'click':
            if (target.classList.contains('temperature-unit')) {     // Unit change.
                this.convertTo(target.value);
            } else if (target.classList.contains('close-button')) {  // Close button.
                this.close();
            } else if (target.classList.contains('sort-option')) {   // Sort option.
                this.updateParent();
            }
            break;
            
        // Filter operator or operand change.
        case 'change':
        case 'keyup':
            this.updateParent();
            break;
    }
};



TemperatureColumnControl.prototype.open = function () {
    'use strict';
    
    this.contextControl.open(this.parent.getTableHeaderElement(this.columnIndex));
};

TemperatureColumnControl.prototype.close = function () {
    'use strict';
    
    this.contextControl.close();
};

TemperatureColumnControl.prototype.getFilterDescriptor = function () {
    'use strict';
    
    var controlElement, rawOperand, operand;
    
    controlElement = this.contextControl.getControlElement();
    if (!controlElement) {
        // Control has not been opened yet => no filtering needs to be performed.
        return null;
    }
    
    operand = Number.parseFloat(controlElement.querySelector('.temperature-filter-operand').value);
    if (Number.isNaN(operand)) {
        // Though SimpleFilterDescriptor can handle it, we're opting not to filter if the entered value is not a number.
        return null;
    }
    
    return new SimpleFilterDescriptor(this.columnIndex, operand, controlElement.querySelector('.temperature-filter-operator').value);
};

TemperatureColumnControl.prototype.getSortDescriptor = function () {
    'use strict';
    
    var controlElement, sortOptions, sortOption, checkedOption, i;
    
    controlElement = this.contextControl.getControlElement();
    if (!controlElement) {
        // Control has not been opened yet => no sorting needs to be performed.
        return null;
    }
    
    // Find first checked sort option.
    sortOptions = controlElement.getElementsByClassName('sort-option');
    for (i = 0; i < sortOptions.length; ++i) {
        sortOption = sortOptions[i];
        if (sortOption.checked) {
            checkedOption = sortOption;
            break;
        }
    }
    
    // If no option is selected OR the 'none' option is selected, no sorting should be performed.
    if (!checkedOption || checkedOption.value === 'none') {
        return null;
    }
    
    return new SimpleSortDescriptor(this.columnIndex, checkedOption.value === 'desc');
};


TemperatureColumnControl.prototype.convertTo = function (unit) {
    'use strict';
    
    this.temperatureConverter.convertColumn(this.columnIndex, unit);
};

TemperatureColumnControl.prototype.updateParent = function () {
    'use strict';
    
    this.parent.processTable();
    this.contextControl.position();
};

TemperatureColumnControl.prototype.defineContent = function (container) {
    'use strict';
    
    var builder, idBase, fId, cId, kId, unitInputSetName, operatorId, operandId, clickTargets, i,
        sortOrderName, sortOrderNoneId, sortOrderAscId, sortOrderDescId;
    
    builder = new XMLBuilder();
    idBase = TemperatureColumnControl.getIdBase();
    
    // Generate ids.
    fId = idBase + 'fInput';
    cId = idBase + 'cInput';
    kId = idBase + 'kInput';
    operatorId = idBase + 'operator';
    operandId = idBase + 'operand';
    sortOrderNoneId = idBase + 'sortOrderNone';
    sortOrderAscId = idBase + 'sortOrderAsc';
    sortOrderDescId = idBase + 'sortOrderDesc';
    
    // Generate names.
    unitInputSetName = idBase + 'temperatureInput';
    sortOrderName = idBase + 'sortOrder';
    
    // Build content.
    builder.startTag('div').attribute('class', 'control-bar')
        .startTag('span').attribute('class', 'control-button close-button').content('\u00D7').closeTag()
    .closeTag()
    .startTag('div').attribute('class', 'unit-selection')
        .startTag('span')
            .startTag('input').attribute('id', fId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName).attribute('value', 'F').attribute('type', 'radio').closeTag()
            .startTag('label').attribute('for', fId).attribute('class', 'fahrenheit').closeTag(true)
        .closeTag()
        .startTag('span')
            .startTag('input').attribute('id', cId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName).attribute('value', 'C').attribute('type', 'radio').closeTag()
            .startTag('label').attribute('for', cId).attribute('class', 'celsius').closeTag(true)
        .closeTag()
        .startTag('span')
            .startTag('input').attribute('id', kId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName).attribute('value', 'K').attribute('type', 'radio').closeTag()
            .startTag('label').attribute('for', kId).attribute('class', 'kelvin').closeTag(true)
        .closeTag()
    .closeTag()
    .startTag('div').attribute('class', 'filter-condition')
        .startTag('label').attribute('for', operatorId).content('Temperature is ').closeTag()
        .startTag('select').attribute('id', operatorId).attribute('class', 'temperature-filter-operator')
            .startTag('option').attribute('value', '>=').content('>=').closeTag()
            .startTag('option').attribute('value', '<=').content('<=').closeTag()
            .startTag('option').attribute('value', '>').content('>').closeTag()
            .startTag('option').attribute('value', '<').content('<').closeTag()
            .startTag('option').attribute('value', '=').content('=').closeTag()
        .closeTag()
        .startTag('label').attribute('for', operandId).content(' to ').closeTag()
        .startTag('input').attribute('id', operandId).attribute('class', 'temperature-filter-operand')
    .closeTag()
    .startTag('div').attribute('class', 'sort-order')
        .startTag('span').content('Sort Order: ').closeTag()
        .startTag('span').attribute('class', 'field')
            .startTag('input').attribute('id', sortOrderNoneId).attribute('class', 'sort-option').attribute('name', sortOrderName).attribute('value', 'none').attribute('type', 'radio').attribute('checked').closeTag()
            .startTag('label').attribute('for', sortOrderNoneId).content('None').closeTag()
        .closeTag()
        .startTag('span').attribute('class', 'field')
            .startTag('input').attribute('id', sortOrderAscId).attribute('class', 'sort-option').attribute('name', sortOrderName).attribute('value', 'asc').attribute('type', 'radio').closeTag()
            .startTag('label').attribute('for', sortOrderAscId).content('Ascending').closeTag()
        .closeTag()
        .startTag('span').attribute('class', 'field')
            .startTag('input').attribute('id', sortOrderDescId).attribute('class', 'sort-option').attribute('name', sortOrderName).attribute('value', 'desc').attribute('type', 'radio').closeTag()
            .startTag('label').attribute('for', sortOrderDescId).content('Descending').closeTag()
        .closeTag()
    .closeTag();
    
    // Insert content.
    container.insertAdjacentHTML('afterbegin', builder.toString());
    
    // Register for events on newly defined content.
    clickTargets = container.querySelectorAll(TemperatureColumnControl.CLICK_TARGETS_SELECTOR);
    for (i = 0; i < clickTargets.length; ++i) {
        clickTargets[i].addEventListener('click', this, false);
    }
    
    container.querySelector('.temperature-filter-operator').addEventListener('change', this, false);
    container.querySelector('.temperature-filter-operand').addEventListener('keyup', this, false);
};