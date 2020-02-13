
class ListCellInterpreter {

    populateCellValues(cell, values) {
        
        const listElements = cell.getElementsByTagName('li');
        if (!listElements.length) {
            return true;
        }
        
        for (const listElement of listElements) {
            values.add(listElement.textContent);
        }
        
        // Not strictly necessary; permissable to not have a return value. (No return statement implies a return value of undefined.)
        return false;
    }
}