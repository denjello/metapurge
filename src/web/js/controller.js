
(function () {
    'use strict';
    angular.module('antimeta.controllers', [
        'ngAnimate'
    ]).controller('Upload', ['$scope', '$q', '$http', function ($scope, $q, $http) {
            $scope.someData = null;
            $scope.messageCenter = {'message': 'Make a photo or choose an image file.'};
            var deferred = $q.defer();

            // todo: Put this into a directive so it can be reused
            $scope.setMessage = function (m, time, mClass) {
                clearTimeout(window.messageTimer);
                if (!mClass) {
                    mClass = "label-default";
                }
                $scope.$apply(function () {
                    $scope.messageCenter = null;
                    $scope.messageCenter = {"message": m, "class": mClass};
                });
                if (time > -1) {
                    window.messageTimer = setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.messageCenter = null;
                        });
                    }, time);
                }
            };
            window.setMessage = function (msg, time, style) {
                $scope.setMessage(msg, time, style);
            };


            Global.startWindowHeight = window.innerHeight;
            Global.video = document.querySelector('video');
            Global.canvas = document.querySelector('canvas#previewer');
            Global.ctx = Global.canvas.getContext('2d');
            Global.uploaderLink = $('a#previewerLink');
            Filter.types();
            Canvas.init();
            Canvas.resizeCanvas();
            Canvas.filters();
            MainInterface.upload();
        }])
        .controller('About', ['$scope', function ($scope) {
        }])
}());