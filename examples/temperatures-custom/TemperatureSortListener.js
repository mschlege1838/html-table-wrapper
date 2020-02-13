

function TemperatureSortListener(tableWrapper, sortInputs, highColumnIndex, lowColumnIndex) {
    'use strict';
    
    this.tableWrapper = tableWrapper;
    this.sortInputs = sortInputs;
    this.highColumnIndex = highColumnIndex;
    this.lowColumnIndex = lowColumnIndex;
}

TemperatureSortListener.CATEGORY_ATTRIBUTE_NAME = 'data-category';

TemperatureSortListener.prototype.init = function () {
    'use strict';
    
    var sortInputs, i;
    
    sortInputs = this.sortInputs;
    
    for (i = 0; i < sortInputs.length; ++i) {
        sortInputs[i].addEventListener('click', this, false);
    }
};

TemperatureSortListener.prototype.dispose = function () {
    'use strict';
    
    var sortInputs, i;
    
    sortInputs = this.sortInputs;
    
    for (i = 0; i < sortInputs.length; ++i) {
        sortInputs[i].removeEventListener('click', this, false);
    }
};

TemperatureSortListener.prototype.handleEvent = function (event) {
    'use strict';
    
    var target;
    
    target = event.target;
    
    this.doSort(target.getAttribute(TemperatureSortListener.CATEGORY_ATTRIBUTE_NAME), target.value);
};

TemperatureSortListener.prototype.doSort = function (category, direction) {
    'use strict';
    
    var tableWrapper, highColumnIndex, lowColumnIndex, descending, sortDescriptor;
    
    tableWrapper = this.tableWrapper;
    highColumnIndex = this.highColumnIndex;
    lowColumnIndex = this.lowColumnIndex;
    
    descending = direction == 'desc';
    switch (category) {
        case 'high':
            sortDescriptor = new HighLowSortDescriptor(highColumnIndex, descending);
            break;
        case 'low':
            sortDescriptor = new HighLowSortDescriptor(lowColumnIndex, descending);
            break;
        case 'swing':
            sortDescriptor = new SwingSortDescriptor(highColumnIndex, lowColumnIndex, descending);
            break;
        case 'none':
        default:
            sortDescriptor = null;
    }
    
    if (sortDescriptor) {
        tableWrapper.sort(sortDescriptor);
    } else {
        tableWrapper.clearSort();
    }
};