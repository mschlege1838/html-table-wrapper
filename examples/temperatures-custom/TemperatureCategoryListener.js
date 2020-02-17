

function TemperatureCategoryListener(tableWrapper, categoryInputs, highColumnIndex, lowColumnIndex) {
    'use strict';
    
    this.tableWrapper = tableWrapper;
    this.categoryInputs = categoryInputs;
    this.highColumnIndex = highColumnIndex;
    this.lowColumnIndex = lowColumnIndex;
}

TemperatureCategoryListener.prototype.init = function () {
    'use strict';
    
    var categoryInputs, i;
    
    categoryInputs = this.categoryInputs;
    for (i = 0; i < categoryInputs.length; ++i) {
        categoryInputs[i].addEventListener('click', this, false);
    }
};

TemperatureCategoryListener.prototype.dispose = function () {
    'use strict';
    
    var categoryInputs, i;
    
    categoryInputs = this.categoryInputs;
    for (i = 0; i < categoryInputs.length; ++i) {
        categoryInputs[i].removeEventListener('click', this, false);
    }
};

TemperatureCategoryListener.prototype.handleEvent = function () {
    'use strict';
    
    this.updateTable();
};

TemperatureCategoryListener.prototype.updateTable = function () {
    'use strict';
    
    var tableWrapper, categoryInputs, i, input, tableFilters, classList, highColumnIndex, lowColumnIndex, gt, lte;
    
    tableWrapper = this.tableWrapper;
    categoryInputs = this.categoryInputs;
    highColumnIndex = this.highColumnIndex;
    lowColumnIndex = this.lowColumnIndex;
    
    tableFilters = [];
    for (i = 0; i < categoryInputs.length; ++i) {
        input = categoryInputs[i];
        
        // Only consider checked inputs
        if (!input.checked) {
            continue;
        }
        
        // No need to build a FilterDescriptor for the 'none' field.
        if (input.value === 'none') {
            continue;
        }
        
        // Read in range values.
        gt = Number.parseFloat(input.getAttribute(TemperatureConversionListener.CURRENT_GT_ATTRIBUTE));
        lte = Number.parseFloat(input.getAttribute(TemperatureConversionListener.CURRENT_LTE_ATTRIBUTE));
        
        // Add appropriate filter descriptor.
        classList = input.classList;
        if (classList.contains('high')) {
            tableFilters.push(new HighLowFilter(highColumnIndex, gt, lte));
        } else if (classList.contains('low')) {
            tableFilters.push(new HighLowFilter(lowColumnIndex, gt, lte));
        } else if (classList.contains('swing')) {
            tableFilters.push(new SwingFilter(gt, lte, highColumnIndex, lowColumnIndex));
        }
    }
    
    // Call HTMLTableWrapper.
    tableWrapper.filter(tableFilters);
};