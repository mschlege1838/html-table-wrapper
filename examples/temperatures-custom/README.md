# An Entirely Custom Implementation

All the previous examples used 'helper' classes provided in HTMLTableWrapper.js to assist in the use of 
[`HTMLTableWrapper`][HTMLTableWrapper], but none of these are required; so long as the requirements of using 
the class are met, it will function perfectly well.

Consider the [temperature][temperatures-example] example from before, but with a slightly different spin: we 
want to define an off-table control than handles unit conversions, allows for filtering the table by category: 
hot/warm/cool/cold for highs and lows and low/medium/high for the differences between highs and lows (swing), 
and also allows for sorting the table based upon the daily high, low, and difference between them:
``` html
<!-- ... -->
<div class="control-group">
    <div class="field-group">
        <h4>Temperature Unit</h4>
        <span>
            <input id="temperatureUnitFahrenheit" class="temperature-unit"  type="radio" 
                    name="temperatureUnit" value="F" checked />
            <label for="temperatureUnitFahrenheit" class="fahrenheit" title="Fahrenheit"></label>
        </span>
        <span>
            <input id="temperatureUnitCelsius" class="temperature-unit" type="radio" 
                    name="temperatureUnit" value="C" />
            <label for="temperatureUnitCelsius" class="celsius" title="Celsius"></label>
<!-- ... -->
    <div class="field-group" id="temperatureCategories">
        <h4>Filter By Category</h4>
        <div class="field">
            <span>High:</span>
            <span>
                <input id="temperatureCategoryHighNone" class="temperature-category high" type="radio" 
                        name="temperatureCategoryHigh" value="none" checked />
                <label for="temperatureCategoryHighNone">None</label>
            </span>
            <span>
                <input id="temperatureCategoryHighHot" class="temperature-category high" type="radio" 
                        name="temperatureCategoryHigh" value="hot" data-orig-unit="F" data-orig-gt="75" />
                <label for="temperatureCategoryHighHot">Hot</label>
            </span>
            <span>
                <input id="temperatureCategoryHighWarm" class="temperature-category high" type="radio" 
                        name="temperatureCategoryHigh" value="warm" data-orig-unit="F" 
                                data-orig-lte="75" data-orig-gt="63" />
                <label for="temperatureCategoryHighWarm">Warm</label>
            </span>
<!-- ... -->
<div class="field-group" id="sortOptions">
    <h4>Sort By Temperature</h4>
    <div>
        <input id="temperatureSortNone" class="temperature-sort" type="radio" name="temperatureSort" 
                data-category="none" checked />
        <label for="temperatureSortNone">None</label>
    </div>
    <div>
        <span>
            <input id="temperatureSortHighAscending" class="temperature-sort" type="radio" 
                    name="temperatureSort" data-category="high" value="asc" />
            <label for="temperatureSortHighAscending">High, Ascending</label>
        </span>
        <span>
            <input id="temperatureSortHighDescending" class="temperature-sort" type="radio" 
                    name="temperatureSort" data-category="high" value="desc" />
            <label for="temperatureSortHighDescending">High, Descending</label>
<!-- ... -->
```

Because the 'categories' by which we want to filter correspond to temperature ranges, we define two new attributes: 
`data-orig-gt` and `data-orig-lte` to define the 'greater than' and 'less than or equal to' bounds of the range, 
respectively. E.g. for 'warm' highs, the attributes `data-orig-unit="F"`, `data-orig-lte="75"`, and `data-orig-gt="63"` 
are set, indicating a 'warm high' is considered a high temperature _T_ satisfying _63 < T <= 75_ degrees Fahrenheit.

Similar to the [temperatures][temperatures-example] example, we define some helper objects/classes that are 
not directly related to using HTMLTableWrapper.js, so we only explain them here. Their source files can be 
consulted for details:

- [`conversions.js`](conversions.js)

   Similar to the same file in the [temperatures] example, except we add unit-to-unit conversions to handle 
   converting the 'swing' category. ('Swing' is actually a measure of magnitude, not an absolute temperature.)

- [`TemperatureConversionListener`](TemperatureConversionListener.js)

   Listens for click events on the unit selection inputs. In response to click events, it converts the relevant 
   columns in a backing `HTMLTableElement` to the desired unit and sets the converted version of the range attributes 
   on the category filter fields: `data-lt` and `data-gte`. Similar to the previous [temperatures][temperatures-example] 
   example, this is done to avoid data loss from conversion to conversion. Also similar to the previous example, 
   the 'dictionary' object from `conversions.js` is used to lookup conversion functions.

Next, we declare our [`FilterDescriptor`][FilterDescriptor]s. A [`FilterDescriptor`][FilterDescriptor] is an 
object that defines an [`include`][FilterDescriptor-include] function that takes as an argument either an
`HTMLTableCellElement` or `HTMLTableRowElement`, and is called by [`HTMLTableWrapper`][HTMLTableWrapper] upon 
calls to [`filter`][HTMLTableWrapper-filter]. Whether [`HTMLTableWrapper`][HTMLTableWrapper] ends up passing
an `HTMLTableCellElement` or `HTMLTableRowElement` depends upon whether or not the [`FilterDescriptor`][FilterDescriptor] 
also defines a property called [`columnIndex`][FilterDescriptor-columnIndex]. If [`columnIndex`][FilterDescriptor-columnIndex] 
is a positive number, the argument will be an `HTMLTableCellElement` corresponding to the cell at `columnIndex` 
within the relevant row, otherwise it will be the `HTMLTableRowElement` itself. In either case, 
[`include`][FilterDescriptor-include] must return a `boolean` indicating whether the row should be kept (`true`)
or filtered (`false`).

For this example, we define two such [`FilterDescriptor`][FilterDescriptor]s: one for filtering based upon 
highs and lows, which uses [`columnIndex`][FilterDescriptor-columnIndex], and the other for filtering based 
upon swings (differences between highs and lows), which does not. Both, though, take a 'greater than' and 
'less than or equal to' number that defines the filter's range:
``` javascript
function HighLowFilter(columnIndex, gtRange, lteRange) {
    'use strict';
    
    this.columnIndex = columnIndex;
    this.gtRange = gtRange;
    this.lteRange = lteRange;
}

HighLowFilter.prototype.include = function (cell) {
    'use strict';
    
    var gtRange, lteRange, currentValue;
    
    currentValue = Number.parseFloat(cell.textContent);
    if (Number.isNaN(currentValue)) {
        return false;
    }
    
    gtRange = this.gtRange;
    lteRange = this.lteRange;
    
    if (!Number.isNaN(gtRange) && !(currentValue > gtRange)) {
        return false;
    }
    if (!Number.isNaN(lteRange) && !(currentValue <= lteRange)) {
        return false;
    }
    
    return true;
};


function SwingFilter(gtRange, lteRange, highColumnIndex, lowColumnIndex) {
    'use strict';
    
    this.gtRange = gtRange;
    this.lteRange = lteRange;
    this.highColumnIndex = highColumnIndex;
    this.lowColumnIndex = lowColumnIndex;
}

SwingFilter.prototype.include = function (row) {
    'use strict';
    
    var cells, currentSwing, gtRange, lteRange;
    
    cells = row.cells;
    
    currentSwing = Number.parseFloat(cells[this.highColumnIndex].textContent) - 
            Number.parseFloat(cells[this.lowColumnIndex].textContent)
    if (Number.isNaN(currentSwing)) {
        return false;
    }
    
    gtRange = this.gtRange;
    lteRange = this.lteRange;
    
    if (!Number.isNaN(gtRange) && !(currentSwing > gtRange)) {
        return false;
    }
    if (!Number.isNaN(lteRange) && !(currentSwing <= lteRange)) {
        return false;
    }
    
    return true;
};
```

Our listener class for the category fields takes an [`HTMLTableWrapper`][HTMLTableWrapper] to call on in 
response to click events, the `categoryInputs` themselves, as well as the index of the high and low temperature 
columns in the backing table. We also declare an `init` and `dispose` function where the listener will add
and remove (respectively) itself as a listener for click events on `categoryInputs`.
``` javascript
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
```

Next, we define an `updateTable` function that builds a series of [`FilterDescriptor`][FilterDescriptor]s 
based upon the currently selected category inputs:
``` javascript
TemperatureCategoryListener.prototype.updateTable = function () {
    'use strict';
    
    var tableWrapper, categoryInputs, i, input, tableFilters, classList, highColumnIndex, lowColumnIndex, 
        gt, lte;
    
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
```

With that, the `handleEvent` function for `TemperatureCategoryListener` is simple:
``` javascript
TemperatureCategoryListener.prototype.handleEvent = function () {
    'use strict';
    
    this.updateTable();
};
```


Next, we declare our [`SortDescriptor`][SortDescriptor]s. [`SortDescriptor`][SortDescriptor]s are quite similar 
to [`FilterDescriptor`][FilterDescriptor]s, only they, instead, define a [`compare`][SortDescriptor-compare]
function that takes two `HTMLTableCellElement`s or `HTMLTableRowElement`s, depending upon whether or not its 
[`columnIndex`][SortDescriptor-columnIndex] property is a positive number. The return value for 
[`compare`][SortDescriptor-compare] is an integer: negative if the first argument should be sorted below the 
second, positive if it should be sorted above, and zero if there's no preference.

The [`SortDescriptor`][SortDescriptor]s for this example are quite similar to the [`FilterDescriptor`][FilterDescriptor]s:
``` javascript
function HighLowSortDescriptor(columnIndex, descending) {
    'use strict';
    
    this.columnIndex = columnIndex;
    this.descending = descending;
}

HighLowSortDescriptor.prototype.compare = function (cellA, cellB) {
    'use strict';
    
    var numA, numB, aNaN, bNaN, result;
    
    numA = Number.parseFloat(cellA.textContent);
    numB = Number.parseFloat(cellB.textContent);
    
    aNaN = Number.isNaN(numA);
    bNaN = Number.isNaN(numB);
    if (aNaN && bNaN) {
        return 0;
    } else if (aNaN) {
        return 1;
    } else if (bNaN) {
        return -1;
    }
    
    result = numA - numB;
    return this.descending ? -1 * result : result;
};



function SwingSortDescriptor(highColumnIndex, lowColumnIndex, descending) {
    'use strict';
    
    this.highColumnIndex = highColumnIndex;
    this.lowColumnIndex = lowColumnIndex;
    this.descending = descending;
}

SwingSortDescriptor.prototype.compare = function (rowA, rowB) {
    'use strict';
    
    var highColumnIndex, lowColumnIndex, aCells, bCells, aSwing, bSwing, aNaN, bNaN, result;
    
    highColumnIndex = this.highColumnIndex;
    lowColumnIndex = this.lowColumnIndex;
    
    aCells = rowA.cells;
    bCells = rowB.cells;
    
    aSwing = Number.parseFloat(aCells[highColumnIndex].textContent) - 
            Number.parseFloat(aCells[lowColumnIndex].textContent);
    bSwing = Number.parseFloat(bCells[highColumnIndex].textContent) - 
            Number.parseFloat(bCells[lowColumnIndex].textContent);
    
    aNaN = Number.isNaN(aSwing);
    bNaN = Number.isNaN(bSwing);
    if (aNaN && bNaN) {
        return 0;
    } else if (aNaN) {
        return 1;
    } else if (bNaN) {
        return -1;
    }
    
    result = aSwing - bSwing;
    return this.descending ? -1 * result : result;
};
```

Finally, we declare a listener for the sort fields. Similar to `TemperatureCategoryListener`, it takes a backing 
[`HTMLTableWrapper`][HTMLTableWrapper], a set of relevant inputs, and the column index of the high and low temperature 
columns in the backing table. Also similar to `TemperatureCategoryListener`, the `init` and `dispose` functions 
add and remove (respectively) the listener for click events on relevant inputs.
``` javascript
function TemperatureSortListener(tableWrapper, sortInputs, highColumnIndex, lowColumnIndex) {
    'use strict';
    
    this.tableWrapper = tableWrapper;
    this.sortInputs = sortInputs;
    this.highColumnIndex = highColumnIndex;
    this.lowColumnIndex = lowColumnIndex;
}

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
```

We next declare a `doSort` function that takes a `category` (high/low/swing/none) and `direction` (asc/desc) 
argument. Based upon those, an appropriate [`SortDescriptor`][SortDescriptor] is built, and passed to the backing 
[`HTMLTableWrapper`][HTMLTableWrapper]'s [`sort`][HTMLTableWrapper-sort] function. If the 'none' field is selected,
the sort is [cleared][HTMLTableWrapper-clearSort].
``` javascript
TemperatureSortListener.CATEGORY_ATTRIBUTE_NAME = 'data-category';

// ...

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
```

The `handleEvent` function for `TemperatureSortListener` is also rather simple:
``` javascript
TemperatureSortListener.prototype.handleEvent = function (event) {
    'use strict';
    
    var target;
    
    target = event.target;
    
    this.doSort(target.getAttribute(TemperatureSortListener.CATEGORY_ATTRIBUTE_NAME), target.value);
};
```



The page initialization script, in this case, looks like this:
``` html
<script src="TemperatureConversionListener.js"></script>
<script src="TemperatureSortListener.js"></script>
<script src="TemperatureCategoryListener.js"></script>
<script src="SwingFilter.js"></script>
<script src="SwingSortDescriptor.js"></script>
<script src="HighLowSortDescriptor.js"></script>
<script src="HighLowFilter.js"></script>
<script>

var HIGH_COLUMN_INDEX = 2;
var LOW_COLUMN_INDEX = 3;

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    
    var table, categoryFieldGroup, unitInputs, tableWrapper, categoryInputs, sortInputs;
    
    table = document.getElementById('temperatures');
    categoryFieldGroup = document.getElementById('temperatureCategories');
    unitInputs = document.getElementsByClassName('temperature-unit');
    tableWrapper = new HTMLTableWrapper(table);
    categoryInputs = document.getElementsByClassName('temperature-category');
    sortInputs = document.getElementsByClassName('temperature-sort');
    
    new TemperatureConversionListener(table, categoryFieldGroup, tempConversions, unitInputs).init();
    new TemperatureCategoryListener(tableWrapper, categoryInputs, HIGH_COLUMN_INDEX, LOW_COLUMN_INDEX)
            .init();
    new TemperatureSortListener(tableWrapper, sortInputs, HIGH_COLUMN_INDEX, LOW_COLUMN_INDEX).init();
    
});
</script>
```

The working webpage can be found [here](https://mschlege1838.github.io/html-table-wrapper/examples/temperatures-custom/temperatures-custom.html).


[temperatures-example]: https://github.com/mschlege1838/html-table-wrapper/tree/master/examples/temperatures


[HTMLTableWrapper]: https://mschlege1838.github.io/html-table-wrapper/HTMLTableWrapper.html
[HTMLTableWrapper-filter]: https://mschlege1838.github.io/html-table-wrapper/HTMLTableWrapper.html#filter
[HTMLTableWrapper-sort]: https://mschlege1838.github.io/html-table-wrapper/HTMLTableWrapper.html#sort
[HTMLTableWrapper-clearSort]: https://mschlege1838.github.io/html-table-wrapper/HTMLTableWrapper.html#clearSort
[FilterDescriptor]: https://mschlege1838.github.io/html-table-wrapper/FilterDescriptor.html
[FilterDescriptor-include]: https://mschlege1838.github.io/html-table-wrapper/FilterDescriptor.html#include
[FilterDescriptor-columnIndex]: https://mschlege1838.github.io/html-table-wrapper/FilterDescriptor.html#columnIndex
[SortDescriptor]: https://mschlege1838.github.io/html-table-wrapper/SortDescriptor.html
[SortDescriptor-compare]: https://mschlege1838.github.io/html-table-wrapper/SortDescriptor.html#compare
[SortDescriptor-columnIndex]: https://mschlege1838.github.io/html-table-wrapper/SortDescriptor.html#columnIndex
