
function tempIdent(temp) {
    'use strict';
    
    return temp;
}

function tempFToC(temp) {
    'use strict';
    
    return (5/9) * (temp - 32);
}

function tempCToF(temp) {
    'use strict';
    
    return temp * (9/5) + 32;
}

function tempKToC(temp) {
    'use strict';
    
    return temp - 273.15;
}

function tempCToK(temp) {
    'use strict';
    
    return temp + 273.15;
}

function unitFToC(unit) {
    'use strict';
    
    return (5/9) * unit;
}

function unitCToF(unit) {
    'use strict';
    
    return (9/5) * unit;
}


var tempConversions = {
    'C': {
        toTemp: {
            'F': tempCToF
            , 'K': tempCToK
            , 'C': tempIdent
        }
        , toUnit: {
            'F': unitCToF
            , 'K': tempIdent
            , 'C': tempIdent
        }
        , className: 'celsius'
        
    }
    , 'F': {
        toTemp: {
            'C': tempFToC
            , 'K': function (temp) {
                'use strict';
                
                return tempCToK(tempFToC(temp));
            }
            , 'F': tempIdent
        }
        , toUnit: {
            'C': unitFToC
            , 'K': unitFToC
            , 'F': tempIdent
        }
        , className: 'fahrenheit'
    }
    , 'K': {
        toTemp: {
            'C': tempKToC
            , 'F': function (temp) {
                'use strict';
                
                return tempCToF(tempKToC(temp));
            }
            , 'K': tempIdent
        }
        , toUnit: {
            'c': tempIdent
            , 'F': unitCToF
            , 'K': tempIdent
        }
        , className: 'kelvin'
    }
};
