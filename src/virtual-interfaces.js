/*
 * Copyright 2020 Martin F. Schlegel Jr. | MIT AND BSD-3-Clause
 */
 
// MinimalList
/**
 *
 * @interface MinimalList
 * @classdesc
 *
 * Minimal definition of an iterable collection. Must define a number `length` property representing the number
 * of elements in the collection, and be indexible by integers (`0`...`length - 1`) with each index representing a value
 * in the collection. E.g. both `Array` and `NodeList` implement this interface.
 */
/**
 * A positive integer representing the number of values in the collection.
 *
 * @member MinimalList#length
 * @type {number}
 */
 

// Disposable
/**
 * @interface Disposable
 * @classdesc
 *
 * Represents an object that should be {@link Disposable#init initialized} prior to use, and {@link Disposable#dispose disposed} when no longer needed. Both functions 
 * are optional. Most useful for user-defined objects that make use of, and/or maintain references to, host objects, but any object can implement this interface.
 *
 * As both {@link Disposable#init} and {@link Disposable#dispose} are optional, usage of a `Disposable` (absent knowledge of their implementation on a specific target
 * type) should be akin to the following:
 * ``` javascript
 * if (typeof disposable.init === 'function') {
 *     disposable.init()
 * }
 *
 * // Usage of the Disposable object...
 *
 * // Disposable no longer needed
 * if (typeof disposable.dispose === 'function') {
 *     disposable.dispose();
 * }
 * ```
 */
/**
 * Optional function to initialize this object for use. The object should be usable after calling this function.
 *
 * @function Disposable#init
 */
/**
 * Optional function to dispose this object. The object should not be relied upon to be usable after calling this function, however
 * whether it actually is, or not, is entirely implementation-dependent.
 *
 * @function Disposable#dispose
 */
 
 
// Nothing
/**
 * @interface Nothing
 * @classdesc
 *
 * A marker 'interface' that represents anything convertible to `false` in a boolean expression<sup>[1](#footnote1)</sup>. More specifically, all of the 
 * following 'implement' `Nothing`:
 * - `false`
 * - `0` (The number 0)
 * - `NaN`
 * - `''` (The empty string)
 * - `null`
 * - `undefined` (Any undefined value<sup>[2](#footnote2)</sup>)
 *
 * Anything that is not convertible to `false` (i.e. not one of the above values) does not implement this interface.
 *
 * Throughout this documentation, this interface is often used to indicate a return value from a function (typically a callback) is optional, and 
 * specific actions will be taken in the event that function returns a value convertible to `false`. To exemplify the concept, both the following functions 
 * are considered to return `Nothing`:
 *
 * ``` javascript
 * // Literally returns nothing (though a call to it will implicitly return undefined).
 * function foo() {
 *     'use strict';
 * }
 *
 * // Returns a value, but that value is convertible to false.
 * // (undefined is technically returned in this case, but any of the values specified act to the same effect)
 * function bar() {
 *     'use strict';
 *     return false || 0 || NaN || '' || null || undefined;
 * }
 * ```
 *
 *
 * <div id="footnote1" class="footnote">
 * <sup><a href="#footnote1">1</a></sup>More colloquially, this interface is referred to as 'falsy'. 
 * <a href="https://developer.mozilla.org/en-US/docs/Glossary/Falsy">MDN</a> has an article defining the term in more detail.
 * </div>
 *
 * <div id="footnote2" class="footnote">
 * <sup><a href="#footnote2">2</a></sup><code>undefined</code> is not actually a reserved word, but a built-in variable defined on the Global Object,
 * which implies it can be hidden in a local scope. Another widely recognized, yet 'maximally portable' way of specifying a literal undefined value is 
 * the expression <code>void 0</code>. See <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined">MDN</a>'s 
 * article on the subject for more details.
 * </div>
 */