
# HTMLTableWrapper.js

HTMLTableWrapper.js is a standalone, lightweight, completely pluggable library for user-defined sorting 
and filtering of `HTMLTableElement`s following the typical vertical layout. The easiest way to get up-and-
running with HTMLTableWrapper.js is to use its [_full_](#configurationFull) configuration:

``` html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/html-table-wrapper/html-table-wrapper.min.css" />
<script src="https://cdn.jsdelivr.net/npm/html-table-wrapper/html-table-wrapper.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    
    new HTMLTableWrapperListener(document.getElementById('myTable')).init();
});
</script>
```

Or, if you prefer to trigger sorting and filtering directly, the [_utility_](#configurationUtility) or 
[_core_](#configurationCore) configurations are sufficient (_utility_ shown below):
``` html
<link rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/html-table-wrapper/html-table-wrapper-util.min.css" />
<script src="https://cdn.jsdelivr.net/npm/html-table-wrapper/html-table-wrapper-util.min.js"></script>
<script>
var tableWrapper;
document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    
    tableWrapper = new HTMLTableWrapper(document.getElementById('myTable'));
});
</script>
<!-- ... -->
<script>
// Some event handler
    // Sort by column index 2, asc and 3, desc.
    tableWrapper.sort(new SimpleSortDescriptor(2), new SimpleSortDescriptor(3, true));
    // Filter column index 0 to include only values greater than or equal to 3.
    tableWrapper.sort(new SimpleFilterDescriptor(0, 3, '>='));
</script>
```

## Installation

To use HTMLTableWrapper.js on your webpages, you need only include the desired combination of JavaScript/CSS 
files shown beloww:

- <a name="configurationFull"></a>Full
    - `html-table-wrapper.min.js`
    - `html-table-wrapper.min.css`
    
    Fully featured, and end-user friendly, this is the easiest configuration to use.
- <a name="configurationUtility"></a>Utility
    - `html-table-wrapper-util.min.js`
    - `html-table-wrapper-util.min.css`
    
    The [_core_](#configurationCore) configuration with extra classes and functions to assist in using 
    HTMLTableWrapper.js. No UI-related classes are included.
- <a name="configurationCore"></a>Core
    - `html-table-wrapper-core.min.js`
    - `html-table-wrapper-core.min.css`
    
    Includes only the definition of [`HTMLTableWrapper`][HTMLTableWrapper] and supporting compatibility 
    functions for Internet Explorer.


All files are included in the NPM package. If you use NPM, these can be installed in your local project via:
```
> npm i html-table-wrapper
```
The desired files can then be copied/linked from your `./node_modules/html-table-wrapper/` directory.

Alternatively, the desired files can be linked to or downloaded directly via the JSDelivr CDN (all examples 
link directly to the CDN):
``` html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/html-table-wrapper/html-table-wrapper[-util|-core].min.css" />
<script src="https://cdn.jsdelivr.net/npm/html-table-wrapper/html-table-wrapper[-util|-core].min.js"></script>
```


## Compatibility
HTMLTableWrapper.js is compatible with modern desktop and mobile browsers, as well as with MS Internet Explorer 
back to version 8.


## Documentation
The API Documentation is shipped in the `/doc` directory of the NPM package, and can also be found 
[here](https://mschlege1838.github.io/html-table-wrapper).

Because all declarations in HTMLTableWrapper.js are made in the strictly 'traditional' manner, all constructors, 
functions, and fields are fully accessible by client code. For this reason, all declared members 
are documented, however, client code should only rely on those members declared `public`. Anything labeled 
`private`, `package`, etc. can be used, but may be subject to change without notice.

This project's documentation is generated with [JSDoc](https://jsdoc.app/) and hosted on 
[GitHub Pages](https://pages.github.com/). 


# Usage Examples

Links to the examples and working webpages are provided below.

Although HTMLTableWrapper.js is compatible with IE back to version 8, the examples are not. They require a 
modern browser with an up-to-date DOM and ECMAScript implementation. Due to the relative novelty of ES6+ 
syntax elements, the examples use pre-ES6 syntax.

If you prefer the newer ES6+ syntax, a version of each example source file written in this syntax is provided 
with a `-es6.js` suffix. These will be kept up-to-date as possible with the ECMA-262 latest draft.


## A Simple Table
Example using the [_full_](#configurationFull) configuration:

- [Example](https://github.com/mschlege1838/html-table-wrapper/tree/master/examples/gradebook)
- [Webpage](https://mschlege1838.github.io/html-table-wrapper/examples/gradebook/gradebook.html)

## Changing Cell Interpretation
Example using a [`CellInterpreter`][CellInterpreter]:

- [Example](https://github.com/mschlege1838/html-table-wrapper/tree/master/examples/drinks)
- [Webpage](https://mschlege1838.github.io/html-table-wrapper/examples/drinks/drinks.html)

## Defining Custom Controls
Example using a [`ColumnControl`][ColumnControl]:

- [Example](https://github.com/mschlege1838/html-table-wrapper/tree/master/examples/temperatures)
- [Webpage](https://mschlege1838.github.io/html-table-wrapper/examples/temperatures/temperatures.html)

## Using [`HTMLTableWrapper`][HTMLTableWrapper] Directly
Example using the [_utility_](#configurationUtility) configuration.

- [Example](https://github.com/mschlege1838/html-table-wrapper/tree/master/examples/gradebook-minimal)
- [Webpage](https://mschlege1838.github.io/html-table-wrapper/examples/gradebook-minimal/gradebook-minimal.html)

## Programming For [`HTMLTableWrapper`][HTMLTableWrapper]
Example of using the [_core_](#configurationCore) configuration.

- [Example](https://github.com/mschlege1838/html-table-wrapper/tree/master/examples/temperatures-custom)
- [Webpage](https://mschlege1838.github.io/html-table-wrapper/examples/temperatures-custom/temperatures-custom.html)


# Administrivia

## License

HTMLTableWrapper.js is licenced under the MIT and BSD 3-Clause Free Software Licenses. A full copy can be 
found [here](https://github.com/mschlege1838/html-table-wrapper/tree/master/LICENSE).

## Reporting Issues

Please report any issues or bugs encountered using HTMLTableWrapper.js through this repository's
[issues](https://github.com/mschlege1838/html-table-wrapper/issues) section.

## Contributing

If you'd like to develop an enhancement, or fix a bug yourself, please fork this repository, make your change,
and submit a pull request.

We ask that pull requests contain only changes to the HTMLTableWrapper.js library itself. If you're developing
a plugin to it, please create and maintain your own repositry, and simply list HTMLTableWrapper.js as a dependency.

## Building
HTMLTableWrapper.js uses [Gulp](https://gulpjs.com/) to build its distribution package. If you do not have 
Gulp installed on your machine, you can do so through NPM (distributed with [node.js](https://nodejs.org)):

```
> npm i -g gulp-cli
```

Development dependencies are also installed with NPM. From your cloned repository's root directory, run:

```
> npm i -D
```

The distribution package can then be built using the `default` Gulp task:

```
> gulp
```

After running Gulp, a new subdirectory will be created: `html-table-wrapper`. This subdirectory is the 
"distribution" package.


[HTMLTableWrapper]: https://mschlege1838.github.io/html-table-wrapper/HTMLTableWrapper.html
[CellInterpreter]: https://mschlege1838.github.io/html-table-wrapper/CellInterpreter.html
[ColumnControlFactory]: https://mschlege1838.github.io/html-table-wrapper/ColumnControlFactory.html
[ColumnControl]: https://mschlege1838.github.io/html-table-wrapper/ColumnControl.html

