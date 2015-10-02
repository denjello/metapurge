/**
 * antimeta-sideloader - A standalone Metadata scrubber and Picture App.
 * @version v0.0.1
 * @link 
 * @license 
 */
(function () {
    'use strict';
    angular.module('metapurge', [
        'ui.bootstrap',
        'ngRoute',
        'ngAnimate',
        'ngTouch',
        'metapurge.controllers'
    ])
        .config(['$routeProvider', '$locationProvider', '$animateProvider', function($routeProvider, $locationProvider, $animateProvider) {

            $animateProvider.classNameFilter(/animate-/);

            $locationProvider.html5Mode(true);

            $routeProvider.when('/metapurge/', {
                templateUrl: '/index.html',
                controller: 'Upload'});
            $routeProvider.otherwise({redirectTo: '/metapurge/'});

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



(function () {
    'use strict';
    angular.module('metapurge.controllers', [
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
(function(){function f(e,t){e=String(e);while(e.length<t)e="0"+e;return e}function d(e,t){Date.prototype[e]===undefined&&(Date.prototype[e]=t)}var e=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],t=["January","February","March","April","May","June","July","August","September","October","November","December"],n=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],r=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],i={su:0,sun:0,sunday:0,mo:1,mon:1,monday:1,tu:2,tue:2,tuesday:2,we:3,wed:3,wednesday:3,th:4,thu:4,thursday:4,fr:5,fri:5,friday:5,sa:6,sat:6,saturday:6},s=t.concat(e),o=["su","sun","sunday","mo","mon","monday","tu","tue","tuesday","we","wed","wednesday","th","thu","thursday","fr","fri","friday","sa","sat","saturday"],u={jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11},a=[31,28,31,30,31,30,31,31,30,31,30,31],l=function(e){return e.match(/^(\d+)$/)?!0:!1},c=function(e,t,n,r){for(var i=r;i>=n;i--){var s=e.substring(t,t+i);if(s.length<n)return null;if(l(s))return s}return null},h=Date.parse,p=function(e,t){e+="",t+="";var n=0,r=0,i="",u="",a="",f,l,h=new Date,p=h.getYear(),d=h.getMonth()+1,v=1,m=0,g=0,y=0,b="";while(r<t.length){i=t.charAt(r),u="";while(t.charAt(r)===i&&r<t.length)u+=t.charAt(r++);if(u==="yyyy"||u==="yy"||u==="y"){u==="yyyy"&&(f=4,l=4),u==="yy"&&(f=2,l=2),u==="y"&&(f=2,l=4),p=c(e,n,f,l);if(p===null)return NaN;n+=p.length,p.length===2&&(p>70?p=1900+(p-0):p=2e3+(p-0))}else if(u==="MMM"||u==="NNN"){d=0;for(var w=0;w<s.length;w++){var E=s[w];if(e.substring(n,n+E.length).toLowerCase()===E.toLowerCase())if(u==="MMM"||u==="NNN"&&w>11){d=w+1,d>12&&(d-=12),n+=E.length;break}}if(d<1||d>12)return NaN}else if(u==="EE"||u==="E")for(var S=0;S<o.length;S++){var x=o[S];if(e.substring(n,n+x.length).toLowerCase()===x.toLowerCase()){n+=x.length;break}}else if(u==="MM"||u==="M"){d=c(e,n,u.length,2);if(d===null||d<1||d>12)return NaN;n+=d.length}else if(u==="dd"||u==="d"){v=c(e,n,u.length,2);if(v===null||v<1||v>31)return NaN;n+=v.length}else if(u==="hh"||u==="h"){m=c(e,n,u.length,2);if(m===null||m<1||m>12)return NaN;n+=m.length}else if(u==="HH"||u==="H"){m=c(e,n,u.length,2);if(m===null||m<0||m>23)return NaN;n+=m.length}else if(u==="KK"||u==="K"){m=c(e,n,u.length,2);if(m===null||m<0||m>11)return NaN;n+=m.length}else if(u==="kk"||u==="k"){m=c(e,n,u.length,2);if(m===null||m<1||m>24)return NaN;n+=m.length,m--}else if(u==="mm"||u==="m"){g=c(e,n,u.length,2);if(g===null||g<0||g>59)return NaN;n+=g.length}else if(u==="ss"||u==="s"){y=c(e,n,u.length,2);if(y===null||y<0||y>59)return NaN;n+=y.length}else if(u==="a"){if(e.substring(n,n+2).toLowerCase()==="am")b="AM";else{if(e.substring(n,n+2).toLowerCase()!=="pm")return NaN;b="PM"}n+=2}else{if(e.substring(n,n+u.length)!==u)return NaN;n+=u.length}}if(n!==e.length)return NaN;if(d===2)if(p%4===0&&p%100!==0||p%400===0){if(v>29)return NaN}else if(v>28)return NaN;if(d===4||d===6||d===9||d===11)if(v>30)return NaN;m<12&&b==="PM"?m=m-0+12:m>11&&b==="AM"&&(m-=12);var T=new Date(p,d-1,v,m,g,y);return T.getTime()};Date.parse=function(e,t){if(t)return p(e,t);var n=h(e),r=0,i;return isNaN(n)&&(i=/^(\d{4}|[+\-]\d{6})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3,}))?)?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?))?/.exec(e))&&(i[8]!=="Z"&&(r=+i[10]*60+ +i[11],i[9]==="+"&&(r=0-r)),i[7]=i[7]||"000",n=Date.UTC(+i[1],+i[2]-1,+i[3],+i[4],+i[5]+r,+i[6],+i[7].substr(0,3))),n},Date.today=function(){return(new Date).clearTime()},Date.UTCtoday=function(){return(new Date).clearUTCTime()},Date.tomorrow=function(){return Date.today().add({days:1})},Date.UTCtomorrow=function(){return Date.UTCtoday().add({days:1})},Date.yesterday=function(){return Date.today().add({days:-1})},Date.UTCyesterday=function(){return Date.UTCtoday().add({days:-1})},Date.validateDay=function(e,t,n){var r=new Date(t,n,e);return r.getFullYear()===t&&r.getMonth()===n&&r.getDate()===e},Date.validateYear=function(e){return e>=0&&e<=9999},Date.validateSecond=function(e){return e>=0&&e<60},Date.validateMonth=function(e){return e>=0&&e<12},Date.validateMinute=function(e){return e>=0&&e<60},Date.validateMillisecond=function(e){return e>=0&&e<1e3},Date.validateHour=function(e){return e>=0&&e<24},Date.compare=function(e,t){return e.valueOf()<t.valueOf()?-1:e.valueOf()>t.valueOf()?1:0},Date.equals=function(e,t){return e.valueOf()===t.valueOf()},Date.getDayNumberFromName=function(e){return i[e.toLowerCase()]},Date.getMonthNumberFromName=function(e){return u[e.toLowerCase()]},Date.isLeapYear=function(e){return(new Date(e,1,29)).getDate()===29},Date.getDaysInMonth=function(e,t){return t===1?Date.isLeapYear(e)?29:28:a[t]},d("getMonthAbbr",function(){return e[this.getMonth()]}),d("getMonthName",function(){return t[this.getMonth()]}),d("getUTCOffset",function(){var e=f(Math.abs(this.getTimezoneOffset()/.6),4);return this.getTimezoneOffset()>0&&(e="-"+e),e}),d("toCLFString",function(){return f(this.getDate(),2)+"/"+this.getMonthAbbr()+"/"+this.getFullYear()+":"+f(this.getHours(),2)+":"+f(this.getMinutes(),2)+":"+f(this.getSeconds(),2)+" "+this.getUTCOffset()}),d("toYMD",function(e){return e=typeof e=="undefined"?"-":e,this.getFullYear()+e+f(this.getMonth()+1,2)+e+f(this.getDate(),2)}),d("toDBString",function(){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1,2)+"-"+f(this.getUTCDate(),2)+" "+f(this.getUTCHours(),2)+":"+f(this.getUTCMinutes(),2)+":"+f(this.getUTCSeconds(),2)}),d("clearTime",function(){return this.setHours(0),this.setMinutes(0),this.setSeconds(0),this.setMilliseconds(0),this}),d("clearUTCTime",function(){return this.setUTCHours(0),this.setUTCMinutes(0),this.setUTCSeconds(0),this.setUTCMilliseconds(0),this}),d("add",function(e){return e.milliseconds!==undefined&&this.setMilliseconds(this.getMilliseconds()+e.milliseconds),e.seconds!==undefined&&this.setSeconds(this.getSeconds()+e.seconds),e.minutes!==undefined&&this.setMinutes(this.getMinutes()+e.minutes),e.hours!==undefined&&this.setHours(this.getHours()+e.hours),e.days!==undefined&&this.setDate(this.getDate()+e.days),e.weeks!==undefined&&this.setDate(this.getDate()+e.weeks*7),e.months!==undefined&&this.setMonth(this.getMonth()+e.months),e.years!==undefined&&this.setFullYear(this.getFullYear()+e.years),this}),d("addMilliseconds",function(e){return this.add({milliseconds:e})}),d("addSeconds",function(e){return this.add({seconds:e})}),d("addMinutes",function(e){return this.add({minutes:e})}),d("addHours",function(e){return this.add({hours:e})}),d("addDays",function(e){return this.add({days:e})}),d("addWeeks",function(e){return this.add({days:e*7})}),d("addMonths",function(e){return this.add({months:e})}),d("addYears",function(e){return this.add({years:e})}),d("setTimeToNow",function(){var e=new Date;this.setMilliseconds(e.getMilliseconds()),this.setSeconds(e.getSeconds()),this.setMinutes(e.getMinutes()),this.setHours(e.getHours())}),d("clone",function(){return new Date(this.valueOf())}),d("between",function(e,t){return this.valueOf()>=e.valueOf()&&this.valueOf()<=t.valueOf()}),d("compareTo",function(e){return Date.compare(this,e)}),d("equals",function(e){return Date.equals(this,e)}),d("isAfter",function(e){return e=e?e:new Date,this.compareTo(e)>0}),d("isBefore",function(e){return e=e?e:new Date,this.compareTo(e)<0}),d("getDaysBetween",function(e){return(e.clone().valueOf()-this.valueOf())/864e5|0}),d("getHoursBetween",function(e){return(e.clone().valueOf()-this.valueOf())/36e5|0}),d("getMinutesBetween",function(e){return(e.clone().valueOf()-this.valueOf())/6e4|0}),d("getSecondsBetween",function(e){return(e.clone().valueOf()-this.valueOf())/1e3|0}),d("getMillisecondsBetween",function(e){return e.clone().valueOf()-this.valueOf()|0}),d("getOrdinalNumber",function(){return Math.ceil((this.clone().clearTime()-new Date(this.getFullYear(),0,1))/864e5)+1}),d("toFormat",function(e){return v(e,m(this))}),d("toUTCFormat",function(e){return v(e,g(this))});var v=function(e,t){var n=[e],r,i,s,o=function(e,t){var r=0,i=n.length,s,o,u,a=[];for(;r<i;r++)if(typeof n[r]=="string"){u=n[r].split(e);for(s=0,o=u.length-1;s<o;s++)a.push(u[s]),a.push([t]);a.push(u[o])}else a.push(n[r]);n=a};for(r in t)o(r,t[r]);s="";for(r=0,i=n.length;r<i;r++)s+=typeof n[r]=="string"?n[r]:n[r][0];return n.join("")},m=function(i){var s=i.getHours()%12?i.getHours()%12:12;return{YYYY:i.getFullYear(),YY:String(i.getFullYear()).slice(-2),MMMM:t[i.getMonth()],MMM:e[i.getMonth()],MM:f(i.getMonth()+1,2),MI:f(i.getMinutes(),2),M:i.getMonth()+1,DDDD:r[i.getDay()],DDD:n[i.getDay()],DD:f(i.getDate(),2),D:i.getDate(),HH24:f(i.getHours(),2),HH:f(s,2),H:s,SS:f(i.getSeconds(),2),PP:i.getHours()>=12?"PM":"AM",P:i.getHours()>=12?"pm":"am",LL:f(i.getMilliseconds(),3)}},g=function(i){var s=i.getUTCHours()%12?i.getUTCHours()%12:12;return{YYYY:i.getUTCFullYear(),YY:String(i.getUTCFullYear()).slice(-2),MMMM:t[i.getUTCMonth()],MMM:e[i.getUTCMonth()],MM:f(i.getUTCMonth()+1,2),MI:f(i.getUTCMinutes(),2),M:i.getUTCMonth()+1,DDDD:r[i.getUTCDay()],DDD:n[i.getUTCDay()],DD:f(i.getUTCDate(),2),D:i.getUTCDate(),HH24:f(i.getUTCHours(),2),HH:f(s,2),H:s,SS:f(i.getUTCSeconds(),2),PP:i.getUTCHours()>=12?"PM":"AM",P:i.getUTCHours()>=12?"pm":"am",LL:f(i.getUTCMilliseconds(),3)}}})();
angular.module('metapurge.directives', [])
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


// TODO: Go through all of these and sort them correctly.

var MainInterface = {
    menu: function (special) {
        "use strict";
        var autohide, hide;

        // this is so we can show the teamchooser after already selecting an image...
        if ($('.nav a:last').hasClass("hidden") === true) {
            $('.nav a:nth-last-of-type(2)').addClass('roundedBottom');
        }

        $('.openMenu').unbind('click').bind('click', function () {
            if ($('.nav a:nth-last-of-type(2)').hasClass("roundedBottom") === true) {
                $('.nav a:nth-last-of-type(2)').removeClass('roundedBottom');
            } else {
                if ($('.nav a:last').hasClass("hidden") === true) {
                    $('.nav a:nth-last-of-type(2)').addClass('roundedBottom');
                }
            }

            $('.nav').toggle(100);
            $(this).blur();
        });

        // overrides for display pages
        if (special === "autohide") {
            autohide = window.setTimeout(function () {
                $('.openMenu,.nav').fadeOut(500);
                $('*').css('cursor', 'none');
            }, 5000);
            $(document).on('mousemove', '*', function () {
                $('*').css('cursor', 'auto');
            }).

                on('click', 'canvas', function () {
                    $('.openMenu').fadeIn(500);
                    window.setTimeout(autohide);
                }).on('mouseover', '.nav', function () {
                    window.clearTimeout(hide);
                    window.clearTimeout(autohide);
                }).on('mouseleave', '.nav', function () {
                    window.setTimeout(autohide);
                    $('.nav').fadeOut(250);
                });
        } else {
            hide = window.setTimeout(function () {
                $('.nav').fadeOut(500);
            }, 5000);

            $(document).
                on('mouseover', '.nav', function () {
                    window.clearTimeout(hide);
                    window.clearTimeout(autohide);
                }).
                on('mouseleave', '.nav', function () {
                    $('.nav').fadeOut(250);
                    $('img.teampics').unbind('click').bind('click', function () {
                        Global.NEWTEAMMATEcontributor_id = $(this).attr('ng-contributor_id');
                        $('img.teampics').removeClass('selectedForTeam');
                        $(this).addClass('selectedForTeam');
                        Global.reference_image_id = $(this).attr('ng-reference_image_id')
                        //// window.setMessage('Team Member Selected',2000);
                    });
                });
        }
        $('a:not(.stayhere)').unbind('click').bind('click', function (e) {
            e.preventDefault();
            var change = Canvas.stopCam();
            var link = $(this).attr('href');
            var changePage = window.setInterval(function () {
                if (change === true) {
                    //Global = null;
                    window.clearInterval(changePage);
                    window.location.href = link;
                }
            }, 250);
        });
        $('a.stayhere').unbind('click').bind('click', function (e) {
            e.preventDefault();
            $('#allPics').toggleClass('hidden');
            $('.nav').fadeOut(250);
        })
    },

    upload: function () { // this should be renamed.
        "use strict";

        // turn off camera icon if not supported
        function hasGetUserMedia() {
            return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
        }

        if (hasGetUserMedia() === false) {
            $('#camera,#camchoice').remove();
            $('#accept').css('padding-right', '50px');
        } else {
            $('#camera,#camchoice').click(function () {

                Tools.loading(true);
                window.turnOnCamera = setTimeout(function () {
                    if ($('#load').is(':visible')) {
                        // window.setMessage('Please turn on your Camera.', -1, 'label-error');
                    }
                }, 5000);
                window.cameraProblems = setTimeout(function () {
                    if ($('#load').is(':visible')) {
                        // window.setMessage('Problems? Try uploading from the filesystem.', -1, 'label-error');
                        $('#nativeFile .fa').addClass('oneblink');
                    }
                }, 30000);
                Canvas.init();

                function cameraIntervalTimer() {
                    if (window.localMediaStream) {
                        clearTimeout(window.turnOnCamera);
                        clearTimeout(window.cameraProblems);
                        clearInterval(window.cameraInterval);
                    }
                }

                window.cameraInterval = setInterval(cameraIntervalTimer, 1000);
            });
        }
        $(window).smartresize(function () {
            setTimeout(function () {
                Canvas.resizeCanvas();
            }, 500);
        });


        $('#city').on('click', function () {
            $('#cityChooser').fadeIn();
        });


        $('#nativeFile,#filechoice').click(function () {
            $('input#filechooser').trigger('click');
        });

        $('input#filechooser').on("click", function () {
            setTimeout(function () {
                if (!Global.file) {
                    // window.setMessage('Try the old uploader.', null, 'label-error');
                    $('input#filechooser').attr('capture', 'camera').removeClass('hidden');
                    clearInterval(window.fileInterval);
                }
            }, 15000);
            function fileIntervalTimer() {
                if (Global.file) {
                    Tools.loading('stop');
                    clearInterval(window.fileInterval);
                }
            }

            window.fileInterval = setInterval(fileIntervalTimer, 100);
        }).off("change").on("change", function (evnt) {
            // this is the native file element
            // that is not being triggered when a picture is made on mobile. :(
            Global.file = this.files[0];
            if (Global.file) {
                if (Tools.isImage(Global.file.type) === true) {
                    Canvas.fromImage(evnt);

                    Tools.activate('filechoice');
                    $(".step1").hide();
                    $(".step3").hide();
                    $('.step2').hide().removeClass('hidden').fadeIn(500);

                } else {
                    //$scope.setMessage('That file is not an image.',-1,'label-error');
                    setTimeout(function () {
                        window.location.reload(true);
                    }, 3000);
                }
            }
        });

        $("#accept.action,canvas").click(function () {
            Tools.flash();
            $(".step1").hide();
            $('.step2').hide().removeClass('hidden').fadeIn(500);
            Canvas.freezer();
        });
        $("#cancel").click(function () {
            $(".step2").hide();
            $(".step1").fadeIn(500);
            $(".step3").hide();
            Canvas.releaser();
        });
        $("#settings span.trigger").click(function () {
            if ($('.step3').hasClass('hidden')) {
                $(".step3").hide().removeClass('hidden').fadeIn(500);
                $("#settings i.fa-stack-2x").addClass("fa-circle");
                $("#settings i.fa-stack-1x").addClass("white");

            } else {
                $(".step3").fadeOut(250).addClass('hidden');
                $("#settings .trigger").blur();
                $("#settings .fa-stack-2x").removeClass("fa-circle");
                $("#settings .fa-stack-1x").removeClass("white");
            }
        });
        $(".step3 button").click(function () {
            $("#settings .trigger").click();
        });


        $("#upload").bind('click', function () {
            $('.step2').addClass('hidden');
            // $('#cancel').click();
            // todo: add progress callback for uploader
            Canvas.upload();
        });

    }
};


var Global = {
    ns: null,
    video: document.querySelector('video'),
    canvas: document.querySelector('canvas#previewer'),
    ctx: null,
    videoSettings: {
        audio: false,
        video: {
            mandatory: {
                minWidth: 1920,
                minHeight: 1080
            }
        }
    },
    localMediaStream: null,
    uploaderLink: $('a#previewerLink'),
    imageTypes: ["image/png", "image/x-apple-ios-png", "image/x-png", "image/jpeg", "image/gif", "image/bmp"],
    sourceX: null,
    sourceY: null,
    sourceWidth: null,
    sourceHeight: null,
    destWidth: null,
    destHeight: null,
    destX: 0,
    destY: 0,
    canvasWidth: 850,
    canvasHeight: 850,
    imageObj: new Image(),
    imageData: null,
    iData: null,
    iData2: null,
    iData3: null,
    file: null,
    previewH: null,
    previewW: null,
    angleRotate: 0,
    uploadLock: false,
    logoLock: false,
    videoFeedLock: false,
    startWindowHeight: null,
    exif: null,
    EXIFlat: "Location Unknown",
    GPSlat: "Location Unknown",
    EXIFlong: "Location Unknown",
    GPSlong: "Location Unknown",
    GPSaccuracy: null,
    flash: $('#flash'),
    user: null,
    team_id: null
};

var Tools = {

    getLat: function () {
        // -- turned off for LIVE // console.log(Global.EXIFlat);
        // -- turned off for LIVE // console.log(Global.GPSlat);
        // -- turned off for LIVE // console.log(Global.city);

        if (Global.EXIFlat != "Location Unknown") {
            return Global.EXIFlat;
        } else if (Global.GPSlat != "Location Unknown") {
            // -- turned off for LIVE // console.log('gps');
            return Global.GPSlat;
        } else if (Global.city != undefined) {
            if (Global.city === "Hamburg") {
                //53.5555252,9.9836131
                // -- turned off for LIVE // console.log('hamburg');
                return 53.5555252;
            }
            if (Global.city === "Tallinn") {
                //59.443764, 24.779466
                // -- turned off for LIVE // console.log('tallinn');
                return 59.443764;
            }
            if (Global.city === "Paris") {
                //48.8588589,2.3470599
                return 48.8588589;
            }
        } else {
            // assume R'lyeh
            // -47.150000 -126.716667
            //return -47.15;
            return 53.5555252;

        }
    },
    getLong: function () {
        if (Global.EXIFlong !== "Location Unknown") {
            return Global.EXIFlong;
        } else if (Global.GPSlong !== "Location Unknown") {
            return Global.GPSlong;
        } else if (Global.city !== undefined) {
            if (Global.city === "Hamburg") {
                //53.5555252,9.9836131
                return 9.98361312;
            }
            if (Global.city === "Tallinn") {
                //59.443764, 24.779466
                return 24.779466;
            }
            if (Global.city === "Paris") {
                //48.8588589,2.3470599
                return 2.3470599;
            }
        } else {
            // assume R'lyeh
            // -47.150000 -126.716667
            //return -126.716667;
            return 9.98361312;

        }
    },
    exif: function (detect) {
        // must be called after Canvas.fromImage;
        var reader = new FileReader();
        reader.onload = function (evnt) {
            try {
                var exifHere = new ExifReader();
                // Parse the Exif tags.
                exifHere.load(evnt.target.result); // (was evnt as passed from filechooser )

                Global.EXIFDATA = exifHere.getAllTags();
                //console.log(Global.EXIFDATA);
                var result = new Array;
                angular.forEach(Global.EXIFDATA, function(val, key) {
                    // check if the offset is there
                    if ( val.offset !== false) {
                        if (val.description.length <= 30) {
                            result.push(key+": "+val.description+"<br>\n\r");
                        }
                    }
                });
                console.log(result);
                $('#metaData #data').html(result);
                Canvas.transformCoordinate(exifHere.getTagDescription('Orientation'));
                //var imageDate = exif.getTagDescription('DateTimeOriginal');
                var EXIFLatitude = exifHere.getTagDescription('GPSLatitude');
                var EXIFLongitude = exifHere.getTagDescription('GPSLongitude');
                if (EXIFLatitude !== undefined && EXIFLongitude !== undefined) {
                    Global.EXIFlat = EXIFLatitude;
                    Global.EXIFlong = EXIFLongitude;
                    // window.setMessage("EXIF Geodata Acquired", 2000);
                    $('#city').text("Photo Location Data");

                } else {
                    Global.EXIFlat = "Location Unknown";
                    Global.EXIFlong = "Location Unknown";
                    // window.setMessage("EXIF Geodata Unavailable", 2000);
                }
            }
            catch (error) {
                // -- turned off for LIVE // console.log(error.message);
                console.log("No Exif Information");
                $('#metaData #data').html("No Exif Information");

            }
        };

        reader.readAsArrayBuffer(Global.file);
    },
    geo: function ($scope) {
        'use strict';
        //determine if the handset has client side geo location capabilities
        function successCallback(p) {
            //Global.GPSlatlong = {"latitude":p.latitude,"longitude":p.longitude};
            Global.GPSlat = p.coords.latitude;
            Global.GPSlong = p.coords.longitude;
            Global.GPSaccuracy = p.coords.accuracy;
            $('#city').text("GPS Active");
            $scope.location = p;
            console.log($scope.location);
        }

        function errorCallback() {
            Global.GPSlat = "Location Unknown";
            Global.GPSlong = "Location Unknown";

            //// window.setMessage('Coordinates invalid', 2000);
            $('#city').text(Global.GPSlat);
        }

        if (geoPosition.init()) {
            geoPosition.getCurrentPosition(successCallback, errorCallback, {enableHighAccuracy: true});
        } else {
            // window.setMessage('Please enable GPS.', 2000);
        }
    },
    flash: function () {
        Global.flash.removeClass('hidden');
        setTimeout(function () {
            Global.flash.addClass('hidden');
        }, 500);
    },
    activate: function (target) {
        //  target = camchoice |filechoice
        $('.active .fa-stack-1x').removeClass('blinky');
        $('.active').removeClass('active');
        if (target === "camchoice") {
            $('#camchoice .fa-stack-1x').addClass('blinky');
            $('#camchoice').addClass('active');
        } else if (target === "filechoice") {
            $('#filechoice .fa-stack-1x').addClass('blinky');
            $('#filechoice').addClass('active');
        }

    },
    /*              disable : function(target) {
     //  Tools.activate('picturechoice');
     $('.active .fa-stack-1x').removeClass('blinky');
     $('.active').removeClass('active');
     $('#'+target +' fa-stack-1x').addClass('blinky');
     $('#'+target).addClass('active');
     },
     */
    onCameraFail: function (e) {
        this.error = e.name || e;
        clearTimeout(window.turnOnCamera);
        clearInterval(window.cameraInterval);
        // -- turned off for LIVE // console.log(this.error);
        // window.setMessage(this.error + '. Other programs or tabs using the camera will prevent it from working here.', 2000);

    },
    size: function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                size += 1;
                // -- turned off for LIVE // console.log(key+":"+obj);
            }
        }
        return size;
    },
    isImage: function (mime) {
        if ($.inArray(mime, Global.imageTypes) > -1) {
            // window.setMessage("Image valid", 2000, "label-info");
            Tools.loading('stop');

            return true;
        } else {
            // window.setMessage("Image invalid", -1, "label-error");
            return false;
        }
    },
    cancel: function () {
        // todo: wrap everything in this function and get rid of jquery chaining
        $('#cancel').click();
    },
    cancelEvent: function (e) {
        e = e ? e : window.event;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.cancelBubble = true;
        e.cancel = true;
        e.returnValue = false;
        return false;
    },
    loading: function (e, m) {
        if (e === true) { // we are using this to flick the spinner on.
            $('.spinner').removeClass('hidden');
            return;
        }
        if (m) {
            // window.setMessage(m, 2000);
        }
        if (e === 'start') {
            $('#load').show();
        } else {
            $('#load').hide();
        }
    }
};
var Filter = {
    grayscale: function (pixels, args) {
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];
            // CIE luminance for the RGB
            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            d[i] = d[i + 1] = d[i + 2] = v;
        }
        return pixels;
    },
    brightness: function (pixels, adjustment) {
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            d[i] += adjustment;
            d[i + 1] += adjustment;
            d[i + 2] += adjustment;
        }
        return pixels;
    },

    threshold: function (pixels, thresh) {
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];
            var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= thresh) ? 255 : 0;
            d[i] = d[i + 1] = d[i + 2] = v;
        }
        return pixels;
    },

    invert: function (pixels, args) {
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            d[i] = d[i];  // red
            d[i + 1] = 255 - d[i + 1];  // green
            d[i + 2] = 255 - d[i + 2];  // blue
        }
        return pixels;
    },
    contrast: function (pixels, val, args) {
        var d = pixels.data;
        var factor = (259 * (val + 255)) / (255 * (259 - val));
        for (var i = 0; i < d.length; i += 4) {
            d[i] = factor * (d[i] - 128) + 128;
            d[i + 1] = factor * (d[i + 1] - 128) + 128;
            d[i + 2] = factor * (d[i + 2] - 128) + 128;
        }
        return pixels;

    },

    // convolution
    createImageData: function (w, h) {
        var tmpCanvas = document.createElement('canvas');
        var tmpCtx = tmpCanvas.getContext('2d');
        return tmpCtx.createImageData(w, h);
    },

    convolute: function (pixels, weights, opaque) {
        // todo: find out why this is so slow
        var side = Math.round(Math.sqrt(weights.length));
        var halfSide = Math.floor(side / 2);
        var src = pixels.data;
        var sw = pixels.width;
        var sh = pixels.height;
        // pad output by the convolution matrix
        var w = sw;
        var h = sh;
        var output = Filter.createImageData(w, h);
        var dst = output.data;
        // go through the destination image pixels
        var alphaFac = opaque ? 1 : 0;
        for (var y = 0; y < h; y += 1) {
            for (var x = 0; x < w; x += 1) {
                var sy = y;
                var sx = x;
                var dstOff = (y * w + x) * 4;
                // calculate the weighed sum of the source image pixels that
                // fall under the convolution matrix
                var r = 0, g = 0, b = 0, a = 0;
                for (var cy = 0; cy < side; cy += 1) {
                    for (var cx = 0; cx < side; cx += 1) {
                        var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
                        var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
                        var srcOff = (scy * sw + scx) * 4;
                        var wt = weights[cy * side + cx]; // added opaque
                        r += src[srcOff] * wt;
                        g += src[srcOff + 1] * wt;
                        b += src[srcOff + 2] * wt;
                        a += src[srcOff + 3] * wt;
                    }
                }
                dst[dstOff] = r;
                dst[dstOff + 1] = g;
                dst[dstOff + 2] = b;
                dst[dstOff + 3] = a + alphaFac * (255 - a);
            }
        }
        return output;
    },
    types: function () {

        Filter.gaussian = [
            0.00000067, 0.00002292, 0.00019117, 0.00038771, 0.00019117, 0.00002292, 0.00000067,
            0.00002292, 0.00078634, 0.00655965, 0.01330373, 0.00655965, 0.00078633, 0.00002292,
            0.00019117, 0.00655965, 0.05472157, 0.11098164, 0.05472157, 0.00655965, 0.00019117,
            0.00038771, 0.01330373, 0.11098164, 0.22508352, 0.11098164, 0.01330373, 0.00038771,
            0.00019117, 0.00655965, 0.05472157, 0.11098164, 0.05472157, 0.00655965, 0.00019117,
            0.00002292, 0.00078633, 0.00655965, 0.01330373, 0.00655965, 0.00078633, 0.00002292,
            0.00000067, 0.00002292, 0.00019117, 0.00038771, 0.00019117, 0.00002292, 0.00000067];
    }
}; // end Filter

var Canvas = {
    init: function () {
        Global.startWindowHeight = window.innerHeight;
        Global.video = document.querySelector('video');
        Global.canvas = document.querySelector('canvas#previewer');
        Global.ctx = Global.canvas.getContext('2d');
        Global.uploaderLink = $('a#previewerLink');
        Global.canvas.width = 850;
        Global.canvas.height = 850;
        Global.video.addEventListener('loadedToolsdata', function () {
            if (Global.videoFeedLock === false) {
                Canvas.feed();
                Global.videoFeedLock = true;
            }
        }, true);
        Global.video.addEventListener('canplaythrough', function () {
            if (Global.videoFeedLock === false) {
                Canvas.feed();
                Global.videoFeedLock = true;
            }
        }, true);
        Global.video.addEventListener('loadeddata', function () {
            if (Global.videoFeedLock === false) {
                Canvas.feed();
                Global.videoFeedLock = true;
            }
        }, true);
        Global.video.addEventListener('loadedmetadata', function () {
            if (Global.videoFeedLock === false) {
                Canvas.feed();
                Global.videoFeedLock = true;
            }
        }, true);

        if (!window.localMediaStream) {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            window.URL = window.URL || window.webkitURL;

            navigator.getUserMedia(Global.videoSettings, function (stream) {
                Global.video.src = window.URL.createObjectURL(stream);
                window.localMediaStream = stream;
                Canvas.resizeCanvas();
                // dirty workaround to force the camera on if
                // turned on and not in live mode
                Tools.cancel();
                Canvas.feed();
                // window.setMessage("Camera Feed Created", 1000, "label-info");
                Tools.activate('camchoice');

                //Tools.loading('stop');
            }, Tools.onCameraFail);

        }
    },
    stopCam: function () {
        "use strict";
        var video = document.querySelector('video');
        // -- turned off for LIVE // console.log(video);
        if (video !== null) {
            video.src = null;
            try {
                window.localMediaStream.stop();
            } catch (e) {
                // -- turned off for LIVE // console.log(e);
            }
            window.localMediaStream = null;
            video.load();
        }
        return true;
    },
    feed: function () {
        function feedTimer() {
            if (Global.video.videoHeight > Global.video.videoWidth) {
                Global.sourceX = 0;
                Global.sourceY = (Global.video.videoHeight - Global.video.videoWidth) / 2;
                Global.sourceWidth = Global.video.videoWidth;
                Global.sourceHeight = Global.video.videoWidth;
                Tools.loading('stop');
                clearInterval(window.feedTimer);
            } else if (Global.video.videoHeight < Global.video.videoWidth) {
                Global.sourceX = (Global.video.videoWidth - Global.video.videoHeight) / 2;
                Global.sourceY = 0;
                Global.sourceWidth = Global.video.videoHeight;
                Global.sourceHeight = Global.video.videoHeight;
                Tools.loading('stop');
                clearInterval(window.feedTimer);
            } else { // firefox edge case
                // -- turned off for LIVE // console.log('STILL WAITING');
            }
        }

        function snapIntervalTimer() {
            Global.ctx.drawImage(Global.video, Global.sourceX, Global.sourceY, Global.sourceWidth, Global.sourceHeight, Global.destX, Global.destY, Global.destWidth, Global.destHeight);
        }

        if (window.localMediaStream) {

            if (window.snapInterval) {
                clearInterval(window.snapInterval);
            }

            $('canvas').attr('videoLive', "on");
            // we need to wait for firefox.video to catch up

            if (!window.feedTimer) {
                window.feedTimer = setInterval(feedTimer, 50);
            }


            Global.destWidth = Global.canvas.width;
            Global.destHeight = Global.canvas.height;
            Global.ctx = Global.canvas.getContext('2d');

            window.snapInterval = setInterval(snapIntervalTimer, 40); // 25 fps


        }

    },
    freezer: function () {
        if ($('canvas').attr('videoLive') === 'on') {
            clearInterval(window.snapInterval);
            $(this).attr('videoLive', "off");
        }
    },
    releaser: function () {
        if ($('.active').hasClass('cam')) {
            Canvas.feed();
            $('canvas').attr('videoLive', "on");
        } else {
            Global.ctx.clearRect(0, 0, Global.canvas.width, Global.canvas.height);
        }
    },
    /**
     * Transform canvas coordination according to specified frame size and orientation
     * Orientation value is from EXIF tag
     */
    transformCoordinate: function (orientation) {
        switch (orientation) {
            case 2:
            case "top-left":
                // horizontal flip
                ctx.save();
                ctx.translate(width, 0);
                ctx.scale(-1, 1);
                break;
            case 3:
            case "bottom-right":
                // 180 rotate left
                Canvas.rotate(180);
                break;
            case 4:
            case "bottom-left":
                // vertical flip
                ctx.save();
                ctx.translate(0, height);
                ctx.scale(1, -1);
                break;
            case 5:
            case "left-top":
                // vertical flip + 90 rotate right
                ctx.save();
                ctx.rotate(0.5 * Math.PI);
                ctx.scale(1, -1);
                break;
            case 6:
            case "right-top":
                Canvas.rotate(90);
                // 90 rotate right

                break;
            case 7:
            case "right-bottom":

                // horizontal flip + 90 rotate right
                ctx.save();
                ctx.rotate(0.5 * Math.PI);
                ctx.translate(width, -height);
                ctx.scale(-1, 1);

                break;
            case 8:
            case "left-bottom":
                // 90 rotate left
                Canvas.rotate(-90);
                break;
            default:
                break;
        }
        //redraw

    },
    drawImageIOSFix: function (ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
        /**
         * Detecting vertical squash in loaded image.
         * Fixes a bug which squash image vertically while drawing into canvas for some images.
         * This is a bug in iOS6 devices.
         * This function from https://github.com/stomita/ios-imagefile-megapixel
         */
        this.canvas = document.createElement('canvas');
        this.ctx = canvas.getContext('2d');


        function detectVerticalSquash(img) {
            var iw = img.naturalWidth, ih = img.naturalHeight;
            this.canvas.width = 1;
            this.canvas.height = ih;
            this.ctx.drawImage(img, 0, 0);
            var data = this.ctx.getImageData(0, 0, 1, ih).data;
            // search image edge pixel position in case it is squashed vertically.
            var sy = 0;
            var ey = ih;
            var py = ih;
            while (py > sy) {
                var alpha = data[(py - 1) * 4 + 3];
                if (alpha === 0) {
                    ey = py;
                } else {
                    sy = py;
                }
                py = (ey + sy) >> 1;
            }
            var ratio = (py / ih);
            return (ratio === 0) ? 1 : ratio;
        }

        var vertSquashRatio = detectVerticalSquash(img);
        // Works only if whole image is displayed:
        // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
        // The following works correct also when only a part of the image is displayed:

        Canvas.transformCoordinate(Tools.exif('orientation'));

        ctx.drawImage(img, sx * vertSquashRatio, sy * vertSquashRatio,
            sw * vertSquashRatio, sh * vertSquashRatio,
            dx, dy, dw, dh);
        var iw = img.naturalWidth, ih = img.naturalHeight;
    },
    fromImage : function(evnt) {
        Global.startWindowHeight = window.innerHeight;
        Global.video = document.querySelector('video');
        Global.canvas = document.querySelector('canvas#previewer');
        Global.ctx = Global.canvas.getContext('2d');
        // todo: allow the user to move the image up and down or left and right
        // todo: figure out a way to crop the image too
        if (Global.file) {
            // is the camera running? if so stop it!
            if (window.localMediaStream) {
                //window.localMediaStream.stop(); //turnOffCamera > was breaking the return to
                clearInterval(window.snapInterval);
                Canvas.freezer();
            }
            Global.file = evnt.target.files[0];
            // GET THE EXIF INFO IF AVAILABLE
            //window.setMessage("Analyzing Image",-1);
            Global.imageObj.onload = function () {
                Tools.exif();

                // this crops our image into a square
                // will need to functionalize so that the image can be moved / cropped
                /*
                if (this.height > this.width) {
                    Global.sourceX = 0;
                    Global.sourceY = (this.height - this.width) / 2;
                    Global.sourceWidth = this.width;
                    Global.sourceHeight = this.width;
                } else {
                    Global.sourceX = (this.width - this.height) / 2;
                    Global.sourceY = 0;
                    Global.sourceWidth = this.height;
                    Global.sourceHeight = this.height;
                }
                */

                // by popular demand, the uploaded image should keep its ratio

                Global.canvas.width = 850;
                Global.canvas.height = 850;
                Global.sourceX = 0;
                Global.sourceY = 0;
                Global.sourceWidth = this.width;
                Global.sourceHeight = this.height;
                if (this.height > this.width) {
                    Global.heightFactor=1;
                    Global.widthFactor=this.width / this.height;
                    Global.widthOffset=(Global.canvas.width-(this.width))/2;
                    Global.heightOffset=0;
                } else if (this.height < this.width)  {
                    Global.heightOffset=(Global.canvas.height-this.height)/2;
                    Global.widthOffset=0;
                    Global.heightFactor=this.height / this.width;
                    Global.widthFactor=1;
                } else { // already square
                    Global.heightOffset=0;
                    Global.widthOffset=0;
                    Global.heightFactor=1;
                    Global.widthFactor=1;
                }

                Global.destWidth = Global.canvas.width*Global.widthFactor;
                Global.destHeight = Global.canvas.height*Global.heightFactor;
                Global.widthOffset=(Global.canvas.width-Global.destWidth)/2;
                Global.heightOffset=(Global.canvas.height-Global.destHeight)/2;
                //Canvas.drawImageIOSFix( Global.ctx, this, Global.sourceX, Global.sourceY, Global.sourceWidth, Global.sourceHeight, Global.destX, Global.destY, Global.destWidth, Global.destHeight);
                Global.ctx.drawImage(this, Global.sourceX, Global.sourceY, Global.sourceWidth, Global.sourceHeight, Global.destX+++Global.widthOffset, Global.destY+++Global.heightOffset, Global.destWidth, Global.destHeight);



            };
            if (!Global.imageObj) {
                Global.imageObj = new Image();
            }
            Global.imageObj.src = window.URL.createObjectURL(Global.file);


        } else { // nothing to see here
            Tools.cancel();
        }

    },

    resizeCanvas: function () {

        Global.previewH = window.innerHeight;
        Global.previewW = window.innerWidth;
        var math = Global.startWindowHeight - Global.previewH;
        if (math >= 36 && math <= 45) { // we are in chrome - this is a hack
            $('footer').css({bottom: false, top: "30px"});
        } else {
            $('footer').css({bottom: "60px", top: false});
        }

        math = null;
        if (Global.previewH > Global.previewW) {
            if (Global.previewW >= 850) {
                Global.previewW = 850;
            }
            $(Global.canvas).css({
                width: Global.previewW + "px",
                height: Global.previewW + "px"
            });
        } else {
            if (Global.previewW >= 850 && Global.previewH >= 920) {
                Global.previewH = 1700;
            }
            $(Global.canvas).css({
                width: Global.previewH / 1.5 + "px",
                height: Global.previewH / 1.5 + "px"
            });
        }
    },
    filters: function () {
        "use strict";
        // This is a simple caller to trigger these at the right time.

        $(".filter.contrast").click(function () {
            Tools.loading('start', 'Processing Contrast.');
            setTimeout(function () {
                Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
                Filter.contrast(Global.imageData, 20);
                Global.ctx.putImageData(Global.imageData, 0, 0);
                Global.imageData = null;
            }, 50);
            Tools.loading('stop');
        });
        $(".filter.BW").click(function () {
            Tools.loading('start', 'Processing Black&White.');
            setTimeout(function () {
                Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
                Filter.grayscale(Global.imageData);
                Global.ctx.putImageData(Global.imageData, 0, 0);
                Global.imageData = null;
            }, 50);
            Tools.loading('stop');
        });
        $(".filter.brighten").click(function () {
            Tools.loading('start', 'Processing Lighten.');
            setTimeout(function () {
                Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
                Filter.brightness(Global.imageData, 5);
                Global.ctx.putImageData(Global.imageData, 0, 0);
                Global.imageData = null;
            }, 50);
            Tools.loading('stop');
        });
        $(".filter.darken").click(function () {
            Tools.loading('start', 'Processing Darken.');
            setTimeout(function () {
                Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
                Filter.brightness(Global.imageData, -5);
                Global.ctx.putImageData(Global.imageData, 0, 0);
                Global.imageData = null;
            }, 50);
            Tools.loading('stop');
        });
        $(".filter.sharpen").click(function () {
            Tools.loading('start', 'Processing Sharpen.');
            setTimeout(function () {
                Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
                Global.iData = Filter.convolute(Global.imageData, [0, -1, 0, -1, 5, -1, 0, -1, 0]);
                Global.ctx.putImageData(Global.iData, 0, 0);
                Global.iData = null;
                Global.imageData = null;
            }, 50);
            Tools.loading('stop');
        });
        $(".filter.blur").click(function () {
            Tools.loading('start', 'Processing Blur.');
            setTimeout(function () {
                Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
                Global.iData = Filter.convolute(Global.imageData, Filter.gaussian, 4);
                Global.ctx.putImageData(Global.iData, 0, 0);
                Global.iData = null;
                Global.imageData = null;
            }, 50);
            Tools.loading('stop');
        });

        $(".filter.laplace").click(function () {
            Tools.loading('start', 'Processing Unsharpen.');
            setTimeout(function () {
                Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
                Global.iData = Filter.convolute(Global.imageData, Filter.gaussian);
                Global.iData2 = Filter.convolute(Global.iData, Filter.gaussian);
                Global.iData3 = Filter.convolute(Global.iData2, [
                    -1, -2, -1,
                    -2, 13, -2,
                    -1, -2, -1
                ]);
                Global.ctx.putImageData(Global.iData3, 0, 0);
                Global.iData = null;
                Global.iData2 = null;
                Global.iData3 = null;
                Global.imageData = null;
            }, 50);
            Tools.loading('stop');
        });

        $("#clockwise").click(function () {
            Tools.loading('start', 'Processing Rotation.');
            setTimeout(function () {
                Canvas.rotate(90);
            }, 50);
            Tools.loading('stop');
        });

        $("#counterclockwise").click(function () {
            Tools.loading('start', 'Processing Rotation.');
            setTimeout(function () {
                Canvas.rotate(-90);
            }, 50);
            Tools.loading('stop');
        });
    },
    rotate: function (degrees) {
        // THIS MIGHT ONLY WORK ON SQUARE IMAGES
        var canvasWidth = 850,
            canvasHeight = 850;
        Global.tmpCanvas = new Image();
        Global.tmpCanvas.src = Global.canvas.toDataURL("image/png");
        Global.tmpCanvas.onload = function () {
            Global.ctx.save();
            //Global.ctx.setTransform(1,0,0,1,0,0);
            Global.ctx.clearRect(0, 0, Global.canvas.width, Global.canvas.height);
            Global.ctx.translate(Global.canvas.width / 2, Global.canvas.height / 2);
            Global.ctx.rotate(degrees * Math.PI / 180);
            Global.ctx.drawImage(Global.tmpCanvas, -canvasWidth / 2, -canvasHeight / 2, canvasWidth, canvasHeight); // we assume 850px
            Global.tmpCanvas = null;
            Global.ctx.restore();
        };
    },
    shove: function () {
        // TODO!!!! fix the picture shover!!!
        // move a picture left or right, up or down

    },
    crop: function () {
        // TODO: crop a picture with jcrop

    },
    save: function () {
        Tools.loading(true);
        // for download purposes we've moved this to the jade file
        //var image = Global.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        var image = Global.canvas.toDataURL("image/png");
        window.location.download= "test.png";
        window.location.href = image;
        image=null;
    }

}; // end Canvas


// set the requestAnimationFrame polyfill
// as per http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
(function () {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());


// paul irish to the rescue again
// http://www.paulirish.com/2009/throttled-smartresize-jquery-event-handler/
(function ($, sr) {
    'use strict';
    // debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function (func, threshold, execAsap) {
        var timeout;

        return function debounced() {
            var obj = this, args = arguments;

            function delayed() {
                if (!execAsap) {
                    func.apply(obj, args);
                }
                timeout = null;
            }

            if (timeout) {
                clearTimeout(timeout);
            }
            else if (execAsap) {
                func.apply(obj, args);
            }

            timeout = setTimeout(delayed, threshold || 100);
        };
    };
    // smartresize
    jQuery.fn[sr] = function (fn) {
        return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
    };

})(jQuery, 'smartresize');

/**
 * Created by egal on 9/19/14.
 */


$(document).ready(function(){
    "use strict";


    $(window).smartresize(function () {
        setTimeout(function () {
            Canvas.resizeCanvas();
        }, 500);
    });

    $('#camera,#camchoice').click(function(){
        // we assume here that the camera has not yet been initialized
        Tools.loading(true);
        window.turnOnCamera = setTimeout(function(){
            if ($('#load').is(':visible')){
                //$scope.setMessage('Please turn on your Camera.',-1,'label-error');
            }
        }, 5000);
        window.cameraProblems = setTimeout(function(){
            if ($('#load').is(':visible')){
                //$scope.setMessage('Problems? Try uploading from the filesystem.',-1,'label-error');
                $('#nativeFile .fa').addClass('oneblink');
            }
        }, 30000);
        Canvas.init();

        function cameraIntervalTimer(){
            if (Global.localMediaStream){
                clearTimeout(window.turnOnCamera);
                clearTimeout(window.cameraProblems);
                clearInterval(window.cameraInterval);
            }
        }
        window.cameraInterval = setInterval(cameraIntervalTimer,1000);
    });
    $('#nativeFile,#filechoice').click(function(){
        $('input#filechooser').trigger('click');
    });

    $('input#filechooser').on("click",function(){
        setTimeout(function(){
            if (!Global.file){
                //$scope.setMessage('Try the old uploader.',null,'label-error');
                $('input#filechooser').attr('capture','camera').removeClass('hidden');
                clearInterval(window.fileInterval);
            }
        }, 15000);
        function fileIntervalTimer() {
            if (Global.file){
                Tools.loading('stop');
                clearInterval(window.fileInterval);
            }
        }
        window.fileInterval = setInterval(fileIntervalTimer,100);
    }).off("change").on("change",function (evnt) {
        // this is the native file element
        // that is not being triggered when a picture is made on mobile. :(
        Global.file = this.files[0];
        if (Global.file) {
            if (Tools.isImage(Global.file.type) === true) {
                Canvas.fromImage(evnt);
                Tools.activate('filechoice');
                $(".step1").hide();
                $(".step3").hide();
                $('.step2').hide().removeClass('hidden').fadeIn(500);
            } else {
                //$scope.setMessage('That file is not an image.',-1,'label-error');
                setTimeout(function(){window.location.reload(true);},3000);
            }
        }
    });

    $("#accept.action,canvas").click(function(){
        Tools.flash();
        $(".step1").hide();
        $('.step2').hide().removeClass('hidden').fadeIn(500);
        Canvas.freezer();
    });
    $("#cancel").click(function(){
        $(".step2").hide();
        $(".step1").fadeIn(500);
        $(".step3").hide();
        Canvas.releaser();
    });
    $("#settings span.trigger").click(function(){
        if ($('.step3').hasClass('hidden')){
            $(".step3").hide().removeClass('hidden').fadeIn(500);
            $("#settings i.fa-stack-2x").addClass("fa-circle");
            $("#settings i.fa-stack-1x").addClass("white");

        } else {
            $(".step3").fadeOut(250).addClass('hidden');
            $("#settings .trigger").blur();
            $("#settings .fa-stack-2x").removeClass("fa-circle");
            $("#settings .fa-stack-1x").removeClass("white");
        }
    });
    $(".step3 button").click(function(){
        $("#settings .trigger").click();
    });


    $("#upload").bind('click',function(e){
        $('.step2').addClass('hidden');
        // $('#cancel').click();
        // todo: add progress callback for uploader

        //var canvas = document.getElementById("previewer");
        //var image = canvas.toDataURL("image/png")//.replace("image/png", "data:application/octet-stream");
        Canvas.save();
        $('#cancel').click();
    });


//////////////////////////////////////////////
// FILTER OPS
//
//  todo: functionalize this mess!!!
//
//////////////////////////////////////////////


    $(".filter.contrast").click(function () {
        Tools.loading('start','Processing Contrast.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Filter.contrast(Global.imageData,20);
            Global.ctx.putImageData(Global.imageData, 0, 0);
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });
    $(".filter.BW").click(function () {
        Tools.loading('start','Processing Black&White.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Filter.grayscale(Global.imageData);
            Global.ctx.putImageData(Global.imageData, 0, 0);
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });
    $(".filter.brighten").click(function () {
        Tools.loading('start','Processing Lighten.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Filter.brightness(Global.imageData, 5);
            Global.ctx.putImageData(Global.imageData, 0, 0);
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });
    $(".filter.darken").click(function () {
        Tools.loading('start','Processing Darken.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Filter.brightness(Global.imageData, -5);
            Global.ctx.putImageData(Global.imageData, 0, 0);
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });
    $(".filter.sharpen").click(function () {
        Tools.loading('start','Processing Sharpen.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Global.iData = Filter.convolute(Global.imageData, [ 0, -1, 0, -1, 5, -1, 0, -1, 0]);
            Global.ctx.putImageData(Global.iData, 0, 0);
            Global.iData = null;
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });
    $(".filter.blur").click(function () {
        Tools.loading('start','Processing Blur.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Global.iData = Filter.convolute(Global.imageData, Filter.gaussian,4);
            Global.ctx.putImageData(Global.iData, 0, 0);
            Global.iData = null;
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });

    $(".filter.laplace").click(function () {
        Tools.loading('start','Processing Unsharpen.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Global.iData = Filter.convolute(Global.imageData, Filter.gaussian );
            Global.iData2 = Filter.convolute(Global.iData, Filter.gaussian);
            Global.iData3 = Filter.convolute(Global.iData2, [
                -1, -2, -1,
                -2, 13, -2,
                -1, -2, -1
            ]);
            Global.ctx.putImageData(Global.iData3, 0, 0);
            Global.iData = null;
            Global.iData2 = null;
            Global.iData3 = null;
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });


// maybe we need a new algo for these turners...
    $("#clockwise").click(function () {
        Tools.loading('start','Processing Rotation.');
        setTimeout(function(){
            Canvas.rotate(90);
        },50);
        Tools.loading('stop');
    });

    $("#counterclockwise").click(function () {
        Tools.loading('start','Processing Rotation.');
        setTimeout(function(){
            Canvas.rotate(-90);
        },50);
        Tools.loading('stop');
    });


});