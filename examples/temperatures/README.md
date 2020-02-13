# Defining Custom Controls

Sometimes tables present specialized data for which the default dialogue isn't necessarily a good fit. In these cases, a [ColumnControlFactory]({{link-to-doc}})
can be defined to return custom [ColumnControl]({{link-to-doc}})s.

Consider a webpage that shows historical temperature readings from various cities around the world:
```html
<!-- ... -->
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
<!-- ... -->
```

Suppose for the columns holding temperature data, a custom control is desired that presents the option to convert all the temperatures
in the column from one temperature unit to another, and provides a simple filter field for temperatures greater than, less than, equal
to, etc. to an entered temperature.

To implement this, we first define some supporting objects/classes. As these are not directly related to using HTMLTableWrapper.js, we
only explain them enough to make clear their function. For details on their implementation, consult the source files directly:
- [`conversions.js`](conversions.js)

   Defines direct temperature-to-temperature conversions, and wraps them in a 'dictionary' object describing them.

- [`TemperatureConverter`](TemperatureConverter.js)

   A helper class that takes the 'dictionary' object from `conversions.js` and a backing `HTMLTableElement` containing temperature-related
   data. It exports a single method: `convertTo(columnIndex, unit)`. As its name implies, the function converts the column `columnIndex` of
   the backing table to the given `unit`, rounded to the nearest hundredth. To avoid data loss, conversions are always performed based upon
   the `data-orig-temp` and `data-orig-unit` attributes.

Next, we declare a [`ColumnControl`] that makes use of `TemperatureConverter`. 

A [ColumnControl] is a special object that defines functions its parent [HTMLTableWrapperListener] calls on
to [open], [close], and determine how the control's column should be [sorted] and [filtered] based upon the its state. [ColumnControl]s can optionally (and will typically)
make calls back to their parent to trigger table-wide processing via [processTable].

This example makes use of another class defined within the full configuration of HTMLTableWrapper.js called [ContextControl].
A [ContextControl] is a convenience class that creates an `HTMLDivElement` as a 'content box', and handles positioning it relative to another
element, adjusting to small window sizes, and hiding it when [close]d. Its model for defining content is 'lazy initialization;' upon the first
call to its [open] method, it will dispatch a `create` event to anything that has added itself via `addEventListener`. Content should be defined 
in the handlers of this event.

With that, we can define our constructor `TemperatureColumnControl`, as well as its `init`, `open` and `close` functions:
``` javascript
function TemperatureColumnControl(columnIndex, parent, temperatureConverter) {
    'use strict';
    
    this.columnIndex = columnIndex;                      // Column Index this control handles
    this.parent = parent;                                // Parent HTMLTableWrapperListener
    this.temperatureConverter = temperatureConverter;    // TemperatureConverter
    this.contextControl = new ContextControl();          // Backing ContextControl
}

TemperatureColumnControl.prototype.init = function () {
    'use strict';
    
    this.contextControl.addEventListener('create', this, false);
};

TemperatureColumnControl.prototype.open = function () {
    'use strict';
    
    this.contextControl.open(this.parent.getTableHeaderElement(this.columnIndex));
};

TemperatureColumnControl.prototype.close = function () {
    'use strict';
    
    this.contextControl.close();
};
```

We also know we'll need to convert the temperatures of the column the `TemperatureColumnControl` owns using the backing `TemperatureConverter`:
``` javascript
TemperatureColumnControl.prototype.convertTo = function (unit) {
    'use strict';
    
    this.temperatureConverter.convertColumn(this.columnIndex, unit);
};
```

To define the control's content, we make use of another helper class defined in the full configuration: [XMLBuilder]. [XMLBuilder] is a simple 
builder for XML strings that 'escapes' (replaces with corresponding entities) all reserved XML characters in the data passed to it. It presents 
a simple, state-based, interface allowing client code to [`startTag`]s, add [`attribute`]s to them, define their [`content`], and [`closeTag`]s 
that are completed.

In our control's content, we will also make use of labeled fields, so we also need to define a mechanism for generating DOM IDs that are unique to the document.
To this end, we use a simple counter-based strategy where we return a unique 'base' string that is built upon to generate the ID for each individual field in a
single control:
``` javascript
TemperatureColumnControl.idCounter = 0;

TemperatureColumnControl.getIdBase = function () {
    'use strict';
    
    return 'temperatureControl_ ' + TemperatureColumnControl.idCounter++ + '_';
};
```

With that, we can declare the `defineContent` function. In it, we will build all the unique IDs we need, build our XML string, use `insertAdjacentHTML` to inject
it into the containing element, and then register to listen for various events on relevant elements in the control.
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
            .startTag('input').attribute('id', fId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName)
                    .attribute('value', 'F').attribute('type', 'radio').closeTag()
            .startTag('label').attribute('for', fId).attribute('class', 'fahrenheit').closeTag(true)
        .closeTag()
        .startTag('span')
            .startTag('input').attribute('id', cId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName)
                    .attribute('value', 'C').attribute('type', 'radio').closeTag()
            .startTag('label').attribute('for', cId).attribute('class', 'celsius').closeTag(true)
        .closeTag()
        .startTag('span')
            .startTag('input').attribute('id', kId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName)
                    .attribute('value', 'K').attribute('type', 'radio').closeTag()
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

We can now declare necessary [getFilterDescriptor] and [getSortDescriptor] callback functions. As we're not implementing sorting in this
example, [getSortDescriptor]'s definition is simple:
``` javascript
TemperatureColumnControl.prototype.getSortDescriptor = function () {
    'use strict';
    
    // Not strictly necessary; no return statement implies a return value of undefined.
    return null;
};
```

We base the [getFilterDescriptor] function on the state of the UI of our control:
``` javascript
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
```

With that, we can wire everything together in our `handleEvent` function. We also declare a distinct function for updating the parent. In it
we make the expected call to [processTable], but also reposition the [ContextControl] afterwards, as it is often the case column widths will change
in auto-sized tables after changes in the displayed rows.
``` javascript
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
            if (target.classList.contains('temperature-unit')) {    // Unit change.
                this.convertTo(target.value);
            } else if (target.classList.contains('close-button')) {        // Close button.
                this.close();
            }
            break;
            
        // Filter operator or operand change.
        case 'change':
        case 'keyup':
            this.updateParent();
            break;
    }
};

TemperatureColumnControl.prototype.updateParent = function () {
    'use strict';
    
    this.parent.processTable();
    this.contextControl.position();
};
```

We next declare a [ColumnControlFactory] that returns instances of `TemperatureColumnControl`s for temperature related columns. A [`ColumnControlFactory`] is
a function or an object that declares a function called `getColumnControl` that takes the arguments of the `columnIndex` for which a column control is being
requested, and the `parent` [HTMLTableWrapperListener]. If the factory supports the column, it should return an appropriate [ColumnControl], otherwise it is
permissable to return nothing.

Because we share one instance of `TemperatureConverter` in this example, we use the object-based approach:
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


The page initialization scripts will, then, look like this:
``` html
<script src="TemperatureConverter.js"></script>
<script src="TemperatureColumnControl.js"></script>
<script src="TemperatureColumnControlFactory.js"></script>
<script>

document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    
    var table;
    
    table = document.getElementById('temperatures');
    
    new HTMLTableWrapperListener(table, new TemperatureColumnControlFactory(new TemperatureConverter(table, temperatureDescriptions))).init();
});

</script>
```