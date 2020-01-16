
// Constructor
/**
 * @constructor
 * @implements FilterDescriptor
 * @param {number} columnIndex Column index this `SimpleFilterDescriptor` describes.
 * @param {*} compareValue Value to which cells are to be compared.
 * @param {(string)} [operation='='] 
 *   String indicating the operation this filter is to perform. Must be one of the following: '`='`, '`!=`' '`&lt;`', '`&gt;`' '`&lt;=`', 
 *   '`&gt;=`', '`~`', or '`~~`'.
 * @param {number} [columnType={@link SimpleDataTableUtils.COLUMN_TYPE_INFER}] How the values of cells in this column are to be determined.
 * @classdesc
 *
 * Generic implementation of {@link FilterDescriptor}. Filters cells for the given `columnIndex` by comparing their values to the given 
 * `compareValue` using the given `operation`. The values for individual cells are determined based upon `columnType`.
 * 
 * `Operation` is a string, and must be one of the following:
 * - `'='` (Equals)
 * - `>'` (Greater Than)
 * - `'<'` (Less Than)
 * - `'>='` (Greater Than Or Equal To)
 * - `'<='` (Less Than Or Equal To)
 * - `'!='` (Not Equals)
 * - `'~'` (Contains, Ignore Case)
 * - `'~~'` (Contains, Case Sensitive)
 * 
 */
function SimpleFilterDescriptor(columnIndex, compareValue, operation, columnType) {
	'use strict';
	
	this.columnIndex = columnIndex;
	
	/**
	 * Value against which individual cell values are to be compared.
	 *
	 * @type {*}
	 */
	this.compareValue = compareValue;
	
	if (operation && operation !== '=') {
		this.operation = operation;
	}
	
	if (columnType && columnType !== SimpleDataTableUtils.COLUMN_TYPE_INFER) {
		this.columnType = columnType;
	}
	
}

// Default Instance Properties
/**
 * Operation this `SimpleFilterDescriptor` is to perform when determining whether to filter a cell. Valid values are described
 * in this class' description.
 *
 * @type {string}
 */
SimpleFilterDescriptor.prototype.operation = '=';


/**
 * How individual cell values are to be converted. If {@link SimpleDataTableUtils.COLUMN_TYPE_TEXT}, cell values will
 * be treated only as text; if {@link SimpleDataTableUtils.COLUMN_TYPE_INFER} (default), an attempt will be made to 
 * convert cell values to numbers prior to evaluating filter conditions.
 *
 * @type {number}
 */
SimpleFilterDescriptor.prototype.columnType = SimpleDataTableUtils.COLUMN_TYPE_INFER;


// Instance Methods
SimpleFilterDescriptor.prototype.include = function (cell) {
	'use strict';
	
	var operation, columnValue;
	
	switch (this.operation) {
		case '=':
			operation = SimpleDataTableUtils.FILTER_OP_EQUALS;
			break;
		case '>':
			operation = SimpleDataTableUtils.FILTER_OP_GREATER_THAN;
			break;
		case '<':
			operation = SimpleDataTableUtils.FILTER_OP_LESS_THAN;
			break;
		case '>=':
			operation = SimpleDataTableUtils.FILTER_OP_GREATER_THAN | SimpleDataTableUtils.FILTER_OP_EQUALS;
			break;
		case '<=':
			operation = SimpleDataTableUtils.FILTER_OP_LESS_THAN | SimpleDataTableUtils.FILTER_OP_EQUALS;
			break;
		case '!=':
			operation = SimpleDataTableUtils.FILTER_FLAG_NOT | SimpleDataTableUtils.FILTER_OP_EQUALS;
			break;
		case '~':
			operation = SimpleDataTableUtils.FILTER_OP_CONTAINS | SimpleDataTableUtils.FILTER_FLAG_IGNORE_CASE;
			break;
		case '~~':
			operation = SimpleDataTableUtils.FILTER_OP_CONTAINS;
			break;
	}
	
	columnValue = IE8Compatibility.getTextContent(cell).trim();
	
	return SimpleDataTableUtils.shouldInclude(columnValue, operation, this.compareValue, this.columnType);
};