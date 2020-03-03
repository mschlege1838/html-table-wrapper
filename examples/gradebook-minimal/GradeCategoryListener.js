
function GradeCategoryListener(htmlTableWrapper, gradeColumnIndex, gradeCategoryInputs) {
    'use strict';
    
    this.htmlTableWrapper = htmlTableWrapper;
    this.gradeColumnIndex = gradeColumnIndex;
    this.gradeCategoryInputs = gradeCategoryInputs;
}

GradeCategoryListener.PASSING_CATEGORY_NAME = 'passing';
GradeCategoryListener.FAILING_CATEGORY_NAME = 'failing';
GradeCategoryListener.ALL_CATEGORIES_NAME = 'all';

GradeCategoryListener.prototype.init = function () {
    'use strict';
    
    var gradeCategoryInputs, i;
    
    gradeCategoryInputs = this.gradeCategoryInputs;
    for (i = 0; i < gradeCategoryInputs.length; ++i) {
        gradeCategoryInputs[i].addEventListener('click', this, false);
    }
};

GradeCategoryListener.prototype.dispose = function () {
    'use strict';
    
    var gradeCategoryInputs, i;
    
    gradeCategoryInputs = this.gradeCategoryInputs;
    for (i = 0; i < gradeCategoryInputs.length; ++i) {
        gradeCategoryInputs[i].removeEventListener('click', this, false);
    }
};

GradeCategoryListener.prototype.handleEvent = function (event) {
    'use strict';
    
    this.filterByCategory(event.target.value);
};

GradeCategoryListener.prototype.filterByCategory = function (category) {
    'use strict';
    
    var htmlTableWrapper, gradeColumnIndex;
    
    htmlTableWrapper = this.htmlTableWrapper;
    gradeColumnIndex = this.gradeColumnIndex;
    
    switch (category) {
        case GradeCategoryListener.PASSING_CATEGORY_NAME:
            // Passing => filter to grades that are 'C', or occur before it in the alphabet:
            htmlTableWrapper.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '<='));
            break;
            
        case GradeCategoryListener.FAILING_CATEGORY_NAME:
            // Failing => filter to grades that occur after 'C' in the alphabet:
            htmlTableWrapper.filter(new SimpleFilterDescriptor(gradeColumnIndex, 'C', '>'));
            break;
            
        case GradeCategoryListener.ALL_CATEGORIES_NAME:
        default:
            // Otherwise, show all grades:
            htmlTableWrapper.clearFilter();
            break;
    }

};