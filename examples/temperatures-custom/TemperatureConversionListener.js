

function TemperatureConversionListener(table, categoryFieldGroup, conversionMapping, unitInputs) {
    'use strict';
    
    this.table = table;
    this.categoryFieldGroup = categoryFieldGroup;
    this.conversionMapping = conversionMapping;
    this.unitInputs = unitInputs;
}

// Static fields.
TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE = 'data-orig-unit';
TemperatureConversionListener.ORIGINAL_GT_ATTRIBUTE = 'data-orig-gt';
TemperatureConversionListener.ORIGINAL_LTE_ATTRIBUTE = 'data-orig-lte';
TemperatureConversionListener.ORIGINAL_READING_ATTRIBUTE = 'data-orig-temp';

TemperatureConversionListener.CURRENT_GT_ATTRIBUTE = 'data-current-gt';
TemperatureConversionListener.CURRENT_LTE_ATTRIBUTE = 'data-current-lte';

TemperatureConversionListener.APPLICABLE_INPUT_SELECTOR = '.temperature-category[' + TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE + ']';

TemperatureConversionListener.TEMPERATURE_COLUMN_CLASS_NAME = 'temperature-column';

TemperatureConversionListener.SWING_CATEGORY_CLASS_NAME = 'swing';

// Static methods.
TemperatureConversionListener.convertField = function (field, conversionFn, origAttribute, currentAttribute) {
    'use strict';
    
    var orig, current;
    
    orig = Number.parseFloat(field.getAttribute(origAttribute));
    if (!Number.isNaN(orig)) {
        current = TemperatureConversionListener.strRoundToMax(conversionFn(orig), 2);
        field.setAttribute(currentAttribute, current);
    } else {
        current = NaN;
        field.removeAttribute(currentAttribute);
    }
    
    return current;
};

TemperatureConversionListener.getTitle = function (gt, lte, unit) {
    'use strict';
    
    var gtNum, lteNum, unitAffix, rtm;
    
    gtNum = !Number.isNaN(gt);
    lteNum = !Number.isNaN(lte);
    unitAffix = '\u00B0' + unit;
    rtm = TemperatureConversionListener.strRoundToMax;
    
    if (gtNum && lteNum) {
        return rtm(gt, 2) + unitAffix + ' < T <= ' + rtm(lte, 2) + unitAffix;
    } else if (gtNum) {
        return 'T > ' + rtm(gt, 2) + unitAffix;
    } else if (lteNum) {
        return 'T <= ' + rtm(lte, 2) + unitAffix;
    }
    
    return '';
};


TemperatureConversionListener.strRoundToMax = function (num, places) {
    'use strict';
    
    var sign, fixed, decimalPointIndex, trailingZeroIndex, result;
    
    sign = Math.sign(num);
    num = Math.abs(num);
    
    fixed = (num + 2 * Number.EPSILON).toFixed(places);
    
    decimalPointIndex = fixed.indexOf('.');
    trailingZeroIndex = fixed.indexOf('0', decimalPointIndex);
    
    if (trailingZeroIndex == -1) {
        result = fixed;
    } else if (trailingZeroIndex == decimalPointIndex + 1) {
        result = fixed.substring(0, decimalPointIndex);
    } else {
        result = fixed.substring(0, trailingZeroIndex);
    }
    
    return sign < 0 ? '-' + result : result;
};


// Instance methods.
TemperatureConversionListener.prototype.init = function () {
    'use strict';
    
    var unitInputs, i, input;
    
    unitInputs = this.unitInputs;
    for (i = 0; i < unitInputs.length; ++i) {
        input = unitInputs[i];
        input.addEventListener('click', this, false);
        if (input.checked) {
            this.convertTo(input.value);
        }
    }
    
};

TemperatureConversionListener.prototype.dispose = function () {
    'use strict';
    
    var unitInputs, i;
    
    unitInputs = this.unitInputs;
    for (i = 0; i < unitInputs.length; ++i) {
        unitInputs[i].removeEventListener('click', this, false);
    } 
};

TemperatureConversionListener.prototype.handleEvent = function (event) {
    'use strict';
    
    this.convertTo(event.target.value);
};

TemperatureConversionListener.prototype.convertTo = function (targetUnit) {
    'use strict';
    
    this.convertFields(targetUnit);
    this.convertTable(targetUnit);
};


TemperatureConversionListener.prototype.convertFields = function (targetUnit) {
    'use strict';
    
    var categoryFieldGroup, conversionFn, applicableFields, i, field, gt, lte, correspondingLabel;
    
    categoryFieldGroup = this.categoryFieldGroup;
    
    applicableFields = categoryFieldGroup.querySelectorAll(TemperatureConversionListener.APPLICABLE_INPUT_SELECTOR);
    for (i = 0; i < applicableFields.length; ++i) {
        field = applicableFields[i];
        
        // Get conversion function.
        conversionFn = this.getConversionFn(field.getAttribute(TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE), targetUnit,
                field.classList.contains(TemperatureConversionListener.SWING_CATEGORY_CLASS_NAME) ? 'toUnit' : 'toTemp');
        
        // Convert fields, set attributes.
        gt = TemperatureConversionListener.convertField(field, conversionFn, TemperatureConversionListener.ORIGINAL_GT_ATTRIBUTE, TemperatureConversionListener.CURRENT_GT_ATTRIBUTE);
        lte = TemperatureConversionListener.convertField(field, conversionFn, TemperatureConversionListener.ORIGINAL_LTE_ATTRIBUTE, TemperatureConversionListener.CURRENT_LTE_ATTRIBUTE);
        
        // Set title on corresponding label, if present.
        correspondingLabel = categoryFieldGroup.querySelector('label[for="' + field.id + '"]');
        if (correspondingLabel) {
            correspondingLabel.title = TemperatureConversionListener.getTitle(gt, lte, targetUnit);
        }
    }
};


TemperatureConversionListener.prototype.convertTable = function (targetUnit) {
    'use strict';
    
    var table, conversionMapping, columnHeaders, i, temperatureColumnIndicies, rows, cells, j, cell, conversionFn, 
        originalReadingRaw, originalReading;
    
    table = this.table;
    conversionMapping = this.conversionMapping;
    
    temperatureColumnIndicies = [];
    columnHeaders = table.tHead.rows[0].cells;
    for (i = 0; i < columnHeaders.length; ++i) {
        if (columnHeaders[i].classList.contains(TemperatureConversionListener.TEMPERATURE_COLUMN_CLASS_NAME)) {
            temperatureColumnIndicies.push(i);
        }
    }
    
    if (!temperatureColumnIndicies.length) {
        return;
    }
    
    rows = table.tBodies[0].rows;
    for (i = 0; i < rows.length; ++i) {
        cells = rows[i].cells;
        
        for (j = 0; j < temperatureColumnIndicies.length; ++j) {
            cell = cells[temperatureColumnIndicies[j]];
            
            originalReadingRaw = cell.getAttribute(TemperatureConversionListener.ORIGINAL_READING_ATTRIBUTE);
            originalReading = Number.parseFloat(originalReadingRaw);
            if (Number.isNaN(originalReading)) {
                throw new Error('Unable to parse original reading: ' + originalReadingRaw + '(row ' + i + ', column ' + temperatureColumnIndicies[j] + ')');
            }
            
            conversionFn = this.getConversionFn(cell.getAttribute(TemperatureConversionListener.ORIGINAL_UNIT_ATTRIBUTE), targetUnit, 'toTemp');
            cell.textContent = TemperatureConversionListener.strRoundToMax(conversionFn(originalReading), 2);
            cell.className = conversionMapping[targetUnit].className;
        }
    }
};


TemperatureConversionListener.prototype.getConversionFn = function (fromUnit, toUnit, lib) {
    'use strict';
    
    var conversionMapping, conversion, conversionFn;
    
    conversionMapping = this.conversionMapping;
    
    conversion = conversionMapping[fromUnit];
    if (!conversion) {
        throw new Error('No conversion for unit: ' + fromUnit);
    }
    
    conversionFn = conversion[lib][toUnit];
    if (!conversionFn) {
        throw new Error('No conversion from ' + originalUnit + ' to target unit: ' + toUnit);
    }
    
    return conversionFn;
};