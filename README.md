
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
(use CellInterpreter)
(Drink Recipes - ingredients in list, special format)

## Defining Custom Controls
(use ColumnControlFactory)
(Temperature measurements where temperature unit can change)

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
(use core)
(Windspeeds with off-table unit change, filter measurements by category)



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