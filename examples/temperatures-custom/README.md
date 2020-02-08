# An Entirely Custom Implementation

All the previous examples used 'helper' classes defined to assist in the use of [HTMLTableWrapper], but it is worthy of note that none of these
are required; so long as the requirements of using the class are met, it will function perfectly well.

Consider the temperature example from before, but with a slightly different spin: we want to define an off-table control than handles unit
conversions, allows filtering rows in the table by category: hot/warm/cool/cold for highs and lows and low/medium/high for the differences
between highs and lows, and also allows for sorting the table based upon the daily high, low, and difference between them (swing):
``` html
...
<div class="control-group">
	<div class="field-group">
		<h4>Temperature Unit</h4>
		<span>
			<input id="temperatureUnitFahrenheit" class="temperature-unit"  type="radio" name="temperatureUnit" value="F" checked />
			<label for="temperatureUnitFahrenheit" class="fahrenheit" title="Fahrenheit"></label>
		</span>
		<span>
			<input id="temperatureUnitCelsius" class="temperature-unit" type="radio" name="temperatureUnit" value="C" />
			<label for="temperatureUnitCelsius" class="celsius" title="Celsius"></label>
		</span>
		<span>
			<input id="temperatureUnitKelvin" class="temperature-unit" type="radio" name="temperatureUnit" value="K" />
			<label for="temperatureUnitKelvin" class="kelvin"></label>
		</span>
	</div>
	<div class="field-group" id="temperatureCategories">
		<h4>Filter By Category</h4>
		<div class="field">
			<span>High:</span>
			<span>
				<input id="temperatureCategoryHighNone" class="temperature-category high" type="radio" name="temperatureCategoryHigh" value="none" checked />
				<label for="temperatureCategoryHighNone">None</label>
			</span>
			<span>
				<input id="temperatureCategoryHighHot" class="temperature-category high" type="radio" name="temperatureCategoryHigh" value="hot" 
						data-orig-unit="F" data-orig-gt="75" />
				<label for="temperatureCategoryHighHot">Hot</label>
			</span>
			<span>
				<input id="temperatureCategoryHighWarm" class="temperature-category high" type="radio" name="temperatureCategoryHigh" value="warm" 
						data-orig-unit="F" data-orig-lte="75" data-orig-gt="63" />
				<label for="temperatureCategoryHighWarm">Warm</label>
			</span>
			<span>
				<input id="temperatureCategoryHighCool" class="temperature-category high" type="radio" name="temperatureCategoryHigh" value="cool" 
						data-orig-unit="F" data-orig-lte="63" data-orig-gt="45" />
				<label for="temperatureCategoryHighCool">Cool</label>
			</span>
			<span>
				<input id="temperatureCategoryHighCold" class="temperature-category high" type="radio" name="temperatureCategoryHigh" value="cold" 
						data-orig-unit="F" data-orig-lte="45" />
				<label for="temperatureCategoryHighCold">Cold</label>
			</span>
		</div>
		<div class="field">
			<span>Low:</span>
			<span>
				<input id="temperatureCategoryLowNone" class="temperature-category low" type="radio" name="temperatureCategoryLow" value="none" checked />
				<label for="temperatureCategoryLowNone">None</label>
			</span>
			<span>
				<input id="temperatureCategoryLowHot" class="temperature-category low" type="radio" name="temperatureCategoryLow" value="hot" 
						data-orig-unit="F" data-orig-gt="75" />
				<label for="temperatureCategoryLowHot">Hot</label>
			</span>
...
<div class="field-group" id="sortOptions">
	<h4>Sort By Temperature</h4>
	<div>
		<input id="temperatureSortNone" class="temperature-sort" type="radio" name="temperatureSort" data-category="none" checked />
		<label for="temperatureSortNone">None</label>
	</div>
	<div>
		<span>
			<input id="temperatureSortHighAscending" class="temperature-sort" type="radio" name="temperatureSort" data-category="high" value="asc" />
			<label for="temperatureSortHighAscending">High, Ascending</label>
		</span>
		<span>
			<input id="temperatureSortHighDescending" class="temperature-sort" type="radio" name="temperatureSort" data-category="high" value="desc" />
			<label for="temperatureSortHighDescending">High, Descending</label>
		</span>
	</div>
	<div>
		<span>
			<input id="temperatureSortLowAscending" class="temperature-sort" type="radio" name="temperatureSort" data-category="low" value="asc" />
			<label for="temperatureSortLowAscending">Low, Ascending</label>
...
```

As the 'categories' by which we want to filter correspond to temperature ranges, we define two new attributes `data-orig-gt` and `data-orig-lte` to represent
these. E.g. for 'warm' highs, the attributes `data-orig-unit="F"`, `data-orig-lte="75"`, and `data-orig-gt="63"` are set, indicating a 'warm high' is considered 
a high temperature T satisfying 63 < T <= 75 degrees Fahrenheit.

To process temperature conversions, we borrow from our [definition] in the first temperatures example, but, as we'll also have to process ranges based upon 
differences in temperatures, we also need to define a unit-to-unit conversion:
``` javascript
// ...
function unitFToC(unit) {
	'use strict';
	
	return (5/9) * unit;
}

function unitCToF(unit) {
	'use strict';
	
	return (9/5) * unit;
}


var tempConversions = {
	'C': {
		toTemp: {
			'F': tempCToF
			, 'K': tempCToK
			, 'C': tempIdent
		}
		, toUnit: {
			'F': unitCToF
			, 'K': tempIdent
			, 'C': tempIdent
		}
		, className: 'celsius'
		
	}
	, 'F': {
		toTemp: {
			'C': tempFToC
			, 'K': function (temp) {
				'use strict';
				
				return tempCToK(tempFToC(temp));
			}
			, 'F': tempIdent
		}
		, toUnit: {
			'C': unitFToC
			, 'K': unitFToC
			, 'F': tempIdent
// ...
```

With that, our general strategy will be to declare three classes:
   1. One that listens for click events on the unit selection radio buttons, and converts the relevant table columns, as well as setting the 'instance range' 
      attributes `data-gt` and `data-lte` on the category filter fields. 
   2. One that listens for click events on the category fields and use the `data-gt` and `data-lte` attributes to create [FilterDescriptor]s to pass
      to the [filter] function of [HTMLTableWrapper].
   3. A third that listens for click events on the sort fields, and passes an approprite [SortDescriptor] to the [sort] function of [HTMLTableWrapper].

The first class builds builds upon the [TemperatureConverter] class defined in the previous temperature example; it still operates on a backing table, only
it processes all temperature columns at once, handles setting attributes on the category listener, and is a listener itself for the temperature unit inputs.
As such, the constructor for this class includes a fe more fields:
``` javascript
function TemperatureConversionListener(table, categoryFieldGroup, conversionMapping, unitInputs) {
	'use strict';
	
	this.table = table;
	this.categoryFieldGroup = categoryFieldGroup;
	this.conversionMapping = conversionMapping;
	this.unitInputs = unitInputs;
}
```

The core `handleEvent` function delegates to a general-purpose `converTo` function, which in turn delegates to one function to convert the category
field attributes (`convertFields`), and another to convert the relevant columns on the backing tab;e (`convertTable`):
``` javascript
TemperatureConversionListener.prototype.handleEvent = function (event) {
	'use strict';
	
	this.convertTo(event.target.value);
};

TemperatureConversionListener.prototype.convertTo = function (targetUnit) {
	'use strict';
	
	this.convertFields(targetUnit);
	this.convertTable(targetUnit);
};
```

The `convertFields` function handles updating the temperature category range attributes, as well as their corresponding label titles (tooltips. The conversion 
of individual fields is delgatedd to a static function `convertField`, as well as is the function that computes the label titles `getTitle` (though `getTitle` 
is omitted for brevity; consult the full [source] for details).:
``` javascript
TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE = 'data-orig-unit';
TemperatureConversionListener.ORIGINAL_GT_ATTRIBUTE = 'data-orig-gt';
TemperatureConversionListener.ORIGINAL_LTE_ATTRIBUTE = 'data-orig-lte';
TemperatureConversionListener.APPLICABLE_INPUT_SELECTOR = '.temperature-category[' + TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE + ']';

TemperatureConversionListener.CURRENT_GT_ATTRIBUTE = 'data-gt';
TemperatureConversionListener.CURRENT_LTE_ATTRIBUTE = 'data-lte';

TemperatureConversionListener.SWING_CATEGORY_CLASS_NAME = 'swing';

// ...
TemperatureConversionListener.convertField = function (field, conversionFn, origAttribute, currentAttribute) {
	'use strict';
	
	var orig, current;
	
	orig = Number.parseFloat(field.getAttribute(origAttribute));
	if (!Number.isNaN(orig)) {
		current = TemperatureConversionListener.strRoundToMax(conversionFn(orig), 2);
		field.setAttribute(currentAttribute, current);
	} else {
		current = NaN;
		field.removeAttribute(currentAttribute);
	}
	
	return current;
};

// ...

TemperatureConversionListener.prototype.convertFields = function (targetUnit) {
	'use strict';
	
	var categoryFieldGroup, conversionFn, applicableFields, i, field, gt, lte, correspondingLabel;
	
	categoryFieldGroup = this.categoryFieldGroup;
	
	applicableFields = categoryFieldGroup.querySelectorAll(TemperatureConversionListener.APPLICABLE_INPUT_SELECTOR);
	for (i = 0; i < applicableFields.length; ++i) {
		field = applicableFields[i];
		
		// Get conversion function.
		conversionFn = this.getConversionFn(field.getAttribute(TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE), targetUnit,
				field.classList.contains(TemperatureConversionListener.SWING_CATEGORY_CLASS_NAME) ? 'toUnit' : 'toTemp');
		
		// Convert fields, set attributes.
		gt = TemperatureConversionListener.convertField(field, conversionFn, TemperatureConversionListener.ORIGINAL_GT_ATTRIBUTE, TemperatureConversionListener.CURRENT_GT_ATTRIBUTE);
		lte = TemperatureConversionListener.convertField(field, conversionFn, TemperatureConversionListener.ORIGINAL_LTE_ATTRIBUTE, TemperatureConversionListener.CURRENT_LTE_ATTRIBUTE);
		
		// Set title on corresponding label, if present.
		correspondingLabel = categoryFieldGroup.querySelector('label[for="' + field.id + '"]');
		if (correspondingLabel) {
			correspondingLabel.title = TemperatureConversionListener.getTitle(gt, lte, targetUnit);
		}
	}
};

// ...
```

The `convertTable` function looks similar to its definition in `TemperatureConverter`, except it handles all columns with a header having the class
`temperature-column`:
``` javascript
TemperatureConversionListener.TEMPERATURE_COLUMN_CLASS_NAME = 'temperature-column';

// ...

TemperatureConversionListener.prototype.convertTable = function (targetUnit) {
	'use strict';
	
	var table, conversionMapping, columnHeaders, i, temperatureColumnIndicies, rows, cells, j, cell, conversionFn, 
		originalReadingRaw, originalReading;
	
	table = this.table;
	conversionMapping = this.conversionMapping;
	
	temperatureColumnIndicies = [];
	columnHeaders = table.tHead.rows[0].cells;
	for (i = 0; i < columnHeaders.length; ++i) {
		if (columnHeaders[i].classList.contains(TemperatureConversionListener.TEMPERATURE_COLUMN_CLASS_NAME)) {
			temperatureColumnIndicies.push(i);
		}
	}
	
	if (!temperatureColumnIndicies.length) {
		return;
	}
	
	rows = table.tBodies[0].rows;
	for (i = 0; i < rows.length; ++i) {
		cells = rows[i].cells;
		
		for (j = 0; j < temperatureColumnIndicies.length; ++j) {
			cell = cells[temperatureColumnIndicies[j]];
			
			originalReadingRaw = cell.getAttribute(TemperatureConversionListener.ORIGINAL_READING_ATTRIBUTE);
			originalReading = Number.parseFloat(originalReadingRaw);
			if (Number.isNaN(originalReading)) {
				throw new Error('Unable to parse original reading: ' + originalReadingRaw + '(row ' + i + ', column ' + temperatureColumnIndicies[j] + ')');
			}
			
			conversionFn = this.getConversionFn(cell.getAttribute(TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE), targetUnit, 'toTemp');
			cell.textContent = TemperatureConversionListener.strRoundToMax(conversionFn(originalReading), 2);
			cell.className = conversionMapping[targetUnit].className;
		}
	}
};
```

As seen above, both rely on a utility function to obtain an applicable conversion function (from `temperatureDescriptions`, declared earlier). This
is declared for the special case of swing ranges in the context of converting the corresponding category fields. The `lib` parameter specifies the
'sub'-access path (in the case of swing, it's `toUnit`, otherwise `toTemp`):
``` javascript
TemperatureConversionListener.prototype.getConversionFn = function (fromUnit, toUnit, lib) {
	'use strict';
	
	var conversionMapping, conversion, conversionFn;
	
	conversionMapping = this.conversionMapping;
	
	conversion = conversionMapping[fromUnit];
	if (!conversion) {
		throw new Error('No conversion for unit: ' + fromUnit);
	}
	
	conversionFn = conversion[lib][toUnit];
	if (!conversionFn) {
		throw new Error('No conversion from ' + originalUnit + ' to target unit: ' + toUnit);
	}
	
	return conversionFn;
};
```

Next we declare our [FilterDescriptor]s. A [FilterDescriptor] is an object that defines an `include` function that takes as an argument either an
`HTMLTableCellElement` or `HTMLTableRowElement`. Which [HTMLTableWrapper] ends up passing depends upon whether the [FilterDescriptor] has the
`columnIndex` property defined. If `columnIndex` is a positive number, the argument will be an `HTMLTableCellElement` corresponding to the cell
at `columnIndex` within the relevant row, otherwise it will be the `HTMLTableRowElement` itself. In either case, it must return a `boolean` indicating
whether the row should be kept, or filtered.

For this example, we define two such [FilterDescriptor]s. One for filtering based upon highs and lows, which uses `columnIndex`, and the other for
filtering based upon swings, which does not. Both, though, take a 'greater than' and 'less than or equal to' number that defines the filter's range:
``` javascript
// HighLowFilter
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
//

// SwingFilter
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
	
	currentSwing = Number.parseFloat(cells[this.highColumnIndex].textContent) - Number.parseFloat(cells[this.lowColumnIndex].textContent)
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
//
```

Our listener class for the category inputs takes a [HTMLTableWrapper] to call on in response to events, the `categoryInputs` themselves, as well
as the index of the high and low temperature columns on the backing table:
``` javascript
function TemperatureCategoryListener(HTMLTableWrapper, categoryInputs, highColumnIndex, lowColumnIndex) {
	'use strict';
	
	this.HTMLTableWrapper = HTMLTableWrapper;
	this.categoryInputs = categoryInputs;
	this.highColumnIndex = highColumnIndex;
	this.lowColumnIndex = lowColumnIndex;
}
```

It follows the typical init/dispose/handleEvent pattern with it adding itself as a click listener to the category inputs in init, removing itself 
in dispose, and delegating to the relevant processing function(s) in `handleEvent`. In this case, `handleEvent` is quite simple, it just delegates
directly to `updateTable`:
``` javascript
TemperatureCategoryListener.prototype.handleEvent = function () {
	'use strict';
	
	this.updateTable();
};
```

The `updateTable` function is, itself, rather simple, as well. It builds a series of [FilterDescriptor]s based upon which of the category inputs
are selected. It then decides on an approprite constructor call (defined earlier) based upon the class of the input:
``` javascript
TemperatureCategoryListener.prototype.updateTable = function () {
	'use strict';
	
	var HTMLTableWrapper, categoryInputs, i, input, tableFilters, classList, highColumnIndex, lowColumnIndex, gt, lte;
	
	HTMLTableWrapper = this.HTMLTableWrapper;
	categoryInputs = this.categoryInputs;
	highColumnIndex = this.highColumnIndex;
	lowColumnIndex = this.lowColumnIndex;
	
	tableFilters = [];
	for (i = 0; i < categoryInputs.length; ++i) {
		input = categoryInputs[i];
		if (!input.checked) {
			continue;
		}
		
		if (input.value === 'none') {
			continue;
		}
		
		gt = Number.parseFloat(input.getAttribute(TemperatureConversionListener.CURRENT_GT_ATTRIBUTE));
		lte = Number.parseFloat(input.getAttribute(TemperatureConversionListener.CURRENT_LTE_ATTRIBUTE));
		
		classList = input.classList;
		if (classList.contains('high')) {
			tableFilters.push(new HighLowFilter(highColumnIndex, gt, lte));
		} else if (classList.contains('low')) {
			tableFilters.push(new HighLowFilter(lowColumnIndex, gt, lte));
		} else if (classList.contains('swing')) {
			tableFilters.push(new SwingFilter(gt, lte, highColumnIndex, lowColumnIndex));
		}
	}
	
	HTMLTableWrapper.filter(tableFilters);
};
```


Finally, we declare our [SortDescriptor]s. [SortDescriptor]s are quite similar to [FilterDescriptor]s, only they, instead, define an `include`
function that takes two `HTMLTableCellElement`s or `HTMLTableRowElement`s, depending upon whether or not its `columnIndex` property is a
positive number. The return value for `include` is an integer: negative if the first argument should be sorted below the second, positive
if it should be sorted above, and zero if there's no preference.

The [SortDescriptor]s for this example are quite similar to the [FilterDescriptor]s:
``` javascript
// HighLowSortDescriptor
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
//



// SwingSortDescriptor
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
	
	aSwing = Number.parseFloat(aCells[highColumnIndex].textContent) - Number.parseFloat(aCells[lowColumnIndex].textContent);
	bSwing = Number.parseFloat(bCells[highColumnIndex].textContent) - Number.parseFloat(bCells[lowColumnIndex].textContent);
	
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
//
```

With those, we declare a listener for the sort inputs that makes calls to a backing [HTMLTableWrapper]:
``` javascript
function TemperatureSortListener(HTMLTableWrapper, sortInputs, highColumnIndex, lowColumnIndex) {
	'use strict';
	
	this.HTMLTableWrapper = HTMLTableWrapper;
	this.sortInputs = sortInputs;
	this.highColumnIndex = highColumnIndex;
	this.lowColumnIndex = lowColumnIndex;
}
```

It, too follows the typical init/dispose/handleEvent paradigm, though its `handleEvent` function is slightly more complex
due to the function to which it delegates (`toSort`) takes two arguments:
``` javascript
TemperatureSortListener.CATEGORY_ATTRIBUTE_NAME = 'data-category';

// ...

TemperatureSortListener.prototype.handleEvent = function (event) {
	'use strict';
	
	var target;
	
	target = event.target;
	
	this.doSort(target.getAttribute(TemperatureSortListener.CATEGORY_ATTRIBUTE_NAME), target.value);
};
```

The `doSort` function constructs a single `SortDescriptor` if an applicable input is selected, otherwise [clear]s the sorted state of the
backing [HTMLTableWrapper]:
``` javascript
TemperatureSortListener.prototype.doSort = function (category, direction) {
	'use strict';
	
	var HTMLTableWrapper, highColumnIndex, lowColumnIndex, descending, sortDescriptor;
	
	HTMLTableWrapper = this.HTMLTableWrapper;
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
		HTMLTableWrapper.sort(sortDescriptor);
	} else {
		HTMLTableWrapper.clearSort();
	}
};
```

The page initialization script, in this case, looks like this:
``` html
<script>

var HIGH_COLUMN_INDEX = 2;
var LOW_COLUMN_INDEX = 3;

document.addEventListener('DOMContentLoaded', function () {
	'use strict';
	
	var table, categoryFieldGroup, unitInputs, HTMLTableWrapper, categoryInputs, sortInputs;
	
	table = document.getElementById('temperatures');
	categoryFieldGroup = document.getElementById('temperatureCategories');
	unitInputs = document.getElementsByClassName('temperature-unit');
	HTMLTableWrapper = new HTMLTableWrapper(table);
	categoryInputs = document.getElementsByClassName('temperature-category');
	sortInputs = document.getElementsByClassName('temperature-sort');
	
	new TemperatureConversionListener(table, categoryFieldGroup, tempConversions, unitInputs).init();
	new TemperatureCategoryListener(HTMLTableWrapper, categoryInputs, HIGH_COLUMN_INDEX, LOW_COLUMN_INDEX).init();
	new TemperatureSortListener(HTMLTableWrapper, sortInputs, HIGH_COLUMN_INDEX, LOW_COLUMN_INDEX).init();
	
});
</script>
```