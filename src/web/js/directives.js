angular.module('antimeta.directives', [])
    .filter("toArray", function(){
        'use strict';
        // found at https://stackoverflow.com/questions/14955146/how-to-sort-object-data-source-in-ng-repeat-in-angularjs
        // used in the listview repeat
        return function(obj) {
            var result = [];
            angular.forEach(obj, function(val, key) {
                // check if the offset is there
                if ( val.offset !== false) {
                    result.push(val);
                }
            });
            return result;
        };
    })
    .directive('categories', function() {

    })

    .directive('whenScrolled', function() {
        'use strict';
        // this is the infinite scroller described at
        // https://stackoverflow.com/questions/18204473/progressive-loading-in-ng-repeat-for-images-angular-js
        return function (scope, elm, attr) {
            var raw = elm[0],
                style= window.getComputedStyle(raw),
                overflow = style.getPropertyValue('overflow-x');
            if (overflow === 'scroll')  {
                elm.bind('scroll', function () {
                    if (raw.scrollLeft + raw.offsetWidth >= raw.scrollWidth - 60 ) { //|| raw.scrollLeft + raw.offsetWidth >= raw.scrollWidth
                        scope.$apply(attr.whenScrolled);
                    }
                });
            } else {
                elm.bind('scroll', function () {
                    if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight  - 60 ) { //|| raw.scrollLeft + raw.offsetWidth >= raw.scrollWidth
                        scope.$apply(attr.whenScrolled);
                    }
                });
            }
        };
    })
    .directive('filterListView', function(){
        "use strict";
        // coming soon!!!
    })
    .directive('clickJacker', function() {
        'use strict';
        // general purpose click pass-thru from angular view to controller
        return function (scope, elm, attr) {
            var raw = elm[0];
            $(elm).bind('click', function() {
                scope.$apply(attr.clickJacker);
            });
        };
    });

