
class ClickSortListener {
    
    static get ASCENDING_SORT_CLASS_NAME() { return 'ascending'; }
    static get DESCENDING_SORT_CLASS_NAME() { return 'descending'; }
    
    constructor(tableWrapper) {
        this.tableWrapper = tableWrapper;
    }
    
    init () {
        const tableHeaderCache = this.tableHeaderCache = [];
        for (const tableHeader of this.tableWrapper.getTableElement().tHead.rows[0].cells) {
            tableHeader.addEventListener('click', this, false);
            tableHeaderCache.push(tableHeader);
        }
    }
    
    dispose () {
        for (const tableHeader of this.tableHeaderCache) {
            tableHeader.removeEventListener('click', this, false);
        }
        
        this.tableHeaderCache = null;
    }
    
    handleEvent (event) {
        
        // Setup.
        const tableWrapper = this.tableWrapper;
        const tableHeaderCache = this.tableHeaderCache;
        const header = event.target;
        
        // Error conditions.
        const columnIndex = tableHeaderCache.indexOf(header);
        if (columnIndex === -1) {
            throw new Error('Unrecognized column.');
        }
        
        // Clear last sorted column.
        const lastColumnIndex = this.lastColumnIndex;
        if (lastColumnIndex !== -1 && columnIndex !== lastColumnIndex) {
            const lastHeaderClassList = tableHeaderCache[lastColumnIndex].classList;
            lastHeaderClassList.remove(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
            lastHeaderClassList.remove(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
        }
        this.lastColumnIndex = columnIndex;
        
        // Sort requested column.
        const headerClassList = header.classList;
        if (headerClassList.contains(ClickSortListener.ASCENDING_SORT_CLASS_NAME)) {
            headerClassList.remove(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
            headerClassList.add(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
            
            tableWrapper.sort(new SimpleSortDescriptor(columnIndex, true));
        } else if (headerClassList.contains(ClickSortListener.DESCENDING_SORT_CLASS_NAME)) {
            headerClassList.remove(ClickSortListener.DESCENDING_SORT_CLASS_NAME);
            
            tableWrapper.clearSort();
        } else {
            headerClassList.add(ClickSortListener.ASCENDING_SORT_CLASS_NAME);
            
            tableWrapper.sort(new SimpleSortDescriptor(columnIndex, false));
        }
    }
}

// Field declarations within the class body are not yet standardized.
ClickSortListener.prototype.tableHeaderCache = null;
ClickSortListener.prototype.lastColumnIndex = -1;
//


class GradeCategoryListener {
    
    constructor(tableWrapper, gradeColumnIndex, gradeCategoryInputs) {
        this.tableWrapper = tableWrapper;
        this.gradeColumnIndex = gradeColumnIndex;
        this.gradeCategoryInputs = gradeCategoryInputs;
    }
    
    init() {
        for (const input of this.gradeCategoryInputs) {
            input.addEventListener('click', this, false);
        }
    }

    dispose() {
        for (const input of this.gradeCategoryInputs) {
            input.removeEventListener('click', this, false);
        }
    }

    handleEvent(event) {
        this.filterByCategory(event.target.value);
    }


    filterByCategory(category) {
        const tableWrapper = this.tableWrapper;
        const gradeColumnIndex = this.gradeColumnIndex;
        
        switch (category) {
            case 'passing':
                tableWrapper.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '<='));
                break;
            case 'failing':
                tableWrapper.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '>'));
                break;
            case 'all':
            default:
                tableWrapper.clearFilter();
                break;
        }

    }
}