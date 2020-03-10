
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