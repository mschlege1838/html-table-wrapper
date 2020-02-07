# Defining Custom Controls

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