
var dataTable, dataTableListener;
function pageInit() {
	'use strict';
	
	dataTable = new SimpleDataTable(document.getElementsByTagName('table')[0]);
	dataTableListener = new SimpleDataTableListener(dataTable);
	dataTableListener.init();
}


document.addEventListener('DOMContentLoaded', pageInit);