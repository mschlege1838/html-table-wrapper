

class TemperatureColumnControlFactory {

	constructor(temperatureConverter) {
		this.temperatureConverter = temperatureConverter;
	}
	
	getColumnControl(columnIndex, parent) {
		if (parent.getTableHeaderElement(columnIndex).classList.contains('temperature-column')) {
			return new TemperatureColumnControl(columnIndex, parent, this.temperatureConverter);
		}
		
		// Not strictly necessary; no return statement implies a return value of undefined.
		return null;
	}
}