# A Simple Table
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
<title>HTMLTableWrapper.js - Gradebook</title>
<script src="../html-table-wrapper.min.js"></script>
<script>

document.addEventListener('DOMContentLoaded', () => {
	'use strict';
	
	new HTMLTableWrapperListener(document.getElementById('grades')).init();
});

</script>
...
```

The full example can be found [here](examples/basic/gradebook.html).