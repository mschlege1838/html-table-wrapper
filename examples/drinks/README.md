# Changing How Cells Are Interpreted

Often the default mode of determining a cell's content isn't quite enough. When dealing with tables that have cells that follow a particular
format, a [CellInterpreter]({{link-to-doc}}) can be used to tell HTMLTableWrapper.js how to handle them.

Consider a webpage that aggregates drink recipes in a table. The columns that show the ingredients and mixing steps will have list elements
detailing each:
``` html
<!-- ... -->
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
<!-- ... -->
```

By default HTMLTableWrapper.js simply considers the `textContent` of each cell as its content, however, in this case such would not be desirable
for columns 3 and 4 (index 2 and 3). For this purpose, you can define a `CellInterpreter`.

A valid [CellInterpreter] is a function, or an object that defines a function called `populateCellValues`, that takes the arguments of an `HTMLTableCellElement` and 
a [`ColumnValueSet`]({{link-to-doc}}) of values already identified for the column. The function should add all the values logically contained within the cell to the
set. Returning a value that evaluates to `true` from this function will trigger default processing, in which case the cell's `textContent` will be added to the set.

For the case of interpreting list cells, the following accomplishes this:
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

After a [`CellInterpreter`] implementation is declared, it must be passed to the relevant [HTMLTableWrapperListener]({{link-to-doc}}) (as argument index
2; the previous argument, if defined, is a [`ColumnControlFactory`], which is covered in the next [example]):
```html
<script>
document.addEventListener('DOMContentLoaded', function () {
	'use strict';
	
	new HTMLTableWrapperListener(document.getElementById('drinks'), null, interpretListCell).init();
});
</script>
```

The entire working example can be found [here](examples/drinks/drinks.html).