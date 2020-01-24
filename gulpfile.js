
// Imports
const fs = require('fs');
const gulp = require('gulp');
const uglifyjs = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');
const rename = require('gulp-rename');
const child_process = require('child_process');
const path = require('path');


// Config

// General
const OUT_DIR = 'simple-data-table';
const OUT_PACKAGE_JSON = 'simple-data-table.json';


// Full Distribution
const FULL_SRC_NAME = `${OUT_DIR}/simple-data-table.js`;
const FULL_STYLE_NAME = `${OUT_DIR}/simple-data-table.css`;

const FULL_SRC_ORDER = [
	'src/polyfill.js'
	, 'src/IEGeneralCompatibility.js'
	, 'src/IE9Compatibility.js'
	, 'src/IE8Compatibility.js'
	, 'src/SimpleEventDispatcher.js'
	, 'src/ContextControl.js'
	, 'src/SimpleDataTable.js'
	, 'src/SimpleDataTableControl.js'
	, 'src/SimpleDataTableListener.js'
	, 'src/SimpleDataTableUtils.js'
	, 'src/SimpleFilterDescriptor.js'
	, 'src/SimpleSortDescriptor.js'
	, 'src/XMLBuilder.js'
];

const FULL_STYLE_ORDER = [
	'style/context-control.css'
	, 'style/simple-data-table.css'
];

// Util Distribution
const UTIL_SRC_NAME = `${OUT_DIR}/simple-data-table-util.js`;

const UTIL_SRC_ORDER = [
	'src/polyfill.js'
	, 'src/IEGeneralCompatibility.js'
	, 'src/IE9Compatibility.js'
	, 'src/IE8Compatibility.js'
	, 'src/SimpleDataTable.js'
	, 'src/SimpleFilterDescriptor.js'
	, 'src/SimpleSortDescriptor.js'
];

// Min Distribution
const MIN_SRC_NAME = `${OUT_DIR}/simple-data-table-core.js`;

const MIN_SRC_ORDER = [
	'src/polyfill.js'
	, 'src/IEGeneralCompatibility.js'
	, 'src/IE9Compatibility.js'
	, 'src/IE8Compatibility.js'
	, 'src/SimpleDataTable.js'
];



// Utility Functions
function pipeToTarget(targetName, arr) {
	'use strict';

	return new Promise((resolve, reject) => {
		
		function onError(err) {
			reject(err);
		}
		
		
		const target = fs.createWriteStream(targetName);
		target.on('error', onError);
		
		
		
		let reader = null;
		let i = 0;
		
		function nextReader() {
			if (i >= arr.length) {
				target.end();
				resolve();
			} else {
				reader = fs.createReadStream(arr[i++]);
				reader.on('end', nextReader);
				reader.on('error', onError);
				reader.pipe(target, {end: false});
			}
		}

		nextReader();
		
	});
}



// Build Functions
function ensureDir(cb) {
	'use strict';
	
	return fs.mkdir(OUT_DIR, (err) => {
		if (err && err.code !== 'EEXIST') {
			cb(err);
		}
		cb();
	});
}

function catFull() {
	'use strict';
	
	return Promise.all([pipeToTarget(FULL_SRC_NAME, FULL_SRC_ORDER), pipeToTarget(FULL_STYLE_NAME, FULL_STYLE_ORDER)]);
}

function catUtil() {
	'use strict';
	
	return pipeToTarget(UTIL_SRC_NAME, UTIL_SRC_ORDER);
}

function catMin() {
	'use strict';
	
	return pipeToTarget(MIN_SRC_NAME, MIN_SRC_ORDER);
}

function minifySrc() {
	'use strict';
	
	return gulp.src([FULL_SRC_NAME, UTIL_SRC_NAME, MIN_SRC_NAME])
		.pipe(uglifyjs())
		.pipe(rename({ extname: '.min.js'}))
		.pipe(gulp.dest(OUT_DIR));
}

function minifyStyle() {
	'use strict';
	
	return gulp.src([FULL_STYLE_NAME])
		.pipe(uglifycss())
		.pipe(rename({ extname: '.min.css'}))
		.pipe(gulp.dest(OUT_DIR));
}

function copySrc() {
	'use strict';
	
	return gulp.src('src/**').pipe(gulp.dest(`${OUT_DIR}/src`));
}

function copyStyle() {
	'use strict';
	
	return gulp.src('style/**').pipe(gulp.dest(`${OUT_DIR}/style`));
}

function copyPackage() {
	'use strict';
	
	return fs.createReadStream(OUT_PACKAGE_JSON).pipe(fs.createWriteStream(`${OUT_DIR}/package.json`));
}

function generateDoc(cb) {
	'use strict';
	
	let p = child_process.spawn(
		['.', 'node_modules', '.bin', 'jsdoc'].join(path.sep)
		, ['-p', '-d', `${OUT_DIR}/doc`, '-c', 'jsdoc/jsdoc-conf.json', '-r', 'src']
		, { shell: true} );
	
	let jsdocOut = '';
	p.stdout.on('data', (data) => {
		jsdocOut += `JSDOC OUT: ${data.toString()}`;
	});
	p.stderr.on('data', (data) => {
		jsdocOut += `JSDOC ERR: ${data.toString()}`;
	});
	p.on('error', (err) => {
		cb(err);
	});
	p.on('close', (code) => {
		if (jsdocOut) {
			console.log(jsdocOut);
		}
		cb();
	});

}


// Exports
exports.default = gulp.series(
	ensureDir
	, gulp.parallel(
		gulp.series(
			gulp.parallel(catFull, catUtil, catMin)
			, gulp.parallel(
				minifySrc
				, minifyStyle
			)
		)
		, copySrc
		, copyStyle
		, copyPackage
		, generateDoc
	)
);