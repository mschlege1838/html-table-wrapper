


class TemperatureColumnControl {
	
	static get CLICK_TARGETS_SELECTOR() { return '.temperature-unit, .close-button'; }
	
	static getIdBase() {
		return `temperatureControl_${TemperatureColumnControl.idCounter++}_`;
	}
	
	constructor(columnIndex, parent, temperatureConverter) {
		this.columnIndex = columnIndex;
		this.parent = parent;
		this.temperatureConverter = temperatureConverter;
		this.contextControl = new ContextControl();
	}
	
	init() {
		this.contextControl.addEventListener('create', this, false);
	}
	
	dispose() {
		const contextControl = this.contextControl;
		
		const controlElement = contextControl.getControlElement();
		if (controlElement) {
			const clickTargets = controlElement.querySelectorAll(TemperatureColumnControl.CLICK_TARGETS_SELECTOR);
			for (const clickTarget of clickTargets) {
				clickTarget.removeEventListener('click', this, false);
			}
			
			controlElement.querySelector('.temperature-filter-operator').removeEventListener('change', this, false);
			controlElement.querySelector('.temperature-filter-operand').removeEventListener('keyup', this, false);
		}
		
		contextControl.removeEventListener('create', this, false);
	}
	
	handleEvent(event) {
		const target = event.target;
		
		switch (event.type) {
			case 'create':
				this.defineContent(target.getControlElement());
				break;
			case 'click':
				if (target.classList.contains('temperature-unit')) {
					this.temperatureConverter.convertColumn(this.columnIndex, target.value);
				} else if (target.classList.contains('close-button')) {
					this.close();
				}
				break;
			case 'change':
			case 'keyup':
				this.updateParent();
				break;
		}
	}
	
	open() {
		this.contextControl.open(this.parent.getTableHeaderElement(this.columnIndex));
	}
	
	close() {
		this.contextControl.close();
	}
	
	getFilterDescriptor() {
		const controlElement = this.contextControl.getControlElement();
		if (!controlElement) {
			return null;
		}
		
		const operand = Number.parseFloat(controlElement.querySelector('.temperature-filter-operand').value);
		if (Number.isNaN(operand)) {
			return null;
		}
		
		return new SimpleFilterDescriptor(this.columnIndex, operand, controlElement.querySelector('.temperature-filter-operator').value);
	}
	
	getSortDescriptor() {
		// Not strictly necessary; no return statement implies a return value of undefined.
		return null;
	}
	
	updateParent() {
		'use strict';
		
		this.parent.processTable();
		this.contextControl.position();
	}
	
	defineContent(container) {
		const builder = new XMLBuilder();
		const idBase = TemperatureColumnControl.getIdBase();
		
		const fId = idBase + 'fInput';
		const cId = idBase + 'cInput';
		const kId = idBase + 'kInput';
		const unitInputSetName = idBase + 'temperatureInput';
		const operatorId = idBase + 'operator';
		const operandId = idBase + 'operand';
		
		builder.startTag('div').attribute('class', 'control-bar')
			.startTag('span').attribute('class', 'control-button close-button').content('\u00D7').closeTag()
		.closeTag()
		.startTag('div').attribute('class', 'unit-selection')
			.startTag('span')
				.startTag('input').attribute('id', fId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName).attribute('value', 'F').attribute('type', 'radio').closeTag()
				.startTag('label').attribute('for', fId).attribute('class', 'fahrenheit').closeTag(true)
			.closeTag()
			.startTag('span')
				.startTag('input').attribute('id', cId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName).attribute('value', 'C').attribute('type', 'radio').closeTag()
				.startTag('label').attribute('for', cId).attribute('class', 'celsius').closeTag(true)
			.closeTag()
			.startTag('span')
				.startTag('input').attribute('id', kId).attribute('class', 'temperature-unit').attribute('name', unitInputSetName).attribute('value', 'K').attribute('type', 'radio').closeTag()
				.startTag('label').attribute('for', kId).attribute('class', 'kelvin').closeTag(true)
			.closeTag()
		.closeTag()
		.startTag('div').attribute('class', 'filter-condition')
			.startTag('label').attribute('for', operatorId).content('Temperature is ').closeTag()
			.startTag('select').attribute('id', operatorId).attribute('class', 'temperature-filter-operator')
				.startTag('option').attribute('value', '>=').content('>=').closeTag()
				.startTag('option').attribute('value', '<=').content('<=').closeTag()
				.startTag('option').attribute('value', '>').content('>').closeTag()
				.startTag('option').attribute('value', '<').content('<').closeTag()
				.startTag('option').attribute('value', '=').content('=').closeTag()
			.closeTag()
			.startTag('label').attribute('for', operandId).content(' to ').closeTag()
			.startTag('input').attribute('id', operandId).attribute('class', 'temperature-filter-operand')
		.closeTag();
		
		
		container.insertAdjacentHTML('afterbegin', builder.toString());
		
		for (const clickTarget of container.querySelectorAll(TemperatureColumnControl.CLICK_TARGETS_SELECTOR)) {
			clickTarget.addEventListener('click', this, false);
		}
		
		container.querySelector('.temperature-filter-operator').addEventListener('change', this, false);
		container.querySelector('.temperature-filter-operand').addEventListener('keyup', this, false);
	}
}

// (Static field declarations within the body of the class are not yet standardized.)
TemperatureColumnControl.idCounter = 0;
