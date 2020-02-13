
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
const OUT_DIR = 'html-table-wrapper';
const OUT_PACKAGE_JSON = 'html-table-wrapper.json';


// Full Distribution
const FULL_SRC_NAME = `${OUT_DIR}/html-table-wrapper.js`;
const FULL_STYLE_NAME = `${OUT_DIR}/html-table-wrapper.css`;

const FULL_SRC_ORDER = [
    'src/polyfill.js'
    , 'src/IEGeneralCompatibility.js'
    , 'src/IE9Compatibility.js'
    , 'src/IE8Compatibility.js'
    , 'src/SimpleEventDispatcher.js'
    , 'src/IterationValue.js'
    , 'src/ColumnValueSet.js'
    , 'src/ContextControl.js'
    , 'src/HTMLTableWrapper.js'
    , 'src/HTMLTableWrapperControl.js'
    , 'src/HTMLTableWrapperListener.js'
    , 'src/HTMLTableWrapperUtils.js'
    , 'src/SimpleFilterDescriptor.js'
    , 'src/SimpleSortDescriptor.js'
    , 'src/XMLBuilder.js'
];

const FULL_STYLE_ORDER = [
    'style/context-control.css'
    , 'style/html-table-wrapper.css'
    , 'style/html-table-wrapper-listener.css'
];

// Util Distribution
const UTIL_SRC_NAME = `${OUT_DIR}/html-table-wrapper-util.js`;
const UTIL_STYLE_NAME = `${OUT_DIR}/html-table-wrapper-util.css`;

const UTIL_SRC_ORDER = [
    'src/polyfill.js'
    , 'src/IEGeneralCompatibility.js'
    , 'src/IE9Compatibility.js'
    , 'src/IE8Compatibility.js'
    , 'src/HTMLTableWrapper.js'
    , 'src/HTMLTableWrapperUtils.js'
    , 'src/SimpleFilterDescriptor.js'
    , 'src/SimpleSortDescriptor.js'
];

const UTIL_STYLE_ORDER = ['style/html-table-wrapper.css'];

// Min Distribution
const MIN_SRC_NAME = `${OUT_DIR}/html-table-wrapper-core.js`;
const MIN_STYLE_NAME = `${OUT_DIR}/html-table-wrapper-core.css`;

const MIN_SRC_ORDER = [
    'src/polyfill.js'
    , 'src/IEGeneralCompatibility.js'
    , 'src/IE9Compatibility.js'
    , 'src/IE8Compatibility.js'
    , 'src/HTMLTableWrapper.js'
];

const MIN_STYLE_ORDER = ['style/html-table-wrapper.css'];

// Utility Functions
function pipeToTarget(targetName, arr) {
    'use strict';

    return new Promise((resolve, reject) => {
        
        function onError(err) {
            reject(err);
        }
        
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
        
        
        const target = fs.createWriteStream(targetName);
        target.on('error', onError);
        
        let reader = null;
        let i = 0;

        nextReader();
    });
}



// Build Functions
function ensureDir() {
    'use strict';
    
    return new Promise((resolve, reject) => {
        fs.mkdir(OUT_DIR, (err) => {
            if (err && err.code !== 'EEXIST') {
                reject(err);
            }
            resolve();
        });
    });
}

function catFull() {
    'use strict';
    
    return Promise.all([pipeToTarget(FULL_SRC_NAME, FULL_SRC_ORDER), pipeToTarget(FULL_STYLE_NAME, FULL_STYLE_ORDER)]);
}

function catUtil() {
    'use strict';
    
    return Promise.all([pipeToTarget(UTIL_SRC_NAME, UTIL_SRC_ORDER), pipeToTarget(UTIL_STYLE_NAME, UTIL_STYLE_ORDER)]);
}

function catMin() {
    'use strict';
    
    return Promise.all([pipeToTarget(MIN_SRC_NAME, MIN_SRC_ORDER), pipeToTarget(MIN_STYLE_NAME, MIN_STYLE_ORDER)]);
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
    
    return gulp.src([FULL_STYLE_NAME, UTIL_STYLE_NAME, MIN_STYLE_NAME])
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

function generateDoc() {
    'use strict';
    
    return new Promise((resolve, reject) => {
        let p = child_process.spawn(
            ['.', 'node_modules', '.bin', 'jsdoc'].join(path.sep)
            , ['-p', '-d', `${OUT_DIR}/doc`, '-c', 'jsdoc/jsdoc-conf.json', '-r', 'src']
            , { shell: true });
        
        let jsdocOut = '';
        p.stdout.on('data', (data) => {
            jsdocOut += `JSDOC OUT: ${data.toString()}`;
        });
        p.stderr.on('data', (data) => {
            jsdocOut += `JSDOC ERR: ${data.toString()}`;
        });
        p.on('error', (err) => {
            reject(err);
        });
        p.on('close', (code) => {
            if (jsdocOut) {
                console.log(jsdocOut);
            }
            resolve();
        });
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