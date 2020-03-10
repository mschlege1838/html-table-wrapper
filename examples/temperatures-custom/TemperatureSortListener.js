

function TemperatureSortListener(htmlTableWrapper, sortInputs, highColumnIndex, lowColumnIndex) {
    'use strict';
    
    this.htmlTableWrapper = htmlTableWrapper;
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
    
    var htmlTableWrapper, highColumnIndex, lowColumnIndex, descending, sortDescriptor;
    
    htmlTableWrapper = this.htmlTableWrapper;
    highColumnIndex = this.highColumnIndex;
    lowColumnIndex = this.lowColumnIndex;
    
    // direction is 'asc' or 'desc'; descending to true if 'desc':
    descending = direction == 'desc';
    
    // Build an appropriate SortDescriptor based on category:
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
    
    // Call HTMLTableWrapper.
    if (sortDescriptor) {
        // Sort if a valid SortDescriptor was built.
        htmlTableWrapper.sort(sortDescriptor);
    } else {
        // Otherwise clear sorting.
        htmlTableWrapper.clearSort();
    }
};