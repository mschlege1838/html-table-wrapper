function TemperatureConverter(table, temperatureDescriptions) {
    'use strict';
    
    this.table = table;
    this.temperatureDescriptions = temperatureDescriptions;
}

// Static fields.
TemperatureConverter.ORIGINAL_TEMPERATURE_READING_ATTRIBUTE = 'data-orig-temp';
TemperatureConverter.ORIGINAL_TEMPERATURE_UNIT_ATTRIBUTE = 'data-orig-unit';

// Static methods.
TemperatureConverter.strRoundToMax = function (num, places) {
    'use strict';
    
    var sign, fixed, decimalPointIndex, trailingZeroIndex, result;
    
    // Store sign, convert to absolute value for EPSILON offset.
    sign = Math.sign(num);
    num = Math.abs(num);
    
    // Calculate fixed representation of EPSILON offset.
    fixed = (num + 2 * Number.EPSILON).toFixed(places);
    
    // Determine whether a substring of the fixed representation needs to be returned.
    decimalPointIndex = fixed.indexOf('.');
    trailingZeroIndex = fixed.indexOf('0', decimalPointIndex);
    
    if (trailingZeroIndex == -1) { // If there are no trailing zeros, the fixed representation is the result.
        result = fixed;
    } else if (trailingZeroIndex === decimalPointIndex + 1) { // If the first digit after the decimal point is a zero, no decimal point is needed.
        result = fixed.substring(0, decimalPointIndex);
    } else { // Otherwise, the result is the substring of the fixed representation including the decimal, and all significant digits after.
        result = fixed.substring(0, trailingZeroIndex);
    }
    
    // Return the result calculated above, with the original sign applied.
    return sign < 0 ? '-' + result : result;
};

// Instance methods.
TemperatureConverter.prototype.convertColumn = function (columnIndex, unit) {
    'use strict';
    
    var rows, i, columnIndex, cells, cell, temperatureDescriptions, fromDescription, originalUnit, conversionFn, 
        originalTempRaw, originalTemp, toDescription;
    
    if (typeof columnIndex !== 'number') {
        throw new TypeError('Given column index is not a number: ' + columnIndex);
    }
    
    temperatureDescriptions = this.temperatureDescriptions;
    
    rows = this.table.tBodies[0].rows;
    for (i = 0; i < rows.length; ++i) {
        cells = rows[i].cells;
        
        if (columnIndex >= cells.length) {
            throw new RangeError('Given column index is out of range for row ' + i + ': ' + columnIndex);
        }
        
        // Obtain original reading for cell.
        cell = cells[columnIndex];
        originalUnit = cell.getAttribute(TemperatureConverter.ORIGINAL_TEMPERATURE_UNIT_ATTRIBUTE);
        
        // Obtain descriptor for original unit.
        fromDescription = temperatureDescriptions[originalUnit];
        if (!fromDescription) {
            throw new ReferenceError('No description found for original column unit: ' + originalUnit);
        }
        
        // Obtain conversion function to target unit.
        conversionFn = fromDescription.toTemp[unit];
        if (!conversionFn) {
            throw new ReferenceError('No conversion found from original unit ' + originalUnit + ' to desired unit: ' + unit);
        }
        
        // Read in original reading.
        originalTempRaw = cell.getAttribute(TemperatureConverter.ORIGINAL_TEMPERATURE_READING_ATTRIBUTE)
        originalTemp = Number.parseFloat(originalTempRaw);
        if (Number.isNaN(originalTemp)) {
            throw new Error('Unable to parse original temperature reading for row ' + i + ': ' + originalTempRaw);
        }
        
        // Convert, format, and set result to the current cell's textContent.
        cell.textContent = TemperatureConverter.strRoundToMax(conversionFn(originalTemp), 2);
        
        // Obtain descriptor for target unit.
        toDescription = temperatureDescriptions[unit];
        if (!toDescription) {
            throw new ReferenceError('No description found for desired unit: ' + unit);
        }
        
        // Apply target unit class name to cell.
        cell.className = toDescription.className;
    }
};