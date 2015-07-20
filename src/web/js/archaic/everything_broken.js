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

                    if (detect === "orientation") {
                        var orient = exifHere.getTagDescription('Orientation');
                        return orient;
                    }

                    //var imageDate = exif.getTagDescription('DateTimeOriginal');
                    var EXIFLatitude = exifHere.getTagDescription('GPSLatitude');
                    var EXIFLongitude = exifHere.getTagDescription('GPSLongitude');
                    // var allTags = exif.getAllTags();
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
                    //// window.setMessage("No Exif Information",2000);
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
            }
        },
        /**
         * Transform canvas coordination according to specified frame size and orientation
         * Orientation value is from EXIF tag
         */
        transformCoordinate: function (orientation) {
            var canvas = Global.canvas,
                ctx = Global.ctx,
                height = 850,
                width = 850;

            switch (orientation) {
                case 5:
                case 6:
                case 7:
                case 8:
                    canvas.width = height;
                    canvas.height = width;
                    break;
                default:
                    canvas.width = width;
                    canvas.height = height;
            }
            switch (orientation) {
                case 2:
                    // horizontal flip
                    ctx.save();
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    break;
                case 3:
                    // 180 rotate left
                    ctx.save();
                    ctx.translate(width, height);
                    ctx.rotate(Math.PI);
                    break;
                case 4:
                    // vertical flip
                    ctx.save();
                    ctx.translate(0, height);
                    ctx.scale(1, -1);
                    break;
                case 5:
                    // vertical flip + 90 rotate right
                    ctx.save();
                    ctx.rotate(0.5 * Math.PI);
                    ctx.scale(1, -1);
                    break;
                case 6:
                    // 90 rotate right
                    ctx.save();
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(0, -height);
                    break;
                case 7:
                    // horizontal flip + 90 rotate right
                    ctx.save();
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(width, -height);
                    ctx.scale(-1, 1);

                    break;
                case 8:
                    // 90 rotate left
                    ctx.save();
                    ctx.rotate(-0.5 * Math.PI);
                    ctx.translate(-width, 0);
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
            function detectVerticalSquash(img) {
                var iw = img.naturalWidth, ih = img.naturalHeight;
                var canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = ih;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                var data = ctx.getImageData(0, 0, 1, ih).data;
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
        fromImage: function (evnt) {

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
                console.log(Global.file.name)
                // GET THE EXIF INFO IF AVAILABLE
                //// window.setMessage("Analyzing Image",-1);
                Global.imageObj.onload = function () {
                    Tools.exif();
                    // this crops our image into a square
                    // will need to functionalize so that the image can be moved / cropped
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
                    Global.canvas.width = 850;
                    Global.canvas.height = 850;
                    Global.destWidth = Global.canvas.width;
                    Global.destHeight = Global.canvas.height;
                    console.log(Global)

                    Canvas.drawImageIOSFix(Global.ctx, this, Global.sourceX, Global.sourceY, Global.sourceWidth, Global.sourceHeight, Global.destX, Global.destY, Global.destWidth, Global.destHeight);

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
            var canvas = document.getElementById("previewer");
            var image = canvas.toDataURL("image/png").replace("image/png", "data:application/octet-stream");
            window.location.href = image;

            //}

            // -- turned off for LIVE // console.log("upload"+Global.GPSlat);
            /*
             if (Global.EXIFlat === "Location Unknown" && Global.GPSlat === "Location Unknown" && Global.city === undefined) {
             $('#cityChooser').hide().removeClass('hidden').fadeIn(50);
             $('.btn-city').unbind('click').bind('click', function(){
             Global.city = $(this).text();
             $('#city').text(Global.city);
             $('#cityChooser').fadeOut();
             });
             window.cityChoice = setInterval(function () {
             if (Global.city !== undefined) {
             Canvas.uploadStep2();
             clearInterval(window.cityChoice);
             }
             }, 1000);

             } else {*/
            // window.setMessage('Contacting Server', -1, "label-info");
            Canvas.uploadStep2();
            //}
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
