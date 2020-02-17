/*
 * Copyright 2020 Martin F. Schlegel Jr. | MIT AND BSD-3-Clause
 */
 
/**
 * @param {boolean} done Whether the parent iterator is complete, and has no more values.
 * @param {*} value Current value of the parent iterator.
 * @constructor
 * @classdesc
 *
 * Implementation of the ES6 `IteratorResult`.
 */
function IterationValue(done, value) {
    'use strict';
    
    this.done = done;
    this.value = value;
}