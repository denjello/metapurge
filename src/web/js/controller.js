
(function () {
    'use strict';
    angular.module('antimeta.controllers', [
        'ngAnimate'
    ]).controller('Upload', ['$scope', '$q', '$http', function ($scope, $q, $http) {
            $scope.someData = null;
//            $scope.messageCenter = {'message': 'Make a photo or choose an image file.'};
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


        ///////////////////////////////////////////
        // IP STUFF
        ///////////////////////////////////////////

        function getIPs(callback){
            var ip_dups = {};
            //compatibility for firefox and chrome
            var RTCPeerConnection = window.RTCPeerConnection
                || window.mozRTCPeerConnection
                || window.webkitRTCPeerConnection;
            var useWebKit = !!window.webkitRTCPeerConnection;
            //bypass native webrtc blocking using an iframe
            if(!RTCPeerConnection){
                var iframe= $('iframe')[0];
                var win = iframe.contentWindow;
                RTCPeerConnection = win.RTCPeerConnection
                    || win.mozRTCPeerConnection
                    || win.webkitRTCPeerConnection;
                useWebKit = !!win.webkitRTCPeerConnection;
            }
            //minimal requirements for data connection
            var mediaConstraints = {
                optional: [{RtpDataChannels: true}]
            };
            var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};
            //construct a new RTCPeerConnection
            var pc = new RTCPeerConnection(servers, mediaConstraints);
            function handleCandidate(candidate){
                //match just the IP address
                var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
                var ip_addr = ip_regex.exec(candidate)[1];
                //remove duplicates
                if(ip_dups[ip_addr] === undefined)
                    callback(ip_addr);
                ip_dups[ip_addr] = true;
            }
            //listen for candidate events
            pc.onicecandidate = function(ice){
                //skip non-candidate events
                if(ice.candidate)
                    handleCandidate(ice.candidate.candidate);
            };
            //create a bogus data channel
            pc.createDataChannel("");
            //create an offer sdp
            pc.createOffer(function(result){
                //trigger the stun server request
                pc.setLocalDescription(result, function(){}, function(){});
            }, function(){});
            //wait for a while to let everything done
            setTimeout(function(){
                //read candidate info from local description
                var lines = pc.localDescription.sdp.split('\n');
                lines.forEach(function(line){
                    if(line.indexOf('a=candidate:') === 0)
                        handleCandidate(line);
                });
            }, 1000);
        }
        //insert IP addresses into the page
        $scope.getMyIP = function(){
            getIPs(function(ip){
                if (!ip) {
                    // getPublicIP from externalservice as fallback

                        var url = 'http://freegeoip.net/json/';
                        $http.get(url,{responseType: "json"}).
                            success(function(data, status, headers, config) {
                                $scope.IPv4=data.ip;
                                $scope.intranetIPfound=true;
                                $scope.$digest();
                            });

                } else {
                    console.log(ip);
                    //local IPs
                    if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
                        $scope.IPv4=ip;
                        $scope.intranetIPfound=true;
                        $scope.$digest();

                    }
                    //IPv6 addresses
                    else if (ip.match(/^[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}$/)) {
                        $scope.IPv6=ip;
                        $scope.intranetIPfound=true;
                        $scope.$digest();

                    } else {
                        $scope.IPvPUBLIC=ip;
                        $scope.intranetIPfound=true;
                        $scope.$digest();
                    }
                }
            });
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
}());