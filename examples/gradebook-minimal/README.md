# Using HTMLTableWrapper.js Directly

HTMLTableWrapper.js can be used directly in your own controls. The utility distribution comes with some helper classes that make this a bit
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
between three column states: not sorted -> sorted ascending -> sorted descending, and calls `HTMLTableWrapper`'s [sort]({{link-to-doc}})
function with a [SimpleSortDescriptor]({{link-to-doc}}) each time a column header is clicked. If a different column header is clicked than the 
one before, the previous column's state is cleared. Below is a snippet from `ClickSortListener`'s `handleEvent` function:
``` javascript
...
	// Setup.
	HTMLTableWrapper = this.HTMLTableWrapper;
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
		
		HTMLTableWrapper.sort(new SimpleSortDescriptor(columnIndex, true));
	} else if (headerClassList.contains(ClickSortListener.DESCENDING_SORT_CLASS_NAME)) {
		headerClassList.remove(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
		
		HTMLTableWrapper.clearSort();
	} else {
		headerClassList.add(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
		
		HTMLTableWrapper.sort(new SimpleSortDescriptor(columnIndex, false));
	}
...
```

You'll also need to code an event listener to handle filtering by grade category, and have it call on `HTMLTableWrapper`'s [filter]({{link-to-doc}})
function when a category is selected on the screen. The example code implements this in `GradeCategoryListener`. The relevant snippet from
`GradeCategoryListener`'s `handleEvent` function is below:
``` javascript
...
	HTMLTableWrapper = this.HTMLTableWrapper;
	gradeColumnIndex = this.gradeColumnIndex;
	
	switch (category) {
		case 'passing':
			HTMLTableWrapper.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '<='));
			break;
		case 'failing':
			HTMLTableWrapper.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '>'));
			break;
		case 'all':
		default:
			HTMLTableWrapper.clearFilter();
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
	
	var HTMLTableWrapper, gradeCategoryInputs;
	
	HTMLTableWrapper = new HTMLTableWrapper(document.getElementById('grades'));
	gradeCategoryInputs = document.getElementsByClassName('grade-category');
	
	new ClickSortListener(HTMLTableWrapper).init();
	new GradeCategoryListener(HTMLTableWrapper, 3, gradeCategoryInputs).init();
});

</script>
```

The entire working example can be found [here](examples/gradebook-minimal/gradebook-minimal.html).