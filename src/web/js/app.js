(function () {
    'use strict';
    angular.module('metapurge', [
        'ui.bootstrap',
        'ngRoute',
        'ngAnimate',
        'ngTouch',
        'antimeta.controllers'
    ])
        .config(['$routeProvider', '$locationProvider', '$animateProvider', function($routeProvider, $locationProvider, $animateProvider) {

            $animateProvider.classNameFilter(/animate-/);

            $locationProvider.html5Mode(true);

            $routeProvider.when('/', {
                templateUrl: '/index.html',
                controller: 'Upload'});
            $routeProvider.otherwise({redirectTo: '/'});

        }])
        .run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
            var original = $location.path;
            $location.path = function (path, reload) {
                if (reload === false) {
                    var lastRoute = $route.current;
                    var un = $rootScope.$on('$locationChangeSuccess', function () {
                        $route.current = lastRoute;
                        un();
                    });
                }

                return original.apply($location, [path]);
            };
        }]);
}());

