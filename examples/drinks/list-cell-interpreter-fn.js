
function interpretListCell(cell, values) {
    'use strict';
    
    var listElements, i;
    
    listElements = cell.getElementsByTagName('li');
    if (!listElements.length) {
        return true;
    }
    
    for (i = 0; i < listElements.length; ++i) {
        values.add(listElements[i].textContent);
    }
    
    // Not strictly necessary; permissable to not have a return value. (No return statement implies a return value of undefined.)
    return false;
}