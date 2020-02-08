

/**
 * @constructor
 * @classdesc
 *
 * A 'bridge' API to implement the necessary functionality of the ES6 Set for interpreting cell values. A `ColumnValueSet` is passed
 * to {@link CellInterpreter} or {@link HTMLTableWrapperControl~populateCellValues} when used in {@link HTMLTableWrapperControl}s. If the `Set`
 * constructor is defined, a `Set` will be used to back this `ColumnValueSet`, otherwise will fall back to an `Array`.
 *
 * The {@link ColumnValueSet#iterator} function of this class implements the ES6 protocol for iterable objects (if the `Symbol` constructor
 * is defined, this class implements the protocol fully). `ColumnValueSet`s should be iterated via this function, regardless of whether
 * ES6 semantics are available, as they aren't strictly necessary to consume iterators. E.g., given a `ColumnValueSet` `columnValueSet`:
 *
 * ```javascript
 * var itr, itrVal, currentVal;
 *
 * itr = columnValueSet.iterator();
 * while (!(itrVal = itr.next()).done) {
 *     currentVal = itrVal.value;
 * // ...
 * ```
 */
function ColumnValueSet() {
	'use strict';
	
	if (window.Set) {
		this.values = new Set();
	} else {
		this.values = [];
		this.fallback = true;
	}
}

/**
 * Backing collection containing values added to this set from {@link CellInterpreter} or {@link HTMLTableWrapperControl~populateCellValues}
 * implementations. If the `Set` constructor is defined, will be a `Set`, otherwise will fall back to an `Array`.
 *
 * @member values
 * @type {Set|Array}
 * @private
 */
 
/**
 * Flag indicating whether this `ColumnValueSet` using an `Array` as its backing store due to the `Set` constructor not being available.
 *
 * @type boolean
 */
ColumnValueSet.prototype.fallback = false;


/**
 * Adds the given `value` to this set. By default, the value is `trim`med prior to being added, unless the `noTrim` parameter is
 * passed, and evaluates to `true`.
 *
 * @param {string} value Value to add to this set.
 * @param {boolean} [noTrim] If `true`, `value` will be added to this set, as given, otherwise it will be `trim`med first.
 */
ColumnValueSet.prototype.add = function (value, noTrim) {
	'use strict';
	
	var values;
	
	values = this.values;
	if (!noTrim) {
		value = value.trim();
	}
	
	if (this.fallback) {
		if (values.indexOf(value) === -1) {
			values.push(value);
		}
	} else {
		values.add(value);
	}
};

/**
 * Function that the ES6 protocol for iterable objects. Regardless of the backing data store, an ES6 Iterator will be returned.
 *
 * @returns {Iterator} An object that implements the ES6 protocol for Iterators. 
 */
ColumnValueSet.prototype.iterator = function () {
	'use strict';
	
	return this.fallback ? new ColumnValueSet.FallbackIterator(this.values) : this.values.values();
};

if (window.Symbol && Symbol.iterator) {
	ColumnValueSet.prototype[Symbol.iterator] = ColumnValueSet.prototype.iterator;
}

/**
 * Clears all values from this `ColumnValueSet`.
 */
ColumnValueSet.prototype.clear = function () {
	'use strict';
	
	var values;
	
	values = this.values;
	if (this.fallback) {
		values.length = 0;
	} else {
		values.clear();
	}
};



/**
 * @param {Array} values `Array` backing the parent `ColumnValueSet`.
 * @constructor
 * @classdesc
 *
 * Implentation of the ES6 protocol for Iterators used with {@link ColumnValueSet}s when necessary to fall back to using an `Array` to
 * back the set.
 */
ColumnValueSet.FallbackIterator = function (values) {
	'use strict';
	
	this.values = values;
	this.i = -1;
}

/**
 * Returns the next `IteratorResult` for this iterator.
 *
 * @returns {IterationValue} The next `IteratorResult` for this iterator.
 */
ColumnValueSet.FallbackIterator.prototype.next = function () {
	'use strict';
	
	var i, values;
	
	i = ++this.i;
	values = this.values;
	
	return i < values.length ? new IterationValue(false, values[i]) : new IterationValue(true);
};


