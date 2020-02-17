
# HTMLTableWrapper.js

HTMLTableWrapper.js is a standalone, lightweight, completely pluggable library for the arbitrary sorting 
and filtering of "typical" `HTMLTableElement`s. The easiest way to get up-and-running with HTMLTableWrapper.js 
is to use its "full" configuration:

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

Or, if you prefer to trigger sorting and filtering directly, the "utility" configuration should be sufficient:
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

To use HTMLTableWrapper.js on your webpages, you need only include the desired combination JavaScript/CSS file
combination. These are detailed below:

- Full
    - `html-table-wrapper.min.js`
    - `html-table-wrapper.min.css`
    
    Fully featured, and end-user friendly. This is the easiest configuration to use.
- Utility
    - `html-table-wrapper-util.min.js`
    - `html-table-wrapper-util.min.css`
    
    Includes the contents of the core configuration (below) with a couple extra classes that assist in using
    HTMLTableWrapper.js, but no UI elements.
- Core
    - `html-table-wrapper-core.min.js`
    - `html-table-wrapper-core.min.css`
    
    Includes only the definition of [`HTMLTableWrapper`][HTMLTableWrapper], and supporting compatibility classes 
    for Internet Explorer.


All the above files are included in the NPM package, along with their un-minified versions, HTMLTableWrapper.js's 
individual source files and associated documentation. If you use NPM these can be installed in your local project via:
```
> npm i html-table-wrapper
```
The desired files can then be copied/linked from your `./node_modules/html-table-wrapper/` directory.

Alternatively, the desired source files can be linked or downloaded directly via the JSDelivr CDN (all examples 
link directly to the CDN):
``` html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/html-table-wrapper/html-table-wrapper[-util|-core].min.css" />
<script src="https://cdn.jsdelivr.net/npm/html-table-wrapper/html-table-wrapper[-util|-core].min.js"></script>
```


## Compatibility
HTMLTableWrapper.js is compatible with modern desktop and mobile browsers, as well as MS Internet Explorer 
down to version 8.

## API Overview
At its core, HTMLTableWrapper.js only coordinates sorting and filtering for a given `HTMLTableElement`; the 
definition of how the actual data within the table is to be treated, as well as calls to trigger the sorting
and filtering of that table are completely up to the client. The utility and full configurations build on 
HTMLTableWrapper.js's core, and provide more concrete functionality that handles the vast majority of use-cases, 
but clients are, by no means, required to use them. 


## Motivation
Although there are a multitude of other libraries that perform similar functions to HTMLTableWrapper.js, most 
require the importation of supporting libraries, offer many unneeded features, with few required features, and 
lend themselves poorly to customization. The motivation behind HTMLTableWrapper.js is to serve as a free, standalone, 
(semi-)lightweight, more flexible alternative to all the other HTML table processing libraries available.


## Documentation
The API Documentation for HTMLTableWrapper.js is shipped in the `/doc` directory of its NPM package, and can 
be found online [here](https://mschlege1838.github.io/html-table-wrapper).

Because all declarations in HTMLTableWrapper.js are made in the strictly 'traditional' manner, all constructors, 
functions, and fields are fully accessible by client code. For this reason, all declared constructors and members 
are documented, however client code should only rely on those members that are declared 'public'; anything labeled 
'private', 'package', etc. can be used, but may be subject to change without notice.

This project's documentation is generated with [JSDoc](https://jsdoc.app/), and hosted on 
[GitHub Pages](https://pages.github.com/). 


# Usage Examples

Usage examples and descriptions can be found in their respective subdirectories. Their links are below.
Links to the working webpages are also provided.

Of note, although HTMLTableWrapper.js is compatible with IE back to version 8, the examples are not; they 
require a modern browser with an up-to-date DOM and ES6 implementation. Due, however, to the relative novelty 
of the added ES6 syntax elements, a version of the source code for the examples is written using both the 
'traditional' and newer ES6 syntax (ES6 files are suffixed with `-es6.js`). The code snippets in the examples, 
themselves, though, use the traditional syntax.


## A Simple Table
A basic example that uses the "full" configuration.

- [Example](https://github.com/mschlege1838/html-table-wrapper/tree/master/examples/gradebook)
- [Webpage](https://mschlege1838.github.io/html-table-wrapper/examples/gradebook/gradebook.html)

## Changing How Cells Are Interpreted
A slightly more complex example that plugs into the "full" configuration using a 
[`CellInterpreter`][CellInterpreter].

- [Example](https://github.com/mschlege1838/html-table-wrapper/tree/master/examples/drinks)
- [Webpage](https://mschlege1838.github.io/html-table-wrapper/examples/drinks/drinks.html)

## Defining Custom Controls
Another plug-in to the "full" configuration, using a [`ColumnControlFactory`][ColumnControlFactory] that 
returns a custom [`ColumnControl`][ColumnControl].

- [Example](https://github.com/mschlege1838/html-table-wrapper/tree/master/examples/temperatures)
- [Webpage](https://mschlege1838.github.io/html-table-wrapper/examples/temperatures/temperatures.html)

## Using HTMLTableWrapper.js Directly
An example of using the "utility" configuration.

- [Example](https://github.com/mschlege1838/html-table-wrapper/tree/master/examples/gradebook-minimal)
- [Webpage](https://mschlege1838.github.io/html-table-wrapper/examples/gradebook-minimal/gradebook-minimal.html)

## An Entirely Custom Implementation
An example of using the "core" configuration.

- [Example](https://github.com/mschlege1838/html-table-wrapper/tree/master/examples/temperatures-custom)
- [Webpage](https://mschlege1838.github.io/html-table-wrapper/examples/temperatures-custom/temperatures-custom.html)


# Administrivia

## License

HTMLTableWrapper.js is licenced under the MIT and BSD 3-Clause Free Software Licenses. A full copy can be 
found [here](https://github.com/mschlege1838/html-table-wrapper/LICENSE).

## Reporting Issues

Please report any issues or bugs encountered in using HTMLTableWrapper.js through this repository's
[issues](https://github.com/mschlege1838/html-table-wrapper/issues) section.

## Contributing

If you'd like to develop an enhancement, or fix a bug yourself, please fork this repository, make your change,
and submit a pull request.

We ask that pull requests only contain changes to the HTMLTableWrapper.js library itself; if you're developing
a plugin to it, please create and maintain it in your own repositry, and simply list HTMLTableWrapper.js as
a dependency.

## Building
HTMLTableWrapper.js uses [Gulp](https://gulpjs.com/) to build its distribution package. All build dependencies 
are listed in the `package.json` file of the source repository's root directory, with the only exception of 
`gulp-cli`, which it assumes is installed globally. I.e., from the project's root directory, the following should 
be sufficient for a first time setup ([node.js](https://nodejs.org) also needs to be installed):

```
> npm i -g gulp-cli
> npm i
```

From there, `gulp` can be ran directly to build HTMLTableWrapper.js's distribution package:

```
> gulp
```

HTMLTableWrapper.js does not follow the typical conventions of an NPM package in that its distribution package 
is not the same as its source package; building the source package produces a new directory containing the 
distribution package. This setup is in preference to maintaining an `nmpignore` file for clarity and conciceness; 
no configuration needs to be inspected to see what is, or is not included the distribution. The distribution
is, simply, the newly created package. This also removes cluttering in the distribution's `package.json` file, 
as items related only to development (e.g. `devDependencies`) don't need to be specified.



[HTMLTableWrapper]: https://mschlege1838.github.io/html-table-wrapper/HTMLTableWrapper.html
[CellInterpreter]: https://mschlege1838.github.io/html-table-wrapper/CellInterpreter.html
[ColumnControlFactory]: https://mschlege1838.github.io/html-table-wrapper/ColumnControlFactory.html
[ColumnControl]: https://mschlege1838.github.io/html-table-wrapper/ColumnControl.html

