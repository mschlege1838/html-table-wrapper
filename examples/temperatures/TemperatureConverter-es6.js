

class TemperatureConverter {
    
    static get ORIGINAL_TEMPERATURE_READING_ATTRIBUTE() { return 'data-orig-temp'; }
    static get ORIGINAL_TEMPERATURE_UNIT_ATTRIBUTE() { return 'data-orig-unit'; }
    
    static strRoundToMax(num, places) {
        // Store sign, convert to absolute value for EPSILON offset.
        const sign = Math.sign(num);
        num = Math.abs(num);
        
        // Calculate fixed representation of EPSILON offset.
        const fixed = (num + 2 * Number.EPSILON).toFixed(places);
        
        // Determine whether a substring of the fixed representation needs to be returned.
        const decimalPointIndex = fixed.indexOf('.');
        const trailingZeroIndex = fixed.indexOf('0', decimalPointIndex);
        
        let result;
        if (trailingZeroIndex == -1) { // If there are no trailing zeros, the fixed representation is the result.
            result = fixed;
        } else if (trailingZeroIndex === decimalPointIndex + 1) { // If the first digit after the decimal point is a zero, no decimal point is needed.
            result = fixed.substring(0, decimalPointIndex);
        } else { // Otherwise, the result is the substring of the fixed representation including the decimal, and all significant digits after.
            result = fixed.substring(0, trailingZeroIndex);
        }

        return sign < 0 ? `-${result}` : result;
    }
    
    
    constructor(table, temperatureDescriptions) {
        this.table = table;
        this.temperatureDescriptions = temperatureDescriptions;
    }
    
    convertColumn(columnIndex, unit) {
        if (typeof columnIndex !== 'number') {
            throw new TypeError(`Given column index is not a number: ${columnIndex}`);
        }
        
        const temperatureDescriptions = this.temperatureDescriptions;
        
        for (const row of this.table.tBodies[0].rows) {
            const cells = row.cells;
            
            if (columnIndex >= cells.length) {
                throw new RangeError(`Given column index is out of range for row ${i}: ${columnIndex}`);
            }
            
            // Obtain original reading for cell.
            const cell = cells[columnIndex];
            const originalUnit = cell.getAttribute(TemperatureConverter.ORIGINAL_TEMPERATURE_UNIT_ATTRIBUTE);
            
            // Obtain descriptor for original unit.
            const fromDescription = temperatureDescriptions[originalUnit];
            if (!fromDescription) {
                throw new ReferenceError(`No description found for original column unit: ${originalUnit}`);
            }
            
            // Obtain conversion function to target unit.
            const conversionFn = fromDescription.toTemp[unit];
            if (!conversionFn) {
                throw new ReferenceError(`No conversion found from original unit ${originalUnit} to desired unit: ${unit}`);
            }
            
            // Read in original reading.
            const originalTempRaw = cell.getAttribute(TemperatureConverter.ORIGINAL_TEMPERATURE_READING_ATTRIBUTE)
            const originalTemp = Number.parseFloat(originalTempRaw);
            if (Number.isNaN(originalTemp)) {
                throw new Error(`Unable to parse original temperature reading for row ${i}: ${originalTempRaw}`);
            }
            
            // Convert, format, and set result to the current cell's textContent.
            cell.textContent = TemperatureConverter.strRoundToMax(conversionFn(originalTemp), 2);
            
            // Obtain descriptor for target unit.
            const toDescription = temperatureDescriptions[unit];
            if (!toDescription) {
                throw new ReferenceError(`No description found for desired unit: ${unit}`);
            }
            
            // Apply target unit class name to cell.
            cell.className = toDescription.className;
        }
    }
}