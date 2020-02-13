

function TemperatureColumnControlFactory(temperatureConverter) {
    'use strict';
    
    this.temperatureConverter = temperatureConverter;
}

TemperatureColumnControlFactory.prototype.getColumnControl = function (columnIndex, parent) {
    'use strict';
    
    if (parent.getTableHeaderElement(columnIndex).classList.contains('temperature-column')) {
        return new TemperatureColumnControl(columnIndex, parent, this.temperatureConverter);
    }
    
    // Not strictly necessary; no return statement implies a return value of undefined.
    return null;
};