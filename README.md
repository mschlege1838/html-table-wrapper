
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
importation of heavyweight supporting libraries (e.g. jQuery), are heavyweight themselves, lend themselves poorly to customization, and even 
require payment for their usage. The motivation behind SimpleDataTable.js is to serve as a free, standalone, lightweight, and more flexible
alternative to other HTML table processing libraries available.


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

## Low-Level Processing
(use utility)
(Real-time scoreboard)

## An Entirely Custom Implementation
(use core)
(Windspeeds with off-table unit change, filter measurements by category)



# Administrivia

---------------------------------------------------------------------------------------------------------------------------------------

## License

## Reporting Issues

## Contributing

## Building
