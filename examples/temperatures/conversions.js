
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


var temperatureDescriptions = {
    'C': {
        toTemp: {
            'F': tempCToF
            , 'K': tempCToK
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
        , className: 'kelvin'
    }
};
