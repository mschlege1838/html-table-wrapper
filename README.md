
# HTMLTableWrapper.js

HTMLTableWrapper.js is a standalone, lightweight, completely pluggable library for the arbitrary sorting and filtering of "typical"
HTML table elements. The easiest way to get up-and-running with HTMLTableWrapper.js is to use its "full" distribution:

``` html
<link rel="stylesheet" href="{{full-dist-style}}" />
<script src="{{full-dist-url}}"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
	'use strict';
	
	new HTMLTableWrapperListener(document.getElementById('myTable')).init();
});
</script>
```

## Installation/Distributions
- Full
	A fully featured, end-user friendly distribution. This package is the easiest one with which to get started with HTMLTableWrapper.js
- Utility
	Includes the minimal distribution with a couple extra classes that include the same functionality presented in the full distribution,
	but no UI elements. Use this if you want the same functionality as the full distribution, but want to define your own UI hooks to call on
	HTMLTableWrapper.js.
- Minimal
	Includes only the bare minimum to use HTMLTableWrapper.js. Use this if you only need the behavior defined by HTMLTableWrapper.js, but
	want to define your own data processing functions, as well as your own UI hooks.

## Compatibility
HTMLTableWrapper.js is compatible with modern desktop and mobile browsers, as well as MS Internet Explorer down to version 8.

## API Overview
At its core, HTMLTableWrapper.js is only coordinates sorting and filtering for a given HTML table element; the definition of how actual 
data within a table is to be treated, as well as calls to trigger the sorting and filtering of that table are completely up to the client. The 
utility and full distributions build on HTMLTableWrapper.js's core, and provide more concrete functionality that handles the vast majority of 
use-cases, but clients are, by no means, required to use them. 


## Motivation
Although true there are a multitude of other libraries in existence that perform similar functions to HTMLTableWrapper.js, most require the 
importation of supporting libraries, offer many unneeded features, with few required features, and lend themselves poorly to customization. 
The motivation behind HTMLTableWrapper.js is to serve as a free, standalone, (semi-)lightweight, more flexible alternative to all the other 
HTML table processing libraries available.


## Documentation
The API Documentation for HTMLTableWrapper.js is hosted using [GitHub Pages]({{doc-url}}). 


# Usage Examples

Usage examples are in the README.md files of their respective subdirectories. Their links are below. Links to the working webpages are also provided.
Of note, although HTMLTableWrapper.js is compatible with IE back to version 8, the examples are not; they require a modern browser with an up-to-date
DOM and ES6 implementation. Due, however, to the relative novelty of the added ES6 syntax elements, a version of the source code for the examples is 
written using both the 'traditional' and newer ES6 syntax (ES6 files are suffixed with `-es6.js`). The code snippets in the examples, themselves, though,
use the traditional syntax.


## A Simple Table
[Example](examples/gradebook)

## Changing How Cells Are Interpreted
[Example](examples/drinks)

## Defining Custom Controls
[Example](examples/temperatures)

## Using HTMLTableWrapper.js Directly
[Example](examples/gradebook-minimal)

## An Entirely Custom Implementation
[Example](examples/temperatures-custom)


# Administrivia

## License

HTMLTableWrapper.js is licenced under the MIT and BSD 3-Clause Free Software Licenses. A full copy can be found [here](LICENSE).

## Reporting Issues

## Contributing

## Building
HTMLTableWrapper.js uses [Gulp](https://gulpjs.com/) to build its distribution package. All build dependencies are listed in HTMLTableWrapper.js's 
source repository package.json, with the only exception of the gulp-cli, which it assumes is installed globally. I.e. the following should be 
sufficient for a first time setup (it is also assumed [node.js](https://nodejs.org) is installed):

```
> npm i -g gulp-cli
> npm i
```

From there, `gulp` can be ran directly to build HTMLTableWrapper.js's distribution package:

```
> gulp
```

As you can see, HTMLTableWrapper.js does not follow the typical conventions of an NPM package in that its distribution package is not the same as 
its build package; the build produces a new directory containing the distribution package. This choice was made in preference to maintaining an
nmpignore file for clarity and conciceness; no files need to be inspected to see what is, or is not included the distribution. The distribution
is, simply, the newly created package. This also removes cluttering in the distribution's `package.json` file, as items related only to 
development (e.g. `devDependencies`) don't need to be specified.