
# SimpleDataTable.js

---------------------------------------------------------------------------------------------------------------------------------------

SimpleDataTable.js is a standalone, lightweight, completely pluggable library for the arbitrary sorting and filtering of "typical"
HTML table elements. The easiest way to get up-and-running with SimpleDataTable.js is to use its "full" distribution:

``` html
<link rel="stylesheet" href="{{full-dist-style}}" />
<script src="{{full-dist-url}}"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
	'use strict';
	new SimpleDataTableListener(document.getElementById('myTable').init();
});
</script>
```

## Installation/Distributions
- Full
	A fully featured, end-user friendly distribution. This package is the easiest one with which to get started with SimpleDataTable.js
- Utility
	Includes the minimal distribution with a couple extra classes that include the same functionality presented in the full distribution,
	but no UI elements. Use this if you want the same functionality as the full distribution, but want to define your own UI hooks to call on
	SimpleDataTable.js.
- Minimal
	Includes only the bare minimum to use SimpleDataTable.js. Use this if you only need the behavior defined by SimpleDataTable.js, but
	want to define your own data processing functions, as well as your own UI hooks.

## Compatibility
SimpleDataTable.js is compatible with modern desktop and mobile browsers, as well as MS Internet Explorer down to version 8.

## API Overview
At its core, SimpleDataTable.js is only coordinates sorting and filtering for a given HTML table element; the definition of how actual 
data within a table is to be treated, as well as calls to trigger the sorting and filtering of that table are completely up to the client. The 
utility and full distributions build on SimpleDataTable.js's core, and provide more concrete functionality that handles the vast majority of 
use-cases, but clients are, by no means, required to use them. 


## Motivation
Although true there are a multitude of other libraries in existence that perform similar functions to SimpleDataTable.js, most require the 
importation of supporting libraries, offer many unneeded features, with few required features, and lend themselves poorly to customization. 
The motivation behind SimpleDataTable.js is to serve as a free, standalone, (semi-)lightweight, more flexible alternative to all the other 
HTML table processing libraries available.


## Documentation
The API Documentation for SimpleDataTable.js is hosted using [GitHub Pages]({{doc-url}}). 


# Usage Examples

---------------------------------------------------------------------------------------------------------------------------------------

## A Simple Table
Consider the simple example of a webpage that shows a gradebook:

``` html
<table id="grades">
	<thead>
		<tr>
			<th>Last Name</th>
			<th>First Name</th>
			<th>Assignment</th>
			<th>Grade</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Smith</td>
			<td>John</td>
			<td>Homework #1</td>
			<td>C</td>
		</tr>
		<tr>
			<td>Wimbleton</td>
			<td>Julie</td>
			<td>Homework #1</td>
...
```

Adding the default sort/filter dialogue to the table is as simple as adding something akin to the following to your webpage:

``` html
<!DOCTYPE html>
<html>
<head>
<title>SimpleDataTable.js - Gradebook</title>
<script src="../simple-data-table.min.js"></script>
<script>

document.addEventListener('DOMContentLoaded', () => {
	'use strict';
	
	new SimpleDataTableListener(document.getElementById('grades')).init();
});

</script>
...
```

The full example can be found [here](examples/basic/gradebook.html).


## Changing How Cells Are Interpreted
Often the default mode of determining a cell's content isn't quite enough. When dealing with tables that have cells that follow a particular
format, a [CellInterpreter]({{link-to-doc}}) can be used to tell SimpleDataTable.js how to handle them.

Consider a webpage that aggregates drink recipes in a table. The columns that show the ingredients and mixing steps would have list elements
detailing each:
``` html
...
<table id="drinks">
	<thead>
		<tr>
			<th>Drink</th>
			<th>Source</th>
			<th>Ingredients</th>
			<th>Instructions</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Manhattan (Traditional)</td>
			<td><a href="https://www.makersmark.com/cocktails/makers-46-manhattan">Maker's Mark</a></td>
			<td>
				<ul>
					<li>Bourbon(2 parts)</li>
					<li>Sweet Vermouth(1 part)</li>
					<li>Bitters(2 dashes)</li>
					<li>Maraschino Cherry</li>
				</ul>
			</td>
			<td>
				<ol>
					<li>Combine Bourbon, Vermouth and Bitters in a mixing glass</li>
					<li>Stir and strain into a chilled cocktail glass neat, or on the rocks</li>
					<li>Garnish with cherry</li>
				</ol>
			</td>
		</tr>
		<tr>
			<td>Manhattan (Traditional)</td>
			<td><a href="https://www.allrecipes.com/recipe/222415/manhattan-cocktail">Allrecipes</a></td>
			<td>
				<ul>
					<li>Rye(2 oz)</li>
					<li>Sweet Vermouth(1/2 oz)</li>
...
```

By default SimpleDataTable.js simply considers the `textContent` of each cell as its content, however, in this case such would not be desirable,
particularly for columns 3 and 4 (index 2 and 3). For this purpose, you can define a `CellInterpreter`.

A valid `CellInterpreter` is a function, or an object that defines a function called `populateCellValues`, that takes the arguments of a cell and 
a [ColumnValueSet]({{link-to-doc}}) of values already identified for the column and adds all the values logically contained within the cell to the set. 
For the case of interpreting list cells, the following accomplishes this (note, returning a value that evaluates to `true` from this function will
trigger default processing; returning `true` indicates the interpretation of the cell should be deferred to the default implementation):
``` javascript
function interpretListCell(cell, values) {
	'use strict';
	
	var listElements, i;
	
	listElements = cell.getElementsByTagName('li');
	if (!listElements.length) {
		return true;
	}
	
	for (i = 0; i < listElements.length; ++i) {
		values.add(listElements[i].textContent);
	}
	
	// Not strictly necessary; permissable to not have a return value. (No return statement implies a return value of undefined.)
	return false;
}
```

After a `CellInterpreter` implementation is defined, it must be passed to the relevant [SimpleDataTableListener]({{link-to-doc}}) (as argument index
2; the previous argument, if defined, is a `ColumnControlFactory`, which is covered in the next example):
```javascript
<script>
document.addEventListener('DOMContentLoaded', function () {
	'use strict';
	
	new SimpleDataTableListener(document.getElementById('drinks'), null, interpretListCell).init();
});
</script>
```

The entire working example can be found [here](examples/drinks/drinks.html).


## Defining Custom Controls
Sometimes tables present specialized data for which the default dialogue isn't necessarily a good fit. In these cases, a [ColumnControlFactory]({{link-to-doc}})
can be defined to return custom [ColumnControl]({{link-to-doc}})s.

Consider a webpage that shows historical temperature readings from various cities around the world:
```html
...
<h1>Temperature Readings</h1>
<p>Source: <a href="https://weather.com">The Weather Channel</a></p>
<table id="temperatures">
	<thead>
		<th>City</th>
		<th>Date</th>
		<th class="temperature-column">High</th>
		<th class="temperature-column">Low</th>
	</thead>
	<tbody>
		<tr>
			<td>Washington, DC, US</td>
			<td>2020-01-28</td>
			<td class="fahrenheit" data-orig-unit="F" data-orig-temp="47">47</td>
			<td class="fahrenheit" data-orig-unit="F" data-orig-temp="40">40</td>
		</tr>
		<tr>
			<td>Washington, DC, US</td>
			<td>2020-01-27</td>
			<td class="fahrenheit" data-orig-unit="F" data-orig-temp="49">49</td>
			<td class="fahrenheit" data-orig-unit="F" data-orig-temp="36">36</td>
		</tr>
		<tr>
			<td>Washington, DC, US</td>
			<td>2020-01-26</td>
			<td class="fahrenheit" data-orig-unit="F" data-orig-temp="49">49</td>
			<td class="fahrenheit" data-orig-unit="F" data-orig-temp="36">36</td>
		</tr>
		<tr>
			<td>Washington, DC, US</td>
			<td>2020-01-25</td>
			<td class="fahrenheit" data-orig-unit="F" data-orig-temp="51">51</td>
			<td class="fahrenheit" data-orig-unit="F" data-orig-temp="43">43</td>
		</tr>
		<tr>
			<td>Washington, DC, US</td>
			<td>2020-01-24</td>
...
```

Suppose for the columns holding temperature data, a custom control is desired that presents the option to convert all the temperatures
in the column from one temperature unit to another, and provides a simple filter field for temperatures greater than, less than, equal
to, etc. to an entered temperature.

Though there are many different approaches to implementing something like this, this example will follow the following steps:
   1. Declare classes/functions/objects necessary to ecapsulate the desired custom functionality.
   2. Declare a [ColumnControl]({{link-to-doc}}) that defines the content of the custom control, calls back to its parent
      [SimpleDataTableListener]({{link-to-doc}}) to trigger table processing in response to events on the custom control, and
	  uses the custom declarations from the previous step to tell its parent how the table is to be filtered (and, technically, sorted,
	  though sorting is not implemented in this example).
   3. Declare a [ColumnControlFactory]({{link-to-doc}}) that holds necessary custom supporting class instances, and returns
      instances of the previously declared [ColumnControl]({{link-to-doc}}) in response to requests for [ColumnControl]({{link-to-doc}})s
	  temperature-related columns.

Although possible to parse individual fields, and strip off the temperature unit affix in our script, this example opts to use an `::after`
CSS psudo element with a `content` rule to display units. This makes reading temperatures into our scripts much easier:
``` css
.fahrenheit::after {
	content: '\00B0 F';
}

.celsius::after {
	content: '\00B0 C';
}

.kelvin::after {
	content: '\00B0 K';
}
```

We also need to define how one temperature is to be converted to another, and, additionally, which class name (adering to the CSS rules above)
each cell containing a temperature for a given unit should posess. To this end, we define individual conversion functions, and compose them into
a 'library' or 'lookup' object that describes each individual unit we support:
``` javascript
function tempIdent(temp) {
	'use strict';
	
	return temp;
}

function tempFToC(temp) {
	'use strict';
	
	return (5/9) * (temp - 32);
}

function tempCToF(temp) {
	'use strict';
	
	return temp * (9/5) + 32;
}

function tempKToC(temp) {
	'use strict';
	
	return temp - 273.15;
}

function tempCToK(temp) {
	'use strict';
	
	return temp + 273.15;
}


var temperatureDescriptions = {
	'C': {
		toTemp: {
			'F': tempCToF
			, 'K': tempCToK
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
		, className: 'fahrenheit'
	}
	, 'K': {
		toTemp: {
			'C': tempKToC
			, 'F': function (temp) {
				'use strict';
				
				return tempCToF(tempKToC(temp));
			}
			, 'K': tempIdent
		}
		, className: 'kelvin'
	}
};
```

Next we define a class that handles converting temperature columns on a backing table from one unit to another. As seen earlier in our HTML
definition, we use custom data attributes to avoid data loss on coversions: `data-orig-temp` for the original temperature reading, and
`data-orig-unit` for the unit in which the original was read. When defining any external name a class uses for processing, it's always a good
idea to declare them clearly as static fields:
``` javascript
TemperatureConverter.ORIGINAL_TEMPERATURE_READING_ATTRIBUTE = 'data-orig-temp';
TemperatureConverter.ORIGINAL_TEMPERATURE_UNIT_ATTRIBUTE = 'data-orig-unit';
```

We also want this class to handle the formatting of results of conversions to a certain maximum number of decimal places. To this end, we use
`Number.prototype.toFixed`, but we need to bear in mind there are a couple caveats:
   1. Internal floating point (numeric) representations of certain fractions can actually be below the logical (mathematical) value. This can
      cause unexpected results in rounding. E.g. `0.35.toFixed(1) === '0.3'` because the numeric representation of `0.35` is actually
	  `0.3499999999999999778...`.
   2. The `toFixed` will, as its name implies, always return the result formatted to the given number of decimal places, padding zeros where
      necessary.

To address the first concern, we exploit the fact that we're not dealing with atronomically small values, and can therefore add a small value to
to each value we're formatting that is negligibly small compared to the that value, but large enough to ensure the floating point representation
is greater than or equal to the logical value. We use `2 * Number.EPSILON` to this effect (we multiply by 2 to ensure the offset is large enough
to affect the rounding; `Number.EPSILON` is considered a zero-value in floating point terms, and may not always be enough to affect rounding). Of
note, in order for this to be effective, all values must be converted to their absolute value, so the addition proceeds in the approprite direction.

To address the second concern, we can simply take a substring of the result of the `toFixed` function up to the last trailing 0, or up to the decimal
point if all the digits after the decimal point are trailing zeros. The end result looks like this:
``` javascript
TemperatureConverter.strRoundToMax = function (num, places) {
	'use strict';
	
	var sign, fixed, decimalPointIndex, trailingZeroIndex, result;
	
	// Store sign, convert to absolute value for EPSILON offset.
	sign = Math.sign(num);
	num = Math.abs(num);
	
	// Calculate fixed representation of EPSILON offset.
	fixed = (num + 2 * Number.EPSILON).toFixed(places);
	
	// Determine whether a substring of the fixed representation needs to be returned.
	decimalPointIndex = fixed.indexOf('.');
	trailingZeroIndex = fixed.indexOf('0', decimalPointIndex);
	
	if (trailingZeroIndex == -1) { // If there are no trailing zeros, the fixed representation is the result.
		result = fixed;
	} else if (trailingZeroIndex === decimalPointIndex + 1) { // If the first digit after the decimal point is a zero, no decimal point is needed.
		result = fixed.substring(0, decimalPointIndex);
	} else { // Otherwise, the result is the substring of the fixed representation including the decimal, and all significant digits after.
		result = fixed.substring(0, trailingZeroIndex);
	}
	
	// Return the result calculated above, with the original sign applied.
	return sign < 0 ? '-' + result : result;
};
```

Finally, we define a function `convertColumn` that takes the arguments `columnIndex` and the target `unit`:
``` javascript
TemperatureConverter.prototype.convertColumn = function (columnIndex, unit) {
...
// for each row
// Obtain original reading for cell.
	cell = row.cells[columnIndex];
	originalUnit = cell.getAttribute(TemperatureConverter.ORIGINAL_TEMPERATURE_UNIT_ATTRIBUTE);

	// Obtain descriptor for original unit.
	fromDescription = temperatureDescriptions[originalUnit];
	if (!fromDescription) {
		throw new ReferenceError('No description found for original column unit: ' + originalUnit);
	}

	// Obtain conversion function to target unit.
	conversionFn = fromDescription.toTemp[unit];
	if (!conversionFn) {
		throw new ReferenceError('No conversion found from original unit ' + originalUnit + ' to desired unit: ' + unit);
	}

	// Read in original reading.
	originalTempRaw = cell.getAttribute(TemperatureConverter.ORIGINAL_TEMPERATURE_READING_ATTRIBUTE)
	originalTemp = Number.parseFloat(originalTempRaw);
	if (Number.isNaN(originalTemp)) {
		throw new Error('Unable to parse original temperature reading for row ' + i + ': ' + originalTempRaw);
	}

	// Convert, format, and set result to the current cell's textContent.
	cell.textContent = TemperatureConverter.strRoundToMax(conversionFn(originalTemp), 2);

	// Obtain descriptor for target unit.
	toDescription = temperatureDescriptions[unit];
	if (!toDescription) {
		throw new ReferenceError('No description found for desired unit: ' + unit);
	}

	// Apply target unit class name to cell.
	cell.className = toDescription.className;
...
```

The next step is to declare a [ColumnControl]({{link-to-doc}}) that makes use of the `TemperatureConverter` declared previously. A 
[ColumnControl]({{link-to-doc}}) is a special object that defines functions its parent [SimpleDataTableListener]({{link-to-doc}}) calls
to [open], [close], and determine how its column should be [sorted] and [filtered]. [ColumnControl]s can optionally (and will typically)
make calls back to their parent to trigger table-wide processing via [processTable].

As can be guessed, [open] and [close] are responsible for defining the content of, showing, and hiding the user interface dialogue
for the column they control. Although there are a good deal many ways to do this, this example makes use of another class defined within
the full distribution of SimpleDataTable.js: [ContextControl].

A [ContextControl] is a convenience class that defines an `HTMLDivElement` as a 'content box', and handles positioning it relative to another
element, adjusting to small window sizes, and hiding it when [close]d. Its model for defining content is 'lazy initialization;' upon the first
call to its [open] method, it will dispatch a `create` event to anything that has added itself as a listener to it via `addEventListener`.
Content should be defined in the handlers of this event.

With that, we can define our constructor:
``` javascript
function TemperatureColumnControl(columnIndex, parent, temperatureConverter) {
	'use strict';
	
	this.columnIndex = columnIndex;						// Column Index this control handles
	this.parent = parent;								// Parent SimpleDataTableListener
	this.temperatureConverter = temperatureConverter;	// TemperatureConverter, defined previously
	this.contextControl = new ContextControl();			// Backing ContextControl
}
```

Although completely valid to do so in the constructor, the code in this example (and, more generally, this API) prefers to define separate
initialization methods in which event listeners are registerd. Below is the initialization method for `TemperatureColumnControl`, where it adds
itself as a listener on its own [ContextControl]:
``` javascript
TemperatureColumnControl.prototype.init = function () {
	'use strict';
	
	this.contextControl.addEventListener('create', this, false);
};
```

As [ContextControl] handles standard `EventListener`s, and `TemperatureColumnControl` has added itself as a listener to its [ContextControl],
it must define a `handleEvent` function. Here is the snippit relevant to [ContextControl]:
``` javascript
TemperatureColumnControl.prototype.handleEvent = function (event) {
	'use strict';
	
	var target;
	
	target = event.target;
	
	switch (event.type) {
		case 'create':
			this.defineContent(target.getControlElement());
			break;
// ...
```

As can be seen, we defer to another method to handle the definition of content in response to `create` events. We pass this method the backing
'content box' of our [ContextControl]. This method is then responsible for adding the relevant content to it.

Again, though there are many ways to define such content, this example uses another class defined with the full distribution of simpleDataTable.js:
[XMLBuilder]. [XMLBuilder] is a simple builder for XML strings that 'escapes' (replaces with corresponding entities) all reserved XML characters in
the data passed to it. It presents a simple, state-based, interface allowing client code to `startTag`s, add `attributes` to them, define their
`content`, and `closeTag`s that are completed.

Additionally, `defineContent` defines labeled inputs, so we also define a utility function that uses an internal counter for generating document-unique 
id's for them:
``` javascript
TemperatureColumnControl.idCounter = 0;

TemperatureColumnControl.getIdBase = function () {
	'use strict';
	
	return 'temperatureControl_ ' + TemperatureColumnControl.idCounter++ + '_';
};
```

We then use that function in `defineContent` to generate the unique id's we need, use them with an [XMLBuilder] to build our content string, and then
use the `insertAdjacentHTML` function of `container` to add the created content to it (note, a unique name is also generated for the set of unit radio
buttons to ensure correct behavior between controls):
``` javascript
TemperatureColumnControl.prototype.defineContent = function (container) {
	'use strict';
	
	var builder, idBase, fId, cId, kId, unitInputSetName, operatorId, operandId, clickTargets, i;
	
	builder = new XMLBuilder();
	idBase = TemperatureColumnControl.getIdBase();
	
	// Generate ids.
	fId = idBase + 'fInput';
	cId = idBase + 'cInput';
	kId = idBase + 'kInput';
	operatorId = idBase + 'operator';
	operandId = idBase + 'operand';
		
	// Generate names.
	unitInputSetName = idBase + 'temperatureInput';
	
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
```

As can be seen above, after the content is inserted (and HTML DOM elements generated), `TemperatureColumnControl` adds itself as a listener to
relevant `EventTarget`s on the control. This implies we need to add a bit more to our `handleEvent` function:
``` javascript
TemperatureColumnControl.prototype.handleEvent = function (event) {
	'use strict';
	
	var target;
	
	target = event.target;
	
	switch (event.type) {
// ...
		case 'click':
			if (target.classList.contains('temperature-unit')) {	// Unit change.
				this.convertTo(target.value);
			} else if (target.classList.contains('close-button')) {		// Close button.
				this.close();
			}
			break;
			
		// Filter operator or operand change.
		case 'change':
		case 'keyup':
			this.updateParent();
			break;
// ...
```

All these actions defer to other functions defined on `TemperatureColumnControl`, but, fortunally, their definition is quite simple. (Note the call
to [position] in `updateParent` after [processTable]. This is to reposition the control close to its parent column header after the table is processed, 
as when rows are added/removed, the widths of columns often change for auto-sized tables.)
``` javascript
TemperatureColumnControl.prototype.convertTo = function (unit) {
	'use strict';
	
	this.temperatureConverter.convertColumn(this.columnIndex, unit);
};

TemperatureColumnControl.prototype.close = function () {
	'use strict';
	
	this.contextControl.close();
};

TemperatureColumnControl.prototype.updateParent = function () {
	'use strict';
	
	this.parent.processTable();
	this.contextControl.position();
};
```


This largely completes our definition of `TemperatureColumnControl`. The only non-trival method that needs to be defined is `getFilterDescriptor`, which is
called by [SimpleDataTableListener] upon calls to [processTable]. In this case, we return a [SimpleFilterDescriptor] in the case the value entered for the
temperature filter on the control can be parsed as a number, otherwise, we return nothing (which indicates no filtering should be performed on this column).
(Note also how the control element of the backing [ContextControl] is accessed; because it is lazily initialized, it can't, in all cases, be assumed to be
defined).
``` javascript
TemperatureColumnControl.prototype.getFilterDescriptor = function () {
	'use strict';
	
	var controlElement, rawOperand, operand;
	
	controlElement = this.contextControl.getControlElement();
	if (!controlElement) {
		return null;
	}
	
	operand = Number.parseFloat(controlElement.querySelector('.temperature-filter-operand').value);
	if (Number.isNaN(operand)) {
		return null;
	}
	
	return new SimpleFilterDescriptor(this.columnIndex, operand, controlElement.querySelector('.temperature-filter-operator').value);
};

```


After this, we need only a couple more declarations to complete our [ColumnControl]:
``` javascript
TemperatureColumnControl.prototype.open = function () {
	'use strict';
	
	this.contextControl.open(this.parent.getTableHeaderElement(this.columnIndex));
};

TemperatureColumnControl.prototype.getSortDescriptor = function () {
	'use strict';
	
	// Not strictly necessary; no return statement implies a return value of undefined.
	return null;
};
```

With our custom [ColumnControl] defined, we need to declare a [ColumnControlFactory] to return it when approprite. A [ColumnControlFactory] is
either a function, or an object that declares a function called `getColumnControl` that takes the arguments of `columnIndex` (the column index
for which a [ColumnControl] is being requested) and `parent` (the [SimpleDataTableListener] requesting the control).

In the case of this example, we use the object-based [ColumnControlFactory], as we want to share one instance of our `TemperatureConverter`:
``` javascript
function TemperatureColumnControlFactory(temperatureConverter) {
	'use strict';
	
	this.temperatureConverter = temperatureConverter;
}

TemperatureColumnControlFactory.prototype.getColumnControl = function (columnIndex, parent) {
	'use strict';
	
	if (parent.getTableHeaderElement(columnIndex).classList.contains('temperature-column')) {
		return new TemperatureColumnControl(columnIndex, parent, this.temperatureConverter);
	}
	
	// Not strictly necessary; no return statement implies a return value of undefined.
	return null;
};
```

Now that all the necessary declarations have been made, we use them in our page initialization handler (note `temperatureDescriptions` is defined
globally, see [earlier] in this example):
``` javascript
<script>

document.addEventListener('DOMContentLoaded', function () {
	'use strict';
	
	var table;
	
	table = document.getElementById('temperatures');
	
	new SimpleDataTableListener(table, new TemperatureColumnControlFactory(new TemperatureConverter(table, temperatureDescriptions))).init();
});

</script>
```

## Using SimpleDataTable.js Directly
SimpleDataTable.js can be used directly in your own controls. The utility distribution comes with some helper classes that make this a bit
easier: [SimpleSortDescriptor]({{link-to-doc}}) and [SimpleFilterDescriptor]({{link-to-doc}}).

Consider the gradebook example from earlier. Say you don't need/want the full functionality of the standard distribution, but just the
ability to sort the table, and filter grades by whether they're passing or failing. The utility distribution can be effectively used to this
end, but there's a little more coding you'll have to do.

First off, the options for filtering by category need to be defined. In the example, this is inserted just before the table definition:
``` html
<body>
	<h1>Gradebook</h1>
	<div>
		<span>Show:</span>
		<span>
			<input id="gradeCategoryAll" class="grade-category" type="radio" name="gradeCategory" value="all" checked />
			<label for="gradeCategoryAll">All</label>
		</span>
		<span>
			<input id="gradeCategoryPassing" class="grade-category" type="radio" name="gradeCategory" value="passing" />
			<label for="gradeCategoryPassing">Passing</label>
		</span>
		<span>
			<input id="gradeCategoryFailing" class="grade-category" type="radio" name="gradeCategory" value="failing" />
			<label for="gradeCategoryFailing">Failing</label>
		</span>
	</div>
	<table id="grades">
		<thead>
			<tr>
				<th>Last Name</th>
				<th>First Name</th>
				<th>Assignment</th>
				<th>Grade</th>
			</tr>
...
```

Next, you'll need to code an event listener for the table header cells that handle click events, and sort the column based upon how it's sorted
currently. The example code implements this in `ClickSortListener`. `ClickSortListener` maintains a class name on the table header being sorted, and loops
between three column states: not sorted -> sorted ascending -> sorted descending, and calls `SimpleDataTable`'s [sort]({{link-to-doc}})
function with a [SimpleSortDescriptor]({{link-to-doc}}) each time a column header is clicked. If a different column header is clicked than the 
one before, the previous column's state is cleared. Below is a snippet from `ClickSortListener`'s `handleEvent` function:
``` javascript
...
	// Setup.
	simpleDataTable = this.simpleDataTable;
	tableHeaderCache = this.tableHeaderCache;
	header = event.target;
	
	// Error conditions.
	columnIndex = tableHeaderCache.indexOf(header);
	if (columnIndex === -1) {
		throw new Error('Unrecognized column.');
	}
	
	// Clear last sorted column.
	lastColumnIndex = this.lastColumnIndex;
	if (lastColumnIndex !== -1 && columnIndex !== lastColumnIndex) {
		headerClassList = tableHeaderCache[lastColumnIndex].classList;
		headerClassList.remove(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
		headerClassList.remove(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
	}
	this.lastColumnIndex = columnIndex;
	
	// Sort requested column.
	headerClassList = header.classList;
	if (headerClassList.contains(ClickSortListener.ASCENDING_SORT_CLASS_NAME)) {
		headerClassList.remove(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
		headerClassList.add(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
		
		simpleDataTable.sort(new SimpleSortDescriptor(columnIndex, true));
	} else if (headerClassList.contains(ClickSortListener.DESCENDING_SORT_CLASS_NAME)) {
		headerClassList.remove(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
		
		simpleDataTable.clearSort();
	} else {
		headerClassList.add(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
		
		simpleDataTable.sort(new SimpleSortDescriptor(columnIndex, false));
	}
...
```

You'll also need to code an event listener to handle filtering by grade category, and have it call on `SimpleDataTable`'s [filter]({{link-to-doc}})
function when a category is selected on the screen. The example code implements this in `GradeCategoryListener`. The relevant snippet from
`GradeCategoryListener`'s `handleEvent` function is below:
``` javascript
...
	simpleDataTable = this.simpleDataTable;
	gradeColumnIndex = this.gradeColumnIndex;
	
	switch (category) {
		case 'passing':
			simpleDataTable.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '<='));
			break;
		case 'failing':
			simpleDataTable.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '>'));
			break;
		case 'all':
		default:
			simpleDataTable.clearFilter();
			break;
	}
...
```

With those two classes implemented, you page initialization script will look a little different:
``` html
<script src="grade-controls.js"></script>
<script>

document.addEventListener('DOMContentLoaded', function () {
	'use strict';
	
	var simpleDataTable, gradeCategoryInputs;
	
	simpleDataTable = new SimpleDataTable(document.getElementById('grades'));
	gradeCategoryInputs = document.getElementsByClassName('grade-category');
	
	new ClickSortListener(simpleDataTable).init();
	new GradeCategoryListener(simpleDataTable, 3, gradeCategoryInputs).init();
});

</script>
```

The entire working example can be found [here](examples/gradebook-minimal/gradebook-minimal.html).


## An Entirely Custom Implementation
All the previous examples used 'helper' classes defined to assist in the use of [SimpleDataTable], but it is worthy of note that none of these
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
      to the [filter] function of [SimpleDataTable].
   3. A third that listens for click events on the sort fields, and passes an approprite [SortDescriptor] to the [sort] function of [SimpleDataTable].

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
`HTMLTableCellElement` or `HTMLTableRowElement`. Which [SimpleDataTable] ends up passing depends upon whether the [FilterDescriptor] has the
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

Our listener class for the category inputs takes a [SimpleDataTable] to call on in response to events, the `categoryInputs` themselves, as well
as the index of the high and low temperature columns on the backing table:
``` javascript
function TemperatureCategoryListener(simpleDataTable, categoryInputs, highColumnIndex, lowColumnIndex) {
	'use strict';
	
	this.simpleDataTable = simpleDataTable;
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
	
	var simpleDataTable, categoryInputs, i, input, tableFilters, classList, highColumnIndex, lowColumnIndex, gt, lte;
	
	simpleDataTable = this.simpleDataTable;
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
	
	simpleDataTable.filter(tableFilters);
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

With those, we declare a listener for the sort inputs that makes calls to a backing [SimpleDataTable]:
``` javascript
function TemperatureSortListener(simpleDataTable, sortInputs, highColumnIndex, lowColumnIndex) {
	'use strict';
	
	this.simpleDataTable = simpleDataTable;
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
backing [SimpleDataTable]:
``` javascript
TemperatureSortListener.prototype.doSort = function (category, direction) {
	'use strict';
	
	var simpleDataTable, highColumnIndex, lowColumnIndex, descending, sortDescriptor;
	
	simpleDataTable = this.simpleDataTable;
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
		simpleDataTable.sort(sortDescriptor);
	} else {
		simpleDataTable.clearSort();
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
	
	var table, categoryFieldGroup, unitInputs, simpleDataTable, categoryInputs, sortInputs;
	
	table = document.getElementById('temperatures');
	categoryFieldGroup = document.getElementById('temperatureCategories');
	unitInputs = document.getElementsByClassName('temperature-unit');
	simpleDataTable = new SimpleDataTable(table);
	categoryInputs = document.getElementsByClassName('temperature-category');
	sortInputs = document.getElementsByClassName('temperature-sort');
	
	new TemperatureConversionListener(table, categoryFieldGroup, tempConversions, unitInputs).init();
	new TemperatureCategoryListener(simpleDataTable, categoryInputs, HIGH_COLUMN_INDEX, LOW_COLUMN_INDEX).init();
	new TemperatureSortListener(simpleDataTable, sortInputs, HIGH_COLUMN_INDEX, LOW_COLUMN_INDEX).init();
	
});
</script>
```

# Administrivia

---------------------------------------------------------------------------------------------------------------------------------------

## License

## Reporting Issues

## Contributing

## Building
SimpleDataTable.js uses [Gulp](https://gulpjs.com/) to build its distribution package. All build dependencies are listed in SimpleDataTable.js's 
source repository package.json, with the only exception of the gulp-cli, which it assumes is installed globally. I.e. the following should be 
sufficient for a first time setup (it is also assumed [node.js](https://nodejs.org) is installed):

```
> npm i -g gulp-cli
> npm i
```

From there, `gulp` can be ran directly to build SimpleDataTable.js's distribution package:

```
> gulp
```

As you can see, SimpleDataTable.js does not follow the typical conventions of an NPM package in that its distribution package is not the same as 
its build package; the build produces a new directory containing the distribution package. This choice was made in preference to maintaining an
nmpignore file for clarity and conciceness; no files need to be inspected to see what is, or is not included the distribution. The distribution
is, simply, the newly created package. This also removes cluttering in the distribution's `package.json` file, as items related only to 
development (e.g. `devDependencies`) don't need to be specified.