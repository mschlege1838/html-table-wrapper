# Using HTMLTableWrapper.js Directly

HTMLTableWrapper.js can be used directly in your own controls. The utility configuration comes with some helper classes that make this a bit
easier: [SimpleSortDescriptor]({{link-to-doc}}) and [SimpleFilterDescriptor]({{link-to-doc}}).

Consider the gradebook example from earlier. Say you don't need/want the full functionality of the standard configuration, but just the
ability to sort the table, and filter grades by whether they're passing or failing. The utility configuration can be effectively used to this
end, but there's a little more coding you'll have to do.

First off, the fields for filtering by category need to be defined. In the example, this is inserted just before the table definition:
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
<!-- ... -->
```

Next, we'll define a listener that handles sorting called `ClickSortListener`. Its constructor takes a single [HTMLTableWrapper], and it adds itself as a listener for click events 
on the backing table's column headers in the `init` function. The `tableHeaderCache` is used for determining column indexes later on, as well as maintaining
references to host objects on which we've added ourselves as listeners, so we can remove ourselves when the `ClickSortListener` is no longer needed (this is done in the 
`dispose` function, which is not shown here; see [`grade-controls.js`](grade-controls.js) for details):
``` javascript
function ClickSortListener(tableWrapper) {
	'use strict';
	
	this.tableWrapper = tableWrapper;
}

// ...

ClickSortListener.prototype.init = function () {
	'use strict';
	
	var tableHeaderCache, tableHeaders, i, tableHeader;
	
	tableHeaderCache = this.tableHeaderCache = [];
	tableHeaders = this.tableWrapper.getTableElement().tHead.rows[0].cells;
	for (i = 0; i < tableHeaders.length; ++i) {
		tableHeader = tableHeaders[i];
		tableHeader.addEventListener('click', this, false);
		tableHeaderCache.push(tableHeader);
	}
};
```

After that, we need to declare a `handleEvent` function that calls on the backing [HTMLTableWrapper]'s [sort] function in response to click events
on the column headers to which we've just added ourselves. For this, we maintain a class name on the table header being sorted, and loop
between three column states: not sorted -> sorted ascending -> sorted descending. Based upon the current state, we call [sort]({{link-to-doc}})
with a [SimpleSortDescriptor]({{link-to-doc}}) each time a column header is clicked. If a different column header is clicked than the 
one before, the previous column's state is cleared:
``` javascript
ClickSortListener.prototype.handleEvent = function (event) {
	'use strict';
	
	var header, headerClassList, columnIndex, tableWrapper, lastColumnIndex, tableHeaderCache;
	
	// Setup.
	tableWrapper = this.tableWrapper;
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
		
		tableWrapper.sort(new SimpleSortDescriptor(columnIndex, true));
	} else if (headerClassList.contains(ClickSortListener.DESCENDING_SORT_CLASS_NAME)) {
		headerClassList.remove(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
		
		tableWrapper.clearSort();
	} else {
		headerClassList.add(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
		
		tableWrapper.sort(new SimpleSortDescriptor(columnIndex, false));
	}
};
```

We also need to declare an event listener that handles filtering grades by category. We'll do this in `GradeCategoryListener`. This constructor
will take three arguments: an [HTMLTableWrapper], the index of the column in the table that holds the grades, and the `HTMLInputElement`s we want
to toggle filtering. Similar to the `init` function before, `GradeCategoryListener` adds itself as a click listener on the relevant elements (in
this case, the `HTMLInputElement`s that toggle filtering):

``` javascript
function GradeCategoryListener(tableWrapper, gradeColumnIndex, gradeCategoryInputs) {
	'use strict';
	
	this.tableWrapper = tableWrapper;
	this.gradeColumnIndex = gradeColumnIndex;
	this.gradeCategoryInputs = gradeCategoryInputs;
}

// ...

GradeCategoryListener.prototype.init = function () {
	'use strict';
	
	var gradeCategoryInputs, i;
	
	gradeCategoryInputs = this.gradeCategoryInputs;
	for (i = 0; i < gradeCategoryInputs.length; ++i) {
		gradeCategoryInputs[i].addEventListener('click', this, false);
	}
};
```

We'll also need to declare a function that handles filtering based upon the different `value`s we expect from the `HTMLInputElement`s passed to
the constructor. Based upon the value, we call [filter] with an appropriately configured [SimpleFilterDescriptor]:
``` javascript
GradeCategoryListener.prototype.filterByCategory = function (category) {
	'use strict';
	
	var tableWrapper, gradeColumnIndex;
	
	tableWrapper = this.tableWrapper;
	gradeColumnIndex = this.gradeColumnIndex;
	
	switch (category) {
		case 'passing':
			tableWrapper.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '<='));
			break;
		case 'failing':
			tableWrapper.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '>'));
			break;
		case 'all':
		default:
			tableWrapper.clearFilter();
			break;
	}

};
```

This makes our definition of `handleEvent` event easy:
``` javascript
GradeCategoryListener.prototype.handleEvent = function (event) {
	'use strict';
	
	this.filterByCategory(event.target.value);
};
```


With those two classes implemented, the page initialization script will look like this:
``` html
<script src="grade-controls.js"></script>
<script>

document.addEventListener('DOMContentLoaded', function () {
	'use strict';
	
	var tableWrapper, gradeCategoryInputs;
	
	tableWrapper = new HTMLTableWrapper(document.getElementById('grades'));
	gradeCategoryInputs = document.getElementsByClassName('grade-category');
	
	new ClickSortListener(tableWrapper).init();
	new GradeCategoryListener(tableWrapper, 3, gradeCategoryInputs).init();
});

</script>
```

The entire working example can be found [here](examples/gradebook-minimal/gradebook-minimal.html).